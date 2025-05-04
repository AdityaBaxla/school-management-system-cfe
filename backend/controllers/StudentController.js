const { Configuration, Enrollment, ClassSection } = require("../models");
const Student = require("../models/Student");

// Create a new student
async function createStudent(data) {
  const { classSectionId, ...studentData } = data;
  const student = await Student.create(studentData);

  if (classSectionId) {
    await Enrollment.create({
      studentId: student.id,
      classSectionId,
      academicYearId: data.academicYearId,
    });
  }

  return student;
}

// Get all students
async function getAllStudents(academicYearId) {
  console.log("academicYearId", academicYearId);
  // If no academic year ID is provided, use the current academic year
  if (!academicYearId) {
    academicYearId = await Configuration.findByPk("CURRENT_AY").value;
  }

  // wrong logic, the class section should be filtered by academic year
  console.log("academicYearId", academicYearId);
  const students = await Student.findAll({
    include: {
      model: Enrollment,
      include: ClassSection,
    },
  });
  console.log("students", students);

  return students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    admissionNumber: s.admissionNumber,
    classSectionId: s.Enrollments[0]?.classSectionId || null,
    sectionName: s.Enrollments[0]?.ClassSection?.name || null,
  }));
}

// Get a student by ID
async function getStudentById(id) {
  return await Student.findByPk(id);
}

// Update a student
async function updateStudent(id, data) {
  const student = await Student.findByPk(id);
  if (!student) throw new Error("Student not found");

  // Extract section info if present
  const { classSectionId, ...studentData } = data;

  // Update basic student info
  await student.update(studentData);

  if (classSectionId) {
    // Update or create enrollment
    const [enrollment] = await Enrollment.findOrCreate({
      where: { studentId: id, academicYearId: data.academicYearId },
    });

    await enrollment.update({ classSectionId });
  }

  return student;
}

// Delete a student
async function deleteStudent(id) {
  const student = await Student.findByPk(id);
  if (!student) throw new Error("Student not found");
  return await student.destroy();
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
