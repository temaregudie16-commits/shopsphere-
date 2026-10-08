import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNotifications } from "../context/NotificationContext";

function Navbar() {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const { unreadCount } = useNotifications();

  // =====================================================
  // AUTH STATE SYNC
  // =====================================================

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));

      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("authChanged", syncAuth);

    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("authChanged", syncAuth);

      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    setToken(null);
    setUser(null);

    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* =================================================
              LOGO
          ================================================= */}

          <Link to="/" className="text-2xl font-extrabold text-blue-700">
            🛍️ ShopSphere
          </Link>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              Products
            </Link>

            {token && (
              <>
                <Link
                  to="/cart"
                  className="font-semibold text-gray-700 hover:text-blue-600"
                >
                  🛒 Cart
                </Link>

                <Link
                  to="/orders"
                  className="font-semibold text-gray-700 hover:text-blue-600"
                >
                  📦 Orders
                </Link>

                <Link
                  to="/wishlist"
                  className="font-semibold text-gray-700 hover:text-blue-600"
                >
                  ❤️ Wishlist
                </Link>

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <Link
                  to="/notifications"
                  className="relative font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-3 -right-4 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="font-semibold text-gray-700 hover:text-blue-600"
                >
                  👤 Profile
                </Link>

                {/* =================================================
                    ADMIN
                ================================================= */}

                {String(user?.role || "").toLowerCase() === "admin" && (
                  <Link
                    to="/admin"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700"
                  >
                    ⚙️ Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="hidden lg:block text-sm text-gray-600">
                  Hi, {user?.name || "User"}
                </span>

                {/* Mobile Notification */}

                <Link
                  to="/notifications"
                  className="md:hidden relative text-2xl"
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
