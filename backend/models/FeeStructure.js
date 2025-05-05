// models/FeeStructure.js
// this is a instance of fee type with the amount and due date set for each academic year
const { DataTypes } = require("sequelize");
const { BILLING_CYCLES } = require("./utils/constants");
const sequelize = require("../database");

const FeeStructure = sequelize.define("FeeStructure", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true },
  code: { type: DataTypes.STRING, allowNull: true },
  displayName: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true }, // for one time fees
  dueDateMonthly: { type: DataTypes.DATEONLY, allowNull: true }, // for monthly fees
  lateFine: { type: DataTypes.FLOAT(10, 2), allowNull: true },
  billingCycle: {
    type: DataTypes.ENUM(...BILLING_CYCLES),
    allowNull: false,
  },
});

// Associations
// FeeStructure ↔ AcademicYear (Many-to-One)
// FeeStructure <-> FeeType (Many-to-One)
// FeeStructure <-> Class (Many-to-One)

module.exports = FeeStructure;
