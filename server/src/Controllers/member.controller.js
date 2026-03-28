const jwt = require("jsonwebtoken");
const { User, ProjectMembers } = require("../Database/config");
const { Sequelize, Op } = require('sequelize');
const bcrypt = require("bcryptjs");
const emailService = require("../Services/email.service");


const { getPaginationMetadata, getPaginatedResponse } = require("../Helper/Pagination");

exports.getAllUsers = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get pagination parameters from query string
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        // Get users with pagination
        const users = await User.findAndCountAll({
            attributes: ['user_id', 'email', 'mobile_no', 'name', 'role'],
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']] // Optional: sort by creation date
        });

        // Format paginated response
        const response = getPaginatedResponse(users, page, limit);

        return res.status(200).json(response);

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Server error", err });
    }
};


exports.deleteEmployee = async (req, res) => {
    const { employee_id } = req.params;

    try {
        // Verify the requesting user is an admin
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findOne({ where: { email: decodedToken.email } });

        if (!adminUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the employee exists
        const employee = await User.findOne({
            where: {
                user_id: employee_id,
                role: { [Op.ne]: "admin" } // Prevent deleting other admins
            }
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found or cannot be deleted" });
        }

        // Check if employee is assigned to any projects
        const projectAssignments = await ProjectMembers.findAll({
            where: { user_id: employee_id }
        });

        if (projectAssignments.length > 0) {
            return res.status(400).json({
                message: "Cannot delete employee assigned to projects. Remove from projects first."
            });
        }

        // Delete the employee
        await User.destroy({ where: { user_id: employee_id } });

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Error deleting employee:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Server error", error });
    }
};

exports.adminCreateUser = async (req, res) => {
    const { name, email, mobile_no, password, role } = req.body;

    try {
        // Check if the requesting user is an admin
        const adminUser = req.user; // Assuming you have middleware that sets req.user
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can create users" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const existingMobile = await User.findOne({ where: { mobile_no } });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number already in use" });
        }

        // Generate a random password if not provided
        let userPassword = password;
        if (!userPassword) {
            userPassword = Math.random().toString(36).slice(-8); // Generate 8-character random password
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        // Create the user (automatically verified since admin is creating)
        const newUser = await User.create({
            name,
            email,
            mobile_no,
            password: hashedPassword,
            role: role || 'user', // Default to 'user' if role not specified
            verified: true, // Admin-created users are automatically verified
            verificationToken: null,
        });

        // Send welcome email with credentials
        await emailService.sendWelcomeEmail(
            email,
            name,
            email,
            userPassword // Sending plaintext password (only in welcome email)
        );

        res.status(201).json({
            message: "User created successfully. Welcome email sent.",
            data: {
                userId: newUser.user_id,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Error in adminCreateUser:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getEmployeeData = async (req, res) => {
    try {
        // Verify the token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Show all employee distribution to everyone (same org-wide view)
        const distinctRoles = await User.findAll({
            attributes: [
                [Sequelize.literal('DISTINCT role'), 'role']
            ],
            raw: true
        });
        const availableRoles = distinctRoles.map(item => item.role);

        // Get counts for each role
        const employeeCounts = await User.findAll({
            attributes: [
                'role',
                [Sequelize.literal('COUNT(user_id)'), 'value']
            ],
            group: ['role'],
            raw: true
        });

        // Format the response
        const formattedData = availableRoles.map(role => {
            const found = employeeCounts.find(item => item.role === role);
            return {
                name: role,
                value: found ? parseInt(found.value) : 0
            };
        });

        res.status(200).json({ data: formattedData });
    } catch (error) {
        console.error("Error in getEmployeeData:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};