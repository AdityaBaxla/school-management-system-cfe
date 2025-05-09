const { access } = require("fs");
const {
  sequelize,
  Student,
  Class,
  AcademicYear,
  Configuration,
  Enrollment,
  FeeType,
  FeeStructure,
  FeeInvoice,
  FeePayment,
  ClassSection,
} = require("../models");

const { createClassSection } = require("../controllers/ClassController");

async function seed() {
  try {
    // 1) Recreate schema
    await sequelize.sync({ force: true });
    console.log("✔️ Database synced (all tables dropped & re-created)");

    // 2) Create lookup data
    const ay = await AcademicYear.create({
      name: "2024-2025",
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      code: "AY2024",
    });

    // set current academic year
    const currentAy = await Configuration.findByPk("CURRENT_AY");
    if (!currentAy) {
      await Configuration.create({
        key: "CURRENT_AY",
        value: ay.id,
        description: "Current Academic Year",
      });
    }

    const class1 = await Class.create({ name: "X", displayOrder: 1 });
    const classSection1 = await createClassSection({
      name: "A",
      displayOrder: 1,
      classId: class1.id,
      capacity: 30,
      academicYearId: ay.id,
    });
    const classSection2 = await createClassSection({
      name: "B",
      displayOrder: 2,
      classId: class1.id,
      capacity: 30,
      academicYearId: ay.id,
    });
    const student = await Student.create({
      admissionNumber: "ADM001",
      folioNumber: "FOL1001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "2015-08-15",
      gender: "Male",
      address: "Pune, Cityville",
    });

    const student2 = await Student.create({
      admissionNumber: "ADM002",
      folioNumber: "FOL1002",
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "2015-09-20",
    });

    const enrollement1 = await Enrollment.create({
      enrollmentDate: new Date(),
      status: "active",
      studentId: student.id,
      classSectionId: classSection1.id,
      academicYearId: ay.id,
    });

    const enrollement2 = await Enrollment.create({
      enrollmentDate: new Date(),
      status: "active",
      studentId: student2.id,
      classSectionId: classSection2.id,
      academicYearId: ay.id,
    });

    const feeType1 = await FeeType.create({
      name: "Tuition Fee",
      description: "Monthly tuition fee for the student",
      code: "TUITION",
    });

    const feeType2 = await FeeType.create({
      name: "Late Fine",
      description: "Fine for late payment of fees",
      code: "LATE_FINE",
    });

    const feeType3 = await FeeType.create({
      name: "Admission Fee",
      description: "One-time admission fee",
      code: "ADMISSION",
    });

    const feeType4 = await FeeType.create({
      name: "Annual Fee",
      description: "Annual fee for the student",
      code: "ANNUAL",
    });

    const feeType5 = await FeeType.create({
      name: "Examination Fee",
      description: "Fee for the examination",
      code: "EXAM",
    });

    const feeType6 = await FeeType.create({
      name: "Library Fee/Lab Charge",
      description: "Fee for library/lab usage",
      code: "LIBRARY_LAB",
    });

    const feeType7 = await FeeType.create({
      name: "Infrastructure Maintenance",
      description: "Fee for infrastructure maintenance",
      code: "INFRA_MAINT",
    });
    const feeType8 = await FeeType.create({
      name: "Co-curricular Activities",
      description: "Fee for co-curricular activities",
      code: "CO_CURR_ACT",
    });

    await FeeStructure.bulkCreate([
      {
        classId: class1.id,
        academicYearId: ay.id,
        feeTypeId: feeType1.id,
        amount: 1000,
        billingCycle: "MONTHLY",
        dueDate: "2024-07-15",
      },
      {
        classId: class1.id,
        academicYearId: ay.id,
        feeTypeId: feeType2.id,
        amount: 200,
        dueDate: "2024-07-15",
        billingCycle: "MONTHLY",
      },
    ]);

    // 3) Create a student & enrollment

    // const enrollment = await Enrollment.create({
    //   student_id: student.id,
    //   class_id: grade1.id,
    //   academic_year_id: ay.id,
    // });

    // // 4) Invoice + payment
    // const invoice = await FeeInvoice.create({
    //   student_id: student.id,
    //   enrollment_id: enrollment.id,
    //   invoiceDate: new Date(),
    //   totalAmount: 1200,
    //   status: "pending",
    // });

    // await FeePayment.create({
    //   fee_invoice_id: invoice.id,
    //   paymentDate: new Date(),
    //   amountPaid: 1200,
    //   paymentMethod: "Cash",
    //   transactionReference: "TXN123ABC",
    // });

    console.log("✔️ Dummy data has been populated.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seed();
