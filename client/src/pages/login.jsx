import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (!response.data?.success) {
        setError(response.data?.message || "Login failed. Please try again.");
        return;
      }

      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        setError("Login response is incomplete. Please try again.");
        return;
      }

      // ---------------------------------------------------
      // SAVE AUTH
      // ---------------------------------------------------

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Notify Navbar / other components
      window.dispatchEvent(new Event("authChanged"));

      setSuccess("Login successful. Redirecting...");

      // ---------------------------------------------------
      // ADMIN / CUSTOMER REDIRECT
      // ---------------------------------------------------

      setTimeout(() => {
        if (String(user.role || "").toLowerCase() === "admin") {
          navigate("/admin", {
            replace: true,
          });
        } else {
          navigate("/", {
            replace: true,
          });
        }
      }, 700);
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
          {/* =================================================
              LEFT SIDE - ORIGINAL IMAGE
          ================================================= */}

          <div className="hidden lg:flex relative overflow-hidden min-h-[680px]">
            {/* ORIGINAL IMAGE */}
            <img
              src="/images/login-banner.jpg"
              alt="ShopSphere"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* CONTENT */}
            <div className="relative z-10 flex flex-col justify-between w-full p-12 text-white">
              {/* BRAND */}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl">
                    🛍️
                  </div>

                  <div>
                    <h1 className="text-3xl font-black drop-shadow-lg">
                      ShopSphere
                    </h1>

                    <p className="text-white text-sm drop-shadow">
                      Smart shopping. Simple experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* HERO */}

              <div className="my-12 max-w-xl">
                <p className="text-white uppercase tracking-widest text-xs font-black drop-shadow-lg">
                  Welcome Back
                </p>

                <h2 className="text-4xl xl:text-5xl font-black leading-tight mt-4 drop-shadow-lg">
                  Great to see
                  <br />
                  you again.
                </h2>

                <p className="text-white text-lg leading-8 mt-6 max-w-md drop-shadow-lg">
                  Sign in to continue shopping, manage your orders and enjoy
                  your ShopSphere experience.
                </p>
              </div>

              {/* FEATURES */}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                  <div className="text-2xl">🚚</div>

                  <p className="text-sm font-bold mt-2">Fast Delivery</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                  <div className="text-2xl">🔒</div>

                  <p className="text-sm font-bold mt-2">Secure Shopping</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                  <div className="text-2xl">⭐</div>

                  <p className="text-sm font-bold mt-2">Quality Products</p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE - LOGIN FORM
          ================================================= */}

          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* MOBILE BRAND */}

              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-3xl">
                  🛍️
                </div>

                <h1 className="text-3xl font-black text-slate-900 mt-4">
                  ShopSphere
                </h1>

                <p className="text-slate-500 mt-1">Welcome back</p>
              </div>

              {/* HEADER */}

              <div className="mb-8">
                <p className="text-blue-600 uppercase tracking-widest text-xs font-black">
                  Welcome Back
                </p>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                  Sign in to your account
                </h2>

                <p className="text-slate-500 mt-3">
                  Enter your email and password to continue.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>

                    <p className="font-semibold text-sm leading-6">{error}</p>
                  </div>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-green-700">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✅</span>

                    <p className="font-semibold text-sm leading-6">{success}</p>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-black text-slate-700 mb-2"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ✉️
                    </span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-12 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-black text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      onClick={() =>
                        setError("Password reset is not configured yet.")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-12 pr-14 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-blue-600 disabled:opacity-50"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* REMEMBER */}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-600">Remember me</span>
                </label>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 font-black text-base transition shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* REGISTER */}

              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-sm">Don't have an account?</p>

                <Link
                  to="/register"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-black"
                >
                  Create your ShopSphere account →
                </Link>
              </div>

              {/* STORE */}

              <div className="text-center mt-6">
                <Link
                  to="/"
                  className="text-sm font-semibold text-slate-400 hover:text-blue-600"
                >
                  ← Back to Store
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}

        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
