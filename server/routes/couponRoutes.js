const express = require("express");

const router = express.Router();

const {
  getAll,
  validate,
  create,
  update,
  remove,
} = require("../controllers/couponController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Admin
router.get("/admin/all", protect, admin, getAll);

router.post("/admin", protect, admin, create);

router.put("/admin/:id", protect, admin, update);

router.delete("/admin/:id", protect, admin, remove);

// Customer checkout
router.post("/validate", protect, validate);

module.exports = router;
