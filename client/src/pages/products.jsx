import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const SERVER_URL = "http://localhost:5000";
const PRODUCTS_BACKGROUND = "/images/ecommerce-hero.jpg";

/* =========================================================
   HELPERS
========================================================= */

function getList(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.data)) {
    return data.data.data;
  }

  return [];
}

function getProductName(product) {
  return (
    product?.name ||
    product?.product_name ||
    product?.title ||
    "Unnamed Product"
  );
}

function getProductDescription(product) {
  return (
    product?.description ||
    product?.short_description ||
    "Quality product available at ShopSphere."
  );
}

function getProductPrice(product) {
  return Number(
    product?.price ??
      product?.unit_price ??
      product?.selling_price ??
      product?.amount ??
      0,
  );
}

function getProductStock(product) {
  return Number(
    product?.stock_quantity ??
      product?.stock ??
      product?.quantity ??
      product?.available_stock ??
      product?.inventory ??
      0,
  );
}

function getProductCategoryId(product) {
  return (
    product?.category_id ?? product?.categoryId ?? product?.category?.id ?? ""
  );
}

function getProductCategoryName(product) {
  return (
    product?.category_name ||
    product?.categoryName ||
    product?.category?.name ||
    "Uncategorized"
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("latest");

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts = async () => {
    try {
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.allSettled([
        api.get("/products"),
        api.get("/categories"),
      ]);

      /* PRODUCTS */
      if (productsResponse.status === "fulfilled") {
        const productData = getList(productsResponse.value?.data, [
          "products",
          "items",
        ]);

        setProducts(productData);
      } else {
        console.error("PRODUCTS ERROR:", productsResponse.reason);

        setProducts([]);

        const serverMessage = productsResponse.reason?.response?.data?.message;

        setError(
          serverMessage || "Products could not be loaded from the server.",
        );
      }

      /* CATEGORIES */
      if (categoriesResponse.status === "fulfilled") {
        const categoryData = getList(categoriesResponse.value?.data, [
          "categories",
          "items",
        ]);

        setCategories(categoryData);
      } else {
        console.error("CATEGORIES ERROR:", categoriesResponse.reason);

        /*
          Categories are not required to show products.
          So the page can still work when category API fails.
        */
        setCategories([]);
      }
    } catch (err) {
      console.error("PRODUCT PAGE ERROR:", err);

      setProducts([]);
      setCategories([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while loading products.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FIRST LOAD
  ======================================================= */

  useEffect(() => {
    loadProducts();
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProducts();
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     PRODUCT IMAGE
  ======================================================= */

  const getImageUrl = (product) => {
    const image =
      product?.image_url ||
      product?.imageUrl ||
      product?.image ||
      product?.image_path ||
      product?.product_image ||
      product?.photo ||
      product?.thumbnail ||
      "";

    if (!image) {
      return `${SERVER_URL}/uploads/products/default-product.jpg`;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${SERVER_URL}${image}`;
    }

    return `${SERVER_URL}/${image}`;
  };

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* SEARCH */
    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name = getProductName(product).toLowerCase();

        const description = getProductDescription(product).toLowerCase();

        const categoryName = getProductCategoryName(product).toLowerCase();

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          categoryName.includes(searchValue)
        );
      });
    }

    /* CATEGORY */
    if (category !== "all") {
      result = result.filter((product) => {
        return String(getProductCategoryId(product)) === String(category);
      });
    }

    /* STOCK */
    if (stock === "inStock") {
      result = result.filter((product) => getProductStock(product) > 0);
    }

    if (stock === "outStock") {
      result = result.filter((product) => getProductStock(product) <= 0);
    }

    /* SORT */
    switch (sort) {
      case "priceLow":
        result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;

      case "priceHigh":
        result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;

      case "name":
        result.sort((a, b) =>
          getProductName(a).localeCompare(getProductName(b)),
        );
        break;

      case "stock":
        result.sort((a, b) => getProductStock(b) - getProductStock(a));
        break;

      case "latest":
      default:
        result.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
        break;
    }

    return result;
  }, [products, search, category, stock, sort]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStock("all");
    setSort("latest");
  };

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#0b1728",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${PRODUCTS_BACKGROUND}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.24,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(11,23,40,.82), rgba(25,58,99,.70))",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "30px",
          }}
        >
          <div
            style={{
              width: "55px",
              height: "55px",
              margin: "0 auto 20px",
              border: "5px solid rgba(255,255,255,.2)",
              borderTopColor: "#d7b536",
              borderRadius: "50%",
              animation: "shopSphereProductSpin 1s linear infinite",
            }}
          />

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            Loading ShopSphere Products...
          </h2>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,.75)",
            }}
          >
            Please wait while we prepare the products.
          </p>
        </div>

        <style>
          {`
            @keyframes shopSphereProductSpin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        background: "#0b1728",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ===================================================
          BACKGROUND IMAGE
      =================================================== */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url("${PRODUCTS_BACKGROUND}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: "scale(1.03)",
        }}
      />

      {/* DARK OVERLAY */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(6,20,38,.70), rgba(25,58,99,.55), rgba(6,20,38,.78))",
          pointerEvents: "none",
        }}
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
        }}
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={{
            minHeight: "430px",
            display: "flex",
            alignItems: "center",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1250px",
              margin: "0 auto",
              padding: "80px 24px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                maxWidth: "800px",
                animation: "shopSphereHeroFade 0.9s ease-out",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 15px",
                  marginBottom: "18px",
                  border: "1px solid rgba(246,216,103,.35)",
                  borderRadius: "999px",
                  background: "rgba(215,181,54,.10)",
                  color: "#f6d867",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                }}
              >
                🛍️ ShopSphere Store
              </div>

              <h1
                style={{
                  margin: "0 0 20px",
                  color: "#ffffff",
                  fontSize: "clamp(42px, 6vw, 72px)",
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: "-1.5px",
                }}
              >
                Discover Our Products
              </h1>

              <p
                style={{
                  maxWidth: "720px",
                  margin: 0,
                  color: "rgba(255,255,255,.87)",
                  fontSize: "18px",
                  lineHeight: 1.8,
                }}
              >
                Explore quality products, compare prices, and find everything
                you need in one convenient place.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginTop: "30px",
                }}
              >
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  style={{
                    minHeight: "48px",
                    padding: "0 20px",
                    border: "1px solid #d7b536",
                    borderRadius: "12px",
                    background: "#d7b536",
                    color: "#0b1728",
                    fontWeight: 800,
                    cursor: refreshing ? "not-allowed" : "pointer",
                    opacity: refreshing ? 0.7 : 1,
                  }}
                >
                  {refreshing ? "Refreshing..." : "↻ Refresh Products"}
                </button>

                <Link
                  to="/"
                  style={{
                    minHeight: "48px",
                    padding: "0 20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    border: "1px solid rgba(255,255,255,.24)",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,.08)",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 800,
                  }}
                >
                  ← Back Home
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN
        ================================================= */}

        <main
          style={{
            width: "100%",
            maxWidth: "1250px",
            margin: "0 auto",
            padding: "35px 24px 70px",
            boxSizing: "border-box",
          }}
        >
          {/* =================================================
              FILTER PANEL
          ================================================= */}

          <section
            style={{
              padding: "28px",
              border: "1px solid rgba(255,255,255,.25)",
              borderRadius: "24px",
              background: "rgba(255,255,255,.94)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 25px 60px rgba(5,20,40,.22)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#a08416",
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                  }}
                >
                  SHOP SMART
                </div>

                <h2
                  style={{
                    margin: "6px 0 8px",
                    color: "#193a63",
                    fontSize: "28px",
                    fontWeight: 900,
                  }}
                >
                  Find the right product
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Search, filter, and sort products quickly.
                </p>
              </div>

              <div
                style={{
                  minWidth: "105px",
                  padding: "15px",
                  borderRadius: "18px",
                  background: "linear-gradient(135deg,#193a63,#234c7c)",
                  color: "#ffffff",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                  }}
                >
                  {filteredProducts.length}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#f6d867",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  Products
                </div>
              </div>
            </div>

            {/* FILTER GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(240px,2fr) repeat(3,minmax(160px,1fr))",
                gap: "16px",
              }}
            >
              {/* SEARCH */}
              <div>
                <label
                  htmlFor="product-search"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  Search
                </label>

                <input
                  id="product-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 14px",
                    boxSizing: "border-box",
                    border: "1px solid #d8e1ec",
                    borderRadius: "12px",
                    outline: "none",
                    background: "#ffffff",
                    color: "#193a63",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="product-category"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  Category
                </label>

                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    border: "1px solid #d8e1ec",
                    borderRadius: "12px",
                    outline: "none",
                    background: "#ffffff",
                    color: "#193a63",
                    fontSize: "14px",
                  }}
                >
                  <option value="all">All Categories</option>

                  {categories.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item?.name || item?.category_name || "Category"}
                    </option>
                  ))}
                </select>
              </div>

              {/* STOCK */}
              <div>
                <label
                  htmlFor="product-stock"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  Stock
                </label>

                <select
                  id="product-stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    border: "1px solid #d8e1ec",
                    borderRadius: "12px",
                    outline: "none",
                    background: "#ffffff",
                    color: "#193a63",
                    fontSize: "14px",
                  }}
                >
                  <option value="all">All Stock</option>

                  <option value="inStock">In Stock</option>

                  <option value="outStock">Out of Stock</option>
                </select>
              </div>

              {/* SORT */}
              <div>
                <label
                  htmlFor="product-sort"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  Sort By
                </label>

                <select
                  id="product-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    border: "1px solid #d8e1ec",
                    borderRadius: "12px",
                    outline: "none",
                    background: "#ffffff",
                    color: "#193a63",
                    fontSize: "14px",
                  }}
                >
                  <option value="latest">Latest</option>

                  <option value="priceLow">Price: Low to High</option>

                  <option value="priceHigh">Price: High to Low</option>

                  <option value="name">Name A-Z</option>

                  <option value="stock">Highest Stock</option>
                </select>
              </div>
            </div>

            {/* FILTER BOTTOM */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
                marginTop: "20px",
                paddingTop: "18px",
                borderTop: "1px solid #e8edf3",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              <span>
                Showing{" "}
                <strong style={{ color: "#193a63" }}>
                  {filteredProducts.length}
                </strong>{" "}
                of{" "}
                <strong style={{ color: "#193a63" }}>{products.length}</strong>{" "}
                products
              </span>

              <button
                type="button"
                onClick={clearFilters}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#193a63",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                border: "1px solid #fecaca",
                borderRadius: "18px",
                background: "rgba(255,245,245,.96)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "20px",
                  fontWeight: 900,
                }}
              >
                !
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: "0 0 5px",
                    color: "#991b1b",
                  }}
                >
                  Unable to load products
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#7f1d1d",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#193a63",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================================
              PRODUCT SECTION
          ================================================= */}

          {!error && filteredProducts.length > 0 && (
            <section style={{ marginTop: "35px" }}>
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: "#f6d867",
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                  }}
                >
                  SHOPSPHERE COLLECTION
                </div>

                <h2
                  style={{
                    margin: "6px 0 0",
                    color: "#ffffff",
                    fontSize: "30px",
                    fontWeight: 900,
                  }}
                >
                  Featured Products
                </h2>
              </div>

              {/* PRODUCT GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                  gap: "22px",
                }}
              >
                {filteredProducts.map((product) => {
                  const name = getProductName(product);

                  const description = getProductDescription(product);

                  const price = getProductPrice(product);

                  const productStock = getProductStock(product);

                  const categoryName = getProductCategoryName(product);

                  return (
                    <article
                      key={product?.id}
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid #dbe4ef",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,.97)",
                        boxShadow: "0 10px 30px rgba(5,20,40,.13)",
                      }}
                    >
                      {/* IMAGE */}
                      <div
                        style={{
                          position: "relative",
                          height: "240px",
                          overflow: "hidden",
                          background: "#eef4fb",
                        }}
                      >
                        <img
                          src={getImageUrl(product)}
                          alt={name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = `${SERVER_URL}/uploads/products/default-product.jpg`;
                          }}
                        />

                        <span
                          style={{
                            position: "absolute",
                            top: "14px",
                            right: "14px",
                            padding: "7px 10px",
                            borderRadius: "999px",
                            background:
                              productStock > 0
                                ? "rgba(220,252,231,.96)"
                                : "rgba(254,226,226,.96)",
                            color: productStock > 0 ? "#166534" : "#991b1b",
                            fontSize: "11px",
                            fontWeight: 900,
                          }}
                        >
                          {productStock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      {/* CONTENT */}
                      <div
                        style={{
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            color: "#a08416",
                            fontSize: "11px",
                            fontWeight: 900,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                          }}
                        >
                          {categoryName}
                        </div>

                        <h3
                          style={{
                            margin: "8px 0",
                            color: "#193a63",
                            fontSize: "19px",
                            lineHeight: 1.35,
                            fontWeight: 900,
                          }}
                        >
                          {name}
                        </h3>

                        <p
                          style={{
                            minHeight: "52px",
                            margin: 0,
                            color: "#64748b",
                            fontSize: "13px",
                            lineHeight: 1.6,
                          }}
                        >
                          {description.slice(0, 120)}
                          {description.length > 120 ? "..." : ""}
                        </p>

                        {/* PRICE + STOCK */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            margin: "18px 0",
                          }}
                        >
                          <span
                            style={{
                              color: "#193a63",
                              fontSize: "21px",
                              fontWeight: 900,
                            }}
                          >
                            ${price.toFixed(2)}
                          </span>

                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {productStock > 0
                              ? `${productStock} available`
                              : "Not available"}
                          </span>
                        </div>

                        {/* VIEW DETAILS */}
                        <Link
                          to={`/products/${product?.id}`}
                          style={{
                            width: "100%",
                            minHeight: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            boxSizing: "border-box",
                            padding: "0 15px",
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg,#193a63,#234c7c)",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: 900,
                          }}
                        >
                          <span>View Details</span>

                          <span
                            style={{
                              fontSize: "19px",
                            }}
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!error && filteredProducts.length === 0 && (
            <section
              style={{
                marginTop: "35px",
                padding: "70px 25px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,.20)",
                borderRadius: "25px",
                background: "rgba(255,255,255,.95)",
              }}
            >
              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "15px",
                }}
              >
                🛍️
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  color: "#193a63",
                  fontSize: "28px",
                  fontWeight: 900,
                }}
              >
                No Products Found
              </h2>

              <p
                style={{
                  maxWidth: "500px",
                  margin: "0 auto 25px",
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                We could not find products matching your current filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                style={{
                  minHeight: "45px",
                  padding: "0 20px",
                  border: "none",
                  borderRadius: "11px",
                  background: "#d7b536",
                  color: "#0b1728",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </section>
          )}
        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,.12)",
            background: "rgba(7,18,31,.90)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1250px",
              margin: "0 auto",
              padding: "25px 24px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #d7b536",
                  borderRadius: "50%",
                  background: "#193a63",
                  fontSize: "22px",
                }}
              >
                🛍️
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "17px",
                    fontWeight: 900,
                  }}
                >
                  ShopSphere
                </h3>

                <p
                  style={{
                    margin: "2px 0 0",
                    color: "#f6d867",
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "1.4px",
                  }}
                >
                  SMART SHOPPING
                </p>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,.55)",
                fontSize: "12px",
              }}
            >
              © {new Date().getFullYear()} ShopSphere. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* ===================================================
          RESPONSIVE + ANIMATION
      =================================================== */}

      <style>
        {`
          @keyframes shopSphereHeroFade {
            from {
              opacity: 0;
              transform: translateY(25px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 1100px) {
            main > section + section,
            main section {
              max-width: 100%;
            }

            article {
              min-width: 0;
            }
          }

          @media (max-width: 1100px) {
            div[style*="repeat(4,minmax(0,1fr))"] {
              grid-template-columns:
                repeat(3, minmax(0, 1fr)) !important;
            }

            div[style*="repeat(3,minmax(160px,1fr))"] {
              grid-template-columns:
                repeat(2, minmax(160px,1fr)) !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="repeat(4,minmax(0,1fr))"] {
              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;
            }

            div[style*="repeat(3,minmax(160px,1fr))"] {
              grid-template-columns:
                1fr !important;
            }
          }

          @media (max-width: 520px) {
            div[style*="repeat(4,minmax(0,1fr))"] {
              grid-template-columns:
                1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}
