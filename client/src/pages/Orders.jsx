import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {
  // =====================================================
  // STATE
  // =====================================================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Order Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // =====================================================
  // GET LOGGED USER
  // =====================================================

  const getUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("USER DATA ERROR:", error);

      localStorage.removeItem("user");

      return null;
    }
  };

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  const loadOrders = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const user = getUser();

      if (!user) {
        setOrders([]);

        setError(
          "Your login information could not be found. Please login again.",
        );

        return;
      }

      console.log("📦 Loading my orders...");

      // IMPORTANT:
      // Backend route:
      // GET /api/orders/my
      const response = await api.get("/orders/my");

      console.log("✅ ORDERS RESPONSE:", response.data);

      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);

        setError(response.data?.message || "Orders could not be loaded.");
      }
    } catch (error) {
      console.error("❌ LOAD ORDERS ERROR:", error);

      setOrders([]);

      if (error.response) {
        setError(
          error.response.data?.message ||
            `Server error: ${error.response.status}`,
        );
      } else if (error.request) {
        setError("Cannot connect to ShopSphere server.");
      } else {
        setError(error.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // LOAD WHEN PAGE OPENS + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    loadOrders(true);

    const interval = setInterval(() => {
      loadOrders(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // VIEW ORDER DETAILS
  // =====================================================

  const viewOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);

      console.log("🔎 Loading order details:", orderId);

      const response = await api.get(`/orders/my/${orderId}/details`);

      console.log("✅ ORDER DETAILS RESPONSE:", response.data);

      if (
        response.data?.success &&
        Array.isArray(response.data?.orderDetails)
      ) {
        setSelectedOrder(response.data.orderDetails);

        setShowDetails(true);
      } else {
        alert(response.data?.message || "Order details could not be loaded.");
      }
    } catch (error) {
      console.error("❌ ORDER DETAILS ERROR:", error);

      alert(error.response?.data?.message || "Failed to load order details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  const closeDetails = () => {
    setSelectedOrder(null);
    setShowDetails(false);
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "completed":
        return "bg-emerald-100 text-emerald-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    if (!status) {
      return "Pending";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // =====================================================
  // STATUS STEPS
  // =====================================================

  const statusSteps = ["pending", "processing", "paid", "shipped", "completed"];

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl animate-pulse">📦</div>

          <h2 className="text-2xl font-black text-slate-800 mt-5">
            Loading Your Orders...
          </h2>

          <p className="text-slate-500 mt-2">
            Please wait while we load your order history.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <p className="text-blue-200 text-sm uppercase font-black">
            ShopSphere
          </p>

          <h1 className="text-3xl md:text-4xl font-black mt-1">My Orders</h1>

          <p className="text-blue-100 mt-2">
            Track and review your ShopSphere orders.
          </p>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* ERROR */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex gap-4 items-start">
              <div className="text-3xl">⚠️</div>

              <div className="flex-1">
                <h2 className="text-lg font-black text-red-700">
                  Unable to load orders
                </h2>

                <p className="text-red-600 mt-1">{error}</p>

                <button
                  type="button"
                  onClick={() => loadOrders(true)}
                  disabled={refreshing}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold disabled:opacity-50"
                >
                  {refreshing ? "Loading..." : "🔄 Try Again"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error && orders.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-12 md:p-16 text-center">
            <div className="text-7xl">📦</div>

            <h2 className="text-3xl font-black text-slate-800 mt-6">
              No Orders Yet
            </h2>

            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping and your orders
              will appear here.
            </p>

            <Link
              to="/products"
              className="inline-block mt-7 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-black"
            >
              Start Shopping →
            </Link>
          </div>
        )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {!error && orders.length > 0 && (
          <div className="space-y-5">
            {/* SUMMARY */}

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    Order History
                  </h2>

                  <p className="text-slate-500 mt-1">
                    {orders.length} order
                    {orders.length !== 1 ? "s" : ""} found.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadOrders(false)}
                  disabled={refreshing}
                  className="self-start bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {refreshing ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>
            </div>

            {/* ORDER CARDS */}

            {orders.map((order) => {
              const currentIndex = statusSteps.indexOf(order.status);

              const isCancelled = order.status === "cancelled";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row justify-between gap-5">
                      {/* ORDER INFO */}

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black text-slate-800">
                            Order #{order.id}
                          </h3>

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-black ${getStatusClass(
                              order.status,
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-2">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString()
                            : "-"}
                        </p>
                      </div>

                      {/* TOTAL */}

                      <div className="text-left lg:text-right">
                        <p className="text-sm text-slate-500">Order Total</p>

                        <p className="text-3xl font-black text-green-600">
                          ${Number(order.total_price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        PROGRESS
                    ================================================= */}

                    {!isCancelled ? (
                      <div className="mt-8">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {statusSteps.map((step, index) => {
                            const active = currentIndex >= index;

                            return (
                              <div key={step} className="text-center">
                                <div
                                  className={`h-2 rounded-full ${
                                    active ? "bg-blue-600" : "bg-slate-200"
                                  }`}
                                />

                                <p
                                  className={`text-xs font-bold mt-2 ${
                                    active ? "text-blue-700" : "text-slate-400"
                                  }`}
                                >
                                  {getStatusLabel(step)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-bold">
                        ❌ This order has been cancelled.
                      </div>
                    )}

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="border-t mt-6 pt-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => viewOrderDetails(order.id)}
                        disabled={detailsLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50"
                      >
                        {detailsLoading ? "Loading..." : "👁️ View Details"}
                      </button>

                      <Link
                        to="/products"
                        className="text-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-slate-950 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-center">
          <h3 className="text-xl font-black">🛍️ ShopSphere</h3>

          <p className="text-slate-400 text-sm mt-2">
            Thank you for shopping with ShopSphere.
          </p>

          <p className="text-slate-600 text-xs mt-5">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
        </div>
      </footer>

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}

            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  🧾 Order Details
                </h2>

                <p className="text-slate-500 mt-1">
                  Order #{selectedOrder[0]?.order_id || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="text-3xl text-slate-400 hover:text-red-600"
              >
                ×
              </button>
            </div>

            {/* CONTENT */}

            <div className="p-6">
              {selectedOrder.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No order details found.
                </div>
              ) : (
                <>
                  {/* ORDER INFORMATION */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Customer</p>

                      <p className="font-black mt-1">
                        {selectedOrder[0]?.user_name || "Unknown"}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Email</p>

                      <p className="font-black mt-1">
                        {selectedOrder[0]?.email || "-"}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Status</p>

                      <p className="font-black mt-1 capitalize">
                        {selectedOrder[0]?.status || "-"}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Date</p>

                      <p className="font-black mt-1">
                        {selectedOrder[0]?.created_at
                          ? new Date(
                              selectedOrder[0].created_at,
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCTS */}

                  <h3 className="text-xl font-black mt-8 mb-4">
                    Ordered Products
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-4 text-left">Product</th>

                          <th className="p-4 text-left">Quantity</th>

                          <th className="p-4 text-left">Price</th>

                          <th className="p-4 text-left">Subtotal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedOrder.map((item, index) => {
                          const price = Number(item.item_price || 0);

                          const quantity = Number(item.quantity || 0);

                          return (
                            <tr
                              key={`${item.product_id}-${index}`}
                              className="border-t"
                            >
                              <td className="p-4 font-bold">
                                {item.product_name || "-"}
                              </td>

                              <td className="p-4">{quantity}</td>

                              <td className="p-4">${price.toFixed(2)}</td>

                              <td className="p-4 font-black text-green-600">
                                ${(price * quantity).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* TOTAL */}

                  <div className="flex justify-end mt-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Order Total</p>

                      <p className="text-3xl font-black text-green-600">
                        ${Number(selectedOrder[0]?.order_total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* FOOTER */}

            <div className="p-6 border-t flex justify-end">
              <button
                type="button"
                onClick={closeDetails}
                className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
