const express = require("express");

const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  getEmployeeAttendanceHistory,
} = require("../controllers/attendanceController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

// Specific routes first
router.get("/summary", getAttendanceSummary);
router.get(
  "/employee/:employeeId",
  getEmployeeAttendanceHistory
);

// General routes
router.post("/", markAttendance);
router.get("/", getAttendanceRecords);

module.exports = router;