// const BILLING_CYCLES = [
//   "ANNUAL",
//   "SEMESTER",
//   "QUARTERLY",
//   "MONTHLY",
//   "ONE_TIME",
// ];

const FEE_TYPES = [
  "Tuition Fee",
  "Development Fee",
  "Library Fee",
  "Laboratory Fee",
  "Sports Fee",
  "Activity Fee",
  "Transport Fee",
  "Hostel Fee",
  "Examination Fee",
  "Miscellaneous Fee",
];

/** @enum {string} */
const MONTHS = {
  JAN: "JAN",
  FEB: "FEB",
  MAR: "MAR",
  APR: "APR",
  MAY: "MAY",
  JUN: "JUN",
  JUL: "JUL",
  AUG: "AUG",
  SEP: "SEP",
  OCT: "OCT",
  NOV: "NOV",
  DEC: "DEC",
};
Object.freeze(MONTHS);

/** @enum {string} */
const BILLING_CYCLES = {
  ANNUAL: "ANNUAL",
  SEMESTER: "SEMESTER",
  QUARTERLY: "QUARTERLY",
  MONTHLY: "MONTHLY",
  ONE_TIME: "ONE_TIME",
};
Object.freeze(BILLING_CYCLES);

module.exports = {
  MONTHS,
  BILLING_CYCLES,
  FEE_TYPES,
};
// This file contains constants used in the application.
