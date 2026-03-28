module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define(
        "Notification",
        {
            notification_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "CASCADE",
            },
            type: {
                type: Sequelize.ENUM(
                    "task_assigned",
                    "task_due",
                    "task_completed",
                    "meeting_scheduled",
                    "general"
                ),
                allowNull: false,
                defaultValue: "general",
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            reference_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            timestamps: true,
            tableName: "notifications",
            underscored: true,
        }
    );

    return Notification;
};
