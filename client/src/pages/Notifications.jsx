import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // =====================================================
  // ICON
  // =====================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "promotion":
        return "🎟️";

      case "payment":
        return "💳";

      case "order_status":
        return "📦";

      case "system":
        return "⚙️";

      default:
        return "🔔";
    }
  };

  // =====================================================
  // TYPE STYLE
  // =====================================================

  const getTypeStyle = (type) => {
    switch (type) {
      case "promotion":
        return "bg-purple-100 text-purple-700";

      case "payment":
        return "bg-green-100 text-green-700";

      case "order_status":
        return "bg-blue-100 text-blue-700";

      case "system":
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =====================================================
  // READ
  // =====================================================

  const handleRead = async (id) => {
    await markAsRead(id);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this notification?");

    if (!confirmed) {
      return;
    }

    await deleteNotification(id);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wide">
                ShopSphere
              </p>

              <h1 className="text-3xl md:text-4xl font-black mt-2">
                🔔 Notifications
              </h1>

              <p className="text-blue-100 mt-2">
                Stay updated with your orders, payments and promotions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 h-fit">
              <p className="text-blue-100 text-sm">Unread Notifications</p>

              <p className="text-3xl font-black mt-1">{unreadCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* ACTION BAR */}

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                My Notifications
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                {notifications.length} total notification
                {notifications.length === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
                >
                  ✓ Mark All as Read
                </button>
              )}

              <button
                type="button"
                onClick={loadNotifications}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 rounded-xl font-bold"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl animate-pulse">🔔</div>

            <p className="font-bold text-slate-600 mt-4">
              Loading notifications...
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && notifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-7xl">🔕</div>

            <h3 className="text-2xl font-black text-slate-900 mt-5">
              No Notifications
            </h3>

            <p className="text-slate-500 mt-2">You are all caught up.</p>

            <Link
              to="/products"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {/* =================================================
            NOTIFICATIONS LIST
        ================================================= */}

        {!loading && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const isUnread = Number(notification.is_read) === 0;

              return (
                <div
                  key={notification.id}
                  className={`rounded-2xl border shadow-sm transition ${
                    isUnread
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* ICON */}

                      <div
                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${
                          isUnread ? "bg-blue-100" : "bg-slate-100"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-lg font-black ${
                              isUnread ? "text-slate-900" : "text-slate-700"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {isUnread && (
                            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-[10px] font-black">
                              NEW
                            </span>
                          )}

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black ${getTypeStyle(
                              notification.type,
                            )}`}
                          >
                            {notification.type || "system"}
                          </span>
                        </div>

                        <p className="text-slate-600 mt-2 leading-7">
                          {notification.message}
                        </p>

                        {/* META */}

                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-4">
                          <span>
                            🕒{" "}
                            {notification.created_at
                              ? new Date(
                                  notification.created_at,
                                ).toLocaleString()
                              : "-"}
                          </span>

                          {notification.order_id && (
                            <span>📦 Order #{notification.order_id}</span>
                          )}
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-3 mt-5">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => handleRead(notification.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
                            >
                              ✓ Mark as Read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(notification.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                          >
                            🗑️ Delete
                          </button>

                          {notification.order_id && (
                            <Link
                              to={`/orders`}
                              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold"
                            >
                              📦 View Orders
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Notifications;
