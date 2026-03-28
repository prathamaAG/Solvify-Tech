const express = require("express");
const router = express.Router();
const aiController = require("../Controllers/ai.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

// Get AI-generated analytics summary
router.get("/analytics", authenticateUser, aiController.getAIAnalytics);

module.exports = router;
