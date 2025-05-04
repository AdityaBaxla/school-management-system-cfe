const {
  FeeStructure,
  AcademicYear,
  ClassSection,
  Configuration,
} = require("../models");

const { BILLING_CYCLES } = require("../utils/constants");

const getDropdownLabels = async (data) => {
  switch (data.entity) {
    case "classSection": {
      const classes = await ClassSection.findAll({
        where: { academicYearId: data.academicYearId },
      });
      return classes.map((c) => ({ id: c.id, label: c.displayName }));
    }

    case "feeType": {
      const feeTypes = await FeeType.findAll({
        where: { academicYearId: data.academicYearId },
      });
      return feeTypes.map((f) => ({ id: f.id, label: f.title }));
    }

    default:
      throw new Error(`Unknown dropdown type: ${data.entity}`);
  }
};

function listBillingCycles() {
  // This function returns a list of billing cycles for the dropdown

  return [
    BILLING_CYCLES.map((cycle) => ({
      id: cycle,
      label: cycle
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    })),
  ];
}

module.exports = {
  getDropdownLabels,
  listBillingCycles,
};
