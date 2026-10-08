import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN STATE
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const isLoggedIn = Boolean(getToken());

  // =====================================================
  // LOAD WISHLIST
  // =====================================================

  const loadWishlist = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/wishlist");

      if (response.data?.success) {
        setWishlistItems(response.data.wishlist || []);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("LOAD WISHLIST ERROR:", error);

      // Token expired / unauthorized
      if (error.response?.status === 401) {
        setWishlistItems([]);
      } else {
        setWishlistItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // =====================================================
  // ADD TO WISHLIST
  // =====================================================

  const addToWishlist = async (productId) => {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        requiresLogin: true,
        message: "Please login to use wishlist.",
      };
    }

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    try {
      const response = await api.post(`/wishlist/${productId}`);

      if (response.data?.success) {
        await loadWishlist();
      }

      return {
        success: Boolean(response.data?.success),
        message: response.data?.message || "",
      };
    } catch (error) {
      console.error("ADD WISHLIST ERROR:", error);

      return {
        success: false,
        requiresLogin: error.response?.status === 401,
        status: error.response?.status,
        message:
          error.response?.data?.message || "Failed to add product to wishlist.",
      };
    }
  };

  // =====================================================
  // REMOVE FROM WISHLIST
  // =====================================================

  const removeFromWishlist = async (productId) => {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        requiresLogin: true,
        message: "Please login to use wishlist.",
      };
    }

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    try {
      const response = await api.delete(`/wishlist/${productId}`);

      if (response.data?.success) {
        setWishlistItems((previous) =>
          previous.filter(
            (item) => Number(item.product_id) !== Number(productId),
          ),
        );
      }

      return {
        success: Boolean(response.data?.success),
        message: response.data?.message || "",
      };
    } catch (error) {
      console.error("REMOVE WISHLIST ERROR:", error);

      return {
        success: false,
        requiresLogin: error.response?.status === 401,
        status: error.response?.status,
        message:
          error.response?.data?.message ||
          "Failed to remove product from wishlist.",
      };
    }
  };

  // =====================================================
  // CHECK PRODUCT
  // =====================================================

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) {
        return false;
      }

      return wishlistItems.some(
        (item) => Number(item.product_id) === Number(productId),
      );
    },
    [wishlistItems],
  );

  // =====================================================
  // TOGGLE WISHLIST
  // =====================================================

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    }

    return addToWishlist(productId);
  };

  // =====================================================
  // CLEAR WISHLIST
  // =====================================================

  const clearWishlist = async () => {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    try {
      const response = await api.delete("/wishlist/clear/all");

      if (response.data?.success) {
        setWishlistItems([]);
      }

      return {
        success: Boolean(response.data?.success),
        message: response.data?.message || "",
      };
    } catch (error) {
      console.error("CLEAR WISHLIST ERROR:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Failed to clear wishlist.",
      };
    }
  };

  // =====================================================
  // COUNT
  // =====================================================

  const wishlistCount = wishlistItems.length;

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount,
      loading,
      isLoggedIn,

      loadWishlist,

      addToWishlist,
      removeFromWishlist,

      isInWishlist,
      toggleWishlist,

      clearWishlist,
    }),
    [
      wishlistItems,
      wishlistCount,
      loading,
      isLoggedIn,
      loadWishlist,
      isInWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}

export default WishlistContext;
