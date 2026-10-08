const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

// =====================================================
// GET CUSTOMERS
// =====================================================

exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.profile_image,
        u.created_at,
        COUNT(DISTINCT o.id) AS total_orders,
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
      WHERE u.role != 'admin'
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.role,
        u.profile_image,
        u.created_at
      ORDER BY u.id DESC
    `);

    return res.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customers.",
    });
  }
};

// =====================================================
// GET ADMINS
// =====================================================

exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(`
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
    `);

    return res.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("GET ADMINS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load administrators.",
    });
  }
};

// =====================================================
// CREATE ADMIN
// =====================================================

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [cleanEmail],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, 'admin')
      `,
      [cleanName, cleanEmail, hashedPassword],
    );

    return res.status(201).json({
      success: true,
      message: "Administrator created successfully.",
      admin_id: result.insertId,
    });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create administrator.",
    });
  }
};

// =====================================================
// DELETE ADMIN
// =====================================================

exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = Number(req.params.id);
    const currentUserId = Number(req.user?.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }

    if (adminId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own administrator account.",
      });
    }

    const [result] = await pool.query(
      `
        DELETE FROM users
        WHERE id = ?
        AND role = 'admin'
      `,
      [adminId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    return res.json({
      success: true,
      message: "Administrator deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete administrator.",
    });
  }
};

// =====================================================
// CHANGE USER ROLE
// =====================================================

exports.changeUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const currentUserId = Number(req.user?.id);
    const { role } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const [result] = await pool.query(
      `
        UPDATE users
        SET role = ?
        WHERE id = ?
      `,
      [role, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message:
        role === "admin"
          ? "User is now an administrator."
          : "Administrator access removed.",
    });
  } catch (error) {
    console.error("CHANGE ROLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};

// =====================================================
// UPDATE PROFILE NAME
// =====================================================

exports.updateProfile = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    const cleanName = String(req.body?.name || "").trim();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters.",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must not exceed 100 characters.",
      });
    }

    const [result] = await pool.query(
      `
        UPDATE users
        SET name = ?
        WHERE id = ?
      `,
      [cleanName, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

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
      [userId],
    );

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: rows[0],
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

exports.changePassword = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    const currentPassword = String(req.body?.currentPassword || "");

    const newPassword = String(req.body?.newPassword || "");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    if (!/[A-Za-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain a letter.",
      });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain a number.",
      });
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain a symbol.",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT password
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      currentPassword,
      rows[0].password,
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, rows[0].password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
        UPDATE users
        SET password = ?
        WHERE id = ?
      `,
      [hashedPassword, userId],
    );

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

// =====================================================
// UPDATE / REPLACE PROFILE PHOTO
// =====================================================

exports.updateProfileImage = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile image.",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT profile_image
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId],
    );

    if (!rows.length) {
      try {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (fileError) {
        console.warn("UPLOADED FILE CLEANUP WARNING:", fileError.message);
      }

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldImage = rows[0].profile_image;

    await pool.query(
      `
        UPDATE users
        SET profile_image = ?
        WHERE id = ?
      `,
      [req.file.filename, userId],
    );

    // Delete previous profile photo
    if (oldImage) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profile",
        path.basename(oldImage),
      );

      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (deleteError) {
          console.warn(
            "OLD PROFILE IMAGE DELETE WARNING:",
            deleteError.message,
          );
        }
      }
    }

    return res.json({
      success: true,
      message: "Profile image updated successfully.",
      profile_image: req.file.filename,
      image_url: `/uploads/profile/${req.file.filename}`,
    });
  } catch (error) {
    console.error("UPDATE PROFILE IMAGE ERROR:", error);

    if (req.file?.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.warn("PROFILE IMAGE CLEANUP WARNING:", cleanupError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile image.",
    });
  }
};

// =====================================================
// DELETE PROFILE PHOTO
// =====================================================

exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT profile_image
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldImage = rows[0].profile_image;

    if (!oldImage) {
      return res.status(400).json({
        success: false,
        message: "No profile photo to remove.",
      });
    }

    await pool.query(
      `
        UPDATE users
        SET profile_image = NULL
        WHERE id = ?
      `,
      [userId],
    );

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "profile",
      path.basename(oldImage),
    );

    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (fileError) {
        console.warn("PROFILE IMAGE FILE DELETE WARNING:", fileError.message);
      }
    }

    return res.json({
      success: true,
      message: "Profile photo removed successfully.",
    });
  } catch (error) {
    console.error("DELETE PROFILE IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove profile photo.",
    });
  }
};
