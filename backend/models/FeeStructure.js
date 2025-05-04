// models/FeeStructure.js
// this is a instance of fee type with the amount and due date set for each academic year
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const FeeStructure = sequelize.define("FeeStructure", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
});

module.exports = FeeStructure;
