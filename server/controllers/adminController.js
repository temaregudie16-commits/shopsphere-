const db = require("../config/db");

// =====================================================
// GET ADMIN DASHBOARD STATISTICS
// GET /api/admin/stats
// =====================================================

const getStats = async (req, res) => {
  try {
    // ---------------------------------------------------
    // TOTAL PRODUCTS
    // ---------------------------------------------------

    const [products] = await db.query(`
      SELECT COUNT(*) AS totalProducts
      FROM products
    `);

    // ---------------------------------------------------
    // TOTAL ORDERS
    // ---------------------------------------------------

    const [orders] = await db.query(`
      SELECT COUNT(*) AS totalOrders
      FROM orders
    `);

    // ---------------------------------------------------
    // TOTAL USERS
    // ---------------------------------------------------

    const [users] = await db.query(`
      SELECT COUNT(*) AS totalUsers
      FROM users
    `);

    // ---------------------------------------------------
    // TOTAL SALES
    // Actual revenue = paid/shipped/completed only
    // ---------------------------------------------------

    const [sales] = await db.query(`
      SELECT
        COALESCE(SUM(total_price), 0) AS totalSales
      FROM orders
      WHERE status IN (
        'paid',
        'shipped',
        'completed'
      )
    `);

    // ---------------------------------------------------
    // LOW STOCK
    // ---------------------------------------------------

    const [lowStock] = await db.query(`
      SELECT COUNT(*) AS lowStockProducts
      FROM products
      WHERE stock <= 5
    `);

    // ---------------------------------------------------
    // PENDING ORDERS
    // ---------------------------------------------------

    const [pending] = await db.query(`
      SELECT COUNT(*) AS pendingOrders
      FROM orders
      WHERE status = 'pending'
    `);

    // ---------------------------------------------------
    // ACTIVE COUPONS
    // ---------------------------------------------------

    const [coupons] = await db.query(`
      SELECT COUNT(*) AS activeCoupons
      FROM coupons
      WHERE is_active = 1
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
        AND (
          usage_limit IS NULL
          OR used_count < usage_limit
        )
    `);

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return res.json({
      success: true,

      stats: {
        totalProducts: Number(products[0]?.totalProducts || 0),

        totalOrders: Number(orders[0]?.totalOrders || 0),

        totalUsers: Number(users[0]?.totalUsers || 0),

        totalSales: Number(sales[0]?.totalSales || 0),

        lowStockProducts: Number(lowStock[0]?.lowStockProducts || 0),

        pendingOrders: Number(pending[0]?.pendingOrders || 0),

        activeCoupons: Number(coupons[0]?.activeCoupons || 0),
      },
    });
  } catch (error) {
    console.error("=================================");
    console.error("ADMIN STATS ERROR");
    console.error("=================================");

    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("SQL MESSAGE:", error.sqlMessage);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

// =====================================================
// GET ADMIN DASHBOARD OVERVIEW
// GET /api/admin/overview
// =====================================================

const getOverview = async (req, res) => {
  try {
    // ===================================================
    // REVENUE - LAST 7 DAYS
    // ===================================================

    const [revenueRows] = await db.query(`
      SELECT
        DATE(created_at) AS saleDate,
        COALESCE(SUM(total_price), 0) AS revenue
      FROM orders
      WHERE status IN (
        'paid',
        'shipped',
        'completed'
      )
        AND created_at >= DATE_SUB(
          CURDATE(),
          INTERVAL 6 DAY
        )
      GROUP BY DATE(created_at)
      ORDER BY saleDate ASC
    `);

    // ---------------------------------------------------
    // ALWAYS RETURN ALL 7 DAYS
    // Even when some days have zero revenue.
    // ---------------------------------------------------

    const revenueMap = new Map();

    revenueRows.forEach((row) => {
      const dateKey = new Date(row.saleDate).toISOString().slice(0, 10);

      revenueMap.set(dateKey, Number(row.revenue || 0));
    });

    const revenue = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const dateKey = date.toISOString().slice(0, 10);

      revenue.push({
        saleDate: dateKey,
        revenue: revenueMap.get(dateKey) || 0,
      });
    }

    // ===================================================
    // PENDING ORDER VALUE
    // ===================================================

    const [pendingValueRows] = await db.query(`
        SELECT
          COALESCE(
            SUM(total_price),
            0
          ) AS pendingValue
        FROM orders
        WHERE status = 'pending'
      `);

    const pendingValue = Number(pendingValueRows[0]?.pendingValue || 0);

    // ===================================================
    // RECENT ORDERS
    // ===================================================

    const [recentOrders] = await db.query(`
        SELECT
          o.id,
          o.user_id,
          o.total_price,
          o.status,
          o.created_at,
          u.name AS customer_name,
          u.email AS customer_email
        FROM orders o
        LEFT JOIN users u
          ON u.id = o.user_id
        ORDER BY o.id DESC
        LIMIT 8
      `);

    // ===================================================
    // LOW STOCK PRODUCTS
    // ===================================================

    const [lowStockProducts] = await db.query(`
        SELECT
          id,
          name,
          stock,
          price,
          image
        FROM products
        WHERE stock <= 5
        ORDER BY stock ASC, id DESC
        LIMIT 8
      `);

    // ===================================================
    // TOP ORDERED PRODUCTS
    //
    // Includes:
    // pending
    // paid
    // shipped
    // completed
    //
    // Excludes:
    // cancelled
    // ===================================================

    const [topProducts] = await db.query(`
        SELECT
          p.id,
          p.name,
          p.price,
          p.image,
          COALESCE(
            SUM(
              CASE
                WHEN o.status IN (
                  'pending',
                  'paid',
                  'shipped',
                  'completed'
                )
                THEN oi.quantity
                ELSE 0
              END
            ),
            0
          ) AS total_sold
        FROM products p

        LEFT JOIN order_items oi
          ON oi.product_id = p.id

        LEFT JOIN orders o
          ON o.id = oi.order_id

        GROUP BY
          p.id,
          p.name,
          p.price,
          p.image

        HAVING total_sold > 0

        ORDER BY
          total_sold DESC,
          p.id DESC

        LIMIT 5
      `);

    // ===================================================
    // ORDER STATUS SUMMARY
    // ===================================================

    const [orderStatus] = await db.query(`
        SELECT
          status,
          COUNT(*) AS total
        FROM orders
        GROUP BY status
        ORDER BY total DESC
      `);

    // ===================================================
    // SALES BY STATUS
    // ===================================================

    const [salesByStatus] = await db.query(`
        SELECT
          status,
          COALESCE(
            SUM(total_price),
            0
          ) AS totalSales
        FROM orders
        WHERE status IN (
          'paid',
          'processing',
          'shipped',
          'completed'
        )
        GROUP BY status
        ORDER BY totalSales DESC
      `);

    // ===================================================
    // TOTAL ACTUAL REVENUE
    // ===================================================

    const [revenueTotalRows] = await db.query(`
        SELECT
          COALESCE(
            SUM(total_price),
            0
          ) AS totalRevenue
        FROM orders
        WHERE status IN (
          'paid',
          'shipped',
          'completed'
        )
      `);

    const totalRevenue = Number(revenueTotalRows[0]?.totalRevenue || 0);

    // ===================================================
    // RESPONSE
    // ===================================================

    return res.json({
      success: true,

      overview: {
        revenue,

        totalRevenue,

        pendingValue,

        recentOrders,

        lowStockProducts,

        topProducts,

        orderStatus,

        salesByStatus,
      },
    });
  } catch (error) {
    console.error("=================================");
    console.error("ADMIN OVERVIEW ERROR");
    console.error("=================================");

    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("SQL:", error.sql);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard overview.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getStats,
  getOverview,
};
