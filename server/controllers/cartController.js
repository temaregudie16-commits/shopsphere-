const {
  addToCart,
  getCartByUser,
  updateCart,
  removeFromCart,
} = require("../models/cartModel");

// ================= ADD TO CART =================

exports.add = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    await addToCart(user_id, product_id, quantity);

    res.status(201).json({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET CART =================

exports.getAll = async (req, res) => {
  try {
    const { user_id } = req.params;

    const cart = await getCartByUser(user_id);

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= UPDATE CART =================

exports.update = async (req, res) => {
  try {
    const { quantity } = req.body;

    await updateCart(req.params.id, quantity);

    res.json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= REMOVE CART =================

exports.remove = async (req, res) => {
  try {
    await removeFromCart(req.params.id);

    res.json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
