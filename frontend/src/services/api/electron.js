// src/services/api/electron.js

const currentAY = 1;

function withAY(data) {
  return { ...data, academicYearId: currentAY };
}

export default {
  student: {
    getAll: () => window.api.student.getAll(),
    create: (d) => window.api.student.create(withAY(d)),
    update: (id, d) => window.api.student.update(id, withAY(d)),
    delete: (id) => window.api.student.delete(id),
  },
  fee: {
    getAll: () => window.api.fee.getAll(),
    create: (d) => window.api.fee.create(withAY(d)),
    update: (id, d) => window.api.fee.update(id, d),
    delete: (id) => window.api.fee.delete(id),
  },
  getDropdownLabels: (entity) => {
    return window.api.getDropdownLabels(withAY(entity));
  },
};
