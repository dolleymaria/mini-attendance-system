const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Expected format:
    // Authorization: Bearer <token>

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store decoded user information in request
    req.user = decoded;

    // Continue to controller
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authenticateToken;