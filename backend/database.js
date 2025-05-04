// This file sets up the SQLite database connection using Sequelize ORM.

const { Sequelize } = require("sequelize");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  logging: false, // Disable SQL logs in console
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {}
      : {
          // SQLite specific options
          mode:
            require("sqlite3").OPEN_READWRITE | require("sqlite3").OPEN_CREATE,
        },
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to SQLite has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;
