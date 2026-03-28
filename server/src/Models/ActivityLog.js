module.exports = (sequelize, DataTypes) => {
   const ActivityLog = sequelize.define(
      "ActivityLog",
      {
         log_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
         },
         tracking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
               model: "task_time_tracking",
               key: "tracking_id",
            },
         },
         user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
               model: "users",
               key: "user_id",
            },
         },
         task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
               model: "tasks",
               key: "task_id",
            },
         },
         timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
         },
         is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
         },
         last_activity_time: {
            type: DataTypes.DATE,
            allowNull: true,
         },
         is_tab_visible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
         },
      },
      {
         timestamps: true,
         tableName: "activity_logs",
         underscored: true,
      }
   );

   return ActivityLog;
};
