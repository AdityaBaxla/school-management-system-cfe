const { FeeType } = require("../models");

// this file creates base fee types valid across academic year (set it and forget it)
async function createFeeType(data) {
  const feeType = await FeeType.create(data);
  return feeType;
}

async function updateFeeType(id, data) {
  const feeType = await FeeType.findByPk(id);
  if (!feeType) {
    throw new Error("Fee Type not found, check id");
  }
  return await feeType.update(data);
}

async function getFeeType(id, data) {
  const fee = await FeeType.findByPk(id);
  if (!fee) throw new Error("Fee Type not found, check id");
  return await fee;
}

async function getAllFeeType(data) {
  const fees = await FeeType.findAll();
  return fees;
}

// destroy fee with caution, it will break fee structure associated with it
async function deleteFeeType(id, data) {
  const fee = await FeeType.findByPk(id);
  if (!fee) throw new Error("Fee Type not found, check id");
  return await fee.destroy();
}

module.exports = {
  createFeeType,
  updateFeeType,
  getFeeType,
  getAllFeeType,
  deleteFeeType,
};
