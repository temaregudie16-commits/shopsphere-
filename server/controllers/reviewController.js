const {
  createReview,
  getProductReviews,
  getProductRating,
  getAllReviews,
  deleteReview,
  getUserProductReview,
} = require("../models/reviewModel");

// =====================================================
// CREATE REVIEW
// =====================================================

exports.create = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const userId = Number(req.user?.id);

    const { rating, review } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    if (!review?.trim() || review.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please write a review.",
      });
    }

    const existing = await getUserProductReview(productId, userId);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    await createReview(productId, userId, numericRating, review.trim());

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
    });
  }
};

// =====================================================
// GET PRODUCT REVIEWS
// =====================================================

exports.getProductReviews = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const reviews = await getProductReviews(productId);

    const rating = await getProductRating(productId);

    return res.json({
      success: true,
      reviews,
      rating,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load reviews.",
    });
  }
};

// =====================================================
// GET ALL REVIEWS - ADMIN
// =====================================================

exports.getAll = async (req, res) => {
  try {
    const reviews = await getAllReviews();

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET ALL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load reviews.",
    });
  }
};

// =====================================================
// DELETE REVIEW - ADMIN
// =====================================================

exports.remove = async (req, res) => {
  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const result = await deleteReview(reviewId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
    });
  }
};
