import { Link, useSearchParams } from "react-router-dom";

function PaymentFailed() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") || "Payment was not completed.";

  const orderId = searchParams.get("order_id") || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-10 md:p-14 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center text-5xl">
          ❌
        </div>

        <p className="text-red-600 text-sm font-black uppercase tracking-widest mt-7">
          Payment Failed
        </p>

        <h1 className="text-4xl font-black text-slate-800 mt-2">
          Payment Was Not Completed
        </h1>

        <p className="text-slate-500 text-lg mt-4">
          Status: <span className="font-black text-slate-700">{status}</span>
        </p>

        {orderId && (
          <div className="mt-7 inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-3">
            <span className="text-slate-500 font-bold">Order</span>

            <span className="font-black text-slate-800">#{orderId}</span>
          </div>
        )}

        <p className="text-sm text-slate-500 mt-6">
          Your payment was not confirmed. Please try again or check your order
          status.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Link
            to="/checkout"
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-xl font-black transition"
          >
            🔄 Return to Checkout
          </Link>

          <Link
            to="/orders"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-7 py-4 rounded-xl font-black transition"
          >
            📦 My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailed;
