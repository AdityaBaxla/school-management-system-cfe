const express = require("express");
const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../../controllers/studentController");

const {
  createFeeType,
  getAllFeeType,
  getFeeType,
  updateFeeType,
  deleteFeeType,
} = require("../../controllers/FeeTypeController");

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
  console.log("req.params.y", req.query.academicYearId);
  try {
    const updatedStudent = await updateStudent(req.params.id, {
      ...req.body,
      academicYearId: req.query.academicYearId,
    });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a student
router.delete("/students/:id", async (req, res) => {
  try {
    await deleteStudent(req.params.id, {
      academicYearId: req.query.academicYearId,
    });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fee Type

router.post("/feetypes", async (req, res) => {
  try {
    const fee = await createFeeType({ ...req.body, ...req.query });
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/feetypes", async (req, res) => {
  try {
    const fees = await getAllFeeType({ ...req.query }); // spread queries like academicYearId
    res.status(200).json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/feetypes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const fee = await getFeeType(id, { ...req.query });
    res.status(200).json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/feetypes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log("here in update");
    const fee = await updateFeeType(id, { ...req.query });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/feetypes/:id", async (req, res) => {
  try {
    await deleteFeeType(req.params.id, {
      ...res.query,
    });
    res.json({ message: "Feetype deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
