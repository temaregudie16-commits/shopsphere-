const pool = require("../config/db");

// =====================================================
// AUTH: CREATE USER
// =====================================================

exports.createUser = async (name, email, hashedPassword) => {
  const [result] = await pool.query(
    `
      INSERT INTO users
      (
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, 'customer')
    `,
    [name, email, hashedPassword],
  );

  return result;
};

// =====================================================
// AUTH: FIND USER BY EMAIL
// =====================================================

exports.findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password,
        role,
        profile_image,
        created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] || null;
};

// =====================================================
// ADMIN: GET ALL ADMINS
// =====================================================

exports.getAllAdmins = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        profile_image,
        created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY id DESC
    `,
  );

  return rows;
};

// =====================================================
// ADMIN: GET ADMIN DETAILS
// =====================================================

exports.getAdminDetails = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        profile_image,
        created_at
      FROM users
      WHERE id = ?
        AND role = 'admin'
      LIMIT 1
    `,
    [id],
  );

  return rows;
};

// =====================================================
// ADMIN: CREATE ADMIN
// =====================================================

exports.createAdmin = async (name, email, hashedPassword) => {
  const [result] = await pool.query(
    `
      INSERT INTO users
      (
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, 'admin')
    `,
    [name, email, hashedPassword],
  );

  return result;
};

// =====================================================
// ADMIN: DELETE ADMIN
// =====================================================

exports.deleteAdmin = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM users
      WHERE id = ?
        AND role = 'admin'
    `,
    [id],
  );

  return result;
};

// =====================================================
// ADMIN: UPDATE USER ROLE
// =====================================================

exports.updateUserRole = async (id, role) => {
  const [result] = await pool.query(
    `
      UPDATE users
      SET role = ?
      WHERE id = ?
    `,
    [role, id],
  );

  return result;
};

// =====================================================
// ADMIN: COUNT ADMINS
// =====================================================

exports.countAdmins = async () => {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'admin'
    `,
  );

  return Number(rows[0]?.total || 0);
};

// =====================================================
// ADMIN: GET ALL CUSTOMERS
// =====================================================

exports.getAllCustomers = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.profile_image,
        u.created_at,

        COUNT(
          DISTINCT o.id
        ) AS total_orders,

        COALESCE(
          SUM(
            CASE
              WHEN o.status != 'cancelled'
              THEN o.total_price
              ELSE 0
            END
          ),
          0
        ) AS total_spent

      FROM users u

      LEFT JOIN orders o
        ON o.user_id = u.id

      WHERE u.role = 'customer'

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.role,
        u.profile_image,
        u.created_at

      ORDER BY u.id DESC
    `,
  );

  return rows;
};

// =====================================================
// GET USER BY ID
// =====================================================

exports.getUserById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        profile_image,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};
