const express = require("express");
const router = express.Router();
const memberController = require("../Controllers/member.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");


// // Get all tasks for a specific card
// console.log(memberController); // Check if this logs the correct object
// console.log(memberController.getAllUsers); // Check if this logs the function

router.get("/", authenticateUser, memberController.getAllUsers);
router.get("/employee-data", authenticateUser, memberController.getEmployeeData);

module.exports = router;