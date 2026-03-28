const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/comment.controller');
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");
const uploadMiddleware = require('../Middleware/upload.middleware');

// Create comment (with file upload support)
router.post(
    '/create',
    authenticateUser,
    uploadMiddleware.array('files'),
    commentController.createComment
);

// Get all comments for a task
router.get('/task/:task_id', authenticateUser, commentController.getTaskComments);

// Update comment (with optional file upload)
router.put(
    '/update',
    authenticateUser,
    uploadMiddleware.array('files'),
    commentController.updateComment
);

// Delete comment
router.delete('/', authenticateUser, commentController.deleteComment);

module.exports = router;