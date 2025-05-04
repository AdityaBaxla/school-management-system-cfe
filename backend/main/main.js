const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// database

const { sequelize } = require("../database/models");

// sync should be in sequilize.js file
(async () => {
  try {
    // Sync models with the database (creating the models)
    await sequelize.query("PRAGMA foreign_keys = OFF");
    await sequelize.sync();
    await sequelize.query("PRAGMA foreign_keys = ON");

    // await sequelize.sync({ alter: true }); // `alter` ensures the database schema matches models
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing the database:", error);
  }
})();

// associations
// require("../database/associations");

// controller
const studentController = require("../database/controllers/StudentController");
const feeController = require("../database/controllers/FeeController");
const paymentController = require("../database/controllers/PaymentController");
const CommonController = require("../database/controllers/CommonController");
let mainWindow;

// Use electron reload to hot reload the backend
console.log(">>> Electron main process started");

const electronPath = require("electron").path;
console.log("Reload init");
require("electron-reload")(path.join(__dirname, ".."), {
  electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
  hardResetMethod: "exit",
});

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // If using a preload script
    },
  });

  if (process.env.NODE_ENV === "development") {
    // Load the Vite dev server
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // Load the built Vue app in production
    mainWindow.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
  }

  // handlers

  ipcMain.handle("test", () => {
    console.log("test ping");
    return "test response";
  });

  // Student Controller Calling
  ipcMain.handle("student:create", async (_, data) => {
    return await studentController.createStudent(data);
  });

  ipcMain.handle("student:readAll", async () => {
    // console.log("ipc main data", data);
    const stud = await studentController.getAllStudents(1);
    return stud;
  });

  ipcMain.handle("student:readOne", async (_, id) => {
    return await studentController.getStudentById(id);
  });

  ipcMain.handle("student:update", async (_, id, data) => {
    return await studentController.updateStudent(id, data);
  });

  ipcMain.handle("student:delete", async (_, id) => {
    return await studentController.deleteStudent(id);
  });

  ipcMain.handle("fee:create", async (_, data) => {
    // handler forFee
    return await feeController.createFee(data);
  });

  ipcMain.handle("fee:readAll", async () => {
    return await feeController.getAllFee();
  });

  ipcMain.handle("fee:readOne", async (_, id) => {
    return await feeController.getFeeById(id);
  });

  ipcMain.handle("fee:update", async (_, id, data) => {
    return await feeController.updateStudent(id, data);
  });

  ipcMain.handle("fee:delete", async (_, id) => {
    return await feeController.deleteStudent(id);
  });

  // handler for Payment
  ipcMain.handle("payment:create", async (_, data) => {
    return await paymentController.createStudent(data);
  });

  ipcMain.handle("payment:readAll", async () => {
    return await paymentController.getAllStudents();
  });

  ipcMain.handle("payment:readOne", async (_, id) => {
    return await paymentController.getStudentById(id);
  });

  ipcMain.handle("payment:update", async (_, id, data) => {
    return await paymentController.updateStudent(id, data);
  });

  ipcMain.handle("payment:delete", async (_, id) => {
    return await paymentController.deleteStudent(id);
  });

  ipcMain.handle("getDropdownLabels", async (_, entity) => {
    // console.log("entity", entity);
    // return await feeController.getAllFee();
    const data = await CommonController.getDropdownLabels(entity);
    return data;
  });
});

// creating function that handel invoke from preload.js
// app.on('ready', () => {

// })
