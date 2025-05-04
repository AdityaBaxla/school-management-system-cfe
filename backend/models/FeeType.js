// models/FeeType.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const FeeType = sequelize.define(
  "FeeType",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: true, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }
  // {
  //   tableName: "fee_type",
  //   underscored: true,
  // }
);

module.exports = FeeType;
