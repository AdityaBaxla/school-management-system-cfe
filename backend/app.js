const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

const routes = require("./routes/crud/index");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/crud", routes);
// Routes
// app.use("/api/students", require("./routes/students"));
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});
// Add more routes as needed

// other app.use() and routes above...
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err); // Optional for debugging

  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app; // for testing and exposing to tests
