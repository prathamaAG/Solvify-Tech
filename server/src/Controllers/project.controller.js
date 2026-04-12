const jwt = require("jsonwebtoken");
const { getPaginationMetadata, getPaginatedResponse } = require("../Helper/Pagination");
const { Project, User, ProjectMembers, sequelize, Card } = require("../Database/config");
const { Op, Sequelize } = require("sequelize");


exports.createProject = async (req, res) => {
    const { project_name, description, start_date, due_date, status, technology } = req.body;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const newProject = await Project.create({
            project_name,
            description,
            start_date,
            due_date,
            status,
            technology,
        });

        // Create default cards for the project
        const defaultCards = [
            { title: "To-do", position: 1 },
            { title: "In Progress", position: 2 },
            { title: "Done", position: 3 },
        ];

        // Use Promise.all to create all cards in parallel
        const createdCards = await Promise.all(
            defaultCards.map((card) =>
                Card.create({
                    project_id: newProject.project_id,
                    title: card.title,
                    position: card.position,
                    created_by: user.user_id,
                })
            )
        );

        res.status(201).json({
            message: "Project created successfully",
            project: newProject,
        });
    } catch (error) {
        console.error("Error:", error); // Log the error for better insight
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { user_id } = user;
        const { page, limit, offset } = getPaginationMetadata(req.query.page, req.query.limit); // Get pagination metadata

        // console.log("page: " + page + " limit: " + limit + " offset" + offset);

        let projects, count;

        if (user.role === "admin") {
            try {
                const data = await Project.findAndCountAll({
                    limit,
                    offset
                });
                projects = data.rows;
                count = data.count;
            } catch (error) {
                console.error("Error:", error);
                return res.status(500).json({ message: "Server error", error });
            }
        } else {
            const data = await Project.findAndCountAll({
                include: [{
                    model: User,
                    where: { user_id: user.user_id },
                    through: { attributes: [] }
                }],
                limit,
                offset
            });

            projects = data.rows;
            count = data.count;

            if (!projects.length) {
                return res.status(404).json({ message: "No projects found for this member" });
            }
        }

        res.status(200).json(getPaginatedResponse({ rows: projects, count }, page, limit)); // Return paginated response

    } catch (error) {
        console.error("Error fetching user projects:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getProject = async (req, res) => {
    try {
        const { project_id } = req.params; // Extract ID from URL
        const project = await Project.findOne({ where: { project_id: project_id } });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ data: project });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.updateProject = async (req, res) => {
    const { project_id, project_name, description, start_date, due_date, status, technology } = req.body;

    try {
        // Validate required fields
        if (!project_id) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Fetch project
        const project = await Project.findOne({ where: { project_id: project_id } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Update project
        await project.update({
            project_name,
            description,
            start_date,
            due_date,
            status,
            technology,
        });

        res.status(200).json({
            status: 1,
            message: "Project updated successfully",
            data: project // Optional: return the updated project data
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: 0,
            message: "Server error",
            error: error.message // Only send the error message in production
        });
    }
};

exports.deleteProject = async (req, res) => {
    const { project_id } = req.params;
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Fetch project
        const project = await Project.findOne({ where: { project_id: project_id } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await project.destroy();
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error:", error); // Log the error for better insight
        res.status(500).json({ message: "Server error", error });
    }
};

exports.addMemberToProject = async (req, res) => {
    try {
        const { project_id, userIds } = req.body;

        // Validate input
        if (!userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ message: "userIds should be an array" });
        }

        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Verify requesting user
        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check which users are already members
        const existingMembers = await ProjectMembers.findAll({
            where: {
                project_id,
                user_id: userIds
            }
        });

        const existingUserIds = existingMembers.map(member => member.user_id);
        const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

        if (newUserIds.length === 0) {
            return res.status(400).json({
                message: "All selected users are already members of this project",
                existingUserIds
            });
        }

        // Add new members
        const createdMembers = await Promise.all(
            newUserIds.map(user_id =>
                ProjectMembers.findOrCreate({
                    where: { project_id, user_id },
                    defaults: { project_id, user_id }
                })
            )
        );

        const addedCount = createdMembers.filter(([instance, created]) => created).length;

        res.status(201).json({
            message: "Members added successfully",
            addedCount,
            data: existingUserIds
        });
    } catch (error) {
        console.error("Error adding members:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.removeMemberFromProject = async (req, res) => {
    try {
        const { project_id, user_id } = req.body;

        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check if the member exists in the project
        const existingMember = await ProjectMembers.findOne({ where: { project_id, user_id } });

        if (!existingMember) {
            return res.status(404).json({ message: "User is not a member of this project" });
        }

        // Remove the member from the project
        await ProjectMembers.destroy({ where: { project_id, user_id } });

        res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.getProjectMembers = async (req, res) => {
    try {
        const { project_id } = req.params;

        if (!project_id) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        // Use standard Sequelize ORM to bypass raw SQL table-casing bugs on DigitalOcean
        const project = await Project.findByPk(project_id, {
            include: [{
                model: User,
                attributes: ["user_id", "name", "email", "role"],
                through: { attributes: [] } // Exclude junction table data
            }]
        });

        if (!project || !project.Users || project.Users.length === 0) {
            return res.status(404).json({ message: "No members found for this project" });
        }

        res.status(200).json({ data: project.Users });
    } catch (error) {
        console.error("Error fetching project members:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const users = await User.findAll({ attributes: ['email', 'user_id', 'name', 'role'] });
        return res.status(200).json({ data: users });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Server error", err });
    }
};

exports.getProjectsData = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Build project filter: admin sees all, user sees only their projects
        let projectWhereClause = {};
        if (user.role !== "admin") {
            const userProjects = await ProjectMembers.findAll({
                where: { user_id: user.user_id },
                attributes: ["project_id"],
                raw: true,
            });
            const projectIds = userProjects.map(p => p.project_id);
            projectWhereClause = { project_id: { [Op.in]: projectIds } };
        }

        const projects = await Project.findAll({
            where: projectWhereClause,
            attributes: ["project_id", "project_name", "status", "start_date", "due_date"],
            raw: true,
        });

        // For each project, get task completion stats
        const { Task } = require("../Database/config");
        const projectData = await Promise.all(
            projects.map(async (project) => {
                const cards = await Card.findAll({
                    where: { project_id: project.project_id },
                    attributes: ["card_id"],
                    raw: true,
                });
                const cardIds = cards.map(c => c.card_id);

                if (cardIds.length === 0) {
                    return {
                        project_name: project.project_name,
                        status: project.status,
                        completion: 0,
                        total_tasks: 0,
                        completed_tasks: 0,
                    };
                }

                const totalTasks = await Task.count({
                    where: { card_id: { [Op.in]: cardIds } },
                });
                const completedTasks = await Task.count({
                    where: {
                        card_id: { [Op.in]: cardIds },
                        status: "Completed",
                    },
                });

                const completion = totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0;

                return {
                    project_name: project.project_name,
                    status: project.status,
                    completion,
                    total_tasks: totalTasks,
                    completed_tasks: completedTasks,
                };
            })
        );

        // Get org-wide total project count (same for everyone)
        const totalProjectsCount = await Project.count();

        res.status(200).json({ data: projectData, totalProjectsCount });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};