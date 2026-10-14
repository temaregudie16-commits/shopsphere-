import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const SERVER_URL = (
  import.meta.env.VITE_API_URL || "https://shopsphere-temare.up.railway.app"
).replace(/\/+$/, "");

const PRODUCTS_BACKGROUND = "/images/ecommerce-hero.jpg";
const PLACEHOLDER_IMAGE = "/images/product-placeholder.png";

/* =========================================================
   HELPERS
========================================================= */

function getList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;

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
   PRODUCT IMAGE URL
========================================================= */

function getImageUrl(product) {
  const image =
    product?.image_url ||
    product?.imageUrl ||
    product?.image ||
    product?.image_path ||
    product?.product_image ||
    product?.photo ||
    product?.thumbnail ||
    "";

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  const value = image.trim();

  // External image or encoded image
  if (/^(https?:\/\/|data:|blob:)/i.test(value)) {
    return value;
  }

  // Convert Windows separators to URL separators
  const normalizedPath = value.replace(/\\/g, "/").replace(/^\/+/, "");

  // Relative upload paths must use the Railway server.
  return `${SERVER_URL}/${normalizedPath}`;
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
     LOAD PRODUCTS AND CATEGORIES
  ======================================================= */

  const loadProducts = async () => {
    setError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.allSettled([
        api.get("/products"),
        api.get("/categories"),
      ]);

      if (productsResponse.status === "fulfilled") {
        const productData = getList(productsResponse.value?.data, [
          "products",
          "items",
        ]);

        setProducts(productData);
      } else {
        console.error("PRODUCTS ERROR:", productsResponse.reason);

        setProducts([]);

        setError(
          productsResponse.reason?.response?.data?.message ||
            "Products could not be loaded from the server.",
        );
      }

      if (categoriesResponse.status === "fulfilled") {
        const categoryData = getList(categoriesResponse.value?.data, [
          "categories",
          "items",
        ]);

        setCategories(categoryData);
      } else {
        console.error("CATEGORIES ERROR:", categoriesResponse.reason);

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

  useEffect(() => {
    loadProducts();
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadProducts();
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        return (
          getProductName(product).toLowerCase().includes(searchValue) ||
          getProductDescription(product).toLowerCase().includes(searchValue) ||
          getProductCategoryName(product).toLowerCase().includes(searchValue)
        );
      });
    }

    if (category !== "all") {
      result = result.filter(
        (product) => String(getProductCategoryId(product)) === String(category),
      );
    }

    if (stock === "inStock") {
      result = result.filter((product) => getProductStock(product) > 0);
    }

    if (stock === "outStock") {
      result = result.filter((product) => getProductStock(product) <= 0);
    }

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
      <div className="products-loading">
        <div className="products-loading-overlay" />

        <div className="products-loading-content">
          <div className="products-spinner" />

          <h2>Loading ShopSphere Products...</h2>

          <p>Please wait while we prepare the products.</p>
        </div>

        <style>{`
          .products-loading {
            min-height: 100vh;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #0b1728;
            color: #fff;
            text-align: center;
          }

          .products-loading-overlay {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(
                135deg,
                rgba(11,23,40,.9),
                rgba(25,58,99,.8)
              ),
              url("${PRODUCTS_BACKGROUND}") center/cover no-repeat;
          }

          .products-loading-content {
            position: relative;
            z-index: 1;
            padding: 30px;
          }

          .products-spinner {
            width: 55px;
            height: 55px;
            margin: 0 auto 20px;
            border: 5px solid rgba(255,255,255,.2);
            border-top-color: #d7b536;
            border-radius: 50%;
            animation: shopSphereSpin 1s linear infinite;
          }

          @keyframes shopSphereSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="products-page">
      <div className="products-background" />
      <div className="products-overlay" />

      <div className="products-page-content">
        {/* HERO */}

        <section className="products-hero">
          <div className="products-container">
            <div className="products-hero-content">
              <div className="products-eyebrow">🛍️ ShopSphere Store</div>

              <h1>Discover Our Products</h1>

              <p>
                Explore quality products, compare prices, and find everything
                you need in one convenient place.
              </p>

              <div className="products-hero-actions">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="products-refresh-button"
                >
                  {refreshing ? "Refreshing..." : "↻ Refresh Products"}
                </button>

                <Link to="/" className="products-home-button">
                  ← Back Home
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN */}

        <main className="products-container products-main">
          {/* FILTER PANEL */}

          <section className="products-filter-panel">
            <div className="products-filter-heading">
              <div>
                <div className="products-small-label">SHOP SMART</div>

                <h2>Find the right product</h2>

                <p>Search, filter, and sort products quickly.</p>
              </div>

              <div className="products-count">
                <strong>{filteredProducts.length}</strong>
                <span>Products</span>
              </div>
            </div>

            <div className="products-filter-grid">
              <div className="products-field">
                <label htmlFor="product-search">Search</label>

                <input
                  id="product-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                />
              </div>

              <div className="products-field">
                <label htmlFor="product-category">Category</label>

                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>

                  {categories.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item?.name || item?.category_name || "Category"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="products-field">
                <label htmlFor="product-stock">Stock</label>

                <select
                  id="product-stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                >
                  <option value="all">All Stock</option>
                  <option value="inStock">In Stock</option>
                  <option value="outStock">Out of Stock</option>
                </select>
              </div>

              <div className="products-field">
                <label htmlFor="product-sort">Sort By</label>

                <select
                  id="product-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                  <option value="stock">Highest Stock</option>
                </select>
              </div>
            </div>

            <div className="products-filter-bottom">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> products
              </span>

              <button type="button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div className="products-error">
              <div>
                <h3>Unable to load products</h3>
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Try Again
              </button>
            </div>
          )}

          {/* PRODUCT GRID */}

          {!error && filteredProducts.length > 0 && (
            <section className="products-collection">
              <div className="products-collection-heading">
                <div className="products-small-label">
                  SHOPSPHERE COLLECTION
                </div>

                <h2>Featured Products</h2>
              </div>

              <div className="products-grid">
                {filteredProducts.map((product) => {
                  const name = getProductName(product);
                  const description = getProductDescription(product);
                  const price = getProductPrice(product);
                  const productStock = getProductStock(product);
                  const categoryName = getProductCategoryName(product);

                  const imageUrl = getImageUrl(product);

                  return (
                    <article key={product?.id} className="products-card">
                      <div className="products-card-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            loading="lazy"
                            onError={(event) => {
                              console.error(
                                "PRODUCT IMAGE FAILED:",
                                event.currentTarget.src,
                              );

                              event.currentTarget.onerror = null;
                              event.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        ) : (
                          <div className="products-no-image">
                            <span>🛍️</span>
                            <p>No Image Available</p>
                          </div>
                        )}

                        <span
                          className={`products-stock-badge ${
                            productStock > 0 ? "in-stock" : "out-stock"
                          }`}
                        >
                          {productStock > 0 ? "✓ In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="products-card-content">
                        <div className="products-card-category">
                          {categoryName}
                        </div>

                        <h3>{name}</h3>

                        <p className="products-description">
                          {description.length > 120
                            ? `${description.slice(0, 120)}...`
                            : description}
                        </p>

                        <div className="products-price-row">
                          <strong>${price.toFixed(2)}</strong>

                          <span>
                            {productStock > 0
                              ? `${productStock} available`
                              : "Not available"}
                          </span>
                        </div>

                        <Link
                          to={`/products/${product?.id}`}
                          className="products-details-button"
                        >
                          <span>View Details</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* EMPTY STATE */}

          {!error && filteredProducts.length === 0 && (
            <section className="products-empty">
              <div>🛍️</div>
              <h2>No Products Found</h2>

              <p>We could not find products matching your current filters.</p>

              <button type="button" onClick={clearFilters}>
                Reset Filters
              </button>
            </section>
          )}
        </main>

        {/* FOOTER */}

        <footer className="products-footer">
          <div className="products-container products-footer-inner">
            <div>
              <h3>ShopSphere</h3>
              <span>SMART SHOPPING</span>
            </div>

            <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* STYLES */}

      <style>{`
        .products-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: #0b1728;
          font-family: Inter, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .products-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            url("${PRODUCTS_BACKGROUND}") center/cover no-repeat;
          pointer-events: none;
        }

        .products-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            135deg,
            rgba(6,20,38,.78),
            rgba(25,58,99,.64),
            rgba(6,20,38,.84)
          );
          pointer-events: none;
        }

        .products-page-content {
          position: relative;
          z-index: 2;
          min-height: 100vh;
        }

        .products-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
          box-sizing: border-box;
        }

        .products-hero {
          min-height: 430px;
          display: flex;
          align-items: center;
          color: #fff;
        }

        .products-hero-content {
          max-width: 800px;
          padding: 70px 0;
          animation: productsFadeIn .7s ease-out;
        }

        .products-eyebrow {
          display: inline-flex;
          padding: 9px 15px;
          margin-bottom: 18px;
          border: 1px solid rgba(246,216,103,.35);
          border-radius: 999px;
          background: rgba(215,181,54,.1);
          color: #f6d867;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .products-hero h1 {
          margin: 0 0 20px;
          color: #fff;
          font-size: clamp(38px, 6vw, 72px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -1.5px;
        }

        .products-hero p {
          max-width: 720px;
          margin: 0;
          color: rgba(255,255,255,.87);
          font-size: 18px;
          line-height: 1.8;
        }

        .products-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 30px;
        }

        .products-refresh-button,
        .products-home-button {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .products-refresh-button {
          border: 1px solid #d7b536;
          background: #d7b536;
          color: #0b1728;
        }

        .products-refresh-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .products-home-button {
          border: 1px solid rgba(255,255,255,.24);
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        .products-main {
          padding-top: 35px;
          padding-bottom: 70px;
        }

        .products-filter-panel {
          padding: 28px;
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 24px;
          background: rgba(255,255,255,.96);
          box-shadow: 0 25px 60px rgba(5,20,40,.22);
          box-sizing: border-box;
        }

        .products-filter-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .products-small-label {
          color: #a08416;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .products-filter-heading h2 {
          margin: 6px 0 8px;
          color: #193a63;
          font-size: 28px;
          font-weight: 900;
        }

        .products-filter-heading p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .products-count {
          min-width: 105px;
          padding: 15px;
          border-radius: 18px;
          background: linear-gradient(135deg,#193a63,#234c7c);
          color: #fff;
          text-align: center;
        }

        .products-count strong {
          display: block;
          font-size: 30px;
        }

        .products-count span {
          display: block;
          margin-top: 5px;
          color: #f6d867;
          font-size: 12px;
          font-weight: 800;
        }

        .products-filter-grid {
          display: grid;
          grid-template-columns:
            minmax(220px,2fr)
            repeat(3,minmax(140px,1fr));
          gap: 16px;
        }

        .products-field {
          min-width: 0;
        }

        .products-field label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .products-field input,
        .products-field select {
          width: 100%;
          height: 48px;
          padding: 0 12px;
          border: 1px solid #d8e1ec;
          border-radius: 12px;
          outline: none;
          background: #fff;
          color: #193a63;
          font-size: 14px;
          box-sizing: border-box;
        }

        .products-field input:focus,
        .products-field select:focus {
          border-color: #234c7c;
          box-shadow: 0 0 0 3px rgba(35,76,124,.12);
        }

        .products-filter-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e8edf3;
          color: #64748b;
          font-size: 13px;
        }

        .products-filter-bottom strong {
          color: #193a63;
        }

        .products-filter-bottom button {
          border: 0;
          background: transparent;
          color: #193a63;
          font-weight: 800;
          cursor: pointer;
        }

        .products-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 25px;
          padding: 20px;
          border: 1px solid #fecaca;
          border-radius: 18px;
          background: #fff5f5;
        }

        .products-error h3 {
          margin: 0 0 5px;
          color: #991b1b;
        }

        .products-error p {
          margin: 0;
          color: #7f1d1d;
          font-size: 13px;
        }

        .products-error button,
        .products-empty button {
          min-height: 42px;
          padding: 0 16px;
          border: 0;
          border-radius: 10px;
          background: #193a63;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .products-collection {
          margin-top: 35px;
        }

        .products-collection-heading {
          margin-bottom: 20px;
        }

        .products-collection-heading .products-small-label {
          color: #f6d867;
        }

        .products-collection-heading h2 {
          margin: 6px 0 0;
          color: #fff;
          font-size: 30px;
          font-weight: 900;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 22px;
        }

        .products-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #dbe4ef;
          border-radius: 22px;
          background: rgba(255,255,255,.98);
          box-shadow: 0 10px 30px rgba(5,20,40,.13);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .products-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(5,20,40,.2);
        }

        .products-card-image {
          position: relative;
          height: 240px;
          overflow: hidden;
          background: #eef4fb;
        }

        .products-card-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .products-no-image {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #718096;
        }

        .products-no-image span {
          font-size: 48px;
        }

        .products-no-image p {
          margin: 8px 0 0;
          font-size: 13px;
        }

        .products-stock-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .products-stock-badge.in-stock {
          background: #dcfce7;
          color: #166534;
        }

        .products-stock-badge.out-stock {
          background: #fee2e2;
          color: #991b1b;
        }

        .products-card-content {
          padding: 20px;
        }

        .products-card-category {
          color: #a08416;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .products-card-content h3 {
          margin: 8px 0;
          color: #193a63;
          font-size: 19px;
          line-height: 1.35;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .products-description {
          min-height: 52px;
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .products-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 18px 0;
        }

        .products-price-row strong {
          color: #193a63;
          font-size: 21px;
          font-weight: 900;
        }

        .products-price-row span {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          text-align: right;
        }

        .products-details-button {
          width: 100%;
          min-height: 45px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          padding: 0 15px;
          border-radius: 12px;
          background: linear-gradient(135deg,#193a63,#234c7c);
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
        }

        .products-details-button:hover {
          background: linear-gradient(135deg,#234c7c,#2d619a);
        }

        .products-empty {
          margin-top: 35px;
          padding: 70px 25px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 25px;
          background: rgba(255,255,255,.96);
          text-align: center;
        }

        .products-empty > div {
          margin-bottom: 15px;
          font-size: 55px;
        }

        .products-empty h2 {
          margin: 0 0 10px;
          color: #193a63;
          font-size: 28px;
          font-weight: 900;
        }

        .products-empty p {
          max-width: 500px;
          margin: 0 auto 25px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .products-empty button {
          background: #d7b536;
          color: #0b1728;
        }

        .products-footer {
          border-top: 1px solid rgba(255,255,255,.12);
          background: rgba(7,18,31,.92);
        }

        .products-footer-inner {
          min-height: 95px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 20px;
          padding-bottom: 20px;
        }

        .products-footer h3 {
          margin: 0;
          color: #fff;
          font-size: 17px;
          font-weight: 900;
        }

        .products-footer span {
          color: #f6d867;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .products-footer p {
          margin: 0;
          color: rgba(255,255,255,.6);
          font-size: 12px;
        }

        @keyframes productsFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1050px) {
          .products-grid {
            grid-template-columns: repeat(3,minmax(0,1fr));
          }

          .products-filter-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width: 720px) {
          .products-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .products-hero {
            min-height: 360px;
          }

          .products-hero-content {
            padding: 55px 0;
          }

          .products-hero p {
            font-size: 16px;
          }

          .products-filter-panel {
            padding: 20px;
          }

          .products-filter-heading h2 {
            font-size: 23px;
          }

          .products-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 14px;
          }

          .products-card-image {
            height: 190px;
          }

          .products-card-content {
            padding: 14px;
          }

          .products-card-content h3 {
            font-size: 16px;
          }

          .products-price-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .products-price-row span {
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .products-filter-heading {
            gap: 10px;
          }

          .products-count {
            min-width: 75px;
            padding: 12px 8px;
          }

          .products-count strong {
            font-size: 24px;
          }

          .products-filter-grid {
            grid-template-columns: 1fr;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .products-card-image {
            height: 240px;
          }

          .products-filter-bottom,
          .products-footer-inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .products-error {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
