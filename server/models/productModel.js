const pool = require("../config/db");

// =====================================================
// CREATE PRODUCT
// =====================================================

exports.createProduct = async (
  category_id,
  name,
  description,
  price,
  image,
  image2,
  image3,
  stock,
) => {
  const [result] = await pool.query(
    `
      INSERT INTO products
      (
        category_id,
        name,
        description,
        price,
        image,
        image2,
        image3,
        stock
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [category_id, name, description, price, image, image2, image3, stock],
  );

  return result;
};

// =====================================================
// GET ALL PRODUCTS
// =====================================================

exports.getProducts = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        products.*,
        categories.name AS category_name
      FROM products
      LEFT JOIN categories
        ON products.category_id = categories.id
      ORDER BY products.id DESC
    `,
  );

  return rows;
};

// =====================================================
// GET ONE PRODUCT
// =====================================================

exports.getProductById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        products.*,
        categories.name AS category_name
      FROM products
      LEFT JOIN categories
        ON products.category_id = categories.id
      WHERE products.id = ?
    `,
    [id],
  );

  return rows[0];
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

exports.updateProduct = async (
  id,
  category_id,
  name,
  description,
  price,
  image,
  image2,
  image3,
  stock,
) => {
  const [result] = await pool.query(
    `
      UPDATE products
      SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image = ?,
        image2 = ?,
        image3 = ?,
        stock = ?
      WHERE id = ?
    `,
    [category_id, name, description, price, image, image2, image3, stock, id],
  );

  return result;
};

// =====================================================
// DELETE PRODUCT
// =====================================================

exports.deleteProduct = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM products
      WHERE id = ?
    `,
    [id],
  );

  return result;
};
