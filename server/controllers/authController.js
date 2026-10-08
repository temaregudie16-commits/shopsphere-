const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { createUser, findUserByEmail } = require("../models/userModel");

// =====================================================
// PASSWORD VALIDATION
// =====================================================

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

// =====================================================
// REGISTER
// =====================================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ---------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters.",
      });
    }

    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include a letter, number and symbol.",
      });
    }

    // ---------------------------------------------------
    // CHECK EXISTING USER
    // ---------------------------------------------------

    const existingUser = await findUserByEmail(cleanEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // ---------------------------------------------------
    // HASH PASSWORD
    // ---------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------------------------------------------
    // CREATE USER
    // ---------------------------------------------------

    const result = await createUser(cleanName, cleanEmail, hashedPassword);

    console.log("✅ USER CREATED:", result);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("=================================");

    console.error("REGISTER ERROR:");

    console.error("=================================");

    console.error("message:", error.message);

    console.error("code:", error.code);

    console.error("sqlMessage:", error.sqlMessage);

    console.error("sql:", error.sql);

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server Error",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // ---------------------------------------------------
    // FIND USER
    // ---------------------------------------------------

    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ---------------------------------------------------
    // COMPARE PASSWORD
    // ---------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // ---------------------------------------------------
    // JWT
    // ---------------------------------------------------

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("=================================");

    console.error("LOGIN ERROR:");

    console.error("=================================");

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server Error",
    });
  }
};
