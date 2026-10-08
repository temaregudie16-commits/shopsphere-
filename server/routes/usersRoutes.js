const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getCustomers,
  getAdmins,
  createAdmin,
  deleteAdmin,
  changeUserRole,
  updateProfile,
  changePassword,
  updateProfileImage,
  deleteProfileImage,
} = require("../controllers/usersController");

// =====================================================
// PROFILE UPLOAD DIRECTORY
// =====================================================

const profileUploadDir = path.join(__dirname, "..", "uploads", "profile");

fs.mkdirSync(profileUploadDir, {
  recursive: true,
});

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const userId = Number(req.user?.id);

    cb(null, `profile-${userId}-${Date.now()}${extension}`);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, JPEG, PNG and WEBP images are allowed."),
      false,
    );
  }

  cb(null, true);
};

// =====================================================
// MULTER CONFIG
// =====================================================

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// ADMIN ROUTES
// =====================================================

router.get("/admin/customers", protect, admin, getCustomers);

router.get("/admin/admins", protect, admin, getAdmins);

router.post("/admin/admins", protect, admin, createAdmin);

router.delete("/admin/admins/:id", protect, admin, deleteAdmin);

router.put("/admin/users/:id/role", protect, admin, changeUserRole);

// =====================================================
// PROFILE
// =====================================================

router.put("/profile", protect, updateProfile);

router.put("/profile/password", protect, changePassword);

// =====================================================
// PROFILE PHOTO
// =====================================================

router.put(
  "/profile/photo",
  protect,
  uploadProfileImage.single("profile_image"),
  updateProfileImage,
);

router.delete("/profile/photo", protect, deleteProfileImage);

module.exports = router;
