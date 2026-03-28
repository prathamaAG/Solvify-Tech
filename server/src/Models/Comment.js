module.exports = (sequelize, Sequelize) => {
    const Comment = sequelize.define('Comment', {
        comment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        task_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "tasks",
                key: "task_id",
            },
        },
        text: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        htmlText: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        sender: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        }
    }, {
        timestamps: true,
        tableName: "comments",
        underscored: true,
    });

    return Comment;
};