const express = require("express");

const router = express.Router();

const { getAll, getOne, create } = require("../controllers/categoryController");

// Get all categories
router.get("/", getAll);

// Get one category
router.get("/:id", getOne);

// Create category
router.post("/", create);

module.exports = router;
