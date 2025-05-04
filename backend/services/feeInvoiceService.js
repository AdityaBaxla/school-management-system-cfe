const {
  FeeInvoice,
  FeeStructure,
  Enrollment,
  FeePayment,
} = require("../models");

const { Op } = require("sequelize");

// 🔁 1. Generate monthly invoices for all enrollments
async function generateMonthlyInvoices({ academicYearId, month, year }) {
  const period = `${month.toUpperCase()}-${year}`;
  const feeStructures = await FeeStructure.findAll({
    where: { academicYearId, billingCycle: "monthly" },
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
          period,
          academicYearId,
        },
      });

      if (!alreadyExists) {
        invoices.push({
          studentId: enrollment.studentId,
          feeTypeId: fee.feeTypeId,
          academicYearId,
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

  return invoices.length;
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
