import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/notifications");

      if (response.data?.success) {
        setNotifications(response.data.notifications || []);

        setUnreadCount(Number(response.data.unreadCount || 0));
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  const loadUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get("/notifications/unread-count");

      if (response.data?.success) {
        setUnreadCount(Number(response.data.unreadCount || 0));
      }
    } catch (error) {
      console.error("LOAD UNREAD COUNT ERROR:", error);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn, loadNotifications]);

  // =====================================================
  // AUTO REFRESH UNREAD COUNT
  // =====================================================

  useEffect(() => {
    if (!isLoggedIn) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [isLoggedIn, loadUnreadCount]);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);

      if (response.data?.success) {
        setNotifications((previous) =>
          previous.map((notification) =>
            Number(notification.id) === Number(notificationId)
              ? {
                  ...notification,
                  is_read: 1,
                }
              : notification,
          ),
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      return {
        success: Boolean(response.data?.success),
        message: response.data?.message || "",
      };
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to mark notification as read.",
      };
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      const response = await api.put("/notifications/read-all");

      if (response.data?.success) {
        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            is_read: 1,
          })),
        );

        setUnreadCount(0);
      }

      return {
        success: Boolean(response.data?.success),
        message: response.data?.message || "",
      };
    } catch (error) {
      console.error("MARK ALL NOTIFICATIONS ERROR:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to mark notifications as read.",
      };
    }
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const deleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find(
        (item) => Number(item.id) === Number(notificationId),
      );

      const response = await api.delete(`/notifications/${notificationId}`);

      if (response.data?.success) {
        setNotifications((previous) =>
          previous.filter((item) => Number(item.id) !== Number(notificationId)),
        );

        if (notification && Number(notification.is_read) === 0) {
          setUnreadCount((previous) => Math.max(0, previous - 1));
        }
      }

      return {
        success: Boolean(response.data?.success),
        message: response.data?.message || "",
      };
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete notification.",
      };
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  // =====================================================
  // VALUE
  // =====================================================

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      isLoggedIn,

      loadNotifications,
      loadUnreadCount,
      refreshNotifications,

      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      loading,
      isLoggedIn,
      loadNotifications,
      loadUnreadCount,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}
