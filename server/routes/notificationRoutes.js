const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

const {
  // CUSTOMER
  getAll,
  unreadCount,
  readOne,
  readAll,
  remove,

  // ADMIN
  adminGetAll,
  adminGetOne,
  adminSendToUser,
  adminSendToAll,
  adminRemove,
} = require("../controllers/notificationController");

// =====================================================
// CUSTOMER
// =====================================================

// Get my notifications
router.get("/", protect, getAll);

// Unread count
router.get("/unread-count", protect, unreadCount);

// Mark all as read
router.put("/read-all", protect, readAll);

// Mark one as read
router.put("/:id/read", protect, readOne);

// Delete my notification
router.delete("/:id", protect, remove);

// =====================================================
// ADMIN
// =====================================================

// Get all notifications
router.get("/admin/all", protect, admin, adminGetAll);

// Get one notification
router.get("/admin/:id", protect, admin, adminGetOne);

// Send to one user
router.post("/admin/send", protect, admin, adminSendToUser);

// Send to all users
router.post("/admin/send-all", protect, admin, adminSendToAll);

// Admin delete
router.delete("/admin/:id", protect, admin, adminRemove);

module.exports = router;
