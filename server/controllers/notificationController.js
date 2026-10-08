const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,

  // ADMIN
  getAllNotifications,
  getNotificationById,
  createAdminNotification,
  createNotificationForAllUsers,
  adminDeleteNotification,
} = require("../models/notificationModel");

// =====================================================
// CUSTOMER: GET MY NOTIFICATIONS
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

    const notifications = await getUserNotifications(userId);

    const unreadCount = await getUnreadCount(userId);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};

// =====================================================
// CUSTOMER: UNREAD COUNT
// =====================================================

exports.unreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const unreadCount = await getUnreadCount(userId);

    return res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load unread count.",
    });
  }
};

// =====================================================
// CUSTOMER: MARK ONE READ
// =====================================================

exports.readOne = async (req, res) => {
  try {
    const userId = req.user?.id;

    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const result = await markAsRead(notificationId, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// =====================================================
// CUSTOMER: MARK ALL READ
// =====================================================

exports.readAll = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    await markAllAsRead(userId);

    return res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

// =====================================================
// CUSTOMER: DELETE
// =====================================================

exports.remove = async (req, res) => {
  try {
    const userId = req.user?.id;

    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const result = await deleteNotification(notificationId, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

// =====================================================
// ADMIN: GET ALL NOTIFICATIONS
// =====================================================

exports.adminGetAll = async (req, res) => {
  try {
    const notifications = await getAllNotifications();

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("ADMIN GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin notifications.",
    });
  }
};

// =====================================================
// ADMIN: GET ONE NOTIFICATION
// =====================================================

exports.adminGetOne = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await getNotificationById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("ADMIN GET ONE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notification.",
    });
  }
};

// =====================================================
// ADMIN: SEND TO ONE USER
// =====================================================

exports.adminSendToUser = async (req, res) => {
  try {
    const { user_id, title, message, type, order_id } = req.body;

    const userId = Number(user_id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid user_id is required.",
      });
    }

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    const result = await createAdminNotification({
      user_id: userId,
      order_id: order_id ? Number(order_id) : null,
      title: title.trim(),
      message: message.trim(),
      type: type || "promotion",
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully.",
      notification_id: result.insertId,
    });
  } catch (error) {
    console.error("ADMIN SEND USER NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send notification.",
    });
  }
};

// =====================================================
// ADMIN: SEND TO ALL USERS
// =====================================================

exports.adminSendToAll = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    const result = await createNotificationForAllUsers({
      title: title.trim(),
      message: message.trim(),
      type: type || "promotion",
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent to all users.",
      sent_count: result.affectedRows || 0,
    });
  } catch (error) {
    console.error("ADMIN SEND ALL NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send notification to all users.",
    });
  }
};

// =====================================================
// ADMIN: DELETE
// =====================================================

exports.adminRemove = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const result = await adminDeleteNotification(notificationId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};
