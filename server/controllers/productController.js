const fs = require("fs");
const path = require("path");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../models/productModel");

// =====================================================
// IMAGE DELETE HELPER
// =====================================================

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;

  const filename = path.basename(imagePath);

  const fullPath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// =====================================================
// GET UPLOADED IMAGE PATH
// =====================================================

const getUploadedImage = (req, fieldName) => {
  if (req.files?.[fieldName]?.[0]) {
    return `/uploads/${req.files[fieldName][0].filename}`;
  }

  return null;
};

// =====================================================
// CREATE PRODUCT
// =====================================================

exports.create = async (req, res) => {
  try {
    const { category_id, name, description, price, stock } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, price and stock are required",
      });
    }

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const image = getUploadedImage(req, "image");
    const image2 = getUploadedImage(req, "image2");
    const image3 = getUploadedImage(req, "image3");

    const result = await createProduct(
      Number(category_id),
      name,
      description || "",
      Number(price),
      image,
      image2,
      image3,
      Number(stock),
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: result.insertId,
      image,
      image2,
      image3,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// GET ALL
// =====================================================

exports.getAll = async (req, res) => {
  try {
    const products = await getProducts();

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// GET ONE
// =====================================================

exports.getOne = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// UPDATE
// =====================================================

exports.update = async (req, res) => {
  try {
    const { category_id, name, description, price, stock } = req.body;

    const product = await getProductById(req.params.id);

    if (!product) {
      // Delete any newly uploaded images
      for (const field of ["image", "image2", "image3"]) {
        const uploaded = getUploadedImage(req, field);

        if (uploaded) {
          deleteImageFile(uploaded);
        }
      }

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Keep old images when no new image is uploaded
    const newImage = getUploadedImage(req, "image") || product.image;

    const newImage2 = getUploadedImage(req, "image2") || product.image2;

    const newImage3 = getUploadedImage(req, "image3") || product.image3;

    await updateProduct(
      req.params.id,
      Number(category_id),
      name,
      description || "",
      Number(price),
      newImage,
      newImage2,
      newImage3,
      Number(stock),
    );

    // Delete replaced old images only
    if (req.files?.image?.[0] && product.image && product.image !== newImage) {
      deleteImageFile(product.image);
    }

    if (
      req.files?.image2?.[0] &&
      product.image2 &&
      product.image2 !== newImage2
    ) {
      deleteImageFile(product.image2);
    }

    if (
      req.files?.image3?.[0] &&
      product.image3 &&
      product.image3 !== newImage3
    ) {
      deleteImageFile(product.image3);
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      image: newImage,
      image2: newImage2,
      image3: newImage3,
    });
  } catch (error) {
    console.error("Update product error:", error);

    // Remove newly uploaded files if update fails
    for (const field of ["image", "image2", "image3"]) {
      const uploaded = getUploadedImage(req, field);

      if (uploaded) {
        deleteImageFile(uploaded);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// DELETE
// =====================================================

exports.remove = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await deleteProduct(req.params.id);

    // Delete all product images
    deleteImageFile(product.image);
    deleteImageFile(product.image2);
    deleteImageFile(product.image3);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
