const pool = require("../config/db");

// =====================================================
// CUSTOMER: CREATE NOTIFICATION
// Used by:
// - order creation
// - order status changes
// - other automatic system notifications
// =====================================================

exports.createNotification = async ({
  user_id,
  order_id = null,
  title,
  message,
  type = "order_status",
}) => {
  if (!user_id) {
    throw new Error("Notification user_id is required.");
  }

  if (!title?.trim()) {
    throw new Error("Notification title is required.");
  }

  if (!message?.trim()) {
    throw new Error("Notification message is required.");
  }

  const [result] = await pool.query(
    `
      INSERT INTO notifications
      (
        user_id,
        order_id,
        title,
        message,
        type,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, 0)
    `,
    [
      Number(user_id),
      order_id ? Number(order_id) : null,
      title.trim(),
      message.trim(),
      type || "order_status",
    ],
  );

  return result;
};

// =====================================================
// CUSTOMER: GET MY NOTIFICATIONS
// =====================================================

exports.getUserNotifications = async (user_id) => {
  if (!user_id) {
    return [];
  }

  const [rows] = await pool.query(
    `
          SELECT
            id,
            user_id,
            order_id,
            title,
            message,
            type,
            is_read,
            created_at
          FROM notifications
          WHERE user_id = ?
          ORDER BY id DESC
        `,
    [Number(user_id)],
  );

  return rows;
};

// =====================================================
// CUSTOMER: UNREAD COUNT
// =====================================================

exports.getUnreadCount = async (user_id) => {
  if (!user_id) {
    return 0;
  }

  const [rows] = await pool.query(
    `
          SELECT COUNT(*) AS unread_count
          FROM notifications
          WHERE user_id = ?
            AND is_read = 0
        `,
    [Number(user_id)],
  );

  return Number(rows[0]?.unread_count || 0);
};

// =====================================================
// CUSTOMER: MARK ONE READ
// =====================================================

exports.markAsRead = async (notification_id, user_id) => {
  if (!notification_id || !user_id) {
    return {
      affectedRows: 0,
    };
  }

  const [result] = await pool.query(
    `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
          AND user_id = ?
      `,
    [Number(notification_id), Number(user_id)],
  );

  return result;
};

// =====================================================
// CUSTOMER: MARK ALL READ
// =====================================================

exports.markAllAsRead = async (user_id) => {
  if (!user_id) {
    return {
      affectedRows: 0,
    };
  }

  const [result] = await pool.query(
    `
          UPDATE notifications
          SET is_read = 1
          WHERE user_id = ?
            AND is_read = 0
        `,
    [Number(user_id)],
  );

  return result;
};

// =====================================================
// CUSTOMER: DELETE ONE
// =====================================================

exports.deleteNotification = async (notification_id, user_id) => {
  if (!notification_id || !user_id) {
    return {
      affectedRows: 0,
    };
  }

  const [result] = await pool.query(
    `
          DELETE FROM notifications
          WHERE id = ?
            AND user_id = ?
        `,
    [Number(notification_id), Number(user_id)],
  );

  return result;
};

// =====================================================
// ADMIN: GET ALL NOTIFICATIONS
// =====================================================

exports.getAllNotifications = async () => {
  const [rows] = await pool.query(
    `
          SELECT
            notifications.id,
            notifications.user_id,

            users.name AS user_name,
            users.email AS user_email,

            notifications.order_id,
            notifications.title,
            notifications.message,
            notifications.type,
            notifications.is_read,
            notifications.created_at

          FROM notifications

          LEFT JOIN users
            ON notifications.user_id = users.id

          ORDER BY notifications.id DESC
        `,
  );

  return rows;
};

// =====================================================
// ADMIN: GET ONE NOTIFICATION
// =====================================================

exports.getNotificationById = async (notificationId) => {
  const [rows] = await pool.query(
    `
          SELECT
            notifications.id,
            notifications.user_id,

            users.name AS user_name,
            users.email AS user_email,

            notifications.order_id,
            notifications.title,
            notifications.message,
            notifications.type,
            notifications.is_read,
            notifications.created_at

          FROM notifications

          LEFT JOIN users
            ON notifications.user_id = users.id

          WHERE notifications.id = ?

          LIMIT 1
        `,
    [Number(notificationId)],
  );

  return rows[0] || null;
};

// =====================================================
// ADMIN: SEND TO ONE USER
// =====================================================

exports.createAdminNotification = async ({
  user_id,
  title,
  message,
  type = "promotion",
  order_id = null,
}) => {
  if (!user_id) {
    throw new Error("Notification user_id is required.");
  }

  if (!title?.trim()) {
    throw new Error("Notification title is required.");
  }

  if (!message?.trim()) {
    throw new Error("Notification message is required.");
  }

  const [result] = await pool.query(
    `
          INSERT INTO notifications
          (
            user_id,
            order_id,
            title,
            message,
            type,
            is_read
          )
          VALUES (?, ?, ?, ?, ?, 0)
        `,
    [
      Number(user_id),
      order_id ? Number(order_id) : null,
      title.trim(),
      message.trim(),
      type || "promotion",
    ],
  );

  return result;
};

// =====================================================
// ADMIN: SEND TO ALL CUSTOMERS
// =====================================================

exports.createNotificationForAllUsers = async ({
  title,
  message,
  type = "promotion",
}) => {
  if (!title?.trim()) {
    throw new Error("Notification title is required.");
  }

  if (!message?.trim()) {
    throw new Error("Notification message is required.");
  }

  const [result] = await pool.query(
    `
          INSERT INTO notifications
          (
            user_id,
            order_id,
            title,
            message,
            type,
            is_read
          )
          SELECT
            id,
            NULL,
            ?,
            ?,
            ?,
            0
          FROM users
          WHERE role != 'admin'
        `,
    [title.trim(), message.trim(), type || "promotion"],
  );

  return result;
};

// =====================================================
// ADMIN: DELETE NOTIFICATION
// =====================================================

exports.adminDeleteNotification = async (notificationId) => {
  const [result] = await pool.query(
    `
          DELETE FROM notifications
          WHERE id = ?
        `,
    [Number(notificationId)],
  );

  return result;
};
