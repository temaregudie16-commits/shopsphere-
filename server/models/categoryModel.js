const pool = require("../config/db");

// Get all categories
exports.getCategories = async () => {
  const [rows] = await pool.query(`
    SELECT *
    FROM categories
    ORDER BY id DESC
  `);

  return rows;
};

// Get category by ID
exports.getCategoryById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
    id,
  ]);

  return rows[0];
};

// Create category
exports.createCategory = async (name) => {
  const [result] = await pool.query(
    "INSERT INTO categories (name) VALUES (?)",
    [name],
  );

  return result;
};
