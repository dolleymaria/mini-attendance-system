const pool = require("../config/db");

const getDashboardStatistics = async (req, res) => {
  try {
    // Total employees
    const totalEmployeesResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM employees`
    );

    // Active employees
    const activeEmployeesResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM employees
       WHERE status = 'ACTIVE'`
    );

    // Present today
    const presentTodayResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM attendance
       WHERE attendance_date = CURRENT_DATE
       AND attendance_status = 'PRESENT'`
    );

    // Absent today
    const absentTodayResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM attendance
       WHERE attendance_date = CURRENT_DATE
       AND attendance_status = 'ABSENT'`
    );

    // Department-wise employee count
    const departmentResult = await pool.query(
      `SELECT
        department,
        COUNT(*) AS count
       FROM employees
       GROUP BY department
       ORDER BY department ASC`
    );

    res.json({
      totalEmployees: parseInt(
        totalEmployeesResult.rows[0].total
      ),

      activeEmployees: parseInt(
        activeEmployeesResult.rows[0].total
      ),

      presentToday: parseInt(
        presentTodayResult.rows[0].total
      ),

      absentToday: parseInt(
        absentTodayResult.rows[0].total
      ),

      departmentWiseCount:
        departmentResult.rows.map((row) => ({
          department: row.department,
          count: parseInt(row.count),
        })),
    });
  } catch (error) {
    console.error(
      "Dashboard statistics error:",
      error
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDashboardStatistics,
};