// models/FeeInvoice.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const FeeInvoice = sequelize.define("FeeInvoice", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // student_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: { model: StudentFI, key: "id" },
  //   onUpdate: "CASCADE",
  //   onDelete: "SET NULL",
  // },
  // enrollment_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: { model: EnrollmentFI, key: "id" },
  //   onUpdate: "CASCADE",
  //   onDelete: "CASCADE",
  // },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  originalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  finalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "paid", "overdue", "partially_paid"),
    defaultValue: "pending",
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true,
    // e.g. "ANNUAL-2024", "APR-2025", "EXAM-2025"
  },
});

// Associations
// FeeInvoice ↔ Student (Many-to-One)

module.exports = FeeInvoice;
