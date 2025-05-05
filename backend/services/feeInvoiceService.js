const {
  FeeInvoice,
  FeeStructure,
  Enrollment,
  ClassSection,
  Class,
  FeePayment,
} = require("../models");
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

  return { numberOfInvoices: invoices.length, period: period };
}

// 🧾 2. Generate annual invoice once per student
async function generateAnnualInvoices({ academicYearId }) {
  const feeStructures = await FeeStructure.findAll({
    where: { academicYearId, billingCycle: "annual" },
  });

  const enrollments = await Enrollment.findAll({ where: { academicYearId } });

  const invoices = [];

  for (const enrollment of enrollments) {
    for (const fee of feeStructures) {
      if (fee.classSectionId !== enrollment.classSectionId) continue;

      const alreadyExists = await FeeInvoice.findOne({
        where: {
          studentId: enrollment.studentId,
          feeTypeId: fee.feeTypeId,
          period: `ANNUAL-${academicYearId}`,
          academicYearId,
        },
      });

      if (!alreadyExists) {
        invoices.push({
          studentId: enrollment.studentId,
          feeTypeId: fee.feeTypeId,
          academicYearId,
          period: `ANNUAL-${academicYearId}`,
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

  return invoices.length;
}

// ➕ 3. Create ad-hoc invoice
async function createAdHocInvoice({
  studentId,
  feeTypeId,
  amount,
  period,
  academicYearId,
}) {
  return await FeeInvoice.create({
    studentId,
    feeTypeId,
    academicYearId,
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
