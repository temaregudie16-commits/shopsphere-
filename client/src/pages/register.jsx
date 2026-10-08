import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  const isStrongPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Za-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

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

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // ---------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters and include a letter, number and symbol.",
      );
      return;
    }

    // ---------------------------------------------------
    // CONFIRM PASSWORD
    // ---------------------------------------------------

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.data?.success) {
        setSuccess(
          response.data?.message ||
            "Registration successful. Redirecting to login...",
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        setShowPassword(false);
        setShowConfirmPassword(false);

        setTimeout(() => {
          navigate("/login");
        }, 1200);

        return;
      }

      setError(
        response.data?.message || "Registration failed. Please try again.",
      );
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
          {/* =================================================
              LEFT SIDE - BACKGROUND IMAGE
          ================================================= */}

          <div className="hidden lg:flex relative overflow-hidden p-12 text-white min-h-[720px]">
            {/* ORIGINAL BACKGROUND IMAGE */}
            <img
              src="/images/register-banner.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* VERY LIGHT OVERLAY - DOES NOT CHANGE IMAGE COLOR MUCH */}
            <div className="absolute inset-0 bg-black/10" />

            {/* CONTENT OVER IMAGE */}
            <div className="relative z-10 flex flex-col justify-between w-full">
              {/* BRAND */}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl shadow-lg">
                    🛍️
                  </div>

                  <div>
                    <h1 className="text-3xl font-black drop-shadow-lg">
                      ShopSphere
                    </h1>

                    <p className="text-white/90 text-sm drop-shadow">
                      Smart shopping. Simple experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* HERO CONTENT */}

              <div className="my-12 max-w-xl">
                <p className="text-white/90 uppercase tracking-widest text-xs font-black drop-shadow">
                  Welcome
                </p>

                <h2 className="text-4xl xl:text-5xl font-black leading-tight mt-4 drop-shadow-lg">
                  Your shopping
                  <br />
                  journey starts here.
                </h2>

                <p className="text-white/90 text-lg leading-8 mt-6 max-w-md drop-shadow">
                  Create your ShopSphere account and enjoy a faster, easier and
                  more personalized shopping experience.
                </p>
              </div>

              {/* FEATURES */}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl">🚚</div>

                  <p className="text-sm font-bold mt-2">Fast Delivery</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl">🔒</div>

                  <p className="text-sm font-bold mt-2">Secure Shopping</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl">⭐</div>

                  <p className="text-sm font-bold mt-2">Quality Products</p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE - REGISTER FORM
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

                <p className="text-slate-500 mt-1">Create your account</p>
              </div>

              {/* HEADER */}

              <div className="mb-8">
                <p className="text-blue-600 uppercase tracking-widest text-xs font-black">
                  Get Started
                </p>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                  Create your account
                </h2>

                <p className="text-slate-500 mt-3">
                  Enter your information to join ShopSphere.
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
                {/* NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-black text-slate-700 mb-2"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      👤
                    </span>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-12 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                    />
                  </div>
                </div>

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
                  <label
                    htmlFor="password"
                    className="block text-sm font-black text-slate-700 mb-2"
                  >
                    Password
                  </label>

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
                      placeholder="Create your password"
                      autoComplete="new-password"
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

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-black text-slate-700 mb-2"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔐
                    </span>

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className={`w-full rounded-2xl border bg-slate-50 px-12 pr-14 py-3.5 text-slate-900 outline-none transition focus:bg-white focus:ring-4 disabled:opacity-60 ${
                        formData.confirmPassword
                          ? formData.password === formData.confirmPassword
                            ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                            : "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-blue-600 disabled:opacity-50"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {formData.confirmPassword && (
                    <p
                      className={`text-xs font-bold mt-2 ${
                        formData.password === formData.confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formData.password === formData.confirmPassword
                        ? "✓ Passwords match"
                        : "✕ Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* TERMS */}

                <p className="text-xs text-slate-500 leading-5">
                  By creating an account, you agree to use ShopSphere
                  responsibly and keep your account information secure.
                </p>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 font-black text-base transition shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* LOGIN */}

              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-sm">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-black"
                >
                  Sign in to ShopSphere →
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

export default Register;
