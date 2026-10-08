const pool = require("../config/db");

// =====================================================
// GET ALL COUPONS
// =====================================================

exports.getAllCoupons = async () => {
  const [rows] = await pool.query(`
    SELECT
      id,
      code,
      discount_type,
      discount_value,
      minimum_order,
      usage_limit,
      used_count,
      expires_at,
      is_active,
      created_at
    FROM coupons
    ORDER BY id DESC
  `);

  return rows;
};

// =====================================================
// GET COUPON BY CODE
// =====================================================

exports.getCouponByCode = async (code) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      code,
      discount_type,
      discount_value,
      minimum_order,
      usage_limit,
      used_count,
      expires_at,
      is_active,
      created_at
    FROM coupons
    WHERE UPPER(code) = UPPER(?)
    LIMIT 1
    `,
    [code],
  );

  return rows[0] || null;
};

// =====================================================
// CREATE COUPON
// =====================================================

exports.createCoupon = async (coupon) => {
  const [result] = await pool.query(
    `
    INSERT INTO coupons
    (
      code,
      discount_type,
      discount_value,
      minimum_order,
      usage_limit,
      expires_at,
      is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      coupon.code,
      coupon.discount_type,
      coupon.discount_value,
      coupon.minimum_order,
      coupon.usage_limit,
      coupon.expires_at,
      coupon.is_active,
    ],
  );

  return result;
};

// =====================================================
// UPDATE COUPON
// =====================================================

exports.updateCoupon = async (id, coupon) => {
  const [result] = await pool.query(
    `
    UPDATE coupons
    SET
      code = ?,
      discount_type = ?,
      discount_value = ?,
      minimum_order = ?,
      usage_limit = ?,
      expires_at = ?,
      is_active = ?
    WHERE id = ?
    `,
    [
      coupon.code,
      coupon.discount_type,
      coupon.discount_value,
      coupon.minimum_order,
      coupon.usage_limit,
      coupon.expires_at,
      coupon.is_active,
      id,
    ],
  );

  return result;
};

// =====================================================
// DELETE COUPON
// =====================================================

exports.deleteCoupon = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM coupons
    WHERE id = ?
    `,
    [id],
  );

  return result;
};

// =====================================================
// INCREMENT USAGE
// =====================================================

exports.incrementCouponUsage = async (couponId) => {
  const [result] = await pool.query(
    `
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE id = ?
      AND is_active = 1
      AND (
        usage_limit IS NULL
        OR used_count < usage_limit
      )
    `,
    [couponId],
  );

  return result;
};
