import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Invalid user data in localStorage");
    localStorage.removeItem("user");
  }

  // ==========================================
  // USER NOT LOGGED IN
  // ==========================================

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // ADMIN ONLY
  // ==========================================

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ==========================================
  // ALLOW ACCESS
  // ==========================================

  return children;
}

export default ProtectedRoute;
