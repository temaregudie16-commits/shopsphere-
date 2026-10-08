const express = require("express");

const router = express.Router();

const {
  initializePayment,
  verifyPayment,
  chapaCallback,
  chapaWebhook,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

// =====================================================
// INITIALIZE
// =====================================================

router.post("/chapa/initialize", protect, initializePayment);

// =====================================================
// VERIFY
// =====================================================

router.get("/chapa/verify/:tx_ref", protect, verifyPayment);

// =====================================================
// CALLBACK
// =====================================================

router.get("/chapa/callback", chapaCallback);

// =====================================================
// WEBHOOK
// =====================================================

router.post("/chapa/webhook", chapaWebhook);

module.exports = router;
