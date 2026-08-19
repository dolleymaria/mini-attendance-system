const express = require("express");

const {
  getDashboardStatistics,
} = require("../controllers/dashboardController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard requires authentication
router.use(authenticateToken);

router.get(
  "/statistics",
  getDashboardStatistics
);

module.exports = router;