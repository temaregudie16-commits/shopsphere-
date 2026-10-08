const pool = require("../config/db");

// Add to Cart
exports.addToCart = async (user_id, product_id, quantity) => {
  const [result] = await pool.query(
    `
        INSERT INTO cart
        (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        `,
    [user_id, product_id, quantity],
  );

  return result;
};

// Get User Cart
exports.getCartByUser = async (user_id) => {
  const [rows] = await pool.query(
    `
        SELECT
        cart.id,
        cart.quantity,
        products.name,
        products.price,
        products.image

        FROM cart

        JOIN products
        ON cart.product_id = products.id

        WHERE cart.user_id = ?
        `,
    [user_id],
  );

  return rows;
};

// Update Cart Quantity
exports.updateCart = async (id, quantity) => {
  const [result] = await pool.query(
    `
        UPDATE cart
        SET quantity=?
        WHERE id=?
        `,
    [quantity, id],
  );

  return result;
};

// Remove From Cart
exports.removeFromCart = async (id) => {
  const [result] = await pool.query(
    `
        DELETE FROM cart
        WHERE id=?
        `,
    [id],
  );

  return result;
};
