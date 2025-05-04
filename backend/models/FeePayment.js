// models/FeePayment.js
const { DataTypes: DataTypes } = require("sequelize");
const sequelize = require("../database");

const FeePayment = sequelize.define("FeePayment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // fee_invoice_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: { model: FeeInvoiceFP, key: "id" },
  //   onUpdate: "CASCADE",
  //   onDelete: "CASCADE",
  // },
  invoiceID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "FeeInvoice", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  amountPaid: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  paymentMethod: { type: DataTypes.STRING, allowNull: true },
  transactionReference: { type: DataTypes.STRING, allowNull: true },
});

module.exports = FeePayment;
