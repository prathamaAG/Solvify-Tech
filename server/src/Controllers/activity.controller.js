const { ActivityLog, TaskTimeTracking, Task, User } = require("../Database/config");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const INACTIVITY_THRESHOLD = 120;
exports.receiveHeartbeat = async (req, res) => {
   const { tracking_id, task_id, is_active, last_activity_time, is_tab_visible, ms_since_last_heartbeat } = req.body;

   try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decodedToken.email } });

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const tracking = await TaskTimeTracking.findOne({
         where: {
            tracking_id,
            user_id: user.user_id,
            end_time: null,
         },
      });

      if (!tracking) {
         return res.status(404).json({ message: "No active tracking session found" });
      }

      const now = new Date();
      const clientLastActivity = new Date(last_activity_time);
      const secondsSinceActivity = Math.floor((now - clientLastActivity) / 1000);

      // Use client-reported elapsed time (most accurate, survives browser throttling)
      // Fall back to server-side calculation if not available
      let delta;
      if (ms_since_last_heartbeat && ms_since_last_heartbeat > 0) {
         delta = Math.round(ms_since_last_heartbeat / 1000);
      } else {
         const lastLog = await ActivityLog.findOne({
            where: { tracking_id },
            order: [["timestamp", "DESC"]],
         });
         delta = lastLog
            ? Math.floor((now - new Date(lastLog.timestamp)) / 1000)
            : 30;
      }

      // Clamp delta to reasonable max (10 minutes) to handle edge cases
      delta = Math.min(delta, 600);

      // Active = recent mouse/keyboard activity within threshold
      const isUserActive = secondsSinceActivity < INACTIVITY_THRESHOLD;

      // Accumulate time in the correct bucket
      if (isUserActive) {
         tracking.active_duration = (tracking.active_duration || 0) + delta;
      } else {
         tracking.inactive_duration = (tracking.inactive_duration || 0) + delta;
      }
      tracking.last_activity_time = clientLastActivity;
      await tracking.save();

      // Log activity entry
      const lastLog = await ActivityLog.findOne({
         where: { tracking_id },
         order: [["timestamp", "DESC"]],
      });

      const statusChanged = !lastLog || lastLog.is_active !== isUserActive;
      const enoughTimePassed = !lastLog || Math.floor((now - new Date(lastLog.timestamp)) / 1000) >= 30;

      if (statusChanged || enoughTimePassed) {
         await ActivityLog.create({
            tracking_id,
            user_id: user.user_id,
            task_id: task_id || tracking.task_id,
            timestamp: now,
            is_active: isUserActive,
            last_activity_time: clientLastActivity,
            is_tab_visible: is_tab_visible !== false,
         });
      }

      const currentInactiveSeconds = isUserActive ? 0 : secondsSinceActivity;

      res.status(200).json({
         status: 1,
         message: "Heartbeat received",
         data: {
            is_active: isUserActive,
            current_inactive_seconds: currentInactiveSeconds,
            active_duration: tracking.active_duration,
            inactive_duration: tracking.inactive_duration,
         },
      });
   } catch (error) {
      console.error("Heartbeat error:", error);
      res.status(500).json({ status: 0, message: "Server error", error: error.message });
   }
};

exports.getActivityReport = async (req, res) => {
   const { tracking_id } = req.params;

   try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decodedToken.email } });

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const tracking = await TaskTimeTracking.findOne({
         where: { tracking_id },
         attributes: ["tracking_id", "user_id", "active_duration", "inactive_duration", "duration", "start_time", "end_time"],
      });

      if (!tracking) {
         return res.status(404).json({ message: "Tracking session not found" });
      }

      if (user.role !== "admin" && tracking.user_id !== user.user_id) {
         return res.status(403).json({ message: "Access denied. You can only view your own activity logs." });
      }

      const logs = await ActivityLog.findAll({
         where: { tracking_id },
         order: [["timestamp", "ASC"]],
         include: [
            {
               model: User,
               as: "user",
               attributes: ["name", "email"],
            },
            {
               model: Task,
               as: "task",
               attributes: ["title"],
            },
         ],
      });

      res.status(200).json({
         status: 1,
         message: "Activity report fetched",
         data: {
            tracking,
            logs,
         },
      });
   } catch (error) {
      console.error("Activity report error:", error);
      res.status(500).json({ status: 0, message: "Server error", error: error.message });
   }
};

exports.getActivitySummary = async (req, res) => {
   try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decodedToken.email } });

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const { date, user_id } = req.query;

      const whereClause = {};
      if (date) {
         const startOfDay = dayjs(date).startOf("day").toDate();
         const endOfDay = dayjs(date).endOf("day").toDate();
         whereClause.start_time = { [Op.between]: [startOfDay, endOfDay] };
      }

      if (user.role !== "admin") {
         whereClause.user_id = user.user_id;
      } else if (user_id) {
         whereClause.user_id = user_id;
      }

      const trackingData = await TaskTimeTracking.findAll({
         where: whereClause,
         include: [
            {
               model: Task,
               as: "task",
               attributes: ["title", "task_id"],
            },
            {
               model: User,
               as: "user",
               attributes: ["name", "email", "user_id"],
            },
         ],
         order: [["start_time", "DESC"]],
      });

      const summaryData = trackingData.map((record) => {
         const activeDuration = record.active_duration || 0;
         const inactiveDuration = record.inactive_duration || 0;
         const trackedTotal = activeDuration + inactiveDuration;

         // Use tracked total (active + inactive from heartbeats) as the primary total
         // Fall back to wall-clock duration only if no heartbeat data exists
         const totalDuration = trackedTotal > 0 ? trackedTotal : (record.duration || 0);

         const activityPercentage = totalDuration > 0
            ? Math.round((activeDuration / totalDuration) * 100)
            : 0;

         return {
            tracking_id: record.tracking_id,
            user_name: record.user?.name || "Unknown",
            user_email: record.user?.email || "",
            user_id: record.user?.user_id,
            task_title: record.task?.title || "Unknown",
            task_id: record.task?.task_id,
            date: dayjs(record.start_time).format("YYYY-MM-DD"),
            start_time: record.start_time,
            end_time: record.end_time,
            total_duration: totalDuration,
            active_duration: activeDuration,
            inactive_duration: inactiveDuration,
            activity_percentage: activityPercentage,
            status: record.status,
            is_manual: record.is_manual,
            last_activity_time: record.last_activity_time,
         };
      });

      res.status(200).json({
         status: 1,
         message: "Activity summary fetched",
         data: summaryData,
      });
   } catch (error) {
      console.error("Activity summary error:", error);
      res.status(500).json({ status: 0, message: "Server error", error: error.message });
   }
};
