const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");

const upload = require("../middleware/upload");

const protect = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

// ===============================
// PUBLIC
// ===============================

router.get("/", productController.getAll);

router.get("/:id", productController.getOne);

// ===============================
// ADMIN - CREATE
// ===============================

router.post(
  "/",
  protect,
  admin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  productController.create,
);

// ===============================
// ADMIN - UPDATE
// ===============================

router.put(
  "/:id",
  protect,
  admin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  productController.update,
);

// ===============================
// ADMIN - DELETE
// ===============================

router.delete("/:id", protect, admin, productController.remove);

module.exports = router;
