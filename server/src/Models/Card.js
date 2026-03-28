module.exports = (sequelize, Sequelize) => {
    const Card = sequelize.define(
        "Card",
        {
            card_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            position: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            priority: {
                type: Sequelize.ENUM("low", "medium", "high"),
                allowNull: false,
                defaultValue: "low",
            },
            project_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "projects",
                    key: "project_id",
                },
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
            },
        },
        {
            timestamps: true,
            tableName: "cards",
            underscored: true,
        }
    );

    return Card;
}