const { GoogleGenerativeAI } = require("@google/generative-ai");
const jwt = require("jsonwebtoken");
const { Project, Task, User, ProjectMembers, Card, TaskTimeTracking, sequelize } = require("../Database/config");
const { Op } = require("sequelize");
const { getSubordinateIds } = require("../Helper/hierarchyPermission");

// Model fallback chain — tries each model until one works
const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
];

const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * Try generating content with model fallback and retry
 */
async function generateWithFallback(prompt) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of MODELS) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(`Success with model: ${modelName}`);
            return { text: response.text(), model: modelName };
        } catch (error) {
            console.log(`Model ${modelName} failed: ${error.status || error.message}`);
            lastError = error;

            // If it's a rate limit error, try next model immediately
            if (error.status === 429) {
                continue;
            }
            // For other errors (auth, etc.), throw immediately
            if (error.status === 401 || error.status === 403) {
                throw error;
            }
            continue;
        }
    }

    // All models failed — try first model with a delay (retry)
    console.log("All models failed. Retrying first model after 5s delay...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        const model = genAI.getGenerativeModel({ model: MODELS[0] });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { text: response.text(), model: MODELS[0] };
    } catch (retryError) {
        throw lastError || retryError;
    }
}

/**
 * Gather all relevant data based on user role/hierarchy
 */
async function gatherAnalyticsData(user) {
    const isAdmin = user.role === "admin";

    let projectWhereClause = {};
    if (!isAdmin) {
        const userProjects = await ProjectMembers.findAll({
            where: { user_id: user.user_id },
            attributes: ["project_id"],
            raw: true,
        });
        const projectIds = userProjects.map(p => p.project_id);
        projectWhereClause = { project_id: { [Op.in]: projectIds } };
    }

    const projects = await Project.findAll({ where: projectWhereClause, raw: true });

    let employees;
    if (isAdmin) {
        employees = await User.findAll({
            attributes: ["user_id", "name", "email", "role", "technology"],
            raw: true,
        });
    } else {
        const subordinateIds = await getSubordinateIds(user.user_id);
        const relevantIds = [user.user_id, ...subordinateIds];
        employees = await User.findAll({
            where: { user_id: { [Op.in]: relevantIds } },
            attributes: ["user_id", "name", "email", "role", "technology"],
            raw: true,
        });
    }

    const projectIds = projects.map(p => p.project_id);
    const cards = await Card.findAll({
        where: { project_id: { [Op.in]: projectIds } },
        attributes: ["card_id", "title", "project_id"],
        raw: true,
    });
    const cardIds = cards.map(c => c.card_id);

    let taskWhereClause = { card_id: { [Op.in]: cardIds } };
    if (!isAdmin) {
        const subordinateIds = await getSubordinateIds(user.user_id);
        const relevantUserIds = [user.user_id, ...subordinateIds];
        taskWhereClause = {
            card_id: { [Op.in]: cardIds },
            [Op.or]: [
                { assign_to: { [Op.in]: relevantUserIds } },
                { assign_to: null }
            ]
        };
    }

    const tasks = await Task.findAll({
        where: taskWhereClause,
        include: [
            { model: User, as: "Assignee", attributes: ["name"], required: false },
            { model: Card, attributes: ["title", "project_id"] },
        ],
    });

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === "Completed").length,
        inProgress: tasks.filter(t => t.status === "In progress").length,
        pending: tasks.filter(t => t.status === "Pending").length,
        toBeVerified: tasks.filter(t => t.status === "To be verified").length,
    };

    const now = new Date();
    const overdueTasks = tasks.filter(t =>
        t.due_date && new Date(t.due_date) < now && t.status !== "Completed"
    );

    const projectBreakdown = projects.map(project => {
        const projectCards = cards.filter(c => c.project_id === project.project_id);
        const projectCardIds = projectCards.map(c => c.card_id);
        const projectTasks = tasks.filter(t => projectCardIds.includes(t.card_id));
        const completed = projectTasks.filter(t => t.status === "Completed").length;
        const total = projectTasks.length;
        return {
            name: project.project_name,
            status: project.status,
            total_tasks: total,
            completed_tasks: completed,
            completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
            overdue_tasks: projectTasks.filter(t =>
                t.due_date && new Date(t.due_date) < now && t.status !== "Completed"
            ).length,
        };
    });

    const employeeStats = employees.map(emp => {
        const empTasks = tasks.filter(t => t.assign_to === emp.user_id);
        return {
            name: emp.name,
            role: emp.role,
            total_tasks: empTasks.length,
            completed: empTasks.filter(t => t.status === "Completed").length,
            in_progress: empTasks.filter(t => t.status === "In progress").length,
            overdue: empTasks.filter(t =>
                t.due_date && new Date(t.due_date) < now && t.status !== "Completed"
            ).length,
        };
    });

    return {
        overview: {
            total_projects: projects.length,
            total_employees: employees.length,
            ...taskStats,
            overdue_count: overdueTasks.length,
        },
        projects: projectBreakdown,
        employees: employeeStats,
        overdue_tasks: overdueTasks.slice(0, 10).map(t => ({
            title: t.title,
            assignee: t.Assignee?.name || "Unassigned",
            due_date: t.due_date,
            status: t.status,
            project: t.Card?.title || "Unknown",
        })),
    };
}

/**
 * Build the prompt for Gemini
 */
function buildPrompt(data, isAdmin) {
    const role = isAdmin ? "an admin/manager" : "a team member/developer";
    return `You are an AI analytics assistant for Solvify project management tool.
Generate a summary for ${role}.

## Overview
- Projects: ${data.overview.total_projects}, Team: ${data.overview.total_employees}
- Tasks: ${data.overview.total} total, ${data.overview.completed} done, ${data.overview.inProgress} active, ${data.overview.pending} pending, ${data.overview.overdue_count} overdue

## Projects
${data.projects.map(p => `- ${p.name} (${p.status}): ${p.completion_pct}% done, ${p.completed_tasks}/${p.total_tasks} tasks, ${p.overdue_tasks} overdue`).join("\n")}

## Employees
${data.employees.map(e => `- ${e.name} (${e.role}): ${e.completed}/${e.total_tasks} done, ${e.in_progress} active, ${e.overdue} overdue`).join("\n")}

## Overdue Tasks
${data.overdue_tasks.map(t => `- "${t.title}" → ${t.assignee}, due ${t.due_date}`).join("\n") || "None"}

Provide: 1) Executive Summary (2-3 sentences) 2) Key Highlights 3) Risk Areas 4) Recommendations (3-5) 5) Employee Spotlight. Use markdown. Max 400 words.`;
}

/**
 * GET /api/ai/analytics
 */
exports.getAIAnalytics = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ status: 0, message: "User not found" });
        }

        // Gather data based on role
        const analyticsData = await gatherAnalyticsData(user);

        // Build prompt and call Gemini with fallback
        const prompt = buildPrompt(analyticsData, user.role === "admin");
        const { text: aiSummary, model: usedModel } = await generateWithFallback(prompt);

        res.status(200).json({
            status: 1,
            message: "AI analytics generated",
            data: {
                summary: aiSummary,
                stats: analyticsData.overview,
                projects: analyticsData.projects,
                employees: analyticsData.employees,
                generated_at: new Date().toISOString(),
                model_used: usedModel,
            },
        });
    } catch (error) {
        console.error("AI Analytics error:", error);

        if (error.message?.includes("GEMINI_API_KEY")) {
            return res.status(500).json({
                status: 0,
                message: "Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.",
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                status: 0,
                message: "AI service is temporarily rate-limited. Please wait 1 minute and try again.",
            });
        }

        if (error.status === 401 || error.status === 403) {
            return res.status(500).json({
                status: 0,
                message: "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.",
            });
        }

        res.status(500).json({
            status: 0,
            message: "Failed to generate AI analytics. " + (error.message || ""),
        });
    }
};

