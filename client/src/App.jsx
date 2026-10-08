import { Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";

// =====================================================
// MAIN PAGES
// =====================================================

import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetails from "./pages/productDetails";
import Cart from "./pages/cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/profile";
import Wishlist from "./pages/wishlist";
import Notifications from "./pages/Notifications";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/login";
import Register from "./pages/register";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./pages/adminDashboard";

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
