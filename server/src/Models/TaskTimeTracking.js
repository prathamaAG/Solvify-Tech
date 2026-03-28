module.exports = (sequelize, DataTypes) => {
   const TaskTimeTracking = sequelize.define(
      "TaskTimeTracking",
      {
         tracking_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
         },
         task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
               model: "tasks",
               key: "task_id",
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
         start_time: {
            type: DataTypes.DATE,
            allowNull: false,
         },
         end_time: {
            type: DataTypes.DATE,
            allowNull: true,
         },
         duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
         },
         is_manual: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
         },
         status: {
            type: DataTypes.STRING,
            allowNull: true,
         },
         active_duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
         },
         inactive_duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
         },
         last_activity_time: {
            type: DataTypes.DATE,
            allowNull: true,
         },
      },
      {
         timestamps: true,
         tableName: "task_time_tracking",
         underscored: true,
      }
   );

   return TaskTimeTracking;
};
