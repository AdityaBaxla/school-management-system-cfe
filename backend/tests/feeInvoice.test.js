const request = require("supertest");
const app = require("../app");
const sequelize = require("../database");
const { Student, Class } = require("../models");

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Clean slate
});

afterAll(async () => {
  await sequelize.close();
});

describe("Student API", () => {
  test(" Student", async () => {
    //     const classRes = await request(app)
    //       .post("/api/crud/classes")
    //       .send({ firstName: "Test Class" });
    //     expect(classRes.statusCode).toBe(200);
    const classSectionId = 1;

    const studentRes = await request(app)
      .post("/api/crud/students")
      .send({ firstName: "John Doe", classSectionId });
    console.log("Student Response:", studentRes.body);
    expect(studentRes.statusCode).toBe(200);
    expect(studentRes.body.firstName).toBe("John Doe");
    expect(studentRes.body.classSectionId).toBe(classSectionId);
  });

  test("Get Students", async () => {
    const res = await request(app).get("/api/crud/students");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
