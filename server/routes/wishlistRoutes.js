const express = require("express");

const router = express.Router();

const {
  getAll,
  add,
  remove,
  check,
  clear,
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");

// =====================================================
// GET MY WISHLIST
// =====================================================

router.get("/", protect, getAll);

// =====================================================
// CHECK PRODUCT
// =====================================================

router.get("/check/:productId", protect, check);

// =====================================================
// ADD PRODUCT
// =====================================================

router.post("/:productId", protect, add);

// =====================================================
// REMOVE PRODUCT
// =====================================================

router.delete("/:productId", protect, remove);

// =====================================================
// CLEAR
// =====================================================

router.delete("/clear/all", protect, clear);

module.exports = router;
