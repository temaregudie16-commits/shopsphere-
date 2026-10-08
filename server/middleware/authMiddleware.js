const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // =====================================================
    // CHECK JWT CONFIGURATION
    // =====================================================

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing from server configuration.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    // =====================================================
    // GET AUTHORIZATION HEADER
    // =====================================================

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // =====================================================
    // CHECK BEARER FORMAT
    // =====================================================

    const parts = authorization.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = parts[1];

    // =====================================================
    // VERIFY TOKEN
    // =====================================================

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =====================================================
    // VALIDATE USER PAYLOAD
    // =====================================================

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // =====================================================
    // ATTACH USER
    // =====================================================

    req.user = {
      id: Number(decoded.id),
      email: decoded.email || null,
      role: decoded.role || null,
    };

    next();
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

module.exports = protect;
