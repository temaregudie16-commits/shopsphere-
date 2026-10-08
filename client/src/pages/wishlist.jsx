import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const SERVER_URL = "http://localhost:5000";

function Wishlist() {
  const navigate = useNavigate();

  const {
    wishlistItems,
    loading,
    removeFromWishlist,
    clearWishlist,
    loadWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  // =====================================================
  // IMAGE URL
  // =====================================================

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

  // =====================================================
  // REFRESH
  // =====================================================

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // =====================================================
  // REMOVE
  // =====================================================

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);

    if (!result.success) {
      if (result.requiresLogin) {
        navigate("/login", {
          state: {
            from: "/wishlist",
          },
        });

        return;
      }

      alert(result.message || "Failed to remove item.");
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (product) => {
    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      alert("This product is currently out of stock.");

      return;
    }

    addToCart({
      id: product.product_id,
      name: product.name,
      description: product.description || "",
      price: Number(product.price || 0),
      image: product.image || "",
      stock,
      category_name: product.category_name || "",
      quantity: 1,
    });

    alert(`${product.name} added to cart ✅`);
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0) {
      return;
    }

    const confirmed = window.confirm("Remove all products from your wishlist?");

    if (!confirmed) {
      return;
    }

    const result = await clearWishlist();

    if (!result.success) {
      alert(result.message || "Failed to clear wishlist.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl animate-pulse">❤️</div>

          <h1 className="text-3xl font-black text-slate-800 mt-5">
            Loading Wishlist...
          </h1>

          <p className="text-slate-500 mt-2">Please wait.</p>
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

      <section className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-5">
            <div>
              <p className="text-pink-100 text-sm uppercase font-black">
                ShopSphere
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-1">
                ❤️ My Wishlist
              </h1>

              <p className="text-pink-100 mt-2">
                Save your favorite products and come back later.
              </p>
            </div>

            <Link
              to="/products"
              className="self-start bg-white text-pink-700 px-5 py-3 rounded-xl font-black hover:bg-slate-100"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* TOP BAR */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                Saved Products
              </h2>

              <p className="text-slate-500 mt-1">
                {wishlistItems.length} product
                {wishlistItems.length !== 1 ? "s" : ""} saved.
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearWishlist}
                className="self-start bg-red-50 text-red-600 hover:bg-red-100 px-5 py-3 rounded-xl font-black"
              >
                🗑️ Clear Wishlist
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 md:p-16 text-center">
            <div className="text-8xl">💔</div>

            <h2 className="text-3xl font-black text-slate-800 mt-6">
              Your Wishlist is Empty
            </h2>

            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Save products you love here so you can easily find them again.
            </p>

            <Link
              to="/products"
              className="inline-block mt-7 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-black"
            >
              🛍️ Browse Products
            </Link>
          </div>
        ) : (
          /* =================================================
             GRID
          ================================================= */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              const stock = Number(product.stock || 0);

              const price = Number(product.price || 0);

              const imageUrl = getImageUrl(product.image);

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden group"
                >
                  {/* IMAGE */}

                  <div className="relative h-64 bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-5 group-hover:scale-105 transition duration-300"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          if (event.currentTarget.parentElement) {
                            event.currentTarget.parentElement
                              .querySelector(".wishlist-image-fallback")
                              ?.classList.remove("hidden");
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className={`wishlist-image-fallback absolute inset-0 flex items-center justify-center ${
                        imageUrl ? "hidden" : ""
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-6xl">🛍️</div>

                        <p className="text-slate-400 font-bold mt-2">
                          No Image
                        </p>
                      </div>
                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() => handleRemove(product.product_id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow hover:bg-red-50 text-red-600 font-black"
                      title="Remove from wishlist"
                    >
                      ♥
                    </button>

                    {/* STOCK */}

                    <div className="absolute bottom-4 left-4">
                      {stock > 0 ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-black">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* INFO */}

                  <div className="p-5">
                    <p className="text-xs uppercase text-blue-600 font-black">
                      {product.category_name || "Product"}
                    </p>

                    <h3 className="text-lg font-black text-slate-800 mt-1 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">
                      {product.description || "No description available."}
                    </p>

                    <div className="flex items-center justify-between mt-5">
                      <p className="text-2xl font-black text-green-600">
                        ${price.toFixed(2)}
                      </p>

                      <span
                        className={`text-xs font-bold ${
                          stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock > 0 ? `${stock} available` : "Out of stock"}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div className="grid grid-cols-1 gap-2 mt-5">
                      <Link
                        to={`/products/${product.product_id}`}
                        className="text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-black"
                      >
                        👁️ View Product
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={stock <= 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black disabled:opacity-40"
                      >
                        {stock > 0 ? "🛒 Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}

      <footer className="bg-slate-950 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-center">
          <h3 className="text-xl font-black">🛍️ ShopSphere</h3>

          <p className="text-slate-400 text-sm mt-2">
            Your favorites, saved in one place.
          </p>

          <p className="text-slate-600 text-xs mt-5">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Wishlist;
