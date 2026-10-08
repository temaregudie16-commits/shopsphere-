const pool = require("./config/db");

async function test() {
  try {
    console.log("DB CONFIG:");
    console.log("HOST:", process.env.DB_HOST);
    console.log("PORT:", process.env.DB_PORT);
    console.log("DATABASE:", process.env.DB_NAME);

    const [rows] = await pool.query(`
      SELECT
        products.*,
        categories.name AS category_name
      FROM products
      LEFT JOIN categories
        ON products.category_id = categories.id
      ORDER BY products.id DESC
    `);

    console.log("✅ PRODUCT QUERY SUCCESS");
    console.log("PRODUCT COUNT:", rows.length);
    console.table(rows);

    process.exit(0);
  } catch (error) {
    console.error("❌ PRODUCT QUERY FAILED");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("SQL MESSAGE:", error.sqlMessage);

    process.exit(1);
  }
}

test();
