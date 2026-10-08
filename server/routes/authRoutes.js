const express = require("express");

const router = express.Router();

const { register, login } = require("../controllers/authController");

// =====================================================
// TEST LOGIN ROUTE
// =====================================================

router.get("/login", (req, res) => {
  return res.json({
    success: true,
    message: "Login Route Working",
  });
});

// =====================================================
// REGISTER
// =====================================================

router.post("/register", register);

// =====================================================
// LOGIN
// =====================================================

router.post("/login", login);

module.exports = router;
