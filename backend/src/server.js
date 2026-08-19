const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/authRoutes");

const employeeRoutes = require("./routes/employeeRoutes");

const attendanceRoutes = require("./routes/attendanceRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");
// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Attendance Management API is running",
  });
});

// Database test API
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "success",
      message: "Backend and PostgreSQL are connected",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});