const jwt = require("jsonwebtoken");
const { Notification, User } = require("../Database/config");
const { Op } = require("sequelize");

// Helper: Create a notification (reusable from other controllers)
const createNotification = async (user_id, type, title, message, reference_id = null) => {
    try {
        const notification = await Notification.create({
            user_id,
            type,
            title,
            message,
            reference_id,
            is_read: false,
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// GET /api/notification/ — Get user's notifications (paginated)
exports.getUserNotifications = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ status: 0, message: "User not found" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows: notifications } = await Notification.findAndCountAll({
            where: { user_id: user.user_id },
            order: [["created_at", "DESC"]],
            limit,
            offset,
        });

        res.status(200).json({
            status: 1,
            message: "Notifications fetched successfully",
            data: {
                notifications,
                page_information: {
                    current_page: page,
                    total_pages: Math.ceil(count / limit),
                    total_count: count,
                    per_page: limit,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// GET /api/notification/unread-count
exports.getUnreadCount = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ status: 0, message: "User not found" });
        }

        const count = await Notification.count({
            where: { user_id: user.user_id, is_read: false },
        });

        res.status(200).json({
            status: 1,
            data: { unread_count: count },
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// PUT /api/notification/read/:id — Mark one notification as read
exports.markAsRead = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ status: 0, message: "User not found" });
        }

        const notification = await Notification.findOne({
            where: { notification_id: req.params.id, user_id: user.user_id },
        });

        if (!notification) {
            return res.status(404).json({ status: 0, message: "Notification not found" });
        }

        await notification.update({ is_read: true });

        res.status(200).json({
            status: 1,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// PUT /api/notification/read-all — Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(404).json({ status: 0, message: "User not found" });
        }

        await Notification.update(
            { is_read: true },
            { where: { user_id: user.user_id, is_read: false } }
        );

        res.status(200).json({
            status: 1,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Error marking all as read:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// Export createNotification for use in other controllers
exports.createNotification = createNotification;
