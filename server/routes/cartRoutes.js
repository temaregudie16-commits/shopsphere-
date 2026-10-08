const express = require("express");

const router = express.Router();

const {
  add,
  getAll,
  update,
  remove,
} = require("../controllers/cartController");

// Add product to cart
router.post("/", add);

// Get user cart
router.get("/:user_id", getAll);

// Update cart quantity
router.put("/:id", update);

// Remove cart item
router.delete("/:id", remove);

module.exports = router;
