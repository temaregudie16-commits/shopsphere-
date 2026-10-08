import { createContext, useContext, useEffect, useMemo, useState } from "react";

// =====================================================
// CONTEXT
// =====================================================

const CartContext = createContext(null);

// =====================================================
// PROVIDER
// =====================================================

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
      return [];
    }
  });

  // ===================================================
  // SAVE CART
  // ===================================================

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("CART SAVE ERROR:", error);
    }
  }, [cartItems]);

  // ===================================================
  // ADD TO CART
  // ===================================================

  const addToCart = (product) => {
    if (!product) {
      return false;
    }

    const id = product.id ?? product.product_id;

    if (!id) {
      console.error("PRODUCT ID MISSING:", product);
      return false;
    }

    const stock = Number(product.stock || 0);
    const quantity = Math.max(Number(product.quantity || 1), 1);

    setCartItems((current) => {
      const existing = current.find((item) => Number(item.id) === Number(id));

      // EXISTING
      if (existing) {
        let newQuantity = Number(existing.quantity || 0) + quantity;

        if (stock > 0) {
          newQuantity = Math.min(newQuantity, stock);
        }

        return current.map((item) =>
          Number(item.id) === Number(id)
            ? {
                ...item,
                quantity: newQuantity,
                stock: stock || Number(item.stock || 0),
              }
            : item,
        );
      }

      // NEW
      const finalQuantity = stock > 0 ? Math.min(quantity, stock) : quantity;

      return [
        ...current,
        {
          id,
          product_id: id,
          name: product.name || "",
          description: product.description || "",
          price: Number(product.price || 0),
          image: product.image || "",
          stock,
          category_name: product.category_name || "",
          quantity: finalQuantity,
        },
      ];
    });

    return true;
  };

  // ===================================================
  // REMOVE
  // ===================================================

  const removeFromCart = (id) => {
    setCartItems((current) =>
      current.filter((item) => Number(item.id) !== Number(id)),
    );
  };

  // ===================================================
  // INCREASE
  // ===================================================

  const increaseQuantity = (id) => {
    setCartItems((current) =>
      current.map((item) => {
        if (Number(item.id) !== Number(id)) {
          return item;
        }

        const quantity = Number(item.quantity || 0);

        const stock = Number(item.stock || 0);

        const newQuantity =
          stock > 0 ? Math.min(quantity + 1, stock) : quantity + 1;

        return {
          ...item,
          quantity: newQuantity,
        };
      }),
    );
  };

  // ===================================================
  // DECREASE
  // ===================================================

  const decreaseQuantity = (id) => {
    setCartItems((current) =>
      current
        .map((item) => {
          if (Number(item.id) !== Number(id)) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(Number(item.quantity || 0) - 1, 0),
          };
        })
        .filter((item) => Number(item.quantity || 0) > 0),
    );
  };

  // ===================================================
  // CLEAR
  // ===================================================

  const clearCart = () => {
    setCartItems([]);
  };

  // ===================================================
  // COUNT
  // ===================================================

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartItems]);

  // ===================================================
  // TOTAL
  // ===================================================

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  // ===================================================
  // THIS IS THE PROVIDER VALUE
  // ===================================================

  const value = {
    cartItems,
    cartItemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };

  // ===================================================
  // IMPORTANT:
  // value={value} MUST EXIST
  // ===================================================

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// =====================================================
// HOOK
// =====================================================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

export default CartContext;
