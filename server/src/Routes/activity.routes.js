const express = require("express");
const router = express.Router();
const activityController = require("../Controllers/activity.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

router.post("/heartbeat", authenticateUser, activityController.receiveHeartbeat);
router.get("/report/:tracking_id", authenticateUser, activityController.getActivityReport);
router.get("/summary", authenticateUser, activityController.getActivitySummary);

module.exports = router;
