import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const SERVER_URL = "http://localhost:5000";

// ============================================================
// HOME BACKGROUND IMAGE
// client/public/images/ecommerce-hero.jpg
// ============================================================

const HOME_BACKGROUND = "/images/ecommerce-hero.jpg";

// ============================================================
// COUNTRY / LOCATION HELPERS
// ============================================================

const getLocationName = (address = {}) => {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state ||
    "Current Location"
  );
};

// ============================================================
// HOME
// ============================================================

function Home() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // ============================================================
  // LOCATION STATE
  // ============================================================

  const [currentLocation, setCurrentLocation] = useState({
    city: "Injibara",
    country: "Ethiopia",
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      if (response.data?.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts([]);

        setError(response.data?.message || "Products could not be loaded.");
      }
    } catch (requestError) {
      console.error("HOME PRODUCT ERROR:", requestError);

      setProducts([]);

      if (requestError.response) {
        setError(
          requestError.response.data?.message ||
            `Server error: ${requestError.response.status}`,
        );
      } else if (requestError.request) {
        setError(
          "Cannot connect to ShopSphere server. Please make sure the backend is running on port 5000.",
        );
      } else {
        setError(requestError.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(response.data?.categories || []);
    } catch (requestError) {
      console.error("HOME CATEGORY ERROR:", requestError);

      setCategories([]);
    }
  };

  // ============================================================
  // AUTH SYNC
  // ============================================================

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

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // ============================================================
  // IMAGE URL
  // ============================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `${SERVER_URL}${image}`;
    }

    return `${SERVER_URL}/uploads/${image}`;
  };

  // ============================================================
  // FEATURED PRODUCTS
  // ============================================================

  const featuredProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      .slice(0, 10);
  }, [products]);

  // ============================================================
  // LOCATION / GPS
  // ============================================================

  const handleGetLocation = () => {
    setLocationError("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationLoading(false);

      setLocationError("GPS is not supported by this browser.");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        let city = "Current Location";
        let country = "Ethiopia";

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();

            const address = data?.address || {};

            city = getLocationName(address);
            country = address.country || "Ethiopia";
          }
        } catch (reverseError) {
          console.error("GPS REVERSE GEOCODING ERROR:", reverseError);

          city = "Current Location";
        }

        setCurrentLocation({
          city,
          country,
          latitude,
          longitude,
          accuracy,
        });

        setLocationLoading(false);
      },

      (geoError) => {
        console.error("GPS ERROR:", geoError);

        setLocationLoading(false);

        switch (geoError.code) {
          case 1:
            setLocationError(
              "Location permission denied. Please allow location access.",
            );
            break;

          case 2:
            setLocationError("Current location is unavailable.");
            break;

          case 3:
            setLocationError("Location request timed out. Please try again.");
            break;

          default:
            setLocationError("Unable to get your current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // ============================================================
  // SUBSCRIBE
  // ============================================================

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubscribed(true);
    setEmail("");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  // ============================================================
  // CLOSE MOBILE MENU
  // ============================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl animate-pulse">
            🛍️
          </div>

          <h2 className="text-2xl font-black text-slate-900 mt-5">
            Loading ShopSphere...
          </h2>

          <p className="text-slate-500 mt-2">
            Please wait while we prepare the store.
          </p>

          <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden mx-auto mt-5">
            <div className="w-1/2 h-full bg-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HERO ANIMATIONS
      ===================================================== */}
      <style>
        {`
          /* ==================================================
             SHOPSPHERE HEADER — NAVY + GOLD
          ================================================== */
          .shopsphere-header {
            background: #193a63;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 18px rgba(15, 23, 42, 0.18);
          }

          .shopsphere-logo { text-decoration: none; }

          .shopsphere-logo-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 13px;
            background: #2563eb;
            color: #ffffff;
            font-size: 21px;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
          }

          .shopsphere-brand {
            margin: 0;
            color: #ffffff;
            font-size: 18px;
            font-weight: 900;
            line-height: 1.1;
          }

          .shopsphere-tagline {
            margin: 3px 0 0;
            color: #e0bd3e;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.18em;
          }

          .shopsphere-nav {
            position: relative;
            color: #e0bd3e;
            font-size: 15px;
            font-weight: 800;
            text-decoration: none;
            transition: color 0.25s ease, transform 0.25s ease;
          }

          .shopsphere-nav:hover {
            color: #f6d867;
            transform: translateY(-1px);
          }

          .shopsphere-nav.active { color: #f6d867; }

          .shopsphere-nav.active::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            height: 3px;
            border-radius: 999px;
            background: #f6d867;
          }

          .shopsphere-auth {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            padding: 10px 18px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 900;
            text-decoration: none;
            transition: all 0.25s ease;
          }

          .shopsphere-login {
            color: #e0bd3e;
            border: 1px solid rgba(224, 189, 62, 0.75);
            background: transparent;
          }

          .shopsphere-login:hover {
            color: #193a63;
            background: #e0bd3e;
            border-color: #e0bd3e;
          }

          .shopsphere-signup {
            color: #193a63;
            background: #e0bd3e;
            border: 1px solid #e0bd3e;
            box-shadow: 0 6px 16px rgba(224, 189, 62, 0.18);
          }

          .shopsphere-signup:hover {
            background: #f6d867;
            border-color: #f6d867;
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(224, 189, 62, 0.24);
          }

          .shopsphere-logout {
            min-height: 42px;
            padding: 10px 18px;
            border: 1px solid #e0bd3e;
            border-radius: 10px;
            background: #e0bd3e;
            color: #193a63;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .shopsphere-logout:hover {
            background: #f6d867;
            border-color: #f6d867;
            transform: translateY(-1px);
          }

          .shopsphere-mobile-btn {
            width: 44px;
            height: 44px;
            border: 1px solid rgba(224, 189, 62, 0.35);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);
            color: #e0bd3e;
            font-size: 20px;
          }

          .shopsphere-mobile-menu {
            padding: 14px 0 18px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }

          .shopsphere-mobile-link {
            display: block;
            padding: 12px 15px;
            border-radius: 10px;
            color: #e0bd3e;
            font-weight: 800;
            text-decoration: none;
          }

          .shopsphere-mobile-link:hover {
            background: rgba(224, 189, 62, 0.1);
            color: #f6d867;
          }

          .shopsphere-mobile-login,
          .shopsphere-mobile-signup,
          .shopsphere-mobile-logout {
            display: block;
            width: 100%;
            margin-top: 8px;
            padding: 12px 15px;
            border-radius: 10px;
            font-weight: 900;
            text-align: left;
            text-decoration: none;
          }

          .shopsphere-mobile-login {
            border: 1px solid rgba(224, 189, 62, 0.75);
            color: #e0bd3e;
          }

          .shopsphere-mobile-signup {
            border: 1px solid #e0bd3e;
            background: #e0bd3e;
            color: #193a63;
          }

          .shopsphere-mobile-logout {
            border: none;
            background: #e0bd3e;
            color: #193a63;
          }

          /* ==================================================
             HERO — CLEAN, CENTERED, PROFESSIONAL
          ================================================== */
          .shopsphere-hero {
            position: relative;
            min-height: 680px;
            overflow: hidden;
          }

          .shopsphere-hero-bg {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transform: scale(1);
            animation: shopsphereHeroZoom 16s ease-in-out infinite alternate;
            will-change: transform;
          }

          @keyframes shopsphereHeroZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
          }

          .shopsphere-hero-content {
            animation: shopsphereHeroFloat 6s ease-in-out infinite;
            will-change: transform;
          }

          @keyframes shopsphereHeroFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }

          .shopsphere-hero-title {
            margin: 0;
            color: #e0bd3e;
            font-size: clamp(28px, 5vw, 54px);
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: 0.025em;
            text-transform: uppercase;
            text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
          }

          .shopsphere-hero-heading {
            margin: 18px 0 0;
            color: #ffffff;
            font-size: clamp(30px, 5vw, 52px);
            line-height: 1.15;
            font-weight: 900;
            text-shadow: 0 5px 24px rgba(0, 0, 0, 0.42);
          }

          .shopsphere-hero-description {
            max-width: 780px;
            margin: 18px auto 0;
            color: #f8fafc;
            font-size: clamp(16px, 2vw, 20px);
            line-height: 1.8;
            text-shadow: 0 3px 15px rgba(0, 0, 0, 0.32);
          }

          .shopsphere-hero-buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 14px;
            margin-top: 30px;
          }

          .shopsphere-hero-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 50px;
            padding: 13px 28px;
            border-radius: 11px;
            background: #e0bd3e;
            color: #193a63;
            font-size: 15px;
            font-weight: 900;
            text-decoration: none;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
            transition: all 0.25s ease;
          }

          .shopsphere-hero-button:hover {
            background: #f6d867;
            transform: translateY(-3px);
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.26);
          }

          .shopsphere-hero-button.secondary {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.42);
            backdrop-filter: blur(8px);
          }

          .shopsphere-hero-button.secondary:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          @media (max-width: 768px) {
            .shopsphere-hero { min-height: 620px; }
            .shopsphere-hero-content {
              padding-top: 30px;
              padding-bottom: 30px;
            }
            .shopsphere-hero-title {
              font-size: clamp(25px, 8vw, 40px);
            }
            .shopsphere-hero-heading {
              font-size: clamp(27px, 8vw, 42px);
            }
            .shopsphere-hero-description {
              font-size: 16px;
              line-height: 1.7;
            }
            .shopsphere-hero-button {
              width: 100%;
              max-width: 310px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .shopsphere-hero-bg,
            .shopsphere-hero-content {
              animation: none !important;
              transform: none !important;
            }
          }
        `}
      </style>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="shopsphere-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-6">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="shopsphere-logo flex items-center gap-3 shrink-0"
            >
              <div className="shopsphere-logo-icon">🛍️</div>

              <div className="hidden sm:block">
                <p className="shopsphere-brand">ShopSphere</p>
                <p className="shopsphere-tagline">Smart Shopping</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 ml-auto">
              <a href="#home" className="shopsphere-nav active">
                Home
              </a>

              <Link to="/products" className="shopsphere-nav">
                Products
              </Link>

              <a href="#about" className="shopsphere-nav">
                About
              </a>

              <a
                href="https://temare-portfolio.netlify.app/"
                target="_blank"
                rel="noreferrer"
                className="shopsphere-nav"
              >
                Portfolio
              </a>

              <a href="#contact" className="shopsphere-nav">
                Contact
              </a>

              <Link to="/register" className="shopsphere-signup">
                Signup
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              {token && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shopsphere-logout"
                >
                  Logout
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="lg:hidden shopsphere-mobile-btn"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden shopsphere-mobile-menu">
              <a
                href="#home"
                onClick={closeMobileMenu}
                className="shopsphere-mobile-link"
              >
                Home
              </a>

              <Link
                to="/products"
                onClick={closeMobileMenu}
                className="shopsphere-mobile-link"
              >
                Products
              </Link>

              <a
                href="#about"
                onClick={closeMobileMenu}
                className="shopsphere-mobile-link"
              >
                About
              </a>

              <a
                href="https://temare-portfolio.netlify.app/"
                target="_blank"
                rel="noreferrer"
                onClick={closeMobileMenu}
                className="shopsphere-mobile-link"
              >
                Portfolio
              </a>

              <a
                href="#contact"
                onClick={closeMobileMenu}
                className="shopsphere-mobile-link"
              >
                Contact
              </a>

              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="shopsphere-mobile-signup"
              >
                Signup
              </Link>

              {token && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="shopsphere-mobile-logout"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      {/* =====================================================
          HERO
      ===================================================== */}
      <section id="home" className="shopsphere-hero relative overflow-hidden">
        <div
          className="absolute inset-0 shopsphere-hero-bg"
          style={{
            backgroundImage: `url("${HOME_BACKGROUND}")`,
          }}
        />

        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />

        <div className="relative z-10 min-h-[680px] flex items-center justify-center px-6 py-16">
          <div className="shopsphere-hero-content max-w-5xl mx-auto text-center">
            <p className="shopsphere-hero-title">Welcome to ShopSphere</p>

            <h1 className="shopsphere-hero-heading">
              Your shopping journey starts here.
            </h1>

            <p className="shopsphere-hero-description">
              Discover quality products, enjoy a secure shopping experience, and
              get everything you need from one convenient online store.
            </p>

            <div className="shopsphere-hero-buttons">
              <Link to="/products" className="shopsphere-hero-button">
                🛍️ Shop Now
              </Link>

              <a href="#about" className="shopsphere-hero-button secondary">
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          CATEGORIES
      ===================================================== */}
      /
      <section className="home-section categories-section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          {/* =========================
        SECTION HEADER
    ========================= */}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p
                className="
          text-[#b89420]
          uppercase
          tracking-[0.2em]
          text-xs
          font-black
        "
              >
                Shop By Category
              </p>

              <h2
                className="
          text-3xl
          md:text-5xl
          font-black
          mt-3
          text-[#193a63]
          leading-tight
        "
              >
                Explore Categories
              </h2>

              <p
                className="
          text-slate-500
          mt-4
          text-base
          md:text-lg
          leading-7
        "
              >
                Browse our product categories and quickly find what you need
                from one convenient online store.
              </p>
            </div>

            {/* VIEW ALL */}

            <Link
              to="/products"
              className="
          group
          inline-flex
          items-center
          justify-center
          gap-2
          self-start
          md:self-auto
          rounded-xl
          border
          border-[#193a63]/20
          bg-white
          px-6
          py-3
          text-sm
          font-black
          text-[#193a63]
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-[#193a63]
          hover:text-white
          hover:border-[#193a63]
          hover:shadow-lg
        "
            >
              View All
              <span
                className="
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
              >
                →
              </span>
            </Link>
          </div>

          {/* =========================
        CATEGORY GRID
    ========================= */}

          <div
            className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-4
      gap-6
    "
          >
            {[
              {
                icon: "📱",
                name: "Electronics",
                text: "Phones, laptops, accessories and smart devices.",
                number: "01",
              },
              {
                icon: "👕",
                name: "Clothing",
                text: "Discover everyday fashion, style and essentials.",
                number: "02",
              },
              {
                icon: "📚",
                name: "Books",
                text: "Learn, read and explore with books for every interest.",
                number: "03",
              },
              {
                icon: "🎁",
                name: "More",
                text: "Discover more useful products for your everyday needs.",
                number: "04",
              },
            ].map((item) => (
              <Link
                key={item.name}
                to="/products"
                className="
            category-card
            group
            relative
            overflow-hidden
            bg-white
            rounded-[1.75rem]
            border
            border-slate-200
            p-7
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-[#d7b536]/60
            hover:shadow-[0_20px_45px_rgba(25,58,99,0.11)]
          "
              >
                {/* GOLD TOP LINE */}

                <div
                  className="
            absolute
            top-0
            left-0
            right-0
            h-1
            bg-[#d7b536]
            scale-x-0
            origin-left
            transition-transform
            duration-500
            group-hover:scale-x-100
          "
                />

                {/* CATEGORY NUMBER */}

                <div
                  className="
            absolute
            top-5
            right-5
            text-xs
            font-black
            tracking-wider
            text-slate-300
            group-hover:text-[#d7b536]
            transition-colors
            duration-300
          "
                >
                  {item.number}
                </div>

                {/* ICON */}

                <div
                  className="
            category-icon
            w-16
            h-16
            rounded-2xl
            bg-[#193a63]
            flex
            items-center
            justify-center
            text-3xl
            shadow-lg
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-2
          "
                >
                  {item.icon}
                </div>

                {/* NAME */}

                <h3
                  className="
            text-xl
            font-black
            mt-6
            text-[#193a63]
          "
                >
                  {item.name}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
            text-sm
            text-slate-500
            mt-3
            leading-7
            min-h-[56px]
          "
                >
                  {item.text}
                </p>

                {/* SHOP NOW */}

                <div
                  className="
            flex
            items-center
            gap-2
            mt-6
            text-sm
            font-black
            text-[#b89420]
          "
                >
                  <span>Shop Now</span>

                  <span
                    className="
              transition-transform
              duration-300
              group-hover:translate-x-2
            "
                  >
                    →
                  </span>
                </div>

                {/* DECORATIVE CIRCLE */}

                <div
                  className="
            absolute
            -bottom-10
            -right-10
            w-32
            h-32
            rounded-full
            bg-[#193a63]/[0.035]
            transition-transform
            duration-500
            group-hover:scale-125
          "
                />
              </Link>
            ))}
          </div>

          {/* =========================
        BOTTOM CATEGORY STRIP
    ========================= */}

          <div
            className="
      mt-10
      rounded-3xl
      bg-[#193a63]
      p-6
      md:p-7
      shadow-xl
    "
          >
            <div
              className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-6
      "
            >
              <div>
                <p
                  className="
            text-[#f6d867]
            text-xs
            uppercase
            tracking-[0.18em]
            font-black
          "
                >
                  ShopSphere
                </p>

                <h3
                  className="
            text-white
            text-xl
            md:text-2xl
            font-black
            mt-2
          "
                >
                  Everything you need, all in one place.
                </h3>
              </div>

              <Link
                to="/products"
                className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#d7b536]
            hover:bg-[#f6d867]
            text-[#193a63]
            px-6
            py-3
            font-black
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
          "
              >
                Start Shopping
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
    FEATURED PRODUCTS
===================================================== */}
      <section className="home-section featured-section bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* =========================
        SECTION HEADER
    ========================= */}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-[#b89420] uppercase tracking-[0.2em] text-xs font-black">
                Our Store
              </p>

              <h2 className="text-3xl md:text-5xl font-black mt-3 text-[#193a63] leading-tight">
                Featured Products
              </h2>

              <p className="text-slate-500 mt-4 text-base md:text-lg leading-7">
                Discover some of our most popular products, carefully presented
                to make your shopping experience simple and convenient.
              </p>
            </div>

            <Link
              to="/products"
              className="
          group
          inline-flex
          items-center
          gap-2
          self-start
          md:self-auto
          rounded-xl
          border
          border-[#193a63]/20
          bg-white
          px-6
          py-3
          text-sm
          font-black
          text-[#193a63]
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-[#d7b536]
          hover:shadow-lg
        "
            >
              View All Products
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* =========================
        ERROR MESSAGE
    ========================= */}

          {error && (
            <div className="mb-10 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div
                  className="
            w-14
            h-14
            shrink-0
            rounded-2xl
            bg-red-100
            flex
            items-center
            justify-center
            text-2xl
          "
                >
                  ⚠️
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black text-red-800">
                    Unable to load products
                  </h3>

                  <p className="text-red-700 mt-2 leading-6">{error}</p>

                  <button
                    type="button"
                    onClick={loadProducts}
                    className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-red-600
                hover:bg-red-700
                text-white
                px-5
                py-2.5
                font-black
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
                  >
                    🔄 Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================
        PRODUCT GRID
    ========================= */}

          {!error && featuredProducts.length > 0 && (
            <>
              <div
                className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-5
          gap-6
        "
              >
                {featuredProducts.map((product) => {
                  const imageUrl = getImageUrl(product.image);

                  const stock = Number(product.stock || 0);

                  const price = Number(product.price || 0);

                  const category = product.category_name || "Product";

                  return (
                    <article
                      key={product.id}
                      className="
                  group
                  relative
                  bg-white
                  rounded-[1.75rem]
                  border
                  border-slate-200
                  overflow-hidden
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:border-[#d7b536]/50
                  hover:shadow-[0_20px_45px_rgba(25,58,99,0.12)]
                "
                    >
                      {/* =========================
                    PRODUCT IMAGE
                ========================= */}

                      <div
                        className="
                  relative
                  h-60
                  bg-slate-100
                  overflow-hidden
                "
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-110
                      "
                            onError={(event) => {
                              event.currentTarget.style.display = "none";

                              const fallback =
                                event.currentTarget.parentElement?.querySelector(
                                  ".home-product-fallback",
                                );

                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}

                        {/* IMAGE FALLBACK */}

                        <div
                          className={`
                      home-product-fallback
                      absolute
                      inset-0
                      ${imageUrl ? "hidden" : "flex"}
                      items-center
                      justify-center
                      bg-slate-100
                    `}
                        >
                          <div className="text-center">
                            <div className="text-5xl">🛍️</div>

                            <p className="text-slate-400 text-sm mt-2 font-semibold">
                              No Image
                            </p>
                          </div>
                        </div>

                        {/* IMAGE OVERLAY */}

                        <div
                          className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#193a63]/35
                    via-transparent
                    to-transparent
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-500
                  "
                        />

                        {/* STOCK BADGE */}

                        <div className="absolute top-4 left-4">
                          {stock > 0 ? (
                            <span
                              className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        bg-[#193a63]
                        text-white
                        text-[11px]
                        font-black
                        px-3
                        py-1.5
                        shadow-lg
                      "
                            >
                              <span className="text-[#f6d867]">✓</span>
                              In Stock
                            </span>
                          ) : (
                            <span
                              className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        bg-red-600
                        text-white
                        text-[11px]
                        font-black
                        px-3
                        py-1.5
                        shadow-lg
                      "
                            >
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* CATEGORY BADGE */}

                        <div className="absolute top-4 right-4">
                          <span
                            className="
                      rounded-full
                      bg-white/95
                      backdrop-blur
                      text-[#193a63]
                      text-[10px]
                      uppercase
                      tracking-wider
                      font-black
                      px-3
                      py-1.5
                      shadow
                    "
                          >
                            {category}
                          </span>
                        </div>
                      </div>

                      {/* =========================
                    PRODUCT BODY
                ========================= */}

                      <div className="p-5">
                        {/* CATEGORY */}

                        <p
                          className="
                    text-[10px]
                    uppercase
                    tracking-[0.16em]
                    text-[#b89420]
                    font-black
                  "
                        >
                          {category}
                        </p>

                        {/* PRODUCT NAME */}

                        <h3
                          className="
                    text-lg
                    font-black
                    text-[#193a63]
                    mt-2
                    line-clamp-1
                  "
                        >
                          {product.name}
                        </h3>

                        {/* DESCRIPTION */}

                        <p
                          className="
                    text-sm
                    text-slate-500
                    mt-2
                    leading-6
                    line-clamp-2
                    min-h-[48px]
                  "
                        >
                          {product.description ||
                            "Quality product available at ShopSphere."}
                        </p>

                        {/* PRICE + STOCK */}

                        <div
                          className="
                    flex
                    items-end
                    justify-between
                    gap-3
                    mt-6
                    pt-5
                    border-t
                    border-slate-100
                  "
                        >
                          <div>
                            <p
                              className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-slate-400
                        font-black
                      "
                            >
                              Price
                            </p>

                            <p
                              className="
                        text-xl
                        font-black
                        text-[#193a63]
                        mt-1
                      "
                            >
                              ${price.toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-slate-400
                        font-black
                      "
                            >
                              Availability
                            </p>

                            <p
                              className={`
                        text-xs
                        font-black
                        mt-1
                        ${stock > 0 ? "text-emerald-600" : "text-red-600"}
                      `}
                            >
                              {stock > 0 ? `${stock} available` : "Unavailable"}
                            </p>
                          </div>
                        </div>

                        {/* VIEW PRODUCT BUTTON */}

                        <Link
                          to={`/products/${product.id}`}
                          className="
                      group/product
                      flex
                      items-center
                      justify-center
                      gap-2
                      mt-5
                      rounded-xl
                      bg-[#193a63]
                      hover:bg-[#244b7d]
                      text-white
                      py-3.5
                      text-sm
                      font-black
                      shadow-sm
                      transition-all
                      duration-300
                      hover:shadow-lg
                    "
                        >
                          View Product
                          <span
                            className="
                      transition-transform
                      duration-300
                      group-hover/product:translate-x-1
                    "
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* =========================
            VIEW MORE
        ========================= */}

              {products.length > 10 && (
                <div className="text-center mt-12">
                  <Link
                    to="/products"
                    className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[#193a63]/20
                bg-white
                text-[#193a63]
                px-8
                py-3.5
                font-black
                shadow-sm
                transition-all
                duration-300
                hover:bg-[#193a63]
                hover:text-white
                hover:-translate-y-1
                hover:shadow-lg
              "
                  >
                    View More Products
                    <span>→</span>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* =========================
        EMPTY STATE
    ========================= */}

          {!error && featuredProducts.length === 0 && (
            <div
              className="
        bg-white
        rounded-[2rem]
        border
        border-slate-200
        p-12
        md:p-16
        text-center
        shadow-sm
      "
            >
              <div
                className="
          w-20
          h-20
          mx-auto
          rounded-3xl
          bg-[#193a63]
          flex
          items-center
          justify-center
          text-4xl
          shadow-lg
        "
              >
                📦
              </div>

              <h3
                className="
          text-2xl
          md:text-3xl
          font-black
          text-[#193a63]
          mt-6
        "
              >
                No Products Available
              </h3>

              <p
                className="
          text-slate-500
          mt-3
          max-w-lg
          mx-auto
          leading-7
        "
              >
                There are currently no featured products available in the store.
                Please check again later.
              </p>

              <Link
                to="/products"
                className="
            inline-flex
            items-center
            gap-2
            mt-7
            rounded-xl
            bg-[#193a63]
            hover:bg-[#244b7d]
            text-white
            px-7
            py-3.5
            font-black
            shadow-md
            transition-all
            duration-300
            hover:-translate-y-1
          "
              >
                Browse Products
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>
      {/* =====================================================
          PROMOTION
      ===================================================== */}
      <section className="home-section promotion-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="promotion-card relative overflow-hidden rounded-[2rem] bg-slate-950 text-white">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="promotion-content relative p-8 md:p-12 lg:p-14">
            <span className="promotion-badge inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest">
              Special Offer
            </span>

            <h2 className="text-3xl md:text-5xl font-black mt-5">
              Shop smarter.
              <span className="block text-blue-400">Save more.</span>
            </h2>

            <p className="text-slate-300 max-w-2xl mt-4 leading-7">
              Discover great products and enjoy a simple shopping experience
              with ShopSphere.
            </p>

            <Link
              to="/products"
              className="promotion-button inline-flex mt-7 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 px-7 py-3.5 font-black"
            >
              Shop Deals →
            </Link>
          </div>
        </div>
      </section>
      {/* =====================================================
          ABOUT
      ===================================================== */}
      <section
        id="about"
        className="scroll-mt-24 bg-slate-50 border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          {/* =========================
        SECTION HEADER
    ========================= */}

          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[#c59f24] uppercase tracking-[0.2em] text-xs font-black">
              About ShopSphere
            </p>

            <h2 className="text-3xl md:text-5xl font-black mt-3 text-[#193a63] leading-tight">
              A smarter way to shop online.
            </h2>

            <p className="text-slate-500 mt-5 text-base md:text-lg leading-8">
              ShopSphere is a modern e-commerce platform designed to make online
              shopping simple, secure, convenient, and enjoyable.
            </p>
          </div>

          {/* =========================
        MAIN ABOUT CONTENT
    ========================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* =========================
          PHOTO
      ========================= */}

            <div className="relative flex justify-center">
              {/* Decorative background */}
              <div
                className="
            absolute
            -inset-6
            rounded-[2.5rem]
            bg-gradient-to-br
            from-[#193a63]/10
            via-[#d7b536]/10
            to-blue-100/20
            blur-2xl
          "
              />

              {/* Image container */}
              <div
                className="
            relative
            w-full
            max-w-lg
            rounded-[2.5rem]
            p-3
            bg-white
            border
            border-slate-200
            shadow-[0_25px_60px_rgba(25,58,99,0.12)]
          "
              >
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img
                    src="/images/admin-profile.jpg"
                    alt="ShopSphere"
                    className="
                w-full
                h-[500px]
                md:h-[560px]
                object-cover
                transition-transform
                duration-700
                hover:scale-105
              "
                  />

                  {/* Image overlay */}
                  <div
                    className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#193a63]/75
                via-transparent
                to-transparent
              "
                  />

                  {/* Image bottom label */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                    <p className="text-[#f6d867] text-xs uppercase tracking-[0.18em] font-black">
                      ShopSphere
                    </p>

                    <h3 className="text-white text-2xl md:text-3xl font-black mt-2">
                      Built for better shopping.
                    </h3>

                    <p className="text-blue-100 text-sm mt-2 leading-6">
                      Quality, convenience and trust in one digital shopping
                      experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
          TEXT CONTENT
      ========================= */}

            <div>
              <p className="text-[#c59f24] uppercase tracking-[0.2em] text-xs font-black">
                Why ShopSphere
              </p>

              <h3 className="text-3xl md:text-4xl font-black mt-3 text-[#193a63] leading-tight">
                Making everyday online shopping easier.
              </h3>

              <p className="text-slate-500 mt-5 leading-8 text-base">
                ShopSphere brings customers and quality products together
                through a clean, user-friendly online shopping platform. Our
                goal is to create a smooth experience from discovering products
                to completing an order.
              </p>

              <p className="text-slate-500 mt-4 leading-8 text-base">
                Customers can explore products by category, view detailed
                product information, manage their shopping cart, and enjoy a
                convenient digital shopping experience from one trusted
                platform.
              </p>

              {/* =========================
            FEATURE CARDS
        ========================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                {/* EASY SHOPPING */}
                <div
                  className="
              group
              rounded-2xl
              bg-white
              border
              border-slate-200
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#d7b536]/50
              hover:shadow-lg
            "
                >
                  <div
                    className="
                w-12
                h-12
                rounded-xl
                bg-[#193a63]
                flex
                items-center
                justify-center
                text-2xl
                shadow-md
              "
                  >
                    🛍️
                  </div>

                  <h4 className="font-black text-[#193a63] text-lg mt-4">
                    Easy Shopping
                  </h4>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Discover products quickly with a simple and intuitive
                    shopping experience.
                  </p>
                </div>

                {/* SECURE */}
                <div
                  className="
              group
              rounded-2xl
              bg-white
              border
              border-slate-200
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#d7b536]/50
              hover:shadow-lg
            "
                >
                  <div
                    className="
                w-12
                h-12
                rounded-xl
                bg-[#193a63]
                flex
                items-center
                justify-center
                text-2xl
                shadow-md
              "
                  >
                    🔒
                  </div>

                  <h4 className="font-black text-[#193a63] text-lg mt-4">
                    Secure Experience
                  </h4>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Designed to give customers a reliable and trusted online
                    shopping journey.
                  </p>
                </div>

                {/* QUALITY */}
                <div
                  className="
              group
              rounded-2xl
              bg-white
              border
              border-slate-200
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#d7b536]/50
              hover:shadow-lg
            "
                >
                  <div
                    className="
                w-12
                h-12
                rounded-xl
                bg-[#193a63]
                flex
                items-center
                justify-center
                text-2xl
                shadow-md
              "
                  >
                    ⭐
                  </div>

                  <h4 className="font-black text-[#193a63] text-lg mt-4">
                    Quality Products
                  </h4>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Explore organized products with clear information and
                    convenient access.
                  </p>
                </div>

                {/* CUSTOMER FOCUS */}
                <div
                  className="
              group
              rounded-2xl
              bg-white
              border
              border-slate-200
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#d7b536]/50
              hover:shadow-lg
            "
                >
                  <div
                    className="
                w-12
                h-12
                rounded-xl
                bg-[#193a63]
                flex
                items-center
                justify-center
                text-2xl
                shadow-md
              "
                  >
                    ❤️
                  </div>

                  <h4 className="font-black text-[#193a63] text-lg mt-4">
                    Customer Focus
                  </h4>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Every part of ShopSphere is designed with customer
                    convenience and satisfaction in mind.
                  </p>
                </div>
              </div>

              {/* =========================
            MISSION / VISION
        ========================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                {/* MISSION */}
                <div
                  className="
              rounded-2xl
              bg-[#193a63]
              p-6
              border
              border-[#193a63]
              shadow-lg
            "
                >
                  <p className="text-[#f6d867] text-xs uppercase tracking-[0.17em] font-black">
                    Our Mission
                  </p>

                  <p className="text-white mt-3 leading-7 font-semibold">
                    To make online shopping easier, safer, and more convenient
                    for everyone.
                  </p>
                </div>

                {/* VISION */}
                <div
                  className="
              rounded-2xl
              bg-white
              p-6
              border
              border-[#d7b536]/40
              shadow-sm
            "
                >
                  <p className="text-[#b08c16] text-xs uppercase tracking-[0.17em] font-black">
                    Our Vision
                  </p>

                  <p className="text-[#193a63] mt-3 leading-7 font-semibold">
                    To become a trusted and user-friendly digital marketplace
                    that connects customers with quality products.
                  </p>
                </div>
              </div>

              {/* =========================
            BUTTON
        ========================= */}

              <Link
                to="/products"
                className="
            inline-flex
            items-center
            justify-center
            mt-9
            rounded-xl
            bg-[#193a63]
            hover:bg-[#244b7d]
            text-white
            px-8
            py-3.5
            font-black
            shadow-lg
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-xl
          "
              >
                Explore Products →
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          WHY SHOPSPHERE
      ===================================================== */}
      <section className="home-section why-section bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          {/* =========================
        SECTION HEADER
    ========================= */}

          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="inline-block text-[#b89420] uppercase tracking-[0.2em] text-xs font-black">
              Why ShopSphere
            </p>

            <h2 className="text-3xl md:text-5xl font-black mt-3 text-[#193a63] leading-tight">
              Built for better shopping.
            </h2>

            <p className="text-slate-500 mt-5 text-base md:text-lg leading-8">
              Everything you need for a smooth, convenient, and trusted online
              shopping experience.
            </p>
          </div>

          {/* =========================
        FEATURE CARDS
    ========================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* FAST DELIVERY */}
            <div
              className="
          why-card
          group
          relative
          bg-white
          rounded-3xl
          border
          border-slate-200
          p-7
          shadow-sm
          overflow-hidden
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-[#d7b536]/50
          hover:shadow-[0_20px_40px_rgba(25,58,99,0.10)]
        "
            >
              {/* top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#d7b536]" />

              <div
                className="
            why-icon
            w-14
            h-14
            rounded-2xl
            bg-[#193a63]
            flex
            items-center
            justify-center
            text-2xl
            shadow-lg
            transition-transform
            duration-300
            group-hover:scale-110
          "
              >
                🚚
              </div>

              <h3 className="text-lg font-black mt-6 text-[#193a63]">
                Fast Delivery
              </h3>

              <p className="text-sm text-slate-500 mt-3 leading-7">
                Get your orders delivered quickly and safely with a convenient
                shopping experience.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#b89420]">
                <span>01</span>
                <span className="h-px w-8 bg-[#d7b536]" />
                <span>SHOP WITH CONFIDENCE</span>
              </div>
            </div>

            {/* SECURE SHOPPING */}
            <div
              className="
          why-card
          group
          relative
          bg-white
          rounded-3xl
          border
          border-slate-200
          p-7
          shadow-sm
          overflow-hidden
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-[#d7b536]/50
          hover:shadow-[0_20px_40px_rgba(25,58,99,0.10)]
        "
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#d7b536]" />

              <div
                className="
            why-icon
            w-14
            h-14
            rounded-2xl
            bg-[#193a63]
            flex
            items-center
            justify-center
            text-2xl
            shadow-lg
            transition-transform
            duration-300
            group-hover:scale-110
          "
              >
                🔒
              </div>

              <h3 className="text-lg font-black mt-6 text-[#193a63]">
                Secure Shopping
              </h3>

              <p className="text-sm text-slate-500 mt-3 leading-7">
                Your shopping experience is designed with security, trust, and
                reliable service in mind.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#b89420]">
                <span>02</span>
                <span className="h-px w-8 bg-[#d7b536]" />
                <span>SAFE & TRUSTED</span>
              </div>
            </div>

            {/* QUALITY PRODUCTS */}
            <div
              className="
          why-card
          group
          relative
          bg-white
          rounded-3xl
          border
          border-slate-200
          p-7
          shadow-sm
          overflow-hidden
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-[#d7b536]/50
          hover:shadow-[0_20px_40px_rgba(25,58,99,0.10)]
        "
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#d7b536]" />

              <div
                className="
            why-icon
            w-14
            h-14
            rounded-2xl
            bg-[#193a63]
            flex
            items-center
            justify-center
            text-2xl
            shadow-lg
            transition-transform
            duration-300
            group-hover:scale-110
          "
              >
                ⭐
              </div>

              <h3 className="text-lg font-black mt-6 text-[#193a63]">
                Quality Products
              </h3>

              <p className="text-sm text-slate-500 mt-3 leading-7">
                Discover useful products with clear information and competitive
                prices for everyday needs.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#b89420]">
                <span>03</span>
                <span className="h-px w-8 bg-[#d7b536]" />
                <span>QUALITY FIRST</span>
              </div>
            </div>

            {/* CUSTOMER SUPPORT */}
            <div
              className="
          why-card
          group
          relative
          bg-white
          rounded-3xl
          border
          border-slate-200
          p-7
          shadow-sm
          overflow-hidden
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-[#d7b536]/50
          hover:shadow-[0_20px_40px_rgba(25,58,99,0.10)]
        "
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#d7b536]" />

              <div
                className="
            why-icon
            w-14
            h-14
            rounded-2xl
            bg-[#193a63]
            flex
            items-center
            justify-center
            text-2xl
            shadow-lg
            transition-transform
            duration-300
            group-hover:scale-110
          "
              >
                🎧
              </div>

              <h3 className="text-lg font-black mt-6 text-[#193a63]">
                Customer Support
              </h3>

              <p className="text-sm text-slate-500 mt-3 leading-7">
                Get helpful assistance whenever you need support during your
                shopping journey.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#b89420]">
                <span>04</span>
                <span className="h-px w-8 bg-[#d7b536]" />
                <span>WE ARE HERE</span>
              </div>
            </div>
          </div>

          {/* =========================
        BOTTOM TRUST STRIP
    ========================= */}

          <div className="mt-10 rounded-3xl bg-[#193a63] p-7 md:p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-[#f6d867] text-xs uppercase tracking-[0.18em] font-black">
                  ShopSphere
                </p>

                <h3 className="text-white text-xl md:text-2xl font-black mt-2">
                  Simple. Secure. Convenient.
                </h3>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>

                  <div>
                    <p className="text-white font-black text-sm">Easy to Use</p>

                    <p className="text-blue-100 text-xs mt-1">
                      Simple navigation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>

                  <div>
                    <p className="text-white font-black text-sm">
                      Trusted Service
                    </p>

                    <p className="text-blue-100 text-xs mt-1">
                      Customer focused
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>

                  <div>
                    <p className="text-white font-black text-sm">
                      Better Shopping
                    </p>

                    <p className="text-blue-100 text-xs mt-1">
                      Designed for you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          CONTACT
      ===================================================== */}
      {/* =====================================================
    CONTACT
===================================================== */}
      <section
        id="contact"
        className="scroll-mt-24 bg-white border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* HEADER */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-blue-600 uppercase tracking-[0.18em] text-xs font-black">
              Contact Us
            </p>

            <h2 className="text-3xl md:text-5xl font-black mt-3 text-slate-900">
              Find Us & Contact Us
            </h2>

            <p className="text-slate-500 mt-3 leading-7">
              We are here to help you with your ShopSphere shopping experience.
            </p>
          </div>

          {/* MAP + CONTACT INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MAP */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <p className="text-blue-600 text-xs uppercase tracking-widest font-black">
                  Find Us
                </p>

                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  ShopSphere Location
                </h3>
              </div>

              <div className="h-[380px] bg-slate-100">
                <iframe
                  title="ShopSphere Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15654.75704152733!2d37.37526955!3d11.5976587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164627b001a1d13f%3A0x6b7b1b1b1b1b1b1b!2sBahir%20Dar%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1719293147570!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                  Address
                </p>

                <p className="text-slate-800 font-black text-lg mt-2">
                  Injibara, Amhara, Ethiopia
                </p>
              </div>
            </div>

            {/* GET IN TOUCH */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-7 md:p-8">
              <p className="text-blue-600 text-xs uppercase tracking-widest font-black">
                Get in Touch
              </p>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                We'd love to hear from you
              </h3>

              <p className="text-slate-500 mt-3 leading-7">
                Have a question or need help? Reach out to ShopSphere.
              </p>

              <div className="space-y-4 mt-7">
                {/* ADDRESS */}
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40 transition">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
                    📍
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-black">
                      Address
                    </p>

                    <p className="text-slate-800 font-bold mt-1">
                      Injibara, Amhara, Ethiopia
                    </p>
                  </div>
                </div>

                {/* PHONE */}
                <a
                  href="tel:+251919468741"
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/40 transition"
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                    📞
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-black">
                      Phone
                    </p>

                    <p className="text-slate-800 font-bold mt-1">
                      +251 919 468 741
                    </p>
                  </div>
                </a>

                {/* EMAIL */}
                <a
                  href="mailto:temaregudie@16gmail.com"
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 hover:border-purple-300 hover:bg-purple-50/40 transition"
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-100 flex items-center justify-center text-xl">
                    ✉️
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-black">
                      Email
                    </p>

                    <p className="text-slate-800 font-bold mt-1 break-all">
                      temaregudie@16gmail.com
                    </p>
                  </div>
                </a>

                {/* SUPPORT HOURS */}
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:bg-amber-50/40 transition">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                    🕐
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-black">
                      Support Hours
                    </p>

                    <p className="text-slate-800 font-bold mt-1">
                      Mon - Sat, 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* GPS */}
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                      Current Location
                    </p>

                    <p className="font-black text-slate-900 mt-1">
                      {currentLocation.city}, {currentLocation.country}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 text-xs font-black transition"
                  >
                    {locationLoading ? "Detecting..." : "Use GPS"}
                  </button>
                </div>

                {currentLocation.latitude !== null &&
                  currentLocation.longitude !== null && (
                    <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black">
                        GPS Detected
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        {currentLocation.latitude.toFixed(6)},{" "}
                        {currentLocation.longitude.toFixed(6)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Accuracy: ±{Math.round(currentLocation.accuracy || 0)} m
                      </p>
                    </div>
                  )}

                {locationError && (
                  <p className="text-xs text-red-600 font-semibold mt-3">
                    ❌ {locationError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SEND MESSAGE */}
          <div className="mt-8 bg-slate-50 rounded-[2rem] border border-slate-200 p-7 md:p-10">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-blue-600 text-xs uppercase tracking-widest font-black">
                Send Us a Message
              </p>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                We're ready to help
              </h3>

              <p className="text-slate-500 mt-3 leading-7">
                Send us your question, feedback or request.
              </p>
            </div>

            <form
              className="max-w-3xl mx-auto mt-8 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Your message has been sent successfully.");
              }}
            >
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Your Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Your Email
                </label>

                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Your Message
                </label>

                <textarea
                  required
                  rows="6"
                  placeholder="Write your message..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3.5 outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3.5 font-black transition shadow-lg shadow-blue-100"
              >
                📨 Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* =====================================================
          NEWSLETTER
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2rem] bg-blue-600 text-white p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-center">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest font-black">
                Stay Updated
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Get ShopSphere updates
              </h2>

              <p className="text-blue-100 mt-3 max-w-xl leading-7">
                Receive new product updates, special offers and shopping news.
              </p>
            </div>

            <div>
              {subscribed ? (
                <div className="rounded-2xl bg-white/15 border border-white/20 p-5">
                  <p className="font-black text-lg">✅ You're subscribed.</p>

                  <p className="text-blue-100 text-sm mt-1">
                    Thanks for joining ShopSphere.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 rounded-2xl bg-white text-slate-900 px-5 py-3.5 outline-none"
                  />

                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-950 hover:bg-slate-900 px-6 py-3.5 font-black"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-[#0b1728] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* =====================================================
        MAIN FOOTER
    ===================================================== */}

          <div className="py-16 md:py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
              {/* =====================================================
            BRAND
        ===================================================== */}

              <div className="lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div
                    className="
              w-12
              h-12
              rounded-2xl
              bg-gradient-to-br
              from-[#2563eb]
              to-[#193a63]
              flex
              items-center
              justify-center
              text-xl
              shadow-lg
            "
                  >
                    🛍️
                  </div>

                  <div>
                    <h3
                      className="
                text-xl
                md:text-2xl
                font-black
                tracking-tight
              "
                    >
                      ShopSphere
                    </h3>

                    <p
                      className="
                text-[9px]
                uppercase
                tracking-[0.22em]
                text-[#d7b536]
                font-black
                mt-1
              "
                    >
                      Smart Shopping
                    </p>
                  </div>
                </div>

                <p
                  className="
            text-slate-400
            text-sm
            leading-7
            mt-6
            max-w-sm
          "
                >
                  Your trusted online shopping platform for quality products,
                  convenient shopping, secure experiences, and better everyday
                  choices.
                </p>

                {/* COMPANY TAGLINE */}

                <div
                  className="
            mt-6
            border-l-2
            border-[#d7b536]
            pl-4
          "
                >
                  <p
                    className="
              text-sm
              text-slate-300
              font-semibold
              leading-6
            "
                  >
                    Simple shopping.
                    <br />
                    Better experience.
                  </p>
                </div>

                {/* SOCIAL MEDIA */}

                <div className="flex flex-wrap gap-2.5 mt-7">
                  {/* FACEBOOK */}
                  <a
                    href="https://facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-sm
                font-black
                text-slate-300
                hover:bg-[#2563eb]
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    f
                  </a>

                  {/* INSTAGRAM */}
                  <a
                    href="https://instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-sm
                font-black
                text-slate-300
                hover:bg-pink-600
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    ◎
                  </a>

                  {/* X */}
                  <a
                    href="https://x.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-sm
                font-black
                text-slate-300
                hover:bg-slate-700
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    X
                  </a>

                  {/* TIKTOK */}
                  <a
                    href="https://tiktok.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-sm
                font-black
                text-slate-300
                hover:bg-cyan-600
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    ♪
                  </a>

                  {/* LINKEDIN */}
                  <a
                    href="https://www.linkedin.com/in/temaregudie-software/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-xs
                font-black
                text-slate-300
                hover:bg-blue-700
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    in
                  </a>

                  {/* TELEGRAM */}
                  <a
                    href="https://t.me/dibekulu12"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Telegram"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-lg
                text-slate-300
                hover:bg-sky-500
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    ✈️
                  </a>

                  {/* WHATSAPP */}
                  <a
                    href="https://wa.me/251919468741"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-lg
                text-slate-300
                hover:bg-green-600
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    ☎
                  </a>

                  {/* IMO */}
                  <a
                    href="https://dibekulu.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="IMO"
                    className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-[10px]
                font-black
                text-slate-300
                hover:bg-blue-500
                hover:text-white
                hover:-translate-y-1
                transition-all
                duration-300
              "
                  >
                    imo
                  </a>
                </div>
              </div>

              {/* =====================================================
            QUICK LINKS
        ===================================================== */}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[#d7b536]" />

                  <h4
                    className="
              text-sm
              uppercase
              tracking-[0.16em]
              text-white
              font-black
            "
                  >
                    Quick Links
                  </h4>
                </div>

                <div
                  className="
            flex
            flex-col
            gap-4
            mt-7
            text-sm
          "
                >
                  <Link
                    to="/"
                    className="
                group
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-[#d7b536] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    Home
                  </Link>

                  <Link
                    to="/products"
                    className="
                group
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-[#d7b536] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    Products
                  </Link>

                  <a
                    href="#about"
                    className="
                group
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-[#d7b536] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    About Us
                  </a>

                  <a
                    href="#contact"
                    className="
                group
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-[#d7b536] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    Contact Us
                  </a>

                  <a
                    href="https://temare-portfolio.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="
                group
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-[#d7b536] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    Portfolio
                  </a>

                  <Link
                    to="/register"
                    className="
                group
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-[#d7b536] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    Signup
                  </Link>
                </div>
              </div>

              {/* =====================================================
            CUSTOMER
        ===================================================== */}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[#d7b536]" />

                  <h4
                    className="
              text-sm
              uppercase
              tracking-[0.16em]
              text-white
              font-black
            "
                  >
                    Customer
                  </h4>
                </div>

                <div className="flex flex-col gap-4 mt-7 text-sm">
                  <Link
                    to="/products"
                    className="
                group
                flex
                items-center
                gap-3
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      🛍️
                    </span>
                    Browse Products
                  </Link>

                  <a
                    href="#contact"
                    className="
                group
                flex
                items-center
                gap-3
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      💬
                    </span>
                    Customer Support
                  </a>

                  <a
                    href="#about"
                    className="
                group
                flex
                items-center
                gap-3
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      ℹ️
                    </span>
                    About ShopSphere
                  </a>

                  <Link
                    to="/register"
                    className="
                group
                flex
                items-center
                gap-3
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      👤
                    </span>
                    Create Account
                  </Link>

                  <a
                    href="https://temare-portfolio.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="
                group
                flex
                items-center
                gap-3
                text-slate-400
                hover:text-white
                transition-colors
              "
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      💼
                    </span>
                    View Portfolio
                  </a>
                </div>
              </div>

              {/* =====================================================
            CONTACT & SUPPORT
        ===================================================== */}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[#d7b536]" />

                  <h4
                    className="
              text-sm
              uppercase
              tracking-[0.16em]
              text-white
              font-black
            "
                  >
                    Contact & Support
                  </h4>
                </div>

                <div className="flex flex-col gap-5 mt-7 text-sm">
                  {/* EMAIL */}

                  <div className="flex items-start gap-3">
                    <div
                      className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-[#d7b536]
                shrink-0
              "
                    >
                      ✉️
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-black
                "
                      >
                        Email
                      </p>

                      <a
                        href="mailto:shopsphere.official@gmail.com"
                        className="
                    block
                    mt-1
                    text-slate-300
                    hover:text-[#f6d867]
                    transition
                    break-all
                  "
                      >
                        temaregudie16@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* PHONE */}

                  <div className="flex items-start gap-3">
                    <div
                      className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-[#d7b536]
                shrink-0
              "
                    >
                      📞
                    </div>

                    <div>
                      <p
                        className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-black
                "
                      >
                        Phone
                      </p>

                      <a
                        href="tel:+251919468741"
                        className="
                    block
                    mt-1
                    text-slate-300
                    hover:text-[#f6d867]
                    transition
                  "
                      >
                        +251 919 468 741
                      </a>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div className="flex items-start gap-3">
                    <div
                      className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-[#d7b536]
                shrink-0
              "
                    >
                      📍
                    </div>

                    <div>
                      <p
                        className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-black
                "
                      >
                        Location
                      </p>

                      <p className="mt-1 text-slate-300">
                        {currentLocation.city}, {currentLocation.country}
                      </p>
                    </div>
                  </div>

                  {/* SUPPORT HOURS */}

                  <div className="flex items-start gap-3">
                    <div
                      className="
                w-10
                h-10
                rounded-xl
                bg-[#13243a]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-[#d7b536]
                shrink-0
              "
                    >
                      🕐
                    </div>

                    <div>
                      <p
                        className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-black
                "
                      >
                        Support Hours
                      </p>

                      <p className="mt-1 text-slate-300">Mon - Sat</p>

                      <p className="text-slate-500 text-xs mt-0.5">
                        8:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
        TRUST / SECURITY STRIP
    ===================================================== */}

          <div
            className="
      border-t
      border-white/10
      border-b
      border-white/10
      py-7
    "
          >
            <div
              className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-5
      "
            >
              <div
                className="
          flex
          items-center
          gap-3
          rounded-2xl
          bg-[#101f33]
          border
          border-white/5
          px-5
          py-4
        "
              >
                <span className="text-2xl">🔒</span>

                <div>
                  <p className="text-white text-sm font-black">
                    Secure Shopping
                  </p>

                  <p className="text-slate-500 text-xs mt-1">
                    Shop with confidence
                  </p>
                </div>
              </div>

              <div
                className="
          flex
          items-center
          gap-3
          rounded-2xl
          bg-[#101f33]
          border
          border-white/5
          px-5
          py-4
        "
              >
                <span className="text-2xl">💳</span>

                <div>
                  <p className="text-white text-sm font-black">
                    Secure Payment
                  </p>

                  <p className="text-slate-500 text-xs mt-1">
                    Reliable transactions
                  </p>
                </div>
              </div>

              <div
                className="
          flex
          items-center
          gap-3
          rounded-2xl
          bg-[#101f33]
          border
          border-white/5
          px-5
          py-4
        "
              >
                <span className="text-2xl">⭐</span>

                <div>
                  <p className="text-white text-sm font-black">
                    Quality Products
                  </p>

                  <p className="text-slate-500 text-xs mt-1">
                    Better choices for you
                  </p>
                </div>
              </div>

              <div
                className="
          flex
          items-center
          gap-3
          rounded-2xl
          bg-[#101f33]
          border
          border-white/5
          px-5
          py-4
        "
              >
                <span className="text-2xl">🚚</span>

                <div>
                  <p className="text-white text-sm font-black">Fast Delivery</p>

                  <p className="text-slate-500 text-xs mt-1">
                    Convenient service
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
        BOTTOM FOOTER
    ===================================================== */}

          <div
            className="
      py-7
      flex
      flex-col
      md:flex-row
      md:items-center
      md:justify-between
      gap-5
    "
          >
            <div>
              <p
                className="
          text-xs
          text-slate-500
          leading-6
        "
              >
                © {new Date().getFullYear()} ShopSphere. All rights reserved.
              </p>

              <p
                className="
          text-[11px]
          text-slate-600
          mt-1
        "
              >
                Quality products. Better experience.
              </p>
            </div>

            <div
              className="
        flex
        flex-wrap
        items-center
        gap-5
        text-xs
      "
            >
              <a
                href="#"
                className="
            text-slate-500
            hover:text-white
            transition
          "
              >
                Privacy Policy
              </a>

              <a
                href="#"
                className="
            text-slate-500
            hover:text-white
            transition
          "
              >
                Terms & Conditions
              </a>

              <a
                href="#contact"
                className="
            text-slate-500
            hover:text-[#f6d867]
            transition
            font-semibold
          "
              >
                Customer Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
