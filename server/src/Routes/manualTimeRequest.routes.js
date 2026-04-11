const express = require("express");
const router = express.Router();
const ManualTimeRequestController = require("../Controllers/manualTimeRequest.controller.js");
const {
   verifyAdmin
} = require("../Middleware/auth.middleware");
// Send a manual time request
router.post(
   "/manual-request/send",
   ManualTimeRequestController.requestManualTimeEntry
);

// Get all manual requests for a project (Admin only)
router.get(
   "/manual-request/:project_id",
   verifyAdmin,
   ManualTimeRequestController.getRequestsByProject
);

// Accept or reject a manual request (Admin only)
router.put(
   "/manual-request-action/",
   verifyAdmin,
   ManualTimeRequestController.handleManualRequestStatus
);

module.exports = router;
