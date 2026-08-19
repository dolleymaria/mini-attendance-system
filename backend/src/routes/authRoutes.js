const express = require("express");
const { login } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

module.exports = router;