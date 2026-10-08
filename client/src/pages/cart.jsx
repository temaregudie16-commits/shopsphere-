import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, cartItemCount, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold">🛒 Cart Test</h1>

        <div className="mt-6 space-y-3">
          <p>
            Cart items: {Array.isArray(cartItems) ? cartItems.length : "ERROR"}
          </p>

          <p>Cart count: {cartItemCount}</p>

          <p>Cart total: ${Number(cartTotal || 0).toFixed(2)}</p>
        </div>

        {Array.isArray(cartItems) && cartItems.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Products</h2>

            {cartItems.map((item) => (
              <div key={item.id} className="border-b py-4">
                <p className="font-bold">{item.name}</p>

                <p>Quantity: {item.quantity}</p>

                <p>Price: ${Number(item.price || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl">
            🛒 Cart is empty
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
