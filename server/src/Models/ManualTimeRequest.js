module.exports = (sequelize, DataTypes) => {
   const ManualTimeRequest = sequelize.define(
      "ManualTimeRequest",
      {
         request_id: {
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
            allowNull: false,
         },
         reason: {
            type: DataTypes.TEXT,
            allowNull: true,
         },
         status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            defaultValue: "pending",
         },
      },
      {
         timestamps: true,
         tableName: "manual_time_requests",
         underscored: true,
      }
   );

   return ManualTimeRequest;
};
