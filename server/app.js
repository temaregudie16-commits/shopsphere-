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
// APP CONFIGURATION
// =====================================================

const app = express();

const UPLOADS_DIR = path.resolve(__dirname, "uploads");
const TEST_IMAGE = "1789758646424-663873384.webp";

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
// BODY PARSERS
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
// COOKIE PARSER
// =====================================================

app.use(cookieParser());

// =====================================================
// UPLOAD DIRECTORY DIAGNOSTICS
// =====================================================

console.log("=================================");
console.log("ShopSphere app.js loaded");
console.log("UPLOADS DIRECTORY:", UPLOADS_DIR);
console.log("UPLOADS DIRECTORY EXISTS:", fs.existsSync(UPLOADS_DIR));
console.log(
  "TEST IMAGE EXISTS:",
  fs.existsSync(path.join(UPLOADS_DIR, TEST_IMAGE)),
);
console.log("=================================");

// =====================================================
// STATIC PRODUCT IMAGES / UPLOADS
// =====================================================

// Files in server/uploads are served at /uploads/filename.
// This middleware must be registered before the 404 handler.

app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    dotfiles: "deny",
    index: false,
    fallthrough: true,
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      res.setHeader("Cache-Control", "public, max-age=3600");
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
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShopSphere backend is running",
    server: "Railway",
    uploadsDirectory: UPLOADS_DIR,
    uploadsDirectoryExists: fs.existsSync(UPLOADS_DIR),
    testImageExists: fs.existsSync(path.join(UPLOADS_DIR, TEST_IMAGE)),
    time: new Date().toISOString(),
  });
});

// =====================================================
// TEMPORARY UPLOAD DEBUG ENDPOINT
// =====================================================

// Use this endpoint to check whether the file exists on Railway.
// Remove this endpoint after troubleshooting.

app.get("/api/debug/upload-check", (req, res) => {
  const filename = TEST_IMAGE;
  const filePath = path.join(UPLOADS_DIR, filename);

  res.json({
    uploadsDirectory: UPLOADS_DIR,
    uploadsDirectoryExists: fs.existsSync(UPLOADS_DIR),
    testFilename: filename,
    testImageExists: fs.existsSync(filePath),
    testImageUrl:
      "https://shopsphere-temare.up.railway.app/uploads/" +
      encodeURIComponent(filename),
  });
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
// 404 HANDLER
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
// EXPORT
// =====================================================

module.exports = app;
