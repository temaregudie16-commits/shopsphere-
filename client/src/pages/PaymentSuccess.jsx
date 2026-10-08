import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState(null);
  const [txRef, setTxRef] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAndCreateOrder = async () => {
      const currentTxRef = searchParams.get("tx_ref");

      if (currentTxRef && isMounted) {
        setTxRef(currentTxRef);
      }

      /*
      |--------------------------------------------------------------------------
      | Get saved payment information
      |--------------------------------------------------------------------------
      */

      const savedPayment = sessionStorage.getItem("shopsphere_pending_payment");

      let pendingPayment = null;

      try {
        pendingPayment = savedPayment ? JSON.parse(savedPayment) : null;
      } catch (error) {
        console.error("❌ PENDING PAYMENT DATA ERROR:", error);
      }

      /*
      |--------------------------------------------------------------------------
      | Get Order ID if one exists
      |--------------------------------------------------------------------------
      */

      const savedOrderId =
        searchParams.get("order_id") || pendingPayment?.orderId || null;

      if (savedOrderId && isMounted) {
        setOrderId(savedOrderId);
      }

      /*
      |--------------------------------------------------------------------------
      | Validate transaction reference
      |--------------------------------------------------------------------------
      */

      if (!currentTxRef) {
        if (isMounted) {
          setSuccess(false);
          setMessage("Payment reference was not found.");
          setLoading(false);
        }
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Make sure saved payment belongs to this transaction
      |--------------------------------------------------------------------------
      */

      if (pendingPayment?.txRef && pendingPayment.txRef !== currentTxRef) {
        console.error("❌ TRANSACTION REFERENCE MISMATCH:", {
          urlTxRef: currentTxRef,
          savedTxRef: pendingPayment.txRef,
        });

        if (isMounted) {
          setSuccess(false);
          setMessage("Payment session is invalid. Please try again.");
          setLoading(false);
        }

        return;
      }

      try {
        /*
        |--------------------------------------------------------------------------
        | STEP 1 - VERIFY PAYMENT
        |--------------------------------------------------------------------------
        */

        console.log("🔎 VERIFYING PAYMENT:", {
          txRef: currentTxRef,
          orderId: savedOrderId,
        });

        const verifyResponse = await api.get(
          `/payments/chapa/verify/${encodeURIComponent(currentTxRef)}`,
        );

        const verifyData = verifyResponse.data;

        console.log("✅ PAYMENT VERIFY RESPONSE:", verifyData);

        /*
        |--------------------------------------------------------------------------
        | Extract Chapa information
        |--------------------------------------------------------------------------
        */

        const chapaData = verifyData?.data?.data || verifyData?.data || {};

        const paymentStatus = String(
          verifyData?.status || chapaData?.status || "",
        ).toLowerCase();

        const paymentAmount = Number(
          verifyData?.amount ?? chapaData?.amount ?? 0,
        );

        const savedAmount = Number(pendingPayment?.totalPrice ?? 0);

        const currency = String(
          verifyData?.currency || chapaData?.currency || "",
        ).toUpperCase();

        /*
        |--------------------------------------------------------------------------
        | Get failure reason
        |--------------------------------------------------------------------------
        */

        const failureReason =
          chapaData?.failure_reason ||
          chapaData?.failureReason ||
          verifyData?.failure_reason ||
          verifyData?.error ||
          null;

        /*
        |--------------------------------------------------------------------------
        | STEP 2 - PAYMENT MUST BE SUCCESSFUL
        |--------------------------------------------------------------------------
        */

        if (!verifyData?.success || verifyData?.paid !== true) {
          let failedMessage = "Payment could not be confirmed.";

          if (paymentStatus === "failed/cancelled") {
            failedMessage =
              failureReason ||
              "The Chapa test payment was failed or cancelled.";
          } else if (paymentStatus === "pending") {
            failedMessage =
              "Your payment is still pending. Please wait and try again.";
          } else if (failureReason) {
            failedMessage = failureReason;
          }

          console.error("❌ PAYMENT NOT CONFIRMED:", {
            txRef: currentTxRef,
            status: paymentStatus,
            amount: paymentAmount,
            currency,
            failureReason,
          });

          if (isMounted) {
            setSuccess(false);
            setMessage(failedMessage);
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 3 - CHECK CURRENCY
        |--------------------------------------------------------------------------
        */

        if (currency && currency !== "ETB") {
          console.error("❌ INVALID PAYMENT CURRENCY:", currency);

          if (isMounted) {
            setSuccess(false);
            setMessage(`Payment currency is ${currency}, not ETB.`);
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 4 - CHECK AMOUNT
        |--------------------------------------------------------------------------
        */

        if (savedAmount > 0 && paymentAmount > 0) {
          const difference = Math.abs(paymentAmount - savedAmount);

          if (difference > 0.01) {
            console.error("❌ PAYMENT AMOUNT MISMATCH:", {
              expected: savedAmount,
              received: paymentAmount,
            });

            if (isMounted) {
              setSuccess(false);
              setMessage(
                `Payment amount mismatch. Expected ETB ${savedAmount.toFixed(
                  2,
                )}, received ETB ${paymentAmount.toFixed(2)}.`,
              );
            }

            return;
          }
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT IS CONFIRMED
        |--------------------------------------------------------------------------
        */

        console.log("✅ PAYMENT CONFIRMED:", currentTxRef);

        /*
        |--------------------------------------------------------------------------
        | STEP 5 - CREATE PAID ORDER
        |--------------------------------------------------------------------------
        */

        if (pendingPayment) {
          console.log("📦 Creating paid order...");

          const customer = pendingPayment.customer || {};

          const paidOrderPayload = {
            user_id: Number(pendingPayment.userId),

            first_name: customer.firstName || "",

            last_name: customer.lastName || "",

            email: customer.email || "",

            phone: customer.phone || "",

            address: customer.address || "",

            city: customer.city || "",

            country: customer.country || "Ethiopia",

            notes: customer.notes || "",

            payment_method: pendingPayment.paymentMethod || "chapa",

            subtotal: Number(pendingPayment.subtotal || 0),

            discount_amount: Number(pendingPayment.discountAmount || 0),

            delivery_fee: Number(pendingPayment.deliveryFee || 0),

            total_price: Number(
              pendingPayment.totalPrice || paymentAmount || 0,
            ),

            coupon_code: pendingPayment.couponCode || null,

            items: pendingPayment.items || [],

            payment_reference: currentTxRef,

            initial_status: "paid",
          };

          console.log("📦 PAID ORDER DATA:", {
            user_id: paidOrderPayload.user_id,

            payment_method: paidOrderPayload.payment_method,

            total_price: paidOrderPayload.total_price,

            payment_reference: paidOrderPayload.payment_reference,

            itemsCount: paidOrderPayload.items.length,
          });

          const orderResponse = await api.post(
            "/orders/paid",
            paidOrderPayload,
          );

          console.log("✅ PAID ORDER RESPONSE:", orderResponse.data);

          const createdOrderId =
            orderResponse.data?.order_id ||
            orderResponse.data?.orderId ||
            orderResponse.data?.data?.order_id ||
            orderResponse.data?.data?.id ||
            null;

          if (createdOrderId && isMounted) {
            setOrderId(createdOrderId);
          }
        } else {
          console.warn("⚠️ No pending payment data found in sessionStorage.");
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 6 - Clear cart and payment session
        |--------------------------------------------------------------------------
        */

        clearCart();

        sessionStorage.removeItem("shopsphere_pending_payment");

        /*
        |--------------------------------------------------------------------------
        | STEP 7 - Show success
        |--------------------------------------------------------------------------
        */

        if (isMounted) {
          setSuccess(true);

          setMessage(
            "Your payment has been confirmed and your order has been created successfully.",
          );
        }
      } catch (error) {
        console.error("❌ PAYMENT SUCCESS PAGE ERROR:", error);

        console.error("SERVER RESPONSE:", error.response?.data);

        /*
        |--------------------------------------------------------------------------
        | Extract readable error
        |--------------------------------------------------------------------------
        */

        let errorMessage = "Payment verification failed.";

        if (error.response) {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "The server could not confirm your payment/order.";
        } else if (error.request) {
          errorMessage = "Cannot connect to ShopSphere server.";
        } else {
          errorMessage = error.message || "Payment verification failed.";
        }

        if (isMounted) {
          setSuccess(false);
          setMessage(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyAndCreateOrder();

    return () => {
      isMounted = false;
    };
  }, [searchParams, clearCart]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm p-10 text-center">
          <div className="text-6xl animate-pulse">⏳</div>

          <h1 className="text-3xl font-black text-slate-800 mt-5">
            Verifying Payment
          </h1>

          <p className="text-slate-500 mt-3">
            Please wait while ShopSphere confirms your Chapa payment.
          </p>

          {txRef && (
            <p className="text-xs text-slate-400 mt-5 break-all">
              Transaction: {txRef}
            </p>
          )}
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-10 md:p-14 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-5xl">
            ✅
          </div>

          <p className="text-emerald-600 text-sm font-black uppercase tracking-widest mt-7">
            Payment Successful
          </p>

          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mt-2">
            Thank You!
          </h1>

          <p className="text-slate-500 text-lg mt-4">{message}</p>

          {txRef && (
            <div className="mt-5 mx-auto max-w-xl bg-slate-50 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-bold uppercase">
                Transaction Reference
              </p>

              <p className="text-sm text-slate-700 font-mono break-all mt-1">
                {txRef}
              </p>
            </div>
          )}

          {orderId && (
            <div className="mt-7 inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-3">
              <span className="text-slate-500 font-bold">Order</span>

              <span className="font-black text-slate-800">#{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link
              to="/orders"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-4 rounded-xl font-black transition"
            >
              📦 View My Orders
            </Link>

            <Link
              to="/products"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-7 py-4 rounded-xl font-black transition"
            >
              🛍️ Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | FAILED
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-10 md:p-14 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center text-5xl">
          ❌
        </div>

        <p className="text-red-600 text-sm font-black uppercase tracking-widest mt-7">
          Payment Not Confirmed
        </p>

        <h1 className="text-4xl font-black text-slate-800 mt-2">
          Payment Failed
        </h1>

        <p className="text-slate-500 text-lg mt-4">{message}</p>

        {txRef && (
          <div className="mt-5 mx-auto max-w-xl bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-bold uppercase">
              Transaction Reference
            </p>

            <p className="text-sm text-slate-700 font-mono break-all mt-1">
              {txRef}
            </p>
          </div>
        )}

        {orderId && (
          <div className="mt-7 inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-3">
            <span className="text-slate-500 font-bold">Order</span>

            <span className="font-black text-slate-800">#{orderId}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Link
            to="/checkout"
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-xl font-black transition"
          >
            🔄 Try Again
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

export default PaymentSuccess;
