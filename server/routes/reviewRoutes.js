const express = require("express");

const router = express.Router();

const {
  create,
  getProductReviews,
  getAll,
  remove,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

// =====================================================
// CUSTOMER
// =====================================================

// Get reviews for product
router.get("/product/:productId", getProductReviews);

// Create review
router.post("/product/:productId", protect, create);

// =====================================================
// ADMIN
// =====================================================

// Get all reviews
router.get("/admin/all", protect, admin, getAll);

// Delete review
router.delete("/admin/:id", protect, admin, remove);

module.exports = router;
