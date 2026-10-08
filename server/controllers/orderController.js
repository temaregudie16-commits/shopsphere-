const {
  createOrder,
  getOrdersByUser,
  getAllOrders: getAllOrdersModel,
  updateOrderStatus: updateOrderStatusModel,
  getOrderDetails: getOrderDetailsModel,
} = require("../models/orderModel");

/*
|--------------------------------------------------------------------------
| GET CURRENT USER ID
|--------------------------------------------------------------------------
*/

const getCurrentUserId = (req) => {
  return Number(req.user?.id);
};

/*
|--------------------------------------------------------------------------
| CREATE NORMAL ORDER
|--------------------------------------------------------------------------
| Used only for Cash on Delivery
|--------------------------------------------------------------------------
*/

exports.create = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      notes,
      payment_method,
      subtotal,
      discount_amount,
      delivery_fee,
      total_price,
      coupon_code,
      items,
    } = req.body || {};

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    */

    if (user_id !== undefined && Number(user_id) !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot create an order for another user.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Payment Method
    |--------------------------------------------------------------------------
    */

    const method = String(payment_method || "cash").toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Online Payment Protection
    |--------------------------------------------------------------------------
    */

    if (method !== "cash") {
      return res.status(400).json({
        success: false,
        message:
          "Online payment orders must be completed through Chapa checkout.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Items
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Cash Order
    |--------------------------------------------------------------------------
    */

    const result = await createOrder({
      user_id: currentUserId,

      first_name: first_name || "",
      last_name: last_name || "",
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "Ethiopia",
      notes: notes || "",

      payment_method: "cash",

      subtotal: Number(subtotal || 0),

      discount_amount: Number(discount_amount || 0),

      delivery_fee: Number(delivery_fee || 0),

      total_price: Number(total_price || 0),

      coupon_code: coupon_code || null,

      items,

      payment_reference: null,

      initial_status: "pending",
    });

    console.log("✅ CASH ORDER CREATED:", result);

    return res.status(result.alreadyExists ? 200 : 201).json({
      success: true,

      message: result.alreadyExists
        ? "Order already exists."
        : "Order created successfully.",

      order_id: result.orderId,

      orderId: result.orderId,

      alreadyExists: !!result.alreadyExists,

      data: result,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ CREATE ORDER ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PAID ORDER
|--------------------------------------------------------------------------
| IMPORTANT:
| This function is called ONLY after Chapa payment
| has already been verified successfully.
|--------------------------------------------------------------------------
*/

exports.createPaidOrder = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    console.log("========================================");
    console.log("💰 CREATE PAID ORDER");
    console.log("========================================");

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      notes,
      payment_method,
      subtotal,
      discount_amount,
      delivery_fee,
      total_price,
      coupon_code,
      items,
      payment_reference,
    } = req.body || {};

    /*
    |--------------------------------------------------------------------------
    | Security Check
    |--------------------------------------------------------------------------
    */

    if (user_id !== undefined && Number(user_id) !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot create an order for another user.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Payment Reference Required
    |--------------------------------------------------------------------------
    */

    if (!payment_reference || !String(payment_reference).trim()) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Items Required
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Paid Order
    |--------------------------------------------------------------------------
    */

    console.log("📦 Creating paid order with:", {
      user_id: currentUserId,
      payment_method: payment_method || "chapa",
      total_price: Number(total_price || 0),
      payment_reference: String(payment_reference).trim(),
      itemsCount: items.length,
    });

    const result = await createOrder({
      user_id: currentUserId,

      first_name: first_name || "",
      last_name: last_name || "",
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "Ethiopia",
      notes: notes || "",

      payment_method: payment_method || "chapa",

      subtotal: Number(subtotal || 0),

      discount_amount: Number(discount_amount || 0),

      delivery_fee: Number(delivery_fee || 0),

      total_price: Number(total_price || 0),

      coupon_code: coupon_code || null,

      items,

      payment_reference: String(payment_reference).trim(),

      initial_status: "paid",
    });

    console.log("✅ PAID ORDER CREATED:", result);

    /*
    |--------------------------------------------------------------------------
    | Create Notification
    |--------------------------------------------------------------------------
    */

    if (!result.alreadyExists) {
      try {
        const notificationModel = require("../models/notificationModel");

        /*
        | Some projects may use createNotification
        */

        if (typeof notificationModel.createNotification === "function") {
          await notificationModel.createNotification(
            currentUserId,
            "✅ Payment Confirmed",
            `Your ShopSphere payment was confirmed successfully. Order #${result.orderId} has been created.`,
            "order",
          );

          console.log("✅ Payment confirmation notification created.");
        }
      } catch (notificationError) {
        /*
        | Notification failure should not destroy the order
        */

        console.error(
          "⚠️ PAYMENT NOTIFICATION ERROR:",
          notificationError.message,
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(result.alreadyExists ? 200 : 201).json({
      success: true,

      message: result.alreadyExists
        ? "Paid order already exists."
        : "Paid order created successfully.",

      order_id: result.orderId,

      orderId: result.orderId,

      alreadyExists: !!result.alreadyExists,

      status: "paid",

      data: result,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ CREATE PAID ORDER ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to create paid order.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/

exports.getAll = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const orders = await getOrdersByUser(currentUserId);

    return res.status(200).json({
      success: true,

      orders: orders || [],
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ GET MY ORDERS ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your orders.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
*/

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersModel();

    return res.status(200).json({
      success: true,

      orders: orders || [],
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ GET ALL ORDERS ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load all orders.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

exports.updateStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const { status } = req.body || {};

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required.",
      });
    }

    const result = await updateOrderStatusModel(orderId, status);

    return res.status(200).json({
      success: true,

      message: "Order status updated successfully.",

      data: result,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ UPDATE ORDER STATUS ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to update order status.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ORDER DETAILS
|--------------------------------------------------------------------------
*/

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await getOrderDetailsModel(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,

        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ GET ORDER DETAILS ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,

      message: "Failed to load order details.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY ORDER DETAILS
|--------------------------------------------------------------------------
*/

exports.getMyOrderDetails = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    const orderId = Number(req.params.id);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await getOrderDetailsModel(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,

        message: "Order not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | User can only see their own order
    |--------------------------------------------------------------------------
    */

    if (Number(order.user_id) !== currentUserId) {
      return res.status(403).json({
        success: false,

        message: "You cannot view this order.",
      });
    }

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ GET MY ORDER DETAILS ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(500).json({
      success: false,

      message: "Failed to load order details.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DEBUG EXPORTS
|--------------------------------------------------------------------------
*/

console.log("=================================");
console.log("ORDER CONTROLLER");
console.log("create:", typeof exports.create);
console.log("createPaidOrder:", typeof exports.createPaidOrder);
console.log("getAll:", typeof exports.getAll);
console.log("getAllOrders:", typeof exports.getAllOrders);
console.log("updateStatus:", typeof exports.updateStatus);
console.log("getOrderDetails:", typeof exports.getOrderDetails);
console.log("getMyOrderDetails:", typeof exports.getMyOrderDetails);
console.log("=================================");
