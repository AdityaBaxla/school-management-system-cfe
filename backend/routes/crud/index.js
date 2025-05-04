const express = require("express");
const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../../controllers/studentController");

// Create a new student
router.post("/students", async (req, res) => {
  try {
    const student = await createStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all students (optionally filter by academicYearId)
router.get("/students", async (req, res) => {
  try {
    const academicYearId = req.query.academicYearId;
    const students = await getAllStudents(academicYearId);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a student by ID
router.get("/students/:id", async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a student
router.put("/students/:id", async (req, res) => {
  try {
    const updatedStudent = await updateStudent(req.params.id, req.body);
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a student
router.delete("/students/:id", async (req, res) => {
  try {
    await deleteStudent(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
