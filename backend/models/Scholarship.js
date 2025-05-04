const sequelize = require("../database");
const { DataTypes } = require("sequelize");

const Scholarship = sequelize.define("Scholarship", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Scholarship;
