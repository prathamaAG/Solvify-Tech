const jwt = require("jsonwebtoken");
const { Card, Task, User, ProjectMembers, Project, Notification, sequelize } = require("../Database/config");
const { Sequelize, Op } = require('sequelize');
const { getSubordinateIds, isSuperiorOf, getTaskPermission } = require("../Helper/hierarchyPermission");

exports.createTask = async (req, res) => {
    const { card_id, title, description, due_date, position, priority } = req.body;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has access to the card (either admin or project member)
        const card = await Card.findOne({ where: { card_id: card_id } });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Permission: admin, project members, and superiors of project members can create tasks
        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [{ user_id: user.user_id }, { project_id: card.project_id }]
                }
            });

            if (!projectMember) {
                // Check if user is a superior of any project member
                const projectMembers = await ProjectMembers.findAll({
                    where: { project_id: card.project_id },
                    attributes: ["user_id"],
                    raw: true,
                });
                const memberIds = projectMembers.map(m => m.user_id);
                const subordinateIds = await getSubordinateIds(user.user_id);
                const hasSubordinateInProject = subordinateIds.some(id => memberIds.includes(id));

                if (!hasSubordinateInProject) {
                    return res.status(403).json({ status: 0, message: "Access denied" });
                }
            }
        }

        const newTask = await Task.create({
            card_id,
            title,
            description,
            due_date,
            position,
            priority,
        });

        res.status(201).json({
            message: "Task created successfully",
            data: newTask,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getTasks = async (req, res) => {
    const { card_id } = req.params;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has access to the card (either admin or project member)
        const card = await Card.findOne({ where: { card_id: card_id } });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [{ user_id: user.user_id }, { project_id: card.project_id }]
                }
            });

            if (!projectMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        const tasks = await Task.findAll({
            where: { card_id: card_id },
            order: [['position', 'ASC']] // Sort by 'position' in ascending order
        });

        res.status(200).json({ data: tasks });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.updateTask = async (req, res) => {
    const { task_id, title, description, due_date, position, priority, status, tags, assign_to_email } = req.body;
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the current user from the database
        const currentUser = await User.findOne({ where: { email: decodedToken.email } });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the task exists
        const task = await Task.findOne({ where: { task_id: task_id } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if the card exists
        const card = await Card.findOne({ where: { card_id: task.card_id } });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Check if user is at least a project member
        const projectMember = await ProjectMembers.findOne({
            where: {
                [Op.and]: [{ user_id: currentUser.user_id }, { project_id: card.project_id }]
            }
        });

        if (!projectMember && currentUser.role !== "admin") {
            return res.status(403).json({ status: 0, message: "Access denied. You are not a member of this project." });
        }

        // Hierarchy-based permission check
        const permission = await getTaskPermission(currentUser, task);

        if (permission === "denied") {
            return res.status(403).json({ status: 0, message: "You don't have permission to update this task" });
        }

        // 'self' can update own task but cannot reassign
        if (permission === "self" && assign_to_email) {
            return res.status(403).json({ status: 0, message: "Only your seniors or admins can reassign tasks" });
        }

        // 'superior' can reassign but only to themselves or their subordinates
        if (permission === "superior" && assign_to_email) {
            const assigneeUser = await User.findOne({ where: { email: assign_to_email } });
            if (assigneeUser) {
                const canAssignTo = await isSuperiorOf(currentUser.user_id, assigneeUser.user_id);
                if (!canAssignTo && assigneeUser.user_id !== currentUser.user_id) {
                    return res.status(403).json({ status: 0, message: "You can only reassign to yourself or your subordinates" });
                }
            }
        }

        // 'unassigned' tasks can be claimed by any project member, or assigned to their subordinates
        if (permission === "unassigned" && assign_to_email) {
            const assigneeUser = await User.findOne({ where: { email: assign_to_email } });
            if (assigneeUser) {
                const canAssignTo = await isSuperiorOf(currentUser.user_id, assigneeUser.user_id);
                if (!canAssignTo && assigneeUser.user_id !== currentUser.user_id) {
                    return res.status(403).json({ status: 0, message: "Unassigned tasks can only be claimed by yourself or assigned to your subordinates" });
                }
            }
        }

        // Prepare update data
        const updateData = {
            title,
            description,
            due_date,
            position,
            priority,
            status,
            tag: JSON.stringify(tags),
            assign_by: currentUser.user_id // Set the assigner to current user
        };

        // Handle assignment if assign_to_email is provided
        if (assign_to_email) {
            const assigneeUser = await User.findOne({ where: { email: assign_to_email } });
            if (!assigneeUser) {
                return res.status(404).json({ message: "Assignee user not found" });
            }
            updateData.assign_to = assigneeUser.user_id;
        } else if (assign_to_email === null) {
            // Clear assignment if null is explicitly passed
            updateData.assign_to = null;
        }

        // Update the task
        await Task.update(updateData, { where: { task_id: task_id } });

        // Create notifications
        try {
            // Notify assignee when task is assigned
            if (assign_to_email && updateData.assign_to && updateData.assign_to !== currentUser.user_id) {
                const project = await Project.findOne({ where: { project_id: card.project_id } });
                await Notification.create({
                    user_id: updateData.assign_to,
                    type: 'task_assigned',
                    title: 'New Task Assigned',
                    message: `You have been assigned "${title || task.title}" in project "${project?.project_name || 'Unknown'}".`,
                    reference_id: task_id,
                    is_read: false
                });
            }

            // Notify assigner when task is completed
            if (status === 'Completed' && task.status !== 'Completed' && task.assign_by) {
                await Notification.create({
                    user_id: task.assign_by,
                    type: 'task_completed',
                    title: 'Task Completed',
                    message: `"${task.title}" has been marked as completed by ${currentUser.name}.`,
                    reference_id: task_id,
                    is_read: false
                });
            }
        } catch (notifErr) {
            console.error("Error creating notification (non-blocking):", notifErr);
        }

        res.status(200).json({
            status: 1,
            message: "Task updated successfully",
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 0, message: "Server error", error });
    }
};

exports.deleteTask = async (req, res) => {
    const { task_id } = req.params;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has access to the task (either admin or project member)
        const task = await Task.findOne({ where: { task_id: task_id } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const card = await Card.findOne({ where: { card_id: task.card_id } });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Hierarchy-based permission: only admin or superior can delete tasks
        if (user.role !== "admin") {
            const permission = await getTaskPermission(user, task);

            if (permission === "denied" || permission === "self") {
                return res.status(403).json({ status: 0, message: "Only your seniors or admins can delete tasks" });
            }
            // 'superior' can delete — proceed
        }

        await Task.destroy({ where: { task_id: task_id } });

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.updateTaskPosition = async (req, res) => {

    const { taskId, newCardId, newPosition } = req.body;


    try {

        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        // Find the task to update
        const task = await Task.findOne({ where: { task_id: taskId } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Find the new card to ensure it exists
        const newCard = await Card.findOne({ where: { card_id: newCardId } });
        if (!newCard) {
            return res.status(404).json({ message: "New card not found" });
        }

        // Hierarchy-based permission: admin, self, or superior can move
        if (user.role !== "admin") {
            const permission = await getTaskPermission(user, task);

            if (permission === "denied") {
                return res.status(403).json({ status: 0, message: "You don't have permission to move this task" });
            }
            // 'self' can move own tasks, 'superior' can move subordinates' tasks
        }

        // Fetch all tasks in the new card
        const tasksInNewCard = await Task.findAll({
            where: { card_id: newCardId },
            order: [["position", "ASC"]], // Sort by position
        });

        // Adjust positions of tasks in the new card to make space for the moved task
        for (let i = 0; i < tasksInNewCard.length; i++) {
            if (tasksInNewCard[i].position >= newPosition) {
                tasksInNewCard[i].position += 1; // Increment position
                await tasksInNewCard[i].save();
            }
        }

        // Update the task's card_id and position
        task.card_id = newCardId;
        task.position = newPosition;

        // Save the updated task
        await task.save();

        // Return success response
        res.status(200).json({ message: "Task position updated successfully" });
    } catch (error) {
        console.error("Error updating task position:", error);
        res.status(500).json({ message: "Failed to update task position" });
    }

};

exports.getUserTasks = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Verify the requesting user matches the token
        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const user_id = user.user_id;

        const tasks = await Task.findAll({
            where: { assign_to: user_id },
            include: [
                {
                    model: Card,
                    attributes: ['card_id', 'title', 'project_id'],
                    include: [
                        {
                            model: Project,
                            attributes: ['project_id', 'project_name']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'Assigner',
                    attributes: ['user_id', 'name', 'email'],
                    foreignKey: 'assign_by'
                }
            ],
            order: [
                ['position', 'ASC'] // Sort tasks by position
            ]
        });

        // Format the response to include project, card, and assigner information
        const formattedTasks = tasks.map(task => ({
            task_id: task.task_id,
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            position: task.position,
            priority: task.priority,
            status: task.status,
            assign_by: task.Assigner ? task.Assigner.name : null, // Use assigner's name instead of ID
            assign_to: task.assign_to,
            created_at: task.created_at,
            updated_at: task.updated_at,
            card: {
                card_id: task.Card.card_id,
                title: task.Card.title,
                project: {
                    project_id: task.Card.Project.project_id,
                    project_name: task.Card.Project.project_name
                }
            }
        }));

        res.status(200).json({ data: formattedTasks });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getTaskDetails = async (req, res) => {
    const { task_id } = req.params;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the current user from the database
        const currentUser = await User.findOne({ where: { email: decodedToken.email } });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the task with associated card and project information
        const task = await Task.findOne({
            where: { task_id: task_id },
            include: [
                {
                    model: Card,
                    attributes: ['project_id'],
                },
                {
                    model: User,
                    as: 'Assignee',
                    attributes: ['user_id', 'name', 'email'],
                    required: false,
                    where: { user_id: Sequelize.col('Task.assign_to') }
                },
                {
                    model: User,
                    as: 'Assigner',
                    attributes: ['user_id', 'name', 'email'],
                    required: false,
                    where: { user_id: Sequelize.col('Task.assign_by') }
                }
            ],
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check permissions (admin or project member)
        if (currentUser.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [
                        { user_id: currentUser.user_id },
                        { project_id: task.Card.project_id }
                    ]
                }
            });

            if (!projectMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Format the assign_by and assign_to data
        const assign_by = task.Assigner ? {
            user_id: task.Assigner.user_id,
            name: task.Assigner.name,
            email: task.Assigner.email
        } : null;

        const assign_to = task.Assignee ? {
            user_id: task.Assignee.user_id,
            name: task.Assignee.name,
            email: task.Assignee.email
        } : null;

        // Format the response with all task details
        const response = {
            project_id: task.Card.project_id,
            title: task.title,
            task_id: task.task_id,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assign_by,
            assign_to,
            due_date: task.due_date,
            position: task.position,
            tags: task.tag ? JSON.parse(task.tag) : [],
            created_at: task.created_at,
            updated_at: task.updated_at,
        };

        res.status(200).json({
            status: 1,
            message: "Task details fetched successfully",
            data: response
        });

    } catch (error) {
        console.error("Error fetching task details:", error);
        res.status(500).json({
            status: 0,
            message: "Server error",
            error: error.message
        });
    }
};

exports.getTasksData = async (req, res) => {
    try {
        // Verify the token and get user info
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // For admin, get all tasks. For regular users, get only tasks assigned to them
        let whereClause = {};

        if (user.role !== "admin") {
            // Show only the user's own assigned tasks
            whereClause = { assign_to: user.user_id };
        }

        // Group tasks by status and count them
        const taskData = await Task.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('task_id')), 'value']
            ],
            where: whereClause,
            group: ['status'],
            raw: true
        });

        // Format the response with all possible statuses (even those with zero counts)
        const allStatuses = ["Pending", "In progress", "To be verified", "Completed"];

        const formattedData = allStatuses.map(status => {
            const found = taskData.find(item => item.status === status);
            return {
                name: status,
                value: found ? parseInt(found.value) : 0
            };
        });

        res.status(200).json({ data: formattedData });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getAdminTasks = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const user_id = user.user_id;

        // Tasks assigned TO the admin
        const myTasks = await Task.findAll({
            where: { assign_to: user_id },
            include: [
                {
                    model: Card,
                    attributes: ['card_id', 'title', 'project_id'],
                    include: [
                        {
                            model: Project,
                            attributes: ['project_id', 'project_name']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'Assigner',
                    attributes: ['user_id', 'name', 'email'],
                    foreignKey: 'assign_by'
                }
            ],
            order: [['position', 'ASC']]
        });

        // Tasks assigned BY the admin to OTHER users
        const assignedByMe = await Task.findAll({
            where: {
                assign_by: user_id,
                assign_to: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: user_id }] }
            },
            include: [
                {
                    model: Card,
                    attributes: ['card_id', 'title', 'project_id'],
                    include: [
                        {
                            model: Project,
                            attributes: ['project_id', 'project_name']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'Assignee',
                    attributes: ['user_id', 'name', 'email'],
                    foreignKey: 'assign_to'
                },
                {
                    model: User,
                    as: 'Assigner',
                    attributes: ['user_id', 'name', 'email'],
                    foreignKey: 'assign_by'
                }
            ],
            order: [['position', 'ASC']]
        });

        // Format myTasks
        const formattedMyTasks = myTasks.map(task => ({
            task_id: task.task_id,
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            position: task.position,
            priority: task.priority,
            status: task.status,
            assign_by: task.Assigner ? task.Assigner.name : null,
            assign_to: task.assign_to,
            created_at: task.created_at,
            updated_at: task.updated_at,
            card: {
                card_id: task.Card.card_id,
                title: task.Card.title,
                project: {
                    project_id: task.Card.Project.project_id,
                    project_name: task.Card.Project.project_name
                }
            }
        }));

        // Format assignedByMe
        const formattedAssignedByMe = assignedByMe.map(task => ({
            task_id: task.task_id,
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            position: task.position,
            priority: task.priority,
            status: task.status,
            assign_by: task.Assigner ? task.Assigner.name : null,
            assign_to: task.assign_to,
            assignee_name: task.Assignee ? task.Assignee.name : null,
            assignee_email: task.Assignee ? task.Assignee.email : null,
            created_at: task.created_at,
            updated_at: task.updated_at,
            card: {
                card_id: task.Card.card_id,
                title: task.Card.title,
                project: {
                    project_id: task.Card.Project.project_id,
                    project_name: task.Card.Project.project_name
                }
            }
        }));

        res.status(200).json({
            status: 1,
            data: {
                myTasks: formattedMyTasks,
                assignedByMe: formattedAssignedByMe
            }
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};