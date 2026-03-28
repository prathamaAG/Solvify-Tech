module.exports = (sequelize, Sequelize) => {
    const Meeting = sequelize.define(
        "Meeting",
        {
            meeting_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            project_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "projects",
                    key: "project_id",
                },
                onDelete: "CASCADE",
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            scheduled_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
            },
            meeting_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            start_time: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            end_time: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            meeting_link: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: "meetings",
            underscored: true,
        }
    );

    return Meeting;
};
