const {
  getAllCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage,
} = require("../models/couponModel");

// =====================================================
// GET ALL COUPONS
// =====================================================

exports.getAll = async (req, res) => {
  try {
    const coupons = await getAllCoupons();

    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load coupons.",
    });
  }
};

// =====================================================
// VALIDATE COUPON
// =====================================================

exports.validate = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const total = Number(cartTotal || 0);

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    if (total < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart total.",
      });
    }

    const coupon = await getCouponByCode(code.trim());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    if (!coupon.is_active) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive.",
      });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    if (
      coupon.usage_limit !== null &&
      Number(coupon.used_count) >= Number(coupon.usage_limit)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its usage limit.",
      });
    }

    const minimumOrder = Number(coupon.minimum_order || 0);

    if (total < minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${minimumOrder}.`,
      });
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = total * (Number(coupon.discount_value) / 100);
    } else {
      discount = Number(coupon.discount_value || 0);
    }

    discount = Math.min(discount, total);

    const finalTotal = total - discount;

    res.json({
      success: true,
      message: "Coupon applied successfully.",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        minimum_order: minimumOrder,
      },
      discount: Number(discount.toFixed(2)),
      final_total: Number(finalTotal.toFixed(2)),
    });
  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to validate coupon.",
    });
  }
};

// =====================================================
// CREATE
// =====================================================

exports.create = async (req, res) => {
  try {
    let {
      code,
      discount_type,
      discount_value,
      minimum_order,
      usage_limit,
      expires_at,
      is_active,
    } = req.body;

    code = code?.trim().toUpperCase();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type.",
      });
    }

    const discountValue = Number(discount_value);

    const minimumOrder = Number(minimum_order || 0);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0.",
      });
    }

    if (discount_type === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage cannot exceed 100.",
      });
    }

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid minimum order.",
      });
    }

    const result = await createCoupon({
      code,
      discount_type,
      discount_value: discountValue,
      minimum_order: minimumOrder,
      usage_limit:
        usage_limit === "" || usage_limit === null || usage_limit === undefined
          ? null
          : Number(usage_limit),
      expires_at: expires_at || null,
      is_active: Number(is_active ?? 1) ? 1 : 0,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon_id: result.insertId,
    });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create coupon.",
    });
  }
};

// =====================================================
// UPDATE
// =====================================================

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    let {
      code,
      discount_type,
      discount_value,
      minimum_order,
      usage_limit,
      expires_at,
      is_active,
    } = req.body;

    code = code?.trim().toUpperCase();

    const discountValue = Number(discount_value);

    const minimumOrder = Number(minimum_order || 0);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type.",
      });
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount value.",
      });
    }

    if (discount_type === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage cannot exceed 100.",
      });
    }

    const result = await updateCoupon(id, {
      code,
      discount_type,
      discount_value: discountValue,
      minimum_order: minimumOrder,
      usage_limit:
        usage_limit === "" || usage_limit === null || usage_limit === undefined
          ? null
          : Number(usage_limit),
      expires_at: expires_at || null,
      is_active: Number(is_active ?? 1) ? 1 : 0,
    });

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.json({
      success: true,
      message: "Coupon updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE COUPON ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update coupon.",
    });
  }
};

// =====================================================
// DELETE
// =====================================================

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const result = await deleteCoupon(id);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
    });
  }
};
