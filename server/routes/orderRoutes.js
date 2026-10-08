const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  create,
  createPaidOrder,
  getAll,
  getAllOrders,
  updateStatus,
  getOrderDetails,
  getMyOrderDetails,
} = require("../controllers/orderController");

/*
|--------------------------------------------------------------------------
| CUSTOMER ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Cash on Delivery
 */
router.post("/", protect, create);

/*
 * Chapa verified payment
 */
router.post("/paid", protect, createPaidOrder);

/*
 * Current user's orders
 */
router.get("/my", protect, getAll);

/*
 * Current user's order details
 */
router.get("/my/:id", protect, getMyOrderDetails);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Get all orders
 */
router.get("/", protect, getAllOrders);

/*
 * Get order details
 */
router.get("/:id", protect, getOrderDetails);

/*
 * Update order status
 */
router.put("/:id/status", protect, updateStatus);

module.exports = router;
