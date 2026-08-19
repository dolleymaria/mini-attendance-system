const pool = require("../config/db");

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const {
      employee_id,
      employee_name,
      email,
      mobile_number,
      department,
      designation,
      status = "ACTIVE",
    } = req.body;

    // Basic validation
    if (
      !employee_id ||
      !employee_name ||
      !email ||
      !mobile_number ||
      !department ||
      !designation
    ) {
      return res.status(400).json({
        message: "All employee fields are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO employees
      (
        employee_id,
        employee_name,
        email,
        mobile_number,
        department,
        designation,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        employee_id,
        employee_name,
        email,
        mobile_number,
        department,
        designation,
        status,
      ]
    );

    res.status(201).json({
      message: "Employee created successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Employee ID, email, or mobile number already exists",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// Get Employees
const getEmployees = async (req, res) => {
  try {
    const {
      search = "",
      department,
      status,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      order = "ASC",
    } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const allowedSortColumns = [
      "employee_id",
      "employee_name",
      "email",
      "department",
      "designation",
      "status",
      "created_at",
    ];

    const safeSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy
      : "created_at";

    const safeOrder = order.toUpperCase() === "ASC"
      ? "ASC"
      : "DESC";

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          employee_id ILIKE $${values.length}
          OR employee_name ILIKE $${values.length}
          OR email ILIKE $${values.length}
          OR department ILIKE $${values.length}
        )
      `);
    }

    if (department) {
      values.push(department);

      conditions.push(
        `department = $${values.length}`
      );
    }

    if (status) {
      values.push(status);

      conditions.push(
        `status = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // Total count
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM employees
       ${whereClause}`,
      values
    );

    const total = parseInt(countResult.rows[0].total);

    // Employee records
    const employeeValues = [...values];

    employeeValues.push(limitNumber);
    const limitIndex = employeeValues.length;

    employeeValues.push(offset);
    const offsetIndex = employeeValues.length;

    const result = await pool.query(
      `SELECT *
       FROM employees
       ${whereClause}
       ORDER BY ${safeSortBy} ${safeOrder}
       LIMIT $${limitIndex}
       OFFSET $${offsetIndex}`,
      employeeValues
    );

    res.json({
      employees: result.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// Get Employee By ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM employees
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Get employee error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      employee_id,
      employee_name,
      email,
      mobile_number,
      department,
      designation,
      status,
    } = req.body;

    if (
      !employee_id ||
      !employee_name ||
      !email ||
      !mobile_number ||
      !department ||
      !designation ||
      !status
    ) {
      return res.status(400).json({
        message: "All employee fields are required",
      });
    }

    const result = await pool.query(
      `UPDATE employees
       SET
         employee_id = $1,
         employee_name = $2,
         email = $3,
         mobile_number = $4,
         department = $5,
         designation = $6,
         status = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        employee_id,
        employee_name,
        email,
        mobile_number,
        department,
        designation,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee updated successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Update employee error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Employee ID, email, or mobile number already exists",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM employees
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee deleted successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
// Get all departments
const getDepartments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT department
       FROM employees
       ORDER BY department ASC`
    );

    res.json({
      departments: result.rows.map(
        (row) => row.department
      ),
    });
  } catch (error) {
    console.error(
      "Get departments error:",
      error
    );

    res.status(500).json({
      message: "Failed to load departments.",
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getDepartments,
};