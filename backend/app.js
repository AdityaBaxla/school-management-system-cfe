const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/students", require("./routes/students"));
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});
// Add more routes as needed

module.exports = app;
