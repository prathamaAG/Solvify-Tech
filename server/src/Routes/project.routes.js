const express = require("express");
const router = express.Router();
const projectController = require("../Controllers/project.controller");
const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");

router.post("/create", authenticateUser, projectController.createProject);
router.get("/all-project", authenticateUser, projectController.getProjects);
router.get("/project-data", authenticateUser, projectController.getProjectsData);

router.post("/add-member-to-project", authenticateUser, projectController.addMemberToProject);
router.post("/remove-member-from-project", authenticateUser, projectController.removeMemberFromProject);
router.get("/getuser/formember", authenticateUser, projectController.getAllUsers);
router.get("/get-project-members/:project_id", authenticateUser, projectController.getProjectMembers);

router.get("/:project_id", authenticateUser, projectController.getProject);
router.put("/", authenticateUser, projectController.updateProject);
router.delete("/:project_id", authenticateUser, projectController.deleteProject);

module.exports = router;
