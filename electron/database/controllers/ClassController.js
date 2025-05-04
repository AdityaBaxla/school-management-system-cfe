const { Class, ClassSection, AcademicYear, Enrollment } = require("../models");

// classes CRUD
async function createClass(data) {
  return await Class.create(data);
}

async function updateClass(id, data) {
  const classInstance = await Class.findByPk(id);
  if (!classInstance) throw new Error("Class not found");
  return await classInstance.update(data);
}

async function deleteClass(id) {
  const classInstance = await Class.findByPk(id);
  if (!classInstance) throw new Error("Class not found");
  return await classInstance.destroy();
}
async function getClassById(id) {
  return await Class.findByPk(id);
}

async function getAllClasses() {
  return await Class.findAll();
}

// class sections CRUD
async function createClassSection(data) {
  const classInstance = await Class.findByPk(data.classId);
  if (!classInstance) throw new Error("Class not found");
  displayName = `${classInstance.name} - ${data.name}`;
  return await ClassSection.create({ ...data, displayName });
}
async function updateClassSection(id, data) {
  const classSection = await ClassSection.findByPk(id);
  if (!classSection) throw new Error("ClassSection not found");
  return await classSection.update(data);
}
async function deleteClassSection(id) {
  const classSection = await ClassSection.findByPk(id);
  if (!classSection) throw new Error("ClassSection not found");
  return await classSection.destroy();
}
async function getClassSectionById(id) {
  return await ClassSection.findByPk(id);
}

module.exports = {
  createClass,
  updateClass,
  deleteClass,
  getClassById,
  getAllClasses,
  createClassSection,
  updateClassSection,
  deleteClassSection,
  getClassSectionById,
};
