const { Configuration } = require("../models");
const feeService = require("../services/feeInvoiceService");

exports.generateMonthlyFeeInvoices = async (req, res) => {
  try {
    const { month, year } = req.body;
    const academicYearId = (await Configuration.findByPk("CURRENT_AY")).value; // this critical so not asking from frontend
    const invoices = await feeService.generateMonthlyInvoices({
      academicYearId,
      month,
      year,
    });
    res.status(200).json({
      success: true,
      message: "Monthly fee invoices generated successfully",
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating monthly fee invoices",
      error: error.message,
    });
  }
};

exports.generateAnnualFeeInvoices = async (req, res) => {
  try {
    const { month, year } = req.body;
    const academicYearId = (await Configuration.findByPk("CURRENT_AY")).value; // this critical so not asking from frontend
    const invoices = await feeService.generateAnnualInvoices({
      academicYearId,
      month,
      year,
    });
    res.status(200).json({
      success: true,
      message: "Annual fee invoices generated successfully",
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating annual fee invoices",
      error: error.message,
    });
  }
};
