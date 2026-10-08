const pool = require("../config/db");

// =====================================================
// CREATE ORDER + ITEMS + STOCK UPDATE
// PAYMENT-SAFE VERSION
// =====================================================

exports.createOrder = async ({
  user_id,
  first_name,
  last_name,
  email,
  phone,
  address,
  city,
  country = "Ethiopia",
  notes = "",
  payment_method = "cash",
  total_price,
  discount_amount = 0,
  delivery_fee = 0,
  payment_reference = null,
  initial_status = "pending",
  items,
}) => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    // =================================================
    // IDEMPOTENCY CHECK
    // Don't create the same paid order twice.
    // =================================================

    if (payment_reference) {
      const [existingOrders] = await connection.query(
        `
          SELECT
            id,
            user_id,
            total_price,
            status,
            payment_reference
          FROM orders
          WHERE payment_reference = ?
          LIMIT 1
          `,
        [payment_reference],
      );

      if (existingOrders.length > 0) {
        await connection.rollback();

        return {
          orderId: existingOrders[0].id,
          totalPrice: Number(existingOrders[0].total_price),
          status: existingOrders[0].status,
          alreadyExists: true,
        };
      }
    }

    // =================================================
    // SERVER-SIDE TOTAL
    // =================================================

    let calculatedSubtotal = 0;

    const validatedItems = [];

    for (const item of items) {
      const productId = Number(item.product_id);

      const requestedQuantity = Number(item.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Invalid product ID in order.");
      }

      if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
        throw new Error("Invalid product quantity.");
      }

      // -----------------------------------------------
      // LOCK PRODUCT
      // -----------------------------------------------

      const [products] = await connection.query(
        `
          SELECT
            id,
            name,
            price,
            stock
          FROM products
          WHERE id = ?
          FOR UPDATE
          `,
        [productId],
      );

      if (!products || products.length === 0) {
        throw new Error(`Product ${productId} was not found.`);
      }

      const product = products[0];

      const productPrice = Number(product.price || 0);

      const availableStock = Number(product.stock || 0);

      // -----------------------------------------------
      // STOCK CHECK
      // -----------------------------------------------

      if (requestedQuantity > availableStock) {
        throw new Error(
          `${product.name} has only ${availableStock} item(s) available.`,
        );
      }

      // -----------------------------------------------
      // CALCULATE SUBTOTAL
      // -----------------------------------------------

      const itemSubtotal = productPrice * requestedQuantity;

      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        product_id: product.id,

        quantity: requestedQuantity,

        price: productPrice,
      });
    }

    calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));

    // =================================================
    // DISCOUNT
    // =================================================

    const safeDiscount = Math.min(
      Math.max(Number(discount_amount || 0), 0),
      calculatedSubtotal,
    );

    // =================================================
    // DELIVERY
    // =================================================

    const safeDeliveryFee = Math.max(Number(delivery_fee || 0), 0);

    // =================================================
    // FINAL TOTAL
    // =================================================

    const calculatedFinalTotal = Number(
      Math.max(calculatedSubtotal - safeDiscount + safeDeliveryFee, 0).toFixed(
        2,
      ),
    );

    // =================================================
    // FRONTEND TOTAL CHECK
    // =================================================

    if (total_price !== undefined && total_price !== null) {
      const frontendTotal = Number(Number(total_price).toFixed(2));

      if (Math.abs(frontendTotal - calculatedFinalTotal) > 0.01) {
        throw new Error("Order total does not match server calculation.");
      }
    }

    // =================================================
    // CREATE ORDER
    // =================================================

    const [orderResult] = await connection.query(
      `
        INSERT INTO orders
        (
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
          total_price,
          status,
          payment_reference
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
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
        calculatedFinalTotal,

        // -------------------------------------------
        // STATUS
        // -------------------------------------------

        initial_status,

        // -------------------------------------------
        // PAYMENT REFERENCE
        // -------------------------------------------

        payment_reference,
      ],
    );

    const orderId = orderResult.insertId;

    // =================================================
    // ORDER ITEMS + STOCK
    // =================================================

    for (const item of validatedItems) {
      // -----------------------------------------------
      // INSERT ITEM
      // -----------------------------------------------

      await connection.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.quantity, item.price],
      );

      // -----------------------------------------------
      // DECREASE STOCK
      // -----------------------------------------------

      const [stockResult] = await connection.query(
        `
          UPDATE products
          SET stock = stock - ?
          WHERE id = ?
            AND stock >= ?
          `,
        [item.quantity, item.product_id, item.quantity],
      );

      if (stockResult.affectedRows === 0) {
        throw new Error("Product stock changed while processing your order.");
      }
    }

    // =================================================
    // COMMIT
    // =================================================

    await connection.commit();

    return {
      orderId,
      subtotal: calculatedSubtotal,

      discountAmount: safeDiscount,

      deliveryFee: safeDeliveryFee,

      totalPrice: calculatedFinalTotal,

      status: initial_status,

      paymentReference: payment_reference,

      alreadyExists: false,
    };
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// =====================================================
// GET USER ORDERS
// =====================================================

exports.getOrdersByUser = async (user_id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
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
        total_price,
        status,
        payment_reference,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
      `,
    [user_id],
  );

  return rows;
};

// =====================================================
// ADMIN: GET ALL ORDERS
// =====================================================

exports.getAllOrders = async () => {
  const [rows] = await pool.query(
    `
        SELECT
          orders.id,
          orders.user_id,

          orders.first_name,
          orders.last_name,
          orders.email,
          orders.phone,
          orders.address,
          orders.city,
          orders.country,
          orders.notes,
          orders.payment_method,

          users.name AS user_name,

          orders.total_price,
          orders.status,
          orders.payment_reference,
          orders.created_at

        FROM orders

        LEFT JOIN users
          ON orders.user_id = users.id

        ORDER BY orders.id DESC
        `,
  );

  return rows;
};

// =====================================================
// ADMIN: UPDATE ORDER STATUS
// =====================================================

exports.updateOrderStatus = async (order_id, status) => {
  const [result] = await pool.query(
    `
        UPDATE orders
        SET status = ?
        WHERE id = ?
        `,
    [status, order_id],
  );

  return result;
};

// =====================================================
// GET ORDER BY ID
// =====================================================

exports.getOrderById = async (order_id) => {
  const [rows] = await pool.query(
    `
        SELECT
          id,
          user_id,
          email,
          first_name,
          last_name,
          phone,
          address,
          city,
          country,
          notes,
          payment_method,
          total_price,
          status,
          payment_reference,
          created_at
        FROM orders
        WHERE id = ?
        LIMIT 1
        `,
    [order_id],
  );

  return rows[0] || null;
};

// =====================================================
// PAYMENT: GET ORDER BY PAYMENT REFERENCE
// =====================================================

exports.getOrderByPaymentReference = async (payment_reference) => {
  const [rows] = await pool.query(
    `
        SELECT
          id,
          user_id,
          email,
          first_name,
          last_name,
          total_price,
          status,
          payment_reference
        FROM orders
        WHERE payment_reference = ?
        LIMIT 1
        `,
    [payment_reference],
  );

  return rows[0] || null;
};

// =====================================================
// PAYMENT: MARK ORDER PAID
// =====================================================

exports.markOrderPaid = async (order_id) => {
  const [result] = await pool.query(
    `
        UPDATE orders
        SET status = 'paid'
        WHERE id = ?
          AND status <> 'paid'
        `,
    [order_id],
  );

  return result;
};

// =====================================================
// ADMIN: ORDER DETAILS
// =====================================================

exports.getOrderDetails = async (order_id) => {
  const [rows] = await pool.query(
    `
        SELECT
          orders.id AS order_id,
          orders.user_id,

          users.name AS user_name,

          orders.first_name,
          orders.last_name,
          orders.email,
          orders.phone,
          orders.address,
          orders.city,
          orders.country,
          orders.notes,
          orders.payment_method,

          orders.total_price AS order_total,
          orders.status,
          orders.payment_reference,
          orders.created_at,

          order_items.product_id,
          order_items.quantity,
          order_items.price AS item_price,

          products.name AS product_name,
          products.image AS product_image

        FROM orders

        LEFT JOIN users
          ON orders.user_id = users.id

        LEFT JOIN order_items
          ON orders.id = order_items.order_id

        LEFT JOIN products
          ON order_items.product_id = products.id

        WHERE orders.id = ?

        ORDER BY order_items.id ASC
        `,
    [order_id],
  );

  return rows;
};

// =====================================================
// USER: MY ORDER DETAILS
// =====================================================

exports.getMyOrderDetails = async (order_id, user_id) => {
  const [rows] = await pool.query(
    `
        SELECT
          orders.id AS order_id,
          orders.user_id,

          users.name AS user_name,

          orders.first_name,
          orders.last_name,
          orders.email,
          orders.phone,
          orders.address,
          orders.city,
          orders.country,
          orders.notes,
          orders.payment_method,

          orders.total_price AS order_total,
          orders.status,
          orders.payment_reference,
          orders.created_at,

          order_items.product_id,
          order_items.quantity,
          order_items.price AS item_price,

          products.name AS product_name,
          products.image AS product_image

        FROM orders

        LEFT JOIN users
          ON orders.user_id = users.id

        LEFT JOIN order_items
          ON orders.id = order_items.order_id

        LEFT JOIN products
          ON order_items.product_id = products.id

        WHERE orders.id = ?
          AND orders.user_id = ?

        ORDER BY order_items.id ASC
        `,
    [order_id, user_id],
  );

  return rows;
};
