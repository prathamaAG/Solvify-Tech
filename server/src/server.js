const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const checkMissedTrackers = require("./Helper/missedTrackerCheck"); 

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL, 
  methods: 'GET,POST,PUT,DELETE',
  credentials: true 
}));

// Middleware
app.use(express.json());

// Import routes
const userRoutes = require("./Routes/user.routes");
const projectRoutes = require("./Routes/project.routes");
const cardRoutes = require("./Routes/card.routes");
const taskRoutes = require("./Routes/task.routes");
const memberRoutes = require("./Routes/member.routes");
const commentRoutes = require("./Routes/comment.routes");
const organizationRoutes = require("./Routes/organization.routes");
const taskTimeTrackingRoutes = require("./Routes/taskTimeTracking.routes");
const manualTrackerReuestRoutes = require("./Routes/manualTimeRequest.routes");
const notificationRoutes = require("./Routes/notification.routes");
const meetingRoutes = require("./Routes/meeting.routes");
const activityRoutes = require("./Routes/activity.routes");
const aiRoutes = require("./Routes/ai.routes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/card", cardRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/organization-tree", organizationRoutes);
app.use("/api/task-time-tracking", taskTimeTrackingRoutes);
app.use("/api/manualTrackerRequest", manualTrackerReuestRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/ai", aiRoutes);

// Schedule cron job to check for missed trackers every midnight
cron.schedule("0 0 * * *", checkMissedTrackers);

// Schedule cron job to check for tasks due within 24 hours (runs at 8 AM daily)
cron.schedule("0 8 * * *", async () => {
  try {
    const { Task, User, Card, Project, Notification } = require("./Database/config");
    const { Op } = require("sequelize");
    const { sendDueDateReminderEmail } = require("./Services/email.service");

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find tasks due within the next 24 hours that are not completed
    const dueTasks = await Task.findAll({
      where: {
        due_date: {
          [Op.between]: [
            now.toISOString().split('T')[0],
            tomorrow.toISOString().split('T')[0]
          ]
        },
        status: { [Op.ne]: 'Completed' },
        assign_to: { [Op.ne]: null }
      },
      include: [
        { model: User, as: 'Assignee', attributes: ['user_id', 'name', 'email'] },
        {
          model: Card,
          attributes: ['title', 'project_id'],
          include: [{ model: Project, attributes: ['project_name'] }]
        }
      ]
    });

    for (const task of dueTasks) {
      if (task.Assignee) {
        // Create in-app notification
        await Notification.create({
          user_id: task.Assignee.user_id,
          type: 'task_due',
          title: 'Task Due Soon',
          message: `"${task.title}" in project "${task.Card?.Project?.project_name || 'Unknown'}" is due today.`,
          reference_id: task.task_id,
          is_read: false
        });

        // Send email reminder (non-blocking)
        try {
          await sendDueDateReminderEmail(
            task.Assignee.email,
            task.Assignee.name,
            task.title,
            task.Card?.Project?.project_name || 'Unknown',
            task.due_date
          );
        } catch (emailErr) {
          console.error(`Failed to send due date email to ${task.Assignee.email}:`, emailErr);
        }
      }
    }

    console.log(`✅ Due date check complete. ${dueTasks.length} notifications sent.`);
  } catch (err) {
    console.error("❌ Error in due date cron job:", err);
  }
}); 

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
