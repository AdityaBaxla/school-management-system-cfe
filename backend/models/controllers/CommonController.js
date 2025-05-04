const {
  FeeStructure,
  AcademicYear,
  ClassSection,
  Configuration,
} = require("../models");

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

module.exports = {
  getDropdownLabels,
};
