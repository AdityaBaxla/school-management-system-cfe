const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

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

const {
  createFeeStructure,
  getAllFeeStructure,
  deleteFeeStructure,
  getFeeStructure,
  updateFeeStructure,
} = require("../../controllers/FeeStructureController");

const academicYearController = require("../../controllers/academicYearController");

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

router.post("/fee-types", async (req, res) => {
  try {
    const fee = await createFeeType({ ...req.body, ...req.query });
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/fee-types", async (req, res) => {
  try {
    const fees = await getAllFeeType({ ...req.query }); // spread queries like academicYearId
    res.status(200).json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/fee-types/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const fee = await getFeeType(id, { ...req.query });
    res.status(200).json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/fee-types/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log("here in update");
    const fee = await updateFeeType(id, { ...req.query });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/fee-types/:id", async (req, res) => {
  try {
    await deleteFeeType(req.params.id, {
      ...res.query,
    });
    res.json({ message: "Feetype deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fee Structure

router.post("/fee-structures", async (req, res) => {
  try {
    const feeStructure = await createFeeStructure({
      ...req.body,
      ...req.query,
    });
    res.status(201).json(feeStructure);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/fee-structures", async (req, res) => {
  try {
    const feeStructure = await getAllFeeStructure({ ...req.query }); // spread queries like academicYearId
    res.status(200).json(feeStructure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/fee-structures/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const feeStructure = await getFeeStructure(id, { ...req.query });
    res.status(200).json(feeStructure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/fee-structures/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const feeStructure = await updateFeeStructure(id, {
      ...req.query,
      ...req.body,
    });
    res.json(feeStructure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/fee-structures/:id", async (req, res) => {
  try {
    await deleteFeeStructure(req.params.id, {
      ...res.query,
    });
    res.json({ message: "Fee Structure deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// academic year crud routes
router.get(
  "/academic-years",
  asyncHandler(academicYearController.getAllAcademicYears)
);
router.get(
  "/academic-years/:id",
  asyncHandler(academicYearController.getAcademicYear)
);
router.post(
  "/academic-years",
  asyncHandler(academicYearController.createAcademicYear)
);
router.put(
  "/academic-years/:id",
  asyncHandler(academicYearController.updateAcademicYear)
);
router.delete(
  "/academic-years/:id",
  asyncHandler(academicYearController.deleteAcademicYear)
);

const feeInvoiceController = require("../../controllers/fee-invoice-controller");

// Fee Invoice generation
router.post(
  "/fee-invoices/generate-monthly",
  asyncHandler(feeInvoiceController.generateMonthlyFeeInvoices)
);

router.post(
  "/fee-invoices/generate-annual",
  asyncHandler(feeInvoiceController.generateAnnualFeeInvoices)
);
module.exports = router;
