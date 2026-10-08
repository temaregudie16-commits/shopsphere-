const pool = require("../config/db");

// =====================================================
// ADD TO WISHLIST
// =====================================================

exports.addToWishlist = async (userId, productId) => {
  const [result] = await pool.query(
    `
    INSERT INTO wishlist
    (
      user_id,
      product_id
    )
    VALUES (?, ?)
    `,
    [userId, productId],
  );

  return result;
};

// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

exports.removeFromWishlist = async (userId, productId) => {
  const [result] = await pool.query(
    `
    DELETE FROM wishlist
    WHERE user_id = ?
      AND product_id = ?
    `,
    [userId, productId],
  );

  return result;
};

// =====================================================
// GET USER WISHLIST
// =====================================================

exports.getWishlistByUser = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      wishlist.id,
      wishlist.user_id,
      wishlist.product_id,
      wishlist.created_at,

      products.name,
      products.description,
      products.price,
      products.stock,
      products.image,

      categories.name AS category_name

    FROM wishlist

    INNER JOIN products
      ON wishlist.product_id = products.id

    LEFT JOIN categories
      ON products.category_id = categories.id

    WHERE wishlist.user_id = ?

    ORDER BY wishlist.created_at DESC
    `,
    [userId],
  );

  return rows;
};

// =====================================================
// CHECK WISHLIST
// =====================================================

exports.isInWishlist = async (userId, productId) => {
  const [rows] = await pool.query(
    `
    SELECT id
    FROM wishlist
    WHERE user_id = ?
      AND product_id = ?
    LIMIT 1
    `,
    [userId, productId],
  );

  return rows.length > 0;
};

// =====================================================
// CLEAR WISHLIST
// =====================================================

exports.clearWishlist = async (userId) => {
  const [result] = await pool.query(
    `
    DELETE FROM wishlist
    WHERE user_id = ?
    `,
    [userId],
  );

  return result;
};
