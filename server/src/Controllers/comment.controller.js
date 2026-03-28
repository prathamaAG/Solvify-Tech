const { Comment, CommentFile, User, Task, Card, Project, ProjectMembers } = require('../Database/config');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { uploadToCloudinary } = require('../services/fileUpload');

// Helper function to verify user access to a task
const verifyTaskAccess = async (user, task_id) => {
    const task = await Task.findOne({
        where: { task_id },
        include: [{
            model: Card,
            include: [{
                model: Project,
            }]
        }]
    });

    if (!task) return { error: 'Task not found' };

    // console.log("task : ", task);
    // console.log("dataValues : ", task.dataValues);
    // console.log("card : ", task.dataValues.Card);

    if (user.role !== "admin") {
        const projectMember = await ProjectMembers.findOne({
            where: {
                [Op.and]: [
                    { user_id: user.user_id },
                    { project_id: task.dataValues.Card.project_id }
                ]
            }
        });
        if (!projectMember) return { error: 'Access denied' };
    }

    return { task };
};

exports.createComment = async (req, res) => {
    const { task_id, text, htmlText } = req.body;
    const files = req.files || [];

    try {
        // Authentication
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify task access
        const { error, task } = await verifyTaskAccess(user, task_id);
        if (error) return res.status(error === 'Access denied' ? 403 : 404).json({ message: error });

        // Create comment
        const comment = await Comment.create({
            task_id,
            text,
            htmlText,
            sender: user.user_id
        });

        // Process file uploads
        const uploadedFiles = [];
        for (const file of files) {
            try {
                const result = await uploadToCloudinary(file.path);
                const fileRecord = await CommentFile.create({
                    comment_id: comment.comment_id,
                    name: file.originalname,
                    url: result.url,
                    type: file.mimetype
                });
                uploadedFiles.push(fileRecord);
            } catch (fileError) {
                console.error(`Error uploading file ${file.originalname}:`, fileError);
            }
        }

        // Return created comment with PROPERLY ALIASED associations
        const createdComment = await Comment.findByPk(comment.comment_id, {
            include: [
                {
                    model: User,
                    as: 'commentSender',
                    attributes: ['user_id', 'name', 'email']
                },
                {
                    model: CommentFile,
                    as: 'files'
                }
            ]
        });

        res.status(201).json({
            message: "Comment created successfully",
            data: createdComment
        });


    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getTaskComments = async (req, res) => {
    const { task_id } = req.params;

    try {
        // Authentication
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify task access
        const { error } = await verifyTaskAccess(user, task_id);
        if (error) return res.status(error === 'Access denied' ? 403 : 404).json({ message: error });

        // Get comments
        const comments = await Comment.findAll({
            where: { task_id },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'commentSender',
                    attributes: ['user_id', 'name', 'email']
                },
                {
                    model: CommentFile,
                    as: 'files'
                }
            ]
        });

        res.status(200).json({ data: comments });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.updateComment = async (req, res) => {

    const { text, htmlText, comment_id } = req.body;
    const files = req.files || [];

    try {
        // Authentication
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get comment with task and project info
        const comment = await Comment.findOne({
            where: { comment_id },
            include: [{
                model: Task,
                include: [{
                    model: Card,
                    include: [{
                        model: Project,
                    }]
                }]
            }]
        });
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Verify permissions (admin, project member, or comment owner)
        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [
                        { user_id: user.user_id },
                        { project_id: comment.task.card.project_id }
                    ]
                }
            });
            if (!projectMember && comment.sender !== user.user_id) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Update comment
        await Comment.update(
            { text, htmlText },
            { where: { comment_id } }
        );

        // Process new file uploads
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const result = await uploadToCloudinary(file.path);
                return CommentFile.create({
                    comment_id,
                    name: file.originalname,
                    url: result.secure_url,
                    type: file.mimetype
                });
            })
        );

        // Return updated comment
        const updatedComment = await Comment.findByPk(comment_id, {
            include: [
                {
                    model: User,
                    as: 'commentSender',
                    attributes: ['user_id', 'name', 'email']
                },
                {
                    model: CommentFile,
                    as: 'files'
                }
            ]
        });

        res.status(200).json({
            message: "Comment updated successfully",
            data: updatedComment
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.deleteComment = async (req, res) => {
    const { comment_id } = req.body;

    try {
        // Authentication
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get comment with task and project info
        const comment = await Comment.findOne({
            where: { comment_id },
            include: [{
                model: Task,
                include: [{
                    model: Card,
                    include: [{
                        model: Project,
                    }]
                }]
            }]
        });
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Verify permissions (admin, project member, or comment owner)
        if (user.role !== "admin") {
            const projectMember = await ProjectMembers.findOne({
                where: {
                    [Op.and]: [
                        { user_id: user.user_id },
                        { project_id: comment.task.card.project_id }
                    ]
                }
            });
            if (!projectMember && comment.sender !== user.user_id) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Delete associated files
        await CommentFile.destroy({ where: { comment_id } });

        // Delete comment
        await Comment.destroy({ where: { comment_id } });

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};