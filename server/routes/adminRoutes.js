const express = require("express");

const router = express.Router();

const { getStats, getOverview } = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

// =====================================================
// ADMIN DASHBOARD STATISTICS
// GET /api/admin/stats
// =====================================================

router.get("/stats", protect, admin, getStats);

// =====================================================
// ADMIN DASHBOARD OVERVIEW
// GET /api/admin/overview
// =====================================================

router.get("/overview", protect, admin, getOverview);

module.exports = router;
