const FeeStructure = require("../models/FeeStructure");
const Configuration = require("../models/Configuration");
const { Model } = require("sequelize");
const { AcademicYear, Class, ClassSection, FeeType } = require("../models");
// FeeStructure is specific to a academic Year, since Fee Amounts will change with every academic year and will be added at year start.

// checking complex data validation should be here

// Create a new fee
async function createFeeStructure(data) {
  console.log("Creating fee structure", data);
  if (!data.academicYearId) {
    academicYearId = Configuration.findByPk("CURRENT_AY").value;
    data[academicYearId] = academicYearId;
  }
  const feeType = await FeeType.findByPk(data.feeTypeId);
  const academicYear = await AcademicYear.findByPk(data.academicYearId);
  const displayName = `${feeType.name} ${academicYear.code}`;
  return await FeeStructure.create({ ...data, displayName });
}

// Get all fee structure
async function getAllFeeStructure(data) {
  const fees = await FeeStructure.findAll({
    where: {
      ...(data.academicYearId && { academicYearId: data.academicYearId }),
    },
    // raw: true,
    include: [
      {
        model: AcademicYear,
        attributes: ["name"],
      },
      {
        model: Class,
        attributes: ["name"],
      },
    ],
  });

  // flatten the structure
  return fees.map((fee) => ({
    ...fee.toJSON(),
    academicYearName: fee.AcademicYear?.name,
  }));
}

// Get a fee by ID
async function getFeeStructure(id) {
  return await FeeStructure.findByPk(id);
}

// Update a fee
async function updateFeeStructure(id, data) {
  const fee = await FeeStructure.findByPk(id);
  if (!fee) throw new Error("FeeStructure not found");
  return await fee.update(data);
}

// Delete a fee
async function deleteFeeStructure(id) {
  const fee = await FeeStructure.findByPk(id);
  if (!fee) throw new Error("FeeStructure not found");
  return await fee.destroy();
}

module.exports = {
  createFeeStructure,
  getAllFeeStructure,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
};
