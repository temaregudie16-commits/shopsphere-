import { Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/profile";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

// =====================================================
// PAYMENT PAGES
// =====================================================

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <NotificationProvider>
          <Routes>
            {/* =========================
                HOME
            ========================== */}

            <Route path="/" element={<Home />} />

            {/* =========================
                PRODUCTS
            ========================== */}

            <Route path="/products" element={<Products />} />

            <Route path="/products/:id" element={<ProductDetails />} />

            {/* =========================
                AUTH
            ========================== */}

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* =========================
                SHOPPING
            ========================== */}

            <Route path="/cart" element={<Cart />} />

            <Route path="/checkout" element={<Checkout />} />

            {/* =========================
                ORDERS
            ========================== */}

            <Route path="/orders" element={<Orders />} />

            {/* =========================
                PROFILE
            ========================== */}

            <Route path="/profile" element={<Profile />} />

            {/* =========================
                WISHLIST
            ========================== */}

            <Route path="/wishlist" element={<Wishlist />} />

            {/* =========================
                NOTIFICATIONS
            ========================== */}

            <Route path="/notifications" element={<Notifications />} />

            {/* =========================
                PAYMENT
            ========================== */}

            <Route path="/payment-success" element={<PaymentSuccess />} />

            <Route path="/payment-failed" element={<PaymentFailed />} />

            {/* =========================
                ADMIN
            ========================== */}

            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </NotificationProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
