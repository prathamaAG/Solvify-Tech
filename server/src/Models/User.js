module.exports = (sequelize, DataTypes) => {
   const User = sequelize.define(
     "User",
     {
       user_id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
       },
       name: {
         type: DataTypes.STRING,
         allowNull: false,
       },
       email: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true,
         validate: {
           isEmail: true,
         },
       },
       mobile_no: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
           len: [10, 15],
         },
       },
       password: {
         type: DataTypes.STRING,
         allowNull: false,
       },
       verified: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false,
       },
       verificationToken: {
         type: DataTypes.STRING,
         allowNull: true,
       },
       resetToken: {
         type: DataTypes.STRING,
         allowNull: true,
       },
       registrationDate: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: DataTypes.NOW,
       },
       role: {
         type: DataTypes.STRING,
         allowNull: false,
         defaultValue: "user",
       },
       reporting_person_id: {
         type: DataTypes.INTEGER,
         allowNull: true,
         references: {
           model: "users",
           key: "user_id",
         },
         onDelete: "SET NULL", // Ensures subordinates are not deleted when manager is removed
       },
       technology: {
         type: DataTypes.STRING,
         allowNull: true,
       },
     },
     {
       timestamps: true,
       tableName: "users",
       underscored: true,
     }
   );
 
   User.belongsTo(User, {
     foreignKey: "reporting_person_id",
     as: "reportingPerson",
     constraints: false, 
     onDelete: "SET NULL",
   });
 
   User.hasMany(User, {
     foreignKey: "reporting_person_id",
     as: "subordinates",
     constraints: false, 
   });
 
   return User;
 };
 