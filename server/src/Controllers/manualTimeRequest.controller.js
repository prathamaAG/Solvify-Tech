const {
   ManualTimeRequest,
   TaskTimeTracking,
   User,
   Task,
   Card,
   ProjectMembers,
   Project,
} = require("../Database/config");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { logger } = require("sequelize/lib/utils/logger");

exports.requestManualTimeEntry = async (req, res) => {
   const { task_id, date, start_time, end_time, reason } = req.body;

   try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decodedToken.email } });

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      // Combine date with start_time and end_time
      const startDateTime = new Date(`${date}T${start_time}:00`); // Combining date and start time to form a complete Date object
      const endDateTime = new Date(`${date}T${end_time}:00`); // Combining date and end time

      // Validate time range
      if (
         isNaN(startDateTime.getTime()) ||
         isNaN(endDateTime.getTime()) ||
         endDateTime <= startDateTime
      ) {
         return res.status(400).json({ message: "Invalid start or end time" });
      }

      // Check overlap with existing real trackers
      const trackerOverlap = await TaskTimeTracking.findOne({
         where: {
            user_id: user.user_id,
            [Op.or]: [
               {
                  start_time: { [Op.between]: [startDateTime, endDateTime] },
               },
               {
                  end_time: { [Op.between]: [startDateTime, endDateTime] },
               },
               {
                  start_time: { [Op.lte]: startDateTime },
                  end_time: { [Op.gte]: endDateTime },
               },
            ],
         },
      });

      if (trackerOverlap) {
         return res
            .status(409)
            .json({ message: "Overlap with an existing tracker" });
      }

      // Check overlap with previous manual requests (except rejected)
      const manualOverlap = await ManualTimeRequest.findOne({
         where: {
            user_id: user.user_id,
            status: { [Op.ne]: "rejected" },
            [Op.or]: [
               {
                  start_time: { [Op.between]: [startDateTime, endDateTime] },
               },
               {
                  end_time: { [Op.between]: [startDateTime, endDateTime] },
               },
               {
                  start_time: { [Op.lte]: startDateTime },
                  end_time: { [Op.gte]: endDateTime },
               },
            ],
         },
      });

      if (manualOverlap) {
         return res
            .status(409)
            .json({ message: "Overlap with a previous manual request" });
      }

      // Create new manual time entry request
      const newRequest = await ManualTimeRequest.create({
         task_id,
         user_id: user.user_id,
         start_time: startDateTime,
         end_time: endDateTime,
         reason,
         status: "pending", // default status
      });

      // Move the task to "To be verified" status
      await Task.update(
         { status: "To be verified" },
         { where: { task_id } }
      );

      res.status(201).json({
         message: "Manual time entry request submitted successfully",
         data: newRequest,
      });
   } catch (error) {
      console.error("Manual time request error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

exports.getRequestsByProject = async (req, res) => {
   const { project_id } = req.params;

   try {
      const token = req.headers.authorization?.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decodedToken.email } });

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const requests = await ManualTimeRequest.findAll({
         where: { status: "pending" },
         include: [
            {
               model: Task,
               as: "task",
               attributes: ["task_id", "title", "card_id"],
               include: [
                  {
                     model: Card,
                     attributes: ["card_id", "project_id"],
                     where: { project_id }, // ✅ Put project filter HERE
                     include: [
                        {
                           model: Project,
                           attributes: ["project_id", "project_name"],
                        },
                     ],
                  },
               ],
            },
            {
               model: User,
               as: "user",
               attributes: ["user_id", "name", "email"],
            },
         ],
         order: [["created_at", "DESC"]],
      });

      res.status(200).json({
         status: 1,
         message: "Requests fetched successfully",
         data: requests,
      });
   } catch (error) {
      console.error("Error fetching manual requests:", error);
      res.status(500).json({
         status: 0,
         message: "Server error",
         error: error.message,
      });
   }
};

exports.handleManualRequestStatus = async (req, res) => {
   const { action, request_id } = req.body;

   try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      // const adminUser = await User.findOne({
      //    where: { email: decodedToken.email },
      // });

      // if (!adminUser || adminUser.role !== "admin") {
      //    return res
      //       .status(403)
      //       .json({ message: "Access denied. Admins only." });
      // }

      const request = await ManualTimeRequest.findOne({
         where: { request_id },
      });

      if (!request) {
         return res
            .status(404)
            .json({ message: "Manual time request not found" });
      }

      if (request.status !== "pending") {
         return res
            .status(400)
            .json({ message: "This request has already been processed" });
      }

      const missedTracker = await TaskTimeTracking.findOne({
         where: {
            user_id: request.user_id,
            task_id: request.task_id,
            status: "missed",
         },
      });

      if (action === "approve") {
         request.status = "approved";
         await request.save();

         const startTime = new Date(request.start_time);
         const endTime = new Date(request.end_time);
         const duration = Math.floor((endTime - startTime) / 1000);

         if (missedTracker) {
            // ✅ Update existing missed tracker
            missedTracker.end_time = endTime;
            missedTracker.duration = duration;
            missedTracker.is_manual = true;
            missedTracker.status = "resolved";
            await missedTracker.save();
         } else {
            // Optional fallback: if no missed tracker found, create a new one
            await TaskTimeTracking.create({
               task_id: request.task_id,
               user_id: request.user_id,
               start_time: startTime,
               end_time: endTime,
               duration,
               is_manual: true,
               status: "manual",
            });
         }

         return res
            .status(200)
            .json({ message: "Request approved and time updated" });
      } else if (action === "reject") {
         request.status = "rejected";
         await request.save();

         if (missedTracker) {
            await missedTracker.destroy();
         }

         return res
            .status(200)
            .json({ message: "Request rejected and missed tracker deleted" });
      } else {
         return res
            .status(400)
            .json({ message: "Invalid action. Use 'approve' or 'reject'" });
      }
   } catch (error) {
      console.error("Manual request status error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};
