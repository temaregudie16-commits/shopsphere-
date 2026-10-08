const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// =====================================================
// DATABASE
// =====================================================

const pool = require("./config/db");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const couponRoutes = require("./routes/couponRoutes");

// Reviews & Ratings
const reviewRoutes = require("./routes/reviewRoutes");

// Wishlist
const wishlistRoutes = require("./routes/wishlistRoutes");

// Notifications
const notificationRoutes = require("./routes/notificationRoutes");

// Users / Customers / Admins
const usersRoutes = require("./routes/usersRoutes");

// Payments / Chapa
const paymentRoutes = require("./routes/paymentRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / direct requests
      if (!origin) {
        return callback(null, true);
      }

      // Development: allow localhost on any port
      if (
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        console.log("✅ CORS ALLOWED:", origin);
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);

      return callback(new Error("CORS blocked"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
  }),
);

// =====================================================
// SECURITY
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// =====================================================
// LOGGER
// =====================================================

app.use(morgan("dev"));

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

// =====================================================
// COOKIE
// =====================================================

app.use(cookieParser());

// =====================================================
// STATIC UPLOADS
// =====================================================

// Product images / profile images / other uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================================
// API ROUTES
// =====================================================

// Authentication
app.use("/api/auth", authRoutes);

// Products
app.use("/api/products", productRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Orders
app.use("/api/orders", orderRoutes);

// Categories
app.use("/api/categories", categoryRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Coupons
app.use("/api/coupons", couponRoutes);

// Reviews & Ratings
app.use("/api/reviews", reviewRoutes);

// Wishlist
app.use("/api/wishlist", wishlistRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Users / Customers / Admins
app.use("/api/users", usersRoutes);

// Payments / Chapa
app.use("/api/payments", paymentRoutes);

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const protect = require("./middleware/authMiddleware");

// =====================================================
// PROFILE
// =====================================================

// ✅ Returns the real database user instead of JWT payload only
app.get("/api/profile", protect, async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    // Get the complete user row from database.
    // SELECT * keeps this compatible with the existing users table.
    const [rows] = await pool.query(
      `
        SELECT *
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const dbUser = rows[0];

    // Try the common profile-image field names.
    const profileImage =
      dbUser.profile_image ||
      dbUser.profile_photo ||
      dbUser.avatar ||
      dbUser.image ||
      null;

    // Keep the response clean and frontend-friendly.
    const profileUser = {
      id: dbUser.id,
      name: dbUser.name || "",
      email: dbUser.email || "",
      role: dbUser.role || "user",
      profile_image: profileImage,
      created_at: dbUser.created_at || null,
      updated_at: dbUser.updated_at || null,
    };

    return res.json({
      success: true,
      message: "Profile loaded successfully.",
      user: profileUser,
    });
  } catch (error) {
    console.error("=================================");
    console.error("PROFILE API ERROR");
    console.error("=================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
});

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ShopSphere API 🚀",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShopSphere backend is running",
    server: "localhost:5000",
    time: new Date().toISOString(),
  });
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("=================================");
  console.error("GLOBAL ERROR");
  console.error("=================================");
  console.error(error);

  // -----------------------------
  // CORS ERROR
  // -----------------------------

  if (error.message === "CORS blocked") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked",
    });
  }

  // -----------------------------
  // MULTER ERROR
  // -----------------------------

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Uploaded file is too large.",
    });
  }

  // -----------------------------
  // GENERAL ERROR
  // -----------------------------

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

// =====================================================
// DEBUG
// =====================================================

console.log("=================================");
console.log("ShopSphere app.js loaded");
console.log("APP TYPE:", typeof app);
console.log("COUPON ROUTE: /api/coupons");
console.log("REVIEW ROUTE: /api/reviews");
console.log("WISHLIST ROUTE: /api/wishlist");
console.log("NOTIFICATION ROUTE: /api/notifications");
console.log("USERS ROUTE: /api/users");
console.log("PAYMENT ROUTE: /api/payments");
console.log("PROFILE ROUTE: /api/profile");
console.log("=================================");

// =====================================================
// EXPORT
// =====================================================

module.exports = app;
