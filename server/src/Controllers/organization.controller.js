const { User } = require("../Database/config");

exports.getOrganizationTree = async (req, res) => {
   try {
      const users = await User.findAll({
         attributes: ["user_id", "name", "role", "reporting_person_id", "technology"],
      });

      // Generate avatar URL based on user's initials
      const generateAvatar = (name) => {
         const initials = name ? name.charAt(0).toUpperCase() : "U";
         return `https://ui-avatars.com/api/?name=${initials}&background=random`;
      };

      // Convert users to a map for easy access
      const userMap = new Map();
      let rootUser = null; // This will store the first root user

      users.forEach((user) => {
         const userData = {
            id: user.user_id,
            name: user.name,
            position: user.role || "Employee",
            parentId: user.reporting_person_id,
            department: user.technology || "N/A",
            imageUrl: generateAvatar(user.name),
            subordinates: [],
         };

         // Find the first root user (where parentId is null)
         if (user.reporting_person_id === null) {
            if (!rootUser) {
               rootUser = userData; // Keep the first root user
            } else {
               userData.parentId = rootUser.id; // Assign other root users under the first root user
            }
         }

         userMap.set(user.user_id, userData);
      });

      // Build hierarchy
      const allUsers = [];
      userMap.forEach((user) => {
         if (user.parentId) {
            userMap.get(user.parentId)?.subordinates.push(user);
         }
         allUsers.push(user); // Add to the flat array
      });

      return res.status(200).json({ success: true, data: allUsers });
   } catch (error) {
      console.error("Error fetching organization tree:", error);
      return res.status(500).json({ success: false, message: "Server Error" });
   }
};

