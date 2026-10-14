const express = require("express");
const path = require("path");
const fs = require("fs");
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
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const usersRoutes = require("./routes/usersRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// Use an absolute path for uploaded product images.
const UPLOADS_DIR = path.resolve(__dirname, "uploads");

// =====================================================
// CORS — NETLIFY + LOCAL DEVELOPMENT
// =====================================================

const allowedOrigins = [
  "https://temare-shopsphere.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("CORS ALLOWED:", origin);
      return callback(null, true);
    }

    console.log("CORS BLOCKED:", origin);
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
};

// Register CORS before API routes.
app.use(cors(corsOptions));

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
// STATIC PRODUCT IMAGES / UPLOADS
// =====================================================

// Log whether the upload directory exists on the server.
console.log("UPLOADS DIRECTORY:", UPLOADS_DIR);
console.log("UPLOADS DIRECTORY EXISTS:", fs.existsSync(UPLOADS_DIR));

// Serve files from server/uploads at /uploads/filename.
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    dotfiles: "deny",
    index: false,
    fallthrough: true,
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/payments", paymentRoutes);

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const protect = require("./middleware/authMiddleware");

// =====================================================
// PROFILE
// =====================================================

app.get("/api/profile", protect, async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

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

    const profileImage =
      dbUser.profile_image ||
      dbUser.profile_photo ||
      dbUser.avatar ||
      dbUser.image ||
      null;

    return res.json({
      success: true,
      message: "Profile loaded successfully.",
      user: {
        id: dbUser.id,
        name: dbUser.name || "",
        email: dbUser.email || "",
        role: dbUser.role || "user",
        profile_image: profileImage,
        created_at: dbUser.created_at || null,
        updated_at: dbUser.updated_at || null,
      },
    });
  } catch (error) {
    console.error("PROFILE API ERROR:", error);

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
    message: "Welcome to ShopSphere API",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShopSphere backend is running",
    server: "Railway",
    uploadsDirectoryExists: fs.existsSync(UPLOADS_DIR),
    time: new Date().toISOString(),
  });
});

// =====================================================
// 404 — UNKNOWN ROUTES
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
  console.error("GLOBAL ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  if (error.message === "CORS blocked") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked",
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Uploaded file is too large.",
    });
  }

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
console.log("Allowed frontend origins:", allowedOrigins);
console.log("Uploads directory:", UPLOADS_DIR);
console.log("PRODUCT ROUTE: /api/products");
console.log("CATEGORY ROUTE: /api/categories");
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
