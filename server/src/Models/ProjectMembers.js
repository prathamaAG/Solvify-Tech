module.exports = (sequelize, Sequelize) => {
    const ProjectMembers = sequelize.define(
        "ProjectMembers",
        {
            project_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "projects",
                    key: "project_id",
                },
                onDelete: "CASCADE",
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "CASCADE",
                primaryKey: true,
            },
        },
        {
            timestamps: false,
            tableName: "project_members",
        }
    );

    return ProjectMembers;
};
