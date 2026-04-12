const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/notification.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

// Get user's notifications
router.get("/", authenticateUser, notificationController.getUserNotifications);

// Get unread count
router.get("/unread-count", authenticateUser, notificationController.getUnreadCount);

// Mark all notifications as read
router.put("/read-all", authenticateUser, notificationController.markAllAsRead);

// Mark single notification as read
router.put("/read/:id", authenticateUser, notificationController.markAsRead);

module.exports = router;
