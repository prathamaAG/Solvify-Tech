const jwt = require("jsonwebtoken");
const { Project, User, ProjectMembers, sequelize, Card, Task } = require("../Database/config");
const { Op, Sequelize } = require("sequelize");

exports.getCards = async (req, res) => {
    const { project_id } = req.params; // Extract ID from URL
    if (project_id == null) {
        return res.status(400).json({ message: "Project ID is required" });
    }

    try {
        // console.log("get all projetcs called");
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the decoded email
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {

            const projectmember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [{ user_id: user.user_id }, { project_id: project_id }]
                }
            });

            if (!projectmember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        const cards = await Card.findAll({
            where: { project_id: project_id },
            order: [['position', 'ASC']] // Sort by 'position' in ascending order
        });
        res.status(200).json({ data: cards });
    } catch (error) {
        console.error("Error:", error); // Log the error for better insight
        res.status(500).json({ message: "Server error", error });
    }
};

exports.createCard = async (req, res) => {
    const { title, description, priority, position, project_id } = req.body;
    try {
        // Validate required fields
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (!project_id) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        // Verify authentication
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check project access (admin or project member)
        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [
                        { user_id: user.user_id },
                        { project_id: project_id }
                    ]
                }
            });

            if (!projectMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Verify project exists
        const project = await Project.findByPk(project_id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Determine position if not provided
        let cardPosition = position;
        if (!position) {
            const lastCard = await Card.findOne({
                where: { project_id },
                order: [['position', 'DESC']],
                limit: 1
            });
            cardPosition = lastCard ? lastCard.position + 1 : 0;
        }

        // Create the card
        const newCard = await Card.create({
            title,
            description: description || null,
            priority: priority || "low",
            position: cardPosition,
            project_id,
            created_by: user.user_id
        });

        res.status(201).json({
            message: "Card created successfully",
            data: newCard
        });

    } catch (error) {
        console.error("Error creating card:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ message: "Server error", error });
    }
};

exports.updateCard = async (req, res) => {
    const { title, position, priority, description, card_id } = req.body;

    try {
        // Validate at least one field is being updated
        if (!title && !position && !priority && !description) {
            return res.status(400).json({ message: "At least one field must be updated" });
        }

        // Verify authentication
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the card to update
        const card = await Card.findByPk(card_id);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Check project access (admin or project member)
        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [
                        { user_id: user.user_id },
                        { project_id: card.project_id }
                    ]
                }
            });

            if (!projectMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Prepare update fields
        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (priority !== undefined) updateFields.priority = priority;
        if (position !== undefined) updateFields.position = position;

        // Update the card
        await card.update(updateFields);

        res.status(200).json({
            message: "Card updated successfully",
            data: card
        });

    } catch (error) {
        console.error("Error updating card:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ message: "Server error", error });
    }
};

exports.deleteCard = async (req, res) => {
    const { card_id } = req.params;

    try {
        // Verify authentication
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the card to delete
        const card = await Card.findByPk(card_id);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Check project access (admin or project member)
        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [
                        { user_id: user.user_id },
                        { project_id: card.project_id }
                    ]
                }
            });

            if (!projectMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Delete all tasks associated with this card first
        await Task.destroy({ where: { card_id: card_id } });

        // Delete the card
        await card.destroy();

        res.status(200).json({
            message: "Card and associated tasks deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting card:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Server error", error });
    }
};