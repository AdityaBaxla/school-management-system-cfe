// utils/withAcademicYear.js

// Replace this with reactive Pinia access later
import { useConfigStore } from "@/stores/config";
// const getAcademicYearId = () => useConfigStore().currentAcademicYearId;
const getAcademicYearId = () => {
  1;
};

export const withAcademicYear = (apiObject) => {
  const wrap =
    (fn) =>
    (...args) => {
      const lastArg = args[args.length - 1];
      const ayId = getAcademicYearId();

      if (typeof lastArg === "object" && !Array.isArray(lastArg)) {
        args[args.length - 1] = { ...lastArg, academicYearId: ayId };
      } else {
        args.push({ academicYearId: ayId });
      }

      return fn(...args);
    };

  return Object.keys(apiObject).reduce((wrapped, key) => {
    wrapped[key] = wrap(apiObject[key]);
    return wrapped;
  }, {});
};
