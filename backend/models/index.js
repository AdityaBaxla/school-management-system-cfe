// backend/models/index.js
const sequelize = require("../database");
// const Student = require("./student");
// const Class = require("./class");
// import all other models similarly...

// Define associations here if needed
// Student.belongsTo(Class);

module.exports = {
  sequelize,
  // Student,
  // Class,
  // export other models too
};
