// too much looping i understand, good enough for < 500 enrollments (current student count) > 5000 its risky.
// ideas at the end of the file

const {
  FeeInvoice,
  FeeStructure,
  Enrollment,
  ClassSection,
  Class,
  FeePayment,
  Job,
} = require("../models");

const { MONTHS, BILLING_CYCLES } = require("../models/utils/constants");
// const { BILLING_CYCLES } = require("../utils/constants");
const { Op } = require("sequelize");

// 🔁 1. Generate monthly invoices for all enrollments
async function generateMonthlyInvoices({ academicYearId, month, year }) {
  console.log("running generateMonthlyInvoices");

  const period = `${month.toUpperCase()}-${year}`;
  const feeStructures = await FeeStructure.findAll({
    where: { academicYearId, billingCycle: "MONTHLY" },
  });

  const enrollments = await Enrollment.findAll({
    where: { academicYearId },
    include: [
      {
        model: ClassSection,
        include: [
          {
            model: Class,
            attributes: ["id", "name"], // or just ['id'] if only classId needed
          },
        ],
        attributes: ["id", "classId"],
      },
    ],
    raw: true,
    nest: true,
  });

  const invoices = [];

  for (const enrollment of enrollments) {
    console.log("enrollments:", enrollment);
    for (const fee of feeStructures) {
      // console.log("fee:", fee.dataValues);
      // Check if the fee is applicable for the student's class section, since each class has a different fee structure
      console.log(enrollment.ClassSection?.classId, fee.classId);
      if (fee.classId !== enrollment.ClassSection?.classId) continue;

      const alreadyExists = await FeeInvoice.findOne({
        where: {
          studentId: enrollment.studentId,
          feeStructureId: fee.id,
          period,
        },
      });

      if (!alreadyExists) {
        invoices.push({
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          feeStructureId: fee.id,
          period,
          originalAmount: fee.amount,
          finalAmount: fee.amount,
          status: "Unpaid",
        });
      }
    }
  }

  if (invoices.length > 0) {
    await FeeInvoice.bulkCreate(invoices);
  }

  // add to job table to keep track of invoice generation
  await Job.create({
    name: "MONTHLY_INVOICE,",
    status: "completed",
    code: `${academicYearId}-${month}-${year}`,
    data: invoices,
  });

  return { numberOfInvoices: invoices.length, period: period };
}

// 🧾 2. Generate annual invoice once per student
async function generateAnnualInvoices({ academicYearId, month = "APR" }) {
  // generate annual invoices for all enrollments, billed at a particular month (usually April)
  const feeStructures = await FeeStructure.findAll({
    where: { academicYearId, billingCycle: BILLING_CYCLES.ANNUAL },
  });

  const enrollments = await Enrollment.findAll({
    where: { academicYearId },
    include: [
      {
        model: ClassSection,
        include: [
          {
            model: Class,
            attributes: ["id", "name"], // or just ['id'] if only classId needed
          },
        ],
        attributes: ["id", "classId"],
      },
    ],
    raw: true,
    nest: true,
  });

  const invoices = [];

  for (const enrollment of enrollments) {
    for (const fee of feeStructures) {
      if (fee.classId !== enrollment.ClassSection?.classId) continue;

      const alreadyExists = await FeeInvoice.findOne({
        where: {
          studentId: enrollment.studentId,
          feeStructureId: fee.id,
          period: `${BILLING_CYCLES.ANNUAL}-${academicYearId}-${month}`,
        },
      });

      if (!alreadyExists) {
        invoices.push({
          studentId: enrollment.studentId,
          feeStructureId: fee.id,
          period: `${BILLING_CYCLES.ANNUAL}-${academicYearId}-${month}`,
          originalAmount: fee.amount,
          finalAmount: fee.amount,
          status: "Unpaid",
        });
      }
    }
  }

  if (invoices.length > 0) {
    await FeeInvoice.bulkCreate(invoices);
  }

  // save the job to the database
  await Job.create({
    name: "ANNUAL_INVOICE",
    status: "completed",
    code: `${academicYearId}-${month}-${BILLING_CYCLES.ANNUAL}-${month}`,
    data: invoices,
  });

  return invoices.length;
}

// ➕ 3. Create ad-hoc invoice
async function createAdHocInvoice({ enrollmentId, amount, period }) {
  return await FeeInvoice.create({
    enrollmentId,
    feeStructureId,
    period,
    originalAmount: amount,
    finalAmount: amount,
    status: "Unpaid",
  });
}

// 🔍 4. Get invoices by student
async function getInvoicesByStudent(studentId) {
  return await FeeInvoice.findAll({
    where: { studentId },
    order: [["createdAt", "DESC"]],
  });
}

// 💰 5. Calculate total dues for a student
async function getStudentDues(studentId) {
  const invoices = await FeeInvoice.findAll({ where: { studentId } });

  const dues = [];

  for (const invoice of invoices) {
    const totalPaid = await FeePayment.sum("amountPaid", {
      where: { invoiceId: invoice.id },
    });

    const paid = totalPaid || 0;
    const due = invoice.finalAmount - paid;

    dues.push({
      invoiceId: invoice.id,
      period: invoice.period,
      feeTypeId: invoice.feeTypeId,
      finalAmount: invoice.finalAmount,
      paid,
      due,
      status: invoice.status,
    });
  }

  return dues;
}

// 🧠 6. Update invoice status based on payment
async function updateInvoiceStatus(invoiceId) {
  const invoice = await FeeInvoice.findByPk(invoiceId);
  const paid =
    (await FeePayment.sum("amountPaid", { where: { invoiceId } })) || 0;

  let newStatus = "Unpaid";
  if (paid >= invoice.finalAmount) newStatus = "Paid";
  else if (paid > 0) newStatus = "Partial";

  invoice.status = newStatus;
  await invoice.save();
}

module.exports = {
  generateMonthlyInvoices,
  generateAnnualInvoices,
  createAdHocInvoice,
  getInvoicesByStudent,
  getStudentDues,
  updateInvoiceStatus,
};

/*
  ⚠️ Performance Notes for Large-Scale Invoice Generation:

  1. 🔄 Avoid N+1 Queries:
     - Currently, `FeeInvoice.findOne()` is called inside nested loops.
     - When enrollment count scales, this results in thousands of queries.
     - ✅ Optimization: Preload all existing FeeInvoices for the target period and use a Set for fast lookup.

  2. 🎯 Reduce Unnecessary Fee Checks:
     - Currently iterating over all fee structures for every enrollment.
     - ✅ Optimization: Group FeeStructures by classId ahead of time (Map<classId, FeeStructure[]>), and only loop over relevant ones per enrollment.

  3. 🚀 Batch Processing:
     - Invoice generation should ideally run as a background job, especially when system is under load.
     - ✅ Use queue systems like BullMQ, Agenda, or even simple cron with async batching.

  4. 📥 Bulk Insert Efficiently:
     - You're already using `bulkCreate()` — keep that.
     - ✅ Ensure indexes on studentId, feeStructureId, period in FeeInvoice table for fast upserts/checks.

  5. 🧪 Test Scenarios:
     - Benchmark generation time on test data with 5k+ enrollments.
     - Use fake data seeding scripts to validate performance.

  6. 📊 Track Job Stats:
     - Extend `Job` table with start/end timestamps and duration.
     - Helpful for monitoring job performance over time.

  7. 🧹 Future Consideration:
     - Consider denormalizing some fields only if necessary (e.g., storing classId on FeeInvoice) — but only after you’ve exhausted query optimizations.

*/
