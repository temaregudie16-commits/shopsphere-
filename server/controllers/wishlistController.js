const {
  addToWishlist,
  removeFromWishlist,
  getWishlistByUser,
  isInWishlist,
  clearWishlist,
} = require("../models/wishlistModel");

// =====================================================
// GET MY WISHLIST
// =====================================================

exports.getAll = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const wishlist = await getWishlistByUser(userId);

    return res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load wishlist.",
    });
  }
};

// =====================================================
// ADD
// =====================================================

exports.add = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.params.productId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const alreadyExists = await isInWishlist(userId, productId);

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist.",
      });
    }

    await addToWishlist(userId, productId);

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist ❤️",
    });
  } catch (error) {
    console.error("ADD WISHLIST ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist.",
    });
  }
};

// =====================================================
// REMOVE
// =====================================================

exports.remove = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.params.productId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const result = await removeFromWishlist(userId, productId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product was not found in your wishlist.",
      });
    }

    return res.json({
      success: true,
      message: "Product removed from wishlist.",
    });
  } catch (error) {
    console.error("REMOVE WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove wishlist item.",
    });
  }
};

// =====================================================
// CHECK
// =====================================================

exports.check = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.params.productId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const exists = await isInWishlist(userId, productId);

    return res.json({
      success: true,
      inWishlist: exists,
    });
  } catch (error) {
    console.error("CHECK WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist.",
    });
  }
};

// =====================================================
// CLEAR
// =====================================================

exports.clear = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    await clearWishlist(userId);

    return res.json({
      success: true,
      message: "Wishlist cleared successfully.",
    });
  } catch (error) {
    console.error("CLEAR WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear wishlist.",
    });
  }
};
