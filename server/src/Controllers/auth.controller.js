const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../Database/config");
const emailService = require("../Services/email.service");
const {
   getPaginationMetadata,
   getPaginatedResponse,
} = require("../Helper/Pagination");
const { Op } = require("sequelize");

exports.signup = async (req, res) => {
   const { name, email, mobile_no, password, role = "user" } = req.body;

   try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
         return res.status(400).json({ message: "Email already in use" });
      }

      const existingMobile = await User.findOne({ where: { mobile_no } });
      if (existingMobile) {
         return res
            .status(400)
            .json({ message: "Mobile number already in use" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
         expiresIn: "1h",
      });

      let reportingPersonId = null;

      // If the user is not an admin, assign a reporting person (any existing admin)
      if (role !== "admin") {
         const adminUser = await User.findOne({ where: { role: "admin" } });

         if (!adminUser) {
            return res.status(400).json({
               message: "No admin found. Please create an admin first.",
            });
         }

         reportingPersonId = adminUser.user_id;
      }

      // Save user to database
      const newUser = await User.create({
         name,
         email,
         mobile_no,
         password: hashedPassword,
         verificationToken,
         role,
         reporting_person_id: reportingPersonId,
      });

      // Send verification email
      await emailService.sendVerificationEmail(email, name, verificationToken);

      res.status(201).json({
         message: "User registered. Please verify your email.",
      });
   } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Server error", error });
   }
};

exports.verifyEmail = async (req, res) => {
   const { token } = req.query;
   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decoded.email } });

      if (!user) {
         return res.status(400).json({ message: "Sign-up again !!" });
      }

      if (user.verified) {
         return res.status(201).json({ message: "Email already verified" });
      }

      user.verified = true;
      user.verificationToken = null;
      await user.save();

      return res.status(201).json({ message: "Email Verified Successfully" });
   } catch (error) {
      res.status(400).json({ message: "Invalid or expired token" });
   }
};

exports.resendVerificationEmail = async (req, res) => {
   const { email } = req.body;
   try {
      const user = await User.findOne({ where: { email } });
      if (!user || user.verified) {
         return res
            .status(400)
            .json({ message: "Email not found or already verified" });
      }

      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
         expiresIn: "1h",
      });
      user.verificationToken = verificationToken;
      await user.save();

      await emailService.sendVerificationEmail(
         email,
         user.name,
         verificationToken
      );

      res.status(201).json({ message: "Verification email sent again." });
   } catch (error) {
      res.status(500).json({ message: "Server error", error });
   }
};

exports.login = async (req, res) => {
   const { email, password } = req.body;

   try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
         return res.status(400).json({ message: "Invalid credentials" });
      }

      if (!user.verified) {
         const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
         });

         user.verificationToken = verificationToken;
         await user.save();

         await emailService.sendVerificationEmail(
            email,
            user.name,
            verificationToken
         );

         return res.status(401).json({
            message:
               "Please verify your email first. Verification email sent again.",
         });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
         return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
         { user_id: user.user_id, email: user.email, role: user.role },
         process.env.JWT_SECRET,
         {
            expiresIn: "7d",
         }
      );

      res.status(200).json({
         message: "Login successful",
         data: { token: token, isAdmin: user.role == "admin" ? true : false, email: user.email, user_id: user.user_id, name: user.name },
      });
   } catch (error) {
      res.status(500).json({ message: "Server error", error });
   }
};

exports.forgotPasswordEmail = async (req, res) => {
   const { email } = req.body;

   try {
      // Check if the user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
         return res.status(400).json({ message: "Email not found." });
      }

      // Generate a password reset token
      const resetToken = jwt.sign(
         { user_id: user.user_id },
         process.env.JWT_SECRET,
         {
            expiresIn: "1h",
         }
      );

      // Save the reset token in the user's record
      user.resetToken = resetToken;
      await user.save();

      // Send the reset password email
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`; // Update the URL as needed
      await emailService.sendPasswordResetEmail(email, user.name, resetLink);

      res.status(200).json({
         message: "Password reset email sent successfully.",
      });
   } catch (error) {
      console.error("Error in forgotPasswordEmail:", error);
      res.status(500).json({ message: "Server error", error });
   }
};

exports.updatePassword = async (req, res) => {
   const { token, newPassword, confirmPassword } = req.body;

   try {
      // Verify the token
      // Check if token is provided
      if (!token) {
         return res.status(400).json({ message: "Token is required." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.user_id) {
         return res.status(400).json({ message: "Invalid or expired token." });
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
         return res.status(400).json({ message: "Passwords do not match." });
      }

      // Find the user by ID
      const user = await User.findOne({ where: { user_id: decoded.user_id } });
      if (!user) {
         return res.status(400).json({ message: "User not found." });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token
      user.password = hashedPassword;
      user.resetToken = null; // Clear the reset token
      await user.save();

      res.status(200).json({ message: "Password updated successfully." });
   } catch (error) {
      console.error("Error in updatePassword:", error);
      if (error.name === "JsonWebTokenError") {
         return res.status(400).json({ message: "Invalid or expired token." });
      }
      res.status(500).json({ message: "Server error", error });
   }
};

exports.verifyToken = async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
         return res.status(401).json({
            status: 0,
            message: "Unauthorized: No token provided",
            data: null,
         });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
         if (err) {
            return res.status(404).json({
               status: 0,
               message: "Token expired or invalid",
               data: null,
            });
         }

         return res.status(200).json({
            status: 1,
            message: "Token is valid",
            data: { user: decoded, isValid: true },
         });
      });
   } catch (error) {
      return res.status(500).json({
         status: 0,
         message: "Internal server error",
         data: null,
      });
   }
};

//Update User

exports.updateUser = async (req, res) => {
   const { user_id, name, mobile_no, role, reporting_person_id, technology } =
      req.body;
   const adminId = req.user.user_id; // Assume user ID is in the request after authentication

   try {
      // Check if the authenticated user is an admin
      const adminUser = await User.findOne({
         where: { user_id: adminId, role: "admin" },
      });

      if (!adminUser) {
         return res
            .status(403)
            .json({ message: "Only admins can update users." });
      }

      // Fetch the user to be updated
      const user = await User.findByPk(user_id);

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      // Prevent changing email
      // if (req.body.email) {
      //    return res.status(400).json({ message: "Email cannot be updated" });
      // }

      // Prevent changing admin's reporting person (admin should have no reporting person)
      if (user.role === "admin" && reporting_person_id) {
         return res.status(400).json({
            message: "Admin users cannot have a reporting person.",
         });
      }

      // Update allowed fields
      await user.update({
         name: name || user.name,
         mobile_no: mobile_no || user.mobile_no,
         role: role || user.role,
         reporting_person_id: reporting_person_id || user.reporting_person_id,
         technology: technology || user.technology,
      });

      res.status(200).json({ message: "User details updated successfully" });
   } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Server error", error });
   }
};

// Get ALL employees
exports.getEmployees = async (req, res) => {
   try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database
      const user = await User.findOne({ where: { email: decodedToken.email } });

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      // Only admins can access employee data
      // if (user.role !== "admin") {
      //    return res
      //       .status(403)
      //       .json({ message: "Access denied. Admins only." });
      // }

      // Get pagination metadata
      const { page, limit, offset } = getPaginationMetadata(
         req.query.page,
         req.query.limit
      );

      // Fetch all employees (including reporting person's name)
      const data = await User.findAndCountAll({
         attributes: [
            "user_id",
            "name",
            "email",
            "mobile_no",
            "role",
            "reporting_person_id",
            "technology",
         ],
         include: [
            {
               model: User,
               as: "reportingPerson", // Using the alias defined in model
               attributes: ["name"], // Fetch only reporting person's name
               required: false, // Include users even if they don’t have a reporting person
            },
         ],
         limit,
         offset,
      });

      if (!data.rows.length) {
         return res.status(404).json({ message: "No employees found" });
      }

      // Transform data to include reporting person's name
      const transformedData = data.rows.map((emp) => ({
         ...emp.toJSON(),
         reporting_person_name: emp.reportingPerson
            ? emp.reportingPerson.name
            : null,
      }));

      res.status(200).json(
         getPaginatedResponse({ ...data, rows: transformedData }, page, limit)
      );
   } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Server error", error });
   }
};

exports.getEmployeeDropdownList = async (req, res) => {
   try {
      const employees = await User.findAll({
         attributes: ["user_id", "name"], // Select only Employee ID & Name
         order: [["name", "ASC"]], // Sort by name
      });

      if (!employees.length) {
         return res.status(404).json({ message: "No employees found" });
      }

      res.status(200).json({
         data: {
            employees,
         },
      });
   } catch (error) {
      console.error("Error fetching employee dropdown list:", error);
      res.status(500).json({ message: "Server error", error });
   }
};
