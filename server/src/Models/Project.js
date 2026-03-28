module.exports = (sequelize, Sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      project_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "in progress", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      technology: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    },
    {
      timestamps: true,
      tableName: "projects",
      underscored: true,
    }
  );

  return Project;
};
