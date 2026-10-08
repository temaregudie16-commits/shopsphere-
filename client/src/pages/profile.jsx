import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL = "http://localhost:5000";

  // =====================================================
  // PROFILE IMAGE URL
  // =====================================================

  const getProfileImageUrl = (image) => {
    if (!image) {
      return "";
    }

    // Already a full URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // If backend already returns a /uploads path
    if (image.startsWith("/uploads/")) {
      return `${API_BASE_URL}${image}`;
    }

    // If backend returns uploads/... without first slash
    if (image.startsWith("uploads/")) {
      return `${API_BASE_URL}/${image}`;
    }

    // Default profile image location
    return `${API_BASE_URL}/uploads/profile/${image}`;
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async ({ silent = false } = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/profile",
        },
      });

      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/profile");

      if (response.data?.success && response.data?.user) {
        const profileUser = response.data.user;

        setUser(profileUser);

        // Keep localStorage synchronized
        localStorage.setItem("user", JSON.stringify(profileUser));
      } else {
        setError(response.data?.message || "Unable to load your profile.");
      }
    } catch (requestError) {
      console.error("PROFILE LOAD ERROR:", requestError);

      if (requestError.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
          state: {
            from: "/profile",
          },
        });

        return;
      }

      if (requestError.response) {
        setError(
          requestError.response.data?.message ||
            `Server error: ${requestError.response.status}`,
        );
      } else if (requestError.request) {
        setError("Cannot connect to ShopSphere server.");
      } else {
        setError(requestError.message || "Something went wrong.");
      }
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile image must be less than 5MB.");

      event.target.value = "";
      return;
    }

    const formData = new FormData();

    formData.append("profile_image", file);

    try {
      setUploadingPhoto(true);

      const response = await api.put("/users/profile/photo", formData);

      if (response.data?.success) {
        await loadProfile({
          silent: true,
        });

        alert(response.data?.message || "Profile image updated successfully.");
      } else {
        alert(response.data?.message || "Failed to update profile image.");
      }
    } catch (error) {
      console.error("PROFILE IMAGE UPLOAD ERROR:", error);

      alert(error.response?.data?.message || "Failed to upload profile image.");
    } finally {
      setUploadingPhoto(false);

      event.target.value = "";
    }
  };
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // USER VALUES
  // =====================================================

  const userName = user?.name || "ShopSphere User";
  const userEmail = user?.email || "No email available";
  const userRole = user?.role || "user";

  const isAdmin = String(userRole).toLowerCase() === "admin";

  const initial = useMemo(() => {
    return userName.trim().charAt(0).toUpperCase() || "U";
  }, [userName]);

  const profileImage = getProfileImageUrl(user?.profile_image);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-xl p-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl shadow-lg animate-pulse">
            👤
          </div>

          <h2 className="text-2xl font-black text-slate-900 mt-6">
            Loading your profile
          </h2>

          <p className="text-slate-500 mt-2 leading-7">
            Please wait while we securely load your ShopSphere account.
          </p>

          <div className="mt-7 flex justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:120ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl p-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-4xl">
            ⚠️
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-black mt-6">
            Account
          </p>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
            Profile Unavailable
          </h1>

          <p className="text-slate-500 mt-4 leading-7">
            {error || "Unable to load your profile."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => loadProfile()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition"
            >
              🔄 Try Again
            </button>

            <Link
              to="/"
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black transition"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.22),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
                👤 My Account
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight mt-5">
                Welcome back,
                <span className="block text-blue-400 mt-1">{userName}.</span>
              </h1>

              <p className="text-slate-300 mt-5 text-base md:text-lg leading-8 max-w-2xl">
                Manage your ShopSphere account, orders, wishlist, notifications
                and shopping preferences from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="bg-white text-slate-950 hover:bg-slate-100 px-5 py-3 rounded-2xl font-black transition"
              >
                🛍️ Shop Now
              </Link>

              <button
                type="button"
                onClick={() => loadProfile({ silent: true })}
                disabled={refreshing}
                className="border border-white/15 bg-white/10 hover:bg-white/15 text-white px-5 py-3 rounded-2xl font-black backdrop-blur transition disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* =================================================
            PROFILE OVERVIEW
        ================================================= */}

        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

          <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr]">
            {/* PROFILE IDENTITY */}

            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-8 md:p-10">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex flex-col items-center text-center">
                {/* PROFILE IMAGE */}

                <div className="relative">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2rem] overflow-hidden bg-white/10 border-4 border-white/30 backdrop-blur shadow-2xl flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          const fallback =
                            event.currentTarget.nextElementSibling;

                          if (fallback) {
                            fallback.classList.remove("hidden");
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className={`w-full h-full flex items-center justify-center text-5xl md:text-6xl font-black ${
                        profileImage ? "hidden" : ""
                      }`}
                    >
                      {initial}
                    </div>
                  </div>

                  <div className="absolute -right-2 -bottom-2 w-11 h-11 rounded-full bg-blue-600 border-4 border-indigo-700 flex items-center justify-center text-lg shadow-lg">
                    📷
                  </div>
                </div>
                <label
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black transition cursor-pointer ${
                    uploadingPhoto
                      ? "bg-white/10 text-blue-100 cursor-not-allowed"
                      : "bg-white text-indigo-700 hover:bg-slate-100"
                  }`}
                >
                  {uploadingPhoto ? "⏳ Uploading..." : "📷 Change Photo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProfileImageChange}
                    disabled={uploadingPhoto}
                  />
                </label>

                <p className="text-xs text-blue-100 mt-2">
                  JPG, PNG or WEBP • Max 5MB
                </p>
                <h2 className="text-3xl font-black mt-6 break-words">
                  {userName}
                </h2>

                <p className="text-blue-100 mt-2 break-all">{userEmail}</p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-wider">
                  {isAdmin ? "🛡️ Administrator" : "🛍️ Customer"}
                </span>

                {/* PHOTO STATUS */}

                <div className="w-full mt-8">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-blue-100 uppercase tracking-widest font-black">
                          Profile Photo
                        </p>

                        <p className="font-black mt-1">
                          {profileImage ? "Photo Active" : "Initial Avatar"}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        {profileImage ? "✅" : "👤"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCOUNT MINI INFO */}

                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <p className="text-xs text-blue-100 uppercase tracking-widest font-black">
                      Status
                    </p>

                    <p className="text-lg font-black mt-1">Active</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <p className="text-xs text-blue-100 uppercase tracking-widest font-black">
                      Account
                    </p>

                    <p className="text-lg font-black mt-1">#{user.id ?? "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCOUNT DETAILS */}

            <div className="p-6 md:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-black">
                  Personal Information
                </p>

                <h2 className="text-3xl font-black mt-2">Account Details</h2>

                <p className="text-slate-500 mt-2 leading-7">
                  Your current ShopSphere account information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-blue-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                      👤
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                        Full Name
                      </p>

                      <p className="font-black text-lg mt-1 break-words">
                        {userName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-blue-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
                      ✉️
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                        Email
                      </p>

                      <p className="font-black text-lg mt-1 break-words">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                      🏷️
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-blue-500 font-black">
                        Account Type
                      </p>

                      <p className="font-black text-lg mt-1 capitalize text-blue-900">
                        {userRole}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      🆔
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-emerald-500 font-black">
                        Account ID
                      </p>

                      <p className="font-black text-lg mt-1 text-emerald-900">
                        #{user.id ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFILE IMAGE INFO */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          const fallback =
                            event.currentTarget.nextElementSibling;

                          if (fallback) {
                            fallback.classList.remove("hidden");
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className={`w-full h-full flex items-center justify-center text-2xl font-black text-slate-700 ${
                        profileImage ? "hidden" : ""
                      }`}
                    >
                      {initial}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                      Profile Image
                    </p>

                    <h3 className="font-black text-lg mt-1">
                      {profileImage
                        ? "Profile photo is active"
                        : "No profile photo"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 leading-6">
                      Your ShopSphere profile image is displayed in your account
                      section.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECURITY */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 text-white p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                      Account Security
                    </p>

                    <p className="font-black mt-1">
                      Your ShopSphere session is protected.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 text-sm font-black text-emerald-300">
                    🔒 Protected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-black">
              Quick Access
            </p>

            <h2 className="text-2xl md:text-3xl font-black mt-2">
              Everything you need
            </h2>

            <p className="text-slate-500 mt-2">
              Jump directly to the most useful parts of your ShopSphere account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <Link
              to="/orders"
              className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                  📦
                </div>

                <span className="text-slate-300 group-hover:text-blue-600 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="text-xl font-black mt-6">My Orders</h3>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                View, review, and track your orders.
              </p>

              <p className="text-blue-600 font-black mt-5">View Orders →</p>
            </Link>

            <Link
              to="/wishlist"
              className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-2xl">
                  ❤️
                </div>

                <span className="text-slate-300 group-hover:text-red-600 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="text-xl font-black mt-6">Wishlist</h3>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                Keep your favorite products close.
              </p>

              <p className="text-red-600 font-black mt-5">Open Wishlist →</p>
            </Link>

            <Link
              to="/notifications"
              className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                  🔔
                </div>

                <span className="text-slate-300 group-hover:text-amber-600 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="text-xl font-black mt-6">Notifications</h3>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                Stay updated with your ShopSphere account.
              </p>

              <p className="text-amber-600 font-black mt-5">
                View Notifications →
              </p>
            </Link>

            <Link
              to="/products"
              className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
                  🛍️
                </div>

                <span className="text-slate-300 group-hover:text-emerald-600 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="text-xl font-black mt-6">Continue Shopping</h3>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                Explore products and discover something new.
              </p>

              <p className="text-emerald-600 font-black mt-5">Browse Store →</p>
            </Link>
          </div>
        </section>

        {/* =================================================
            ACCOUNT STATUS
        ================================================= */}

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
                ✅
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                  Account Status
                </p>

                <p className="text-lg font-black text-emerald-700 mt-1">
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                🔒
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                  Security
                </p>

                <p className="text-lg font-black text-blue-700 mt-1">
                  Protected
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">
                ⭐
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                  Membership
                </p>

                <p className="text-lg font-black text-violet-700 mt-1">
                  ShopSphere Member
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <section className="mt-10 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-black">
                Account Session
              </p>

              <h3 className="text-xl md:text-2xl font-black mt-1">
                Sign out of ShopSphere
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Your account data remains safe and you can sign in again
                anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="self-start md:self-auto rounded-2xl bg-red-600 hover:bg-red-700 text-white px-7 py-3.5 font-black transition shadow-lg shadow-red-600/10"
            >
              🚪 Logout
            </button>
          </div>
        </section>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-slate-950 text-white mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="inline-flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                  🛍️
                </div>

                <h3 className="text-xl font-black">ShopSphere</h3>
              </div>

              <p className="text-slate-400 text-sm mt-4 max-w-sm leading-7">
                Your trusted online shopping platform for discovering products
                and managing your shopping experience.
              </p>
            </div>

            <div>
              <h4 className="font-black text-lg">Shop</h4>

              <div className="flex flex-col gap-3 mt-4 text-sm text-slate-400">
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>

                <Link to="/products" className="hover:text-white transition">
                  Products
                </Link>

                <Link to="/orders" className="hover:text-white transition">
                  Orders
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-black text-lg">Account</h4>

              <div className="flex flex-col gap-3 mt-4 text-sm text-slate-400">
                <Link to="/profile" className="hover:text-white transition">
                  Profile
                </Link>

                <Link to="/wishlist" className="hover:text-white transition">
                  Wishlist
                </Link>

                <Link
                  to="/notifications"
                  className="hover:text-white transition"
                >
                  Notifications
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Profile;
