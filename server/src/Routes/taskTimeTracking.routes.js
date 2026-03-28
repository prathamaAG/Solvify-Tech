const express = require('express');
const router = express.Router();
const taskTimeTrackingController = require('../Controllers/taskTimeTracking.controller');
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

// ✅ Endpoints MUST match api-base.constants.tsx
router.post('/start', authenticateUser, taskTimeTrackingController.startTracking);
router.post('/stop', authenticateUser, taskTimeTrackingController.stopTracking);
router.get('/active', authenticateUser, taskTimeTrackingController.getActiveTracking);
router.get('/report', authenticateUser, taskTimeTrackingController.getTimeTrackingReport);
router.get('/missed-tracker', authenticateUser, taskTimeTrackingController.getMissedTracker);

module.exports = router;