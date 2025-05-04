const { FeeInvoice } = require("../models");

const createFeeInvoice = async (data) => {
  const feeInvoice = await FeeInvoice.create(data);
  return feeInvoice;
};
