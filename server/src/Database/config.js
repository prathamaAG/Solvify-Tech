const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || "ProjectSGP",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
    pool: { max: 5, min: 0 },
    dialectOptions: process.env.NODE_ENV === "production" ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((err) => {
    console.error("❌ Error connecting to the database:", err);
  });

// Import models
const Project = require("../Models/Project")(sequelize, Sequelize);
const ProjectMembers = require("../Models/ProjectMembers")(sequelize, Sequelize);
const User = require("../Models/User")(sequelize, Sequelize);
const Card = require("../Models/Card")(sequelize, Sequelize);
const Task = require("../Models/Task")(sequelize, Sequelize);
const Comment = require("../Models/Comment")(sequelize, Sequelize);
const CommentFile = require("../Models/CommentFile")(sequelize, Sequelize);
const TaskTimeTracking = require("../Models/TaskTimeTracking")(sequelize, Sequelize);
const ManualTimeRequest = require("../Models/ManualTimeRequest")(sequelize, Sequelize);
const Notification = require("../Models/Notification")(sequelize, Sequelize);
const Meeting = require("../Models/Meeting")(sequelize, Sequelize);
const ActivityLog = require("../Models/ActivityLog")(sequelize, Sequelize);

// ========================
// Define Associations
// ========================

// Many-to-Many: Projects ↔ Users
User.belongsToMany(Project, { through: ProjectMembers, foreignKey: "user_id" });
Project.belongsToMany(User, { through: ProjectMembers, foreignKey: "project_id" });

// Project ↔ Cards
Card.belongsTo(Project, { foreignKey: "project_id", onDelete: 'CASCADE' });
Card.belongsTo(User, { foreignKey: "created_by", as: "Creator", onDelete: 'CASCADE' });
Project.hasMany(Card, { foreignKey: "project_id", onDelete: 'CASCADE' });
User.hasMany(Card, { foreignKey: "created_by", onDelete: 'CASCADE' });

// Cards ↔ Tasks
Card.hasMany(Task, { foreignKey: 'card_id', onDelete: 'CASCADE' });
Task.belongsTo(Card, { foreignKey: 'card_id', onDelete: 'CASCADE' });
Task.belongsTo(User, { as: 'Assignee', foreignKey: 'assign_to' });
Task.belongsTo(User, { as: 'Assigner', foreignKey: 'assign_by' });

// Comments
Comment.belongsTo(User, { foreignKey: 'sender', as: 'commentSender', onDelete: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'sender', as: 'comments', onDelete: 'CASCADE' });

// Comments ↔ Tasks
Task.hasMany(Comment, { foreignKey: 'task_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'task_id', as: 'task', onDelete: 'CASCADE' });

// Comment Files
Comment.hasMany(CommentFile, { foreignKey: 'comment_id', as: 'files', onDelete: 'CASCADE' });
CommentFile.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment', onDelete: 'CASCADE' });

// TaskTimeTracking
Task.hasMany(TaskTimeTracking, { foreignKey: 'task_id', as: 'timeTrackings', onDelete: 'CASCADE' });
TaskTimeTracking.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
TaskTimeTracking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ManualTimeRequest
ManualTimeRequest.belongsTo(Task, { foreignKey: 'task_id', as: 'task', onDelete: 'CASCADE' });
ManualTimeRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Task.hasMany(ManualTimeRequest, { foreignKey: 'task_id', as: 'manualRequests', onDelete: 'CASCADE' });
User.hasMany(ManualTimeRequest, { foreignKey: 'user_id', as: 'manualRequests', onDelete: 'CASCADE' });

// Notifications
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });

// Meetings
Meeting.belongsTo(Project, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Meeting.belongsTo(User, { foreignKey: 'scheduled_by', as: 'Scheduler' });
Project.hasMany(Meeting, { foreignKey: 'project_id', onDelete: 'CASCADE' });
User.hasMany(Meeting, { foreignKey: 'scheduled_by', as: 'scheduledMeetings' });

// ActivityLogs
ActivityLog.belongsTo(TaskTimeTracking, { foreignKey: 'tracking_id', as: 'tracking', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
ActivityLog.belongsTo(Task, { foreignKey: 'task_id', as: 'task', onDelete: 'CASCADE' });
TaskTimeTracking.hasMany(ActivityLog, { foreignKey: 'tracking_id', as: 'activityLogs', onDelete: 'CASCADE' });
Task.hasMany(ActivityLog, { foreignKey: 'task_id', as: 'activityLogs', onDelete: 'CASCADE' });

// ========================
// Sync Models with Database
// ========================

sequelize
  .sync() // 👈 Safe mode: Only creates tables if they don't exist. Prevents the 64-key limit bug!
  .then(() => console.log("✅ Database tables created/updated successfully."))
  .catch(err => console.error("❌ Error syncing database:", err));

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMembers,
  Card,
  Task,
  Comment,
  CommentFile,
  TaskTimeTracking,
  ManualTimeRequest,
  Notification,
  Meeting,
  ActivityLog,
};
