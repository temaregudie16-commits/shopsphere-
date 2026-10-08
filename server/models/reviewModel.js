const pool = require("../config/db");

// =====================================================
// CREATE REVIEW
// =====================================================

exports.createReview = async (productId, userId, rating, review) => {
  const [result] = await pool.query(
    `
    INSERT INTO reviews
    (
      product_id,
      user_id,
      rating,
      review
    )
    VALUES (?, ?, ?, ?)
    `,
    [productId, userId, rating, review],
  );

  return result;
};

// =====================================================
// GET PRODUCT REVIEWS
// =====================================================

exports.getProductReviews = async (productId) => {
  const [rows] = await pool.query(
    `
    SELECT
      reviews.id,
      reviews.product_id,
      reviews.user_id,
      users.name AS user_name,
      reviews.rating,
      reviews.review,
      reviews.created_at
    FROM reviews
    LEFT JOIN users
      ON reviews.user_id = users.id
    WHERE reviews.product_id = ?
    ORDER BY reviews.created_at DESC
    `,
    [productId],
  );

  return rows;
};

// =====================================================
// GET PRODUCT RATING
// =====================================================

exports.getProductRating = async (productId) => {
  const [rows] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_reviews,
      COALESCE(
        ROUND(AVG(rating), 1),
        0
      ) AS average_rating
    FROM reviews
    WHERE product_id = ?
    `,
    [productId],
  );

  return rows[0];
};

// =====================================================
// GET ALL REVIEWS - ADMIN
// =====================================================

exports.getAllReviews = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      reviews.id,
      reviews.product_id,
      products.name AS product_name,
      reviews.user_id,
      users.name AS user_name,
      users.email,
      reviews.rating,
      reviews.review,
      reviews.created_at
    FROM reviews
    LEFT JOIN products
      ON reviews.product_id = products.id
    LEFT JOIN users
      ON reviews.user_id = users.id
    ORDER BY reviews.created_at DESC
    `,
  );

  return rows;
};

// =====================================================
// DELETE REVIEW - ADMIN
// =====================================================

exports.deleteReview = async (reviewId) => {
  const [result] = await pool.query(
    `
    DELETE FROM reviews
    WHERE id = ?
    `,
    [reviewId],
  );

  return result;
};

// =====================================================
// CHECK EXISTING REVIEW
// =====================================================

exports.getUserProductReview = async (productId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM reviews
    WHERE product_id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [productId, userId],
  );

  return rows[0] || null;
};
