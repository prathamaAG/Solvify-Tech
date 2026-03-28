const express = require("express");
const router = express.Router();
const authController = require("../Controllers/auth.controller");
const { verifyAdmin } = require("../Middleware/auth.middleware");
const memberController = require("../Controllers/member.controller");
const { authMiddleware, authorizeAdmin } = require("../Middleware/auth.middleware");

router.post("/signup", authController.signup);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification-email", authController.resendVerificationEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPasswordEmail);
router.post("/reset-password", authController.updatePassword);
router.get("/validate-token", authController.verifyToken);
router.post("/admin/create-user", verifyAdmin, memberController.adminCreateUser);
router.delete("/employees/:employee_id", memberController.deleteEmployee);

// Route to update user details (Admin only)
router.put("/update", authMiddleware,authorizeAdmin, authController.updateUser);

// Route to get all employees 
router.get("/employees",  authController.getEmployees);

//Dropdown list user name 
router.get("/employee-dropdown", authMiddleware, authController.getEmployeeDropdownList);

// Get current user's subordinate IDs (for hierarchy-based permissions)
router.get("/my-subordinates", authMiddleware, async (req, res) => {
    try {
        const { getSubordinateIds } = require("../Helper/hierarchyPermission");
        const subordinateIds = await getSubordinateIds(req.user.user_id);
        res.status(200).json({ status: 1, data: subordinateIds });
    } catch (error) {
        console.error("Error fetching subordinates:", error);
        res.status(500).json({ status: 0, message: "Server error" });
    }
});

module.exports = router;
