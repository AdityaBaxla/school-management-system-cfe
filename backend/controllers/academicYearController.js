const { AcademicYear } = require("../models");

exports.createAcademicYear = async (req, res) => {
  AcademicYear.create(req.body);
  return res.status(201).json({
    success: true,
    message: "Academic Year created successfully",
    data: req.body,
  });
};

exports.getAcademicYear = async (req, res) => {
  const id = req.params.id;
  const academicYear = await AcademicYear.findByPk(id);
  if (!academicYear) {
    return res.status(404).json({ message: "Academic Year not found" });
  }
  return res.status(200).json({
    success: true,
    message: "Academic Year retrieved successfully",
    data: academicYear,
  });
};

exports.getAllAcademicYears = async (req, res) => {
  const academicYears = await AcademicYear.findAll();
  return res.status(200).json({
    success: true,
    message: "Academic Years retrieved successfully",
    data: academicYears,
  });
};

exports.updateAcademicYear = async (req, res) => {
  const id = req.params.id;
  const academicYear = await AcademicYear.findByPk(id);
  if (!academicYear) {
    return res.status(404).json({ success: false, message: "could not find" });
  }

  await academicYear.update(req.body);
  return res.status(200).json({
    success: true,
    message: "Academic Year updated successfully",
    data: academicYear,
  });
};

exports.deleteAcademicYear = async (req, res) => {
  const id = req.params.id;
  const academicYear = await AcademicYear.findByPk(id);
  if (!academicYear) {
    return res.status(404).json({ success: false, message: "could not find" });
  }
  await academicYear.destroy();
  return res.status(200).json({ message: "deleted" });
};
