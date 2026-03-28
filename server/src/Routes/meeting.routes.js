const express = require("express");
const router = express.Router();
const meetingController = require("../Controllers/meeting.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

// Create a meeting (admin only)
router.post("/create", authenticateUser, meetingController.createMeeting);

// Get all meetings for the user
router.get("/", authenticateUser, meetingController.getMeetings);

// Get meetings for a specific project
router.get("/project/:project_id", authenticateUser, meetingController.getProjectMeetings);

// Delete a meeting (admin only)
router.delete("/:meeting_id", authenticateUser, meetingController.deleteMeeting);

module.exports = router;
