const express = require("express");
const router = express.Router();
const taskController = require("../Controllers/task.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

// Create a new task in a card
router.post("/create", authenticateUser, taskController.createTask);

// Get all tasks for a specific card
router.get("/:card_id", authenticateUser, taskController.getTasks);

router.get("/tasks/data", authenticateUser, taskController.getTasksData);

// Update a task
router.put("/", authenticateUser, taskController.updateTask);

// Delete a task
router.delete("/:task_id", authenticateUser, taskController.deleteTask);

// Update task position
router.put("/tasks/updateTaskPosition", authenticateUser, taskController.updateTaskPosition);

// Get All Task of User
router.get("/user/tasks", authenticateUser, taskController.getUserTasks);

// Get Admin Tasks (own tasks + tasks assigned by admin)
router.get("/admin/tasks", authenticateUser, taskController.getAdminTasks);

// Get Task Details
router.get("/task-details/:task_id", authenticateUser, taskController.getTaskDetails);

module.exports = router;