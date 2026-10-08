import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const SERVER_URL = "http://localhost:5000";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // CART
  // =====================================================

  const { addToCart } = useCart();

  // =====================================================
  // WISHLIST
  // =====================================================

  const { addToWishlist, removeFromWishlist, isInWishlist, loadWishlist } =
    useWishlist();

  // =====================================================
  // PRODUCT
  // =====================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CART UI
  // =====================================================

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  // =====================================================
  // WISHLIST UI
  // =====================================================

  const [wishlistLoading, setWishlistLoading] = useState(false);

  // =====================================================
  // REVIEWS
  // =====================================================

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // =====================================================
  // REVIEW FORM
  // =====================================================

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // =====================================================
  // CURRENT USER
  // =====================================================

  const [currentUser, setCurrentUser] = useState(null);

  // =====================================================
  // GET LOGGED USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("USER DATA ERROR:", error);
      return null;
    }
  };

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
  }, []);

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
  // LOAD PRODUCT
  // =====================================================

  const loadProduct = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/products/${id}`);

      if (response.data?.success && response.data?.product) {
        const loadedProduct = response.data.product;

        setProduct(loadedProduct);

        const productStock = Number(loadedProduct.stock || 0);

        setQuantity(productStock > 0 ? 1 : 0);
      } else {
        setProduct(null);

        setError(response.data?.message || "Product could not be found.");
      }
    } catch (error) {
      console.error("LOAD PRODUCT ERROR:", error);

      setProduct(null);

      if (error.response) {
        setError(
          error.response.data?.message ||
            `Server error: ${error.response.status}`,
        );
      } else if (error.request) {
        setError("Cannot connect to ShopSphere server.");
      } else {
        setError(error.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  const loadReviews = async () => {
    if (!id) {
      return;
    }

    try {
      setReviewsLoading(true);
      setReviewsError("");

      const response = await api.get(`/reviews/product/${id}`);

      if (response.data?.success) {
        const loadedReviews = response.data.reviews || [];

        const ratingData = response.data.rating || {};

        setReviews(loadedReviews);

        setAverageRating(Number(ratingData.average_rating || 0));

        setTotalReviews(
          Number(ratingData.total_reviews || loadedReviews.length || 0),
        );
      } else {
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);

        setReviewsError(
          response.data?.message || "Reviews could not be loaded.",
        );
      }
    } catch (error) {
      console.error("LOAD REVIEWS ERROR:", error);

      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);

      if (error.response) {
        setReviewsError(
          error.response.data?.message || "Failed to load reviews.",
        );
      } else if (error.request) {
        setReviewsError("Cannot connect to ShopSphere server.");
      } else {
        setReviewsError(error.message || "Failed to load reviews.");
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  useEffect(() => {
    loadProduct();
    loadReviews();
    loadWishlist();
  }, [id, loadWishlist]);

  // =====================================================
  // PRODUCT VALUES
  // =====================================================

  const stock = Number(product?.stock || 0);

  const price = Number(product?.price || 0);

  const totalPrice = useMemo(() => {
    return Number((price * Number(quantity || 0)).toFixed(2));
  }, [price, quantity]);

  const imageUrl = getImageUrl(product?.image);

  const inWishlist = product ? isInWishlist(product.id) : false;

  // =====================================================
  // QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    if (!product || stock <= 0) {
      return;
    }

    setQuantity((previous) => Math.min(previous + 1, stock));
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(previous - 1, 1));
  };

  const handleQuantityChange = (event) => {
    if (!product || stock <= 0) {
      return;
    }

    const value = Number(event.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setQuantity(Math.min(Math.max(value, 1), stock));
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {
    if (!product) {
      return false;
    }

    if (stock <= 0) {
      alert("This product is out of stock.");

      return false;
    }

    if (quantity < 1 || quantity > stock) {
      alert(`Please select a quantity between 1 and ${stock}.`);

      return false;
    }

    try {
      setAdding(true);

      const cartProduct = {
        id: product.id,
        product_id: product.id,
        name: product.name,
        description: product.description || "",
        price: Number(product.price || 0),
        image: product.image || "",
        stock,
        category_id: product.category_id || null,
        category_name: product.category_name || "",
        quantity,
      };

      addToCart(cartProduct);

      alert(`${product.name} added to cart ✅`);

      return true;
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);

      alert("Failed to add product to cart.");

      return false;
    } finally {
      setAdding(false);
    }
  };

  // =====================================================
  // BUY NOW
  // =====================================================

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    try {
      setBuying(true);

      const added = await handleAddToCart();

      if (!added) {
        return;
      }

      navigate("/cart");
    } finally {
      setBuying(false);
    }
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleWishlistToggle = async () => {
    if (!product) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    try {
      setWishlistLoading(true);

      let result;

      if (inWishlist) {
        result = await removeFromWishlist(product.id);
      } else {
        result = await addToWishlist(product.id);
      }

      if (!result.success) {
        alert(result.message || "Wishlist update failed.");

        return;
      }

      if (!inWishlist) {
        alert(`${product.name} added to wishlist ❤️`);
      }
    } catch (error) {
      console.error("WISHLIST ERROR:", error);

      alert("Failed to update wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  // =====================================================
  // STARS
  // =====================================================

  const renderStars = (rating, size = "text-xl") => {
    const numericRating = Number(rating || 0);

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${size} ${
              numericRating >= star ? "text-yellow-400" : "text-slate-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    setReviewMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setReviewMessage("Please select a rating from 1 to 5 stars.");

      return;
    }

    const cleanedReview = reviewText.trim();

    if (!cleanedReview || cleanedReview.length < 3) {
      setReviewMessage("Please write at least 3 characters.");

      return;
    }

    if (cleanedReview.length > 1000) {
      setReviewMessage("Review cannot exceed 1000 characters.");

      return;
    }

    try {
      setSubmittingReview(true);

      const response = await api.post(`/reviews/product/${id}`, {
        rating: selectedRating,
        review: cleanedReview,
      });

      if (response.data?.success) {
        setSelectedRating(0);
        setReviewText("");

        setReviewMessage("✅ Review submitted successfully.");

        await loadReviews();
      } else {
        setReviewMessage(response.data?.message || "Failed to submit review.");
      }
    } catch (error) {
      console.error("SUBMIT REVIEW ERROR:", error);

      if (error.response?.status === 409) {
        setReviewMessage(
          error.response.data?.message ||
            "You have already reviewed this product.",
        );
      } else {
        setReviewMessage(
          error.response?.data?.message || "Failed to submit review.",
        );
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // =====================================================
  // RATING PERCENTAGE
  // =====================================================

  const ratingPercentage = useMemo(() => {
    if (totalReviews <= 0) {
      return 0;
    }

    return Math.min(Math.max((averageRating / 5) * 100, 0), 100);
  }, [averageRating, totalReviews]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl animate-pulse">
            🛍️
          </div>

          <h2 className="text-2xl font-black text-slate-900 mt-5">
            Loading Product...
          </h2>

          <p className="text-slate-500 mt-2">
            Please wait while we load the product.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-5xl">
            😔
          </div>

          <h1 className="text-3xl font-black text-slate-900 mt-5">
            Product Not Found
          </h1>

          <p className="text-slate-500 mt-3">
            {error || "This product is not available."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
            <button
              type="button"
              onClick={() => {
                loadProduct();
                loadReviews();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black"
            >
              🔄 Try Again
            </button>

            <Link
              to="/products"
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          <span>›</span>

          <Link to="/products" className="hover:text-blue-600">
            Products
          </Link>

          <span>›</span>

          <span className="font-bold text-slate-800 truncate max-w-[220px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* =================================================
          PRODUCT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* IMAGE */}

            <div className="relative min-h-[430px] lg:min-h-[650px] bg-slate-100 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full max-h-[650px] object-contain p-8 md:p-12"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";

                    const fallback =
                      event.currentTarget.parentElement?.querySelector(
                        ".product-image-fallback",
                      );

                    if (fallback) {
                      fallback.classList.remove("hidden");
                    }
                  }}
                />
              ) : null}

              <div
                className={`product-image-fallback absolute inset-0 ${
                  imageUrl ? "hidden" : "flex"
                } items-center justify-center`}
              >
                <div className="text-center">
                  <div className="text-8xl">🛍️</div>

                  <p className="text-slate-400 font-bold mt-3">
                    No Image Available
                  </p>
                </div>
              </div>

              {/* STOCK */}

              <div className="absolute top-6 left-6">
                {stock > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-black shadow">
                    ✓ In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-600 text-white px-4 py-2 text-sm font-black shadow">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* WISHLIST */}

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-6 right-6 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-2xl transition ${
                  inWishlist
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-white text-red-500 hover:bg-red-50"
                } disabled:opacity-50`}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlistLoading ? "⏳" : inWishlist ? "❤️" : "♡"}
              </button>
            </div>

            {/* INFO */}

            <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
              <div className="inline-flex self-start rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-xs uppercase tracking-widest font-black">
                {product.category_name || "Product"}
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mt-4">
                {product.name}
              </h1>

              <p className="text-slate-500 text-base md:text-lg leading-8 mt-5">
                {product.description ||
                  "No description available for this product."}
              </p>

              {/* RATING */}

              <div className="flex flex-wrap items-center gap-3 mt-6">
                {renderStars(averageRating, "text-2xl")}

                <span className="font-black text-slate-800">
                  {averageRating.toFixed(1)}
                </span>

                <a
                  href="#reviews"
                  className="text-blue-600 font-black hover:underline"
                >
                  {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                </a>
              </div>

              {/* PRICE */}

              <div className="mt-7">
                <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                  Price
                </p>

                <p className="text-4xl md:text-5xl font-black text-emerald-600 mt-1">
                  ${price.toFixed(2)}
                </p>
              </div>

              {/* STOCK */}

              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-black text-slate-700">
                    Availability
                  </span>

                  <span
                    className={
                      stock > 0
                        ? "text-emerald-600 font-black"
                        : "text-red-600 font-black"
                    }
                  >
                    {stock > 0 ? `${stock} available` : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* QUANTITY */}

              {stock > 0 && (
                <>
                  <div className="mt-7">
                    <p className="text-sm uppercase tracking-widest font-black text-slate-500 mb-3">
                      Quantity
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-2xl disabled:opacity-40"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-20 h-12 text-center border border-slate-300 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= stock}
                        className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* TOTAL */}

                  <div className="flex items-center justify-between gap-5 mt-7 rounded-3xl bg-blue-50 border border-blue-100 p-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                        Selected
                      </p>

                      <p className="font-black text-slate-900 mt-1">
                        {quantity} item
                        {quantity !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                        Total
                      </p>

                      <p className="text-2xl md:text-3xl font-black text-blue-600 mt-1">
                        ${totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={adding || buying}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black disabled:opacity-50 transition"
                    >
                      {adding ? "Adding..." : "🛒 Add to Cart"}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={adding || buying}
                      className="bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black disabled:opacity-50 transition"
                    >
                      {buying ? "Processing..." : "⚡ Buy Now"}
                    </button>
                  </div>
                </>
              )}

              {/* WISHLIST */}

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`w-full mt-3 py-4 rounded-2xl font-black transition disabled:opacity-50 ${
                  inWishlist
                    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    : "bg-slate-100 text-slate-800 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {wishlistLoading
                  ? "Updating Wishlist..."
                  : inWishlist
                    ? "❤️ Remove from Wishlist"
                    : "♡ Add to Wishlist"}
              </button>

              <Link
                to="/products"
                className="text-center text-blue-600 font-black mt-6 hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section
          id="reviews"
          className="bg-white rounded-[2rem] border border-slate-200 shadow-sm mt-8 overflow-hidden"
        >
          {/* REVIEW HEADER */}

          <div className="p-6 md:p-8 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-blue-600 uppercase text-xs tracking-widest font-black">
                  Customer Feedback
                </p>

                <h2 className="text-3xl font-black text-slate-900 mt-2">
                  ⭐ Reviews & Ratings
                </h2>

                <p className="text-slate-500 mt-2">
                  See what customers think about this product.
                </p>
              </div>

              {/* RATING SUMMARY */}

              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 min-w-[280px]">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-900">
                      {averageRating.toFixed(1)}
                    </p>

                    <div className="mt-1">{renderStars(averageRating)}</div>
                  </div>

                  <div className="flex-1">
                    <p className="font-black text-slate-800">
                      {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                    </p>

                    <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${ratingPercentage}%`,
                        }}
                      />
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      Overall rating
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WRITE REVIEW */}

          <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-200">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-black text-slate-900">
                ✍️ Write a Review
              </h3>

              {!currentUser ? (
                <div className="bg-white border border-blue-200 rounded-3xl p-6 mt-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl">
                    🔐
                  </div>

                  <p className="text-slate-600 mt-4">
                    Please login to share your experience with this product.
                  </p>

                  <Link
                    to="/login"
                    state={{
                      from: `/products/${id}`,
                    }}
                    className="inline-flex mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black"
                  >
                    Login to Review →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="mt-5">
                  {/* RATING */}

                  <div>
                    <p className="font-black text-slate-700 mb-2">
                      Your Rating
                    </p>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          className={`text-4xl transition hover:scale-110 ${
                            selectedRating >= star
                              ? "text-yellow-400"
                              : "text-slate-300"
                          }`}
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}

                      {selectedRating > 0 && (
                        <span className="ml-3 font-black text-slate-700">
                          {selectedRating} / 5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* REVIEW TEXT */}

                  <div className="mt-5">
                    <label className="block font-black text-slate-700 mb-2">
                      Your Review
                    </label>

                    <textarea
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      rows="5"
                      maxLength={1000}
                      placeholder="Tell other customers about your experience..."
                      className="w-full border border-slate-300 bg-white p-4 rounded-2xl outline-none resize-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>Minimum 3 characters</span>

                      <span>{reviewText.length} / 1000</span>
                    </div>
                  </div>

                  {/* MESSAGE */}

                  {reviewMessage && (
                    <div
                      className={`mt-4 p-4 rounded-2xl font-bold ${
                        reviewMessage.startsWith("✅")
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {reviewMessage}
                    </div>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl font-black disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "⭐ Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* CUSTOMER REVIEWS */}

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Customer Reviews
                </h3>

                <p className="text-slate-500 mt-1">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"} for
                  this product.
                </p>
              </div>

              <button
                type="button"
                onClick={loadReviews}
                disabled={reviewsLoading}
                className="self-start bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-black disabled:opacity-50"
              >
                {reviewsLoading ? "⏳ Loading..." : "🔄 Refresh"}
              </button>
            </div>

            {/* ERROR */}

            {reviewsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 mb-6 font-bold">
                ⚠️ {reviewsError}
              </div>
            )}

            {/* LOADING */}

            {reviewsLoading && (
              <div className="text-center py-10">
                <div className="text-5xl animate-pulse">⭐</div>

                <p className="text-slate-500 font-bold mt-3">
                  Loading reviews...
                </p>
              </div>
            )}

            {/* EMPTY */}

            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <div className="bg-slate-50 rounded-3xl p-10 text-center">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-4xl">
                  💬
                </div>

                <h3 className="text-2xl font-black text-slate-800 mt-5">
                  No Reviews Yet
                </h3>

                <p className="text-slate-500 mt-2">
                  Be the first customer to review this product.
                </p>
              </div>
            )}

            {/* REVIEW LIST */}

            {!reviewsLoading && reviews.length > 0 && (
              <div className="space-y-5">
                {reviews.map((review) => {
                  const name = review.user_name || "Customer";

                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <article
                      key={review.id}
                      className="border border-slate-200 rounded-3xl p-5 md:p-6 hover:shadow-sm transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black shrink-0">
                            {initial}
                          </div>

                          <div>
                            <p className="font-black text-slate-800">{name}</p>

                            <p className="text-xs text-slate-400 mt-1">
                              {review.created_at
                                ? new Date(
                                    review.created_at,
                                  ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div>{renderStars(review.rating)}</div>
                      </div>

                      <p className="text-slate-600 leading-7 mt-5 whitespace-pre-wrap">
                        {review.review}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-slate-950 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-black">🛍️ ShopSphere</h3>

              <p className="text-slate-400 text-sm mt-3 max-w-sm">
                Your trusted online shopping platform.
              </p>
            </div>

            <div>
              <h4 className="font-black">Shop</h4>

              <div className="flex flex-col gap-2 mt-3 text-sm text-slate-400">
                <Link to="/" className="hover:text-white">
                  Home
                </Link>

                <Link to="/products" className="hover:text-white">
                  Products
                </Link>

                <Link to="/wishlist" className="hover:text-white">
                  Wishlist
                </Link>

                <Link to="/orders" className="hover:text-white">
                  Orders
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-black">Features</h4>

              <p className="text-sm text-slate-400 mt-3">🚚 Fast Delivery</p>

              <p className="text-sm text-slate-400 mt-2">🔒 Secure Shopping</p>

              <p className="text-sm text-slate-400 mt-2">⭐ Quality Products</p>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProductDetails;
