const express = require("express");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getDepartments,
} = require("../controllers/employeeController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

// Create employee
router.post("/", createEmployee);

// Get departments
router.get("/departments", getDepartments);

// Get all employees
router.get("/", getEmployees);

// Get employee by ID
router.get("/:id", getEmployeeById);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;