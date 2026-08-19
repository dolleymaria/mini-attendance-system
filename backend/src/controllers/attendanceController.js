const pool = require("../config/db");

// ============================================
// MARK ATTENDANCE
// ============================================

const markAttendance = async (req, res) => {
  try {
    const {
      employee_id,
      attendance_date,
      check_in_time,
      check_out_time,
      attendance_status,
    } = req.body;

    // Validate required fields
    if (!employee_id || !attendance_date || !attendance_status) {
      return res.status(400).json({
        message:
          "Employee ID, attendance date and attendance status are required",
      });
    }

    // Check whether employee exists
    const employeeResult = await pool.query(
      `SELECT id, employee_id, employee_name
       FROM employees
       WHERE id = $1`,
      [employee_id]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Insert attendance record
    const result = await pool.query(
      `INSERT INTO attendance
      (
        employee_id,
        attendance_date,
        check_in_time,
        check_out_time,
        attendance_status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        employee_id,
        attendance_date,
        check_in_time || null,
        check_out_time || null,
        attendance_status,
      ]
    );

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    // Duplicate employee/date
    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "Attendance has already been marked for this employee on this date",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ============================================
// GET ATTENDANCE RECORDS
// ============================================

const getAttendanceRecords = async (req, res) => {
  try {
    const {
      date,
      employee_id,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    // Filter by date
    if (date) {
      values.push(date);

      conditions.push(
        `a.attendance_date = $${values.length}`
      );
    }

    // Filter by employee
    if (employee_id) {
      values.push(employee_id);

      conditions.push(
        `a.employee_id = $${values.length}`
      );
    }

    // Filter by attendance status
    if (status) {
      values.push(status);

      conditions.push(
        `a.attendance_status = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // Count records
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM attendance a
       ${whereClause}`,
      values
    );

    const total = parseInt(countResult.rows[0].total);

    // Pagination values
    const attendanceValues = [...values];

    attendanceValues.push(limitNumber);
    const limitIndex = attendanceValues.length;

    attendanceValues.push(offset);
    const offsetIndex = attendanceValues.length;

    // Get records
    const result = await pool.query(
      `SELECT
        a.id,
        a.employee_id AS employee_database_id,
        e.employee_id,
        e.employee_name,
        e.department,
        e.designation,
        a.attendance_date,
        a.check_in_time,
        a.check_out_time,
        a.attendance_status,
        a.created_at,
        a.updated_at
       FROM attendance a
       INNER JOIN employees e
         ON a.employee_id = e.id
       ${whereClause}
       ORDER BY a.attendance_date DESC, a.id DESC
       LIMIT $${limitIndex}
       OFFSET $${offsetIndex}`,
      attendanceValues
    );

    res.json({
      attendance: result.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get attendance records error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ============================================
// ATTENDANCE SUMMARY
// ============================================

const getAttendanceSummary = async (req, res) => {
  try {
    const {
      employee_id,
      start_date,
      end_date,
    } = req.query;

    const conditions = [];
    const values = [];

    // Employee filter
    if (employee_id) {
      values.push(employee_id);

      conditions.push(
        `a.employee_id = $${values.length}`
      );
    }

    // Start date
    if (start_date) {
      values.push(start_date);

      conditions.push(
        `a.attendance_date >= $${values.length}`
      );
    }

    // End date
    if (end_date) {
      values.push(end_date);

      conditions.push(
        `a.attendance_date <= $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_records,

        COUNT(*) FILTER (
          WHERE a.attendance_status = 'PRESENT'
        ) AS present_days,

        COUNT(*) FILTER (
          WHERE a.attendance_status = 'ABSENT'
        ) AS absent_days,

        COUNT(*) FILTER (
          WHERE a.attendance_status = 'HALF_DAY'
        ) AS half_days,

        COUNT(*) FILTER (
          WHERE a.attendance_status = 'LEAVE'
        ) AS leave_days

       FROM attendance a
       ${whereClause}`,
      values
    );

    const summary = result.rows[0];

    const totalRecords = parseInt(
      summary.total_records
    );

    const presentDays = parseInt(
      summary.present_days
    );

    const absentDays = parseInt(
      summary.absent_days
    );

    const halfDays = parseInt(
      summary.half_days
    );

    const leaveDays = parseInt(
      summary.leave_days
    );

    // ============================================
    // ATTENDANCE PERCENTAGE
    //
    // PRESENT  = 1 day
    // HALF_DAY = 0.5 day
    // ABSENT   = 0 day
    // LEAVE    = excluded
    // ============================================

    const attendedDays =
      presentDays + halfDays * 0.5;

    const workingDays =
      presentDays +
      halfDays +
      absentDays;

    const attendancePercentage =
      workingDays > 0
        ? (
            (attendedDays / workingDays) *
            100
          ).toFixed(2)
        : "0.00";

    res.json({
      summary: {
        totalRecords,
        presentDays,
        absentDays,
        halfDays,
        leaveDays,
        attendancePercentage: `${attendancePercentage}%`,
      },
    });

  } catch (error) {
    console.error(
      "Attendance summary error:",
      error
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ============================================
// EMPLOYEE-WISE ATTENDANCE HISTORY
// ============================================

const getEmployeeAttendanceHistory = async (
  req,
  res
) => {
  try {
    const { employeeId } = req.params;

    // Check employee
    const employeeResult = await pool.query(
      `SELECT
        id,
        employee_id,
        employee_name,
        department,
        designation
       FROM employees
       WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const attendanceResult = await pool.query(
      `SELECT
        id,
        attendance_date,
        check_in_time,
        check_out_time,
        attendance_status
       FROM attendance
       WHERE employee_id = $1
       ORDER BY attendance_date DESC`,
      [employeeId]
    );

    res.json({
      employee: employeeResult.rows[0],
      attendance: attendanceResult.rows,
    });
  } catch (error) {
    console.error(
      "Employee attendance history error:",
      error
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


module.exports = {
  markAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  getEmployeeAttendanceHistory,
};