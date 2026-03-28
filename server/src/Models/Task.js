module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define(
        "Task",
        {
            task_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            card_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'cards', // This is the table name
                    key: 'card_id',
                },
                onDelete: 'CASCADE', // Cascade on delete
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true, // Optional field
            },
            tag: {
                type: Sequelize.TEXT,
                allowNull: true, // Optional field
            },
            due_date: {
                type: Sequelize.DATEONLY, // DATEONLY for date without time
                allowNull: true, // Optional field
            },
            position: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            priority: {
                type: Sequelize.ENUM('High', 'Medium', 'Low'),
                allowNull: false,
                defaultValue: 'Low',
            },
            status: {
                type: Sequelize.ENUM('Pending', 'In progress', 'To be verified', 'Completed'),
                allowNull: false,
                defaultValue: 'Pending',
            },
            assign_by: {
                type: Sequelize.INTEGER,
                allowNull: true, // Can be null if not assigned by anyone
                references: {
                    model: 'users', // Assuming you have a users table
                    key: 'user_id',
                },
            },
            assign_to: {
                type: Sequelize.INTEGER,
                allowNull: true, // Can be null if not assigned to anyone
                references: {
                    model: 'users', // Assuming you have a users table
                    key: 'user_id',
                },
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                onUpdate: Sequelize.NOW,
            },
        },
        {
            timestamps: true, // Disable Sequelize's default timestamps (createdAt, updatedAt)
            tableName: "tasks", // Explicitly define the table name
            underscored: true, // Convert camelCase to snake_case columns
        }
    );

    return Task;
};