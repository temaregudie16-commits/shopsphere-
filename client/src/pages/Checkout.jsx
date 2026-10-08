import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

// =====================================================
// COUNTRY LIST
// =====================================================

const COUNTRY_OPTIONS = (() => {
  try {
    if (
      typeof Intl !== "undefined" &&
      typeof Intl.DisplayNames === "function"
    ) {
      const regions = [
        "AF",
        "AL",
        "DZ",
        "AS",
        "AD",
        "AO",
        "AI",
        "AQ",
        "AG",
        "AR",
        "AM",
        "AW",
        "AU",
        "AT",
        "AZ",
        "BS",
        "BH",
        "BD",
        "BB",
        "BY",
        "BE",
        "BZ",
        "BJ",
        "BM",
        "BT",
        "BO",
        "BQ",
        "BA",
        "BW",
        "BV",
        "BR",
        "IO",
        "BN",
        "BG",
        "BF",
        "BI",
        "CV",
        "KH",
        "CM",
        "CA",
        "KY",
        "CF",
        "TD",
        "CL",
        "CN",
        "CX",
        "CC",
        "CO",
        "KM",
        "CG",
        "CD",
        "CK",
        "CR",
        "CI",
        "HR",
        "CU",
        "CW",
        "CY",
        "CZ",
        "DK",
        "DJ",
        "DM",
        "DO",
        "EC",
        "EG",
        "SV",
        "GQ",
        "ER",
        "EE",
        "SZ",
        "ET",
        "FK",
        "FO",
        "FJ",
        "FI",
        "FR",
        "GF",
        "PF",
        "TF",
        "GA",
        "GM",
        "GE",
        "DE",
        "GH",
        "GI",
        "GR",
        "GL",
        "GD",
        "GP",
        "GU",
        "GT",
        "GG",
        "GN",
        "GW",
        "GY",
        "HT",
        "HM",
        "VA",
        "HN",
        "HK",
        "HU",
        "IS",
        "IN",
        "ID",
        "IR",
        "IQ",
        "IE",
        "IM",
        "IL",
        "IT",
        "JM",
        "JP",
        "JE",
        "JO",
        "KZ",
        "KE",
        "KI",
        "KP",
        "KR",
        "KW",
        "KG",
        "LA",
        "LV",
        "LB",
        "LS",
        "LR",
        "LY",
        "LI",
        "LT",
        "LU",
        "MO",
        "MG",
        "MW",
        "MY",
        "MV",
        "ML",
        "MT",
        "MH",
        "MQ",
        "MR",
        "MU",
        "YT",
        "MX",
        "FM",
        "MD",
        "MC",
        "MN",
        "ME",
        "MS",
        "MA",
        "MZ",
        "MM",
        "NA",
        "NR",
        "NP",
        "NL",
        "NC",
        "NZ",
        "NI",
        "NE",
        "NG",
        "NU",
        "NF",
        "MK",
        "MP",
        "NO",
        "OM",
        "PK",
        "PW",
        "PS",
        "PA",
        "PG",
        "PY",
        "PE",
        "PH",
        "PN",
        "PL",
        "PT",
        "PR",
        "QA",
        "RE",
        "RO",
        "RU",
        "RW",
        "BL",
        "SH",
        "KN",
        "LC",
        "MF",
        "PM",
        "VC",
        "WS",
        "SM",
        "ST",
        "SA",
        "SN",
        "RS",
        "SC",
        "SL",
        "SG",
        "SX",
        "SK",
        "SI",
        "SB",
        "SO",
        "ZA",
        "GS",
        "SS",
        "ES",
        "LK",
        "SD",
        "SR",
        "SJ",
        "SE",
        "CH",
        "SY",
        "TW",
        "TJ",
        "TZ",
        "TH",
        "TL",
        "TG",
        "TK",
        "TO",
        "TT",
        "TN",
        "TR",
        "TM",
        "TC",
        "TV",
        "UG",
        "UA",
        "AE",
        "GB",
        "US",
        "UM",
        "UY",
        "UZ",
        "VU",
        "VE",
        "VN",
        "VG",
        "VI",
        "WF",
        "EH",
        "YE",
        "ZM",
        "ZW",
      ];

      const names = new Intl.DisplayNames(["en"], {
        type: "region",
      });

      return regions
        .map((code) => ({
          code,
          name: names.of(code) || code,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    console.warn("COUNTRY LIST WARNING:", error);
  }

  return [
    { code: "ET", name: "Ethiopia" },
    { code: "KE", name: "Kenya" },
    { code: "UG", name: "Uganda" },
    { code: "TZ", name: "Tanzania" },
    { code: "RW", name: "Rwanda" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AE", name: "United Arab Emirates" },
  ];
})();

// =====================================================
// PAYMENT METHODS
// =====================================================

const PAYMENT_METHODS = [
  {
    key: "cash",
    name: "Cash on Delivery",
    description: "Pay when your order arrives.",
    icon: "💵",
    type: "offline",
    activeClass: "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100",
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "telebirr",
    name: "Telebirr",
    description: "Secure online payment through Chapa.",
    icon: "📱",
    type: "chapa",
    activeClass: "border-purple-500 bg-purple-50 ring-2 ring-purple-100",
    iconClass: "bg-purple-100 text-purple-700",
  },
  {
    key: "cbe",
    name: "Commercial Bank of Ethiopia",
    description: "Secure online payment through Chapa.",
    icon: "🏦",
    type: "chapa",
    activeClass: "border-blue-500 bg-blue-50 ring-2 ring-blue-100",
    iconClass: "bg-blue-100 text-blue-700",
  },
  {
    key: "boa",
    name: "Bank of Abyssinia",
    description: "Secure online payment through Chapa.",
    icon: "🏦",
    type: "chapa",
    activeClass: "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100",
    iconClass: "bg-cyan-100 text-cyan-700",
  },
  {
    key: "abay",
    name: "Abay Bank",
    description: "Secure online payment through Chapa.",
    icon: "🏦",
    type: "chapa",
    activeClass: "border-amber-500 bg-amber-50 ring-2 ring-amber-100",
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    key: "awash",
    name: "Awash Bank",
    description: "Secure online payment through Chapa.",
    icon: "🏦",
    type: "chapa",
    activeClass: "border-red-500 bg-red-50 ring-2 ring-red-100",
    iconClass: "bg-red-100 text-red-700",
  },
];

// =====================================================
// CURRENCY
// =====================================================

const money = (value) => {
  const amount = Number(value || 0);

  return `ETB ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// SAVED USER
// =====================================================

const getSavedUser = () => {
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
// CHECKOUT
// =====================================================

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, cartTotal, clearCart } = useCart();

  // ===================================================
  // CUSTOMER FORM
  // ===================================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Ethiopia",
    notes: "",
    paymentMethod: "cash",
  });

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  // ===================================================
  // GPS LOCATION
  // ===================================================

  const [gpsLoading, setGpsLoading] = useState(false);

  const [gpsError, setGpsError] = useState("");

  const [gpsLocation, setGpsLocation] = useState(null);

  // ===================================================
  // COUPON
  // ===================================================

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [discountAmount, setDiscountAmount] = useState(0);

  const [couponLoading, setCouponLoading] = useState(false);

  const [couponMessage, setCouponMessage] = useState("");

  const [couponError, setCouponError] = useState("");

  // ===================================================
  // TOTAL ITEMS
  // ===================================================

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  // ===================================================
  // SUBTOTAL
  // ===================================================

  const subtotal = useMemo(() => {
    return Number(Number(cartTotal || 0).toFixed(2));
  }, [cartTotal]);

  // ===================================================
  // DELIVERY
  // ===================================================

  const deliveryFee = 0;

  // ===================================================
  // FINAL TOTAL
  // ===================================================

  const finalTotal = useMemo(() => {
    const result =
      subtotal - Number(discountAmount || 0) + Number(deliveryFee || 0);

    return Number(Math.max(result, 0).toFixed(2));
  }, [subtotal, discountAmount, deliveryFee]);

  // ===================================================
  // SELECTED PAYMENT
  // ===================================================

  const selectedPayment = useMemo(() => {
    return (
      PAYMENT_METHODS.find((method) => method.key === formData.paymentMethod) ||
      PAYMENT_METHODS[0]
    );
  }, [formData.paymentMethod]);

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ===================================================
  // GPS CURRENT LOCATION
  // ===================================================

  const handleGetCurrentLocation = () => {
    setGpsError("");
    setGpsLoading(true);

    if (!navigator.geolocation) {
      setGpsLoading(false);
      setGpsError(
        "GPS is not supported by this browser. Please enter your location manually.",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        let placeName = "Current Location";
        let city = "";
        let country = formData.country || "Ethiopia";
        let address = "";

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

            const addressData = data?.address || {};

            city =
              addressData.city ||
              addressData.town ||
              addressData.village ||
              addressData.municipality ||
              addressData.county ||
              "";

            country = addressData.country || formData.country || "Ethiopia";

            const addressParts = [
              addressData.house_number,
              addressData.road,
              addressData.neighbourhood,
              addressData.suburb,
            ].filter(Boolean);

            address =
              addressParts.join(", ") || city || data?.display_name || "";

            placeName =
              city ||
              addressData.state ||
              data?.display_name ||
              "Current Location";
          }
        } catch (error) {
          console.error("GPS REVERSE LOCATION ERROR:", error);

          placeName = "GPS Location";

          address = `Latitude: ${latitude.toFixed(
            6,
          )}, Longitude: ${longitude.toFixed(6)}`;
        }

        const locationData = {
          latitude,
          longitude,
          accuracy,
          placeName,
          address,
          city,
          country,
        };

        setGpsLocation(locationData);
        setGpsLoading(false);

        setFormData((previous) => ({
          ...previous,
          address: address || previous.address,
          city: city || previous.city,
          country: country || previous.country,
        }));

        setErrors((previous) => ({
          ...previous,
          address: "",
          city: "",
          country: "",
        }));
      },

      (geoError) => {
        setGpsLoading(false);

        console.error("GPS ERROR:", geoError);

        switch (geoError.code) {
          case 1:
            setGpsError(
              "Location permission was denied. Please allow location access in your browser.",
            );
            break;

          case 2:
            setGpsError(
              "Your current location is unavailable. Please check your GPS/location service.",
            );
            break;

          case 3:
            setGpsError("Location request timed out. Please try again.");
            break;

          default:
            setGpsError(
              "Unable to get your current location. Please enter your location manually.",
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===================================================
  // APPLY COUPON
  // ===================================================

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    setCouponMessage("");
    setCouponError("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (subtotal <= 0) {
      setCouponError("Your cart total must be greater than 0.");
      return;
    }

    setCouponLoading(true);

    try {
      console.log("🎟️ VALIDATING COUPON:", {
        code,
        cartTotal: subtotal,
      });

      const response = await api.post("/coupons/validate", {
        code,
        cartTotal: subtotal,
      });

      console.log("🎟️ COUPON RESPONSE:", response.data);

      if (response.data?.success) {
        const discount = Number(response.data.discount || 0);

        setAppliedCoupon(
          response.data.coupon || {
            code,
          },
        );

        setDiscountAmount(Math.min(discount, subtotal));

        setCouponCode(response.data.coupon?.code || code);

        setCouponMessage(
          response.data.message || "Coupon applied successfully.",
        );

        setCouponError("");
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);

        setCouponError(response.data?.message || "Invalid coupon code.");
      }
    } catch (error) {
      console.error("APPLY COUPON ERROR:", error);

      setAppliedCoupon(null);
      setDiscountAmount(0);

      if (error.response) {
        setCouponError(
          error.response.data?.message || "Coupon could not be applied.",
        );
      } else if (error.request) {
        setCouponError("Cannot connect to ShopSphere server.");
      } else {
        setCouponError(error.message || "Something went wrong.");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  // ===================================================
  // REMOVE COUPON
  // ===================================================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponMessage("");
    setCouponError("");
  };

  // ===================================================
  // PLACE ORDER / INITIALIZE PAYMENT
  // ===================================================

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Please add products first.");

      navigate("/products");

      return;
    }

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const user = getSavedUser();

    const userId = user?.id ?? user?.user_id;

    if (!userId) {
      alert("Your login session could not be found. Please login again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");

      return;
    }

    const items = cartItems.map((item) => ({
      product_id: item.id ?? item.product_id,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
    }));

    const invalidItem = items.find(
      (item) =>
        !item.product_id ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.price < 0,
    );

    if (invalidItem) {
      alert("One of your cart items is invalid. Please review your cart.");

      navigate("/cart");

      return;
    }

    const totalPrice = Number(finalTotal.toFixed(2));

    const appliedDiscount = Number(discountAmount || 0);

    const selectedMethod = formData.paymentMethod;

    setSubmitting(true);

    try {
      // =================================================
      // CASH ON DELIVERY
      // =================================================

      if (selectedMethod === "cash") {
        const orderPayload = {
          user_id: userId,

          first_name: formData.firstName.trim(),

          last_name: formData.lastName.trim(),

          email: formData.email.trim(),

          phone: formData.phone.trim(),

          address: formData.address.trim(),

          city: formData.city.trim(),

          country: formData.country.trim(),

          notes: formData.notes.trim(),

          payment_method: "cash",

          subtotal,

          discount_amount: appliedDiscount,

          delivery_fee: deliveryFee,

          total_price: totalPrice,

          coupon_code: appliedCoupon?.code || null,

          // GPS DATA
          latitude: gpsLocation?.latitude ?? null,

          longitude: gpsLocation?.longitude ?? null,

          location_name: gpsLocation?.placeName || "",

          location_accuracy: gpsLocation?.accuracy ?? null,

          items,
        };

        console.log("💵 CASH ORDER REQUEST:", orderPayload);

        const response = await api.post("/orders", orderPayload);

        console.log("✅ CASH ORDER RESPONSE:", response.data);

        const orderId =
          response.data?.order_id ??
          response.data?.orderId ??
          response.data?.id ??
          null;

        if (!orderId) {
          throw new Error("Order was created but no order ID was returned.");
        }

        clearCart();

        alert(`Order #${orderId} created successfully ✅`);

        navigate("/orders", {
          replace: true,
        });

        return;
      }

      // =================================================
      // ONLINE PAYMENT
      // =================================================

      console.log("💳 INITIALIZING CHAPA PAYMENT:", {
        amount: totalPrice,
        email: formData.email.trim(),
        paymentMethod: selectedMethod,
      });

      const paymentResponse = await api.post("/payments/chapa/initialize", {
        amount: totalPrice,

        email: formData.email.trim(),

        first_name: formData.firstName.trim(),

        last_name: formData.lastName.trim(),

        phone_number: formData.phone.trim(),

        payment_method: selectedMethod,
      });

      console.log("✅ CHAPA INITIALIZE RESPONSE:", paymentResponse.data);

      const checkoutUrl = paymentResponse.data?.checkout_url;

      const txRef = paymentResponse.data?.tx_ref;

      if (!checkoutUrl || !txRef) {
        throw new Error("Chapa did not return a valid checkout URL.");
      }

      // =================================================
      // TEMPORARY PAYMENT SESSION
      // =================================================

      const pendingPayment = {
        txRef,

        userId: Number(userId),

        paymentMethod: selectedMethod,

        subtotal: Number(subtotal.toFixed(2)),

        discountAmount: Number(appliedDiscount.toFixed(2)),

        deliveryFee: Number(deliveryFee.toFixed(2)),

        totalPrice,

        couponCode: appliedCoupon?.code || null,

        // GPS DATA
        location: gpsLocation
          ? {
              latitude: gpsLocation.latitude,

              longitude: gpsLocation.longitude,

              accuracy: gpsLocation.accuracy,

              placeName: gpsLocation.placeName,
            }
          : null,

        customer: {
          firstName: formData.firstName.trim(),

          lastName: formData.lastName.trim(),

          email: formData.email.trim(),

          phone: formData.phone.trim(),

          address: formData.address.trim(),

          city: formData.city.trim(),

          country: formData.country.trim(),

          notes: formData.notes.trim(),
        },

        items,
      };

      sessionStorage.setItem(
        "shopsphere_pending_payment",
        JSON.stringify(pendingPayment),
      );

      console.log("💾 PENDING PAYMENT SAVED:", {
        txRef,
        amount: totalPrice,
        paymentMethod: selectedMethod,

        gpsLocation,
      });

      // DO NOT CLEAR CART HERE.
      // DO NOT CREATE ORDER HERE.

      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error("❌ CHECKOUT ERROR:", error);

      if (error.response) {
        console.error(
          "SERVER RESPONSE:",
          error.response.status,
          error.response.data,
        );

        const serverData = error.response.data;

        const serverMessage = serverData?.message;

        if (typeof serverMessage === "string") {
          alert(serverMessage);
        } else {
          alert("Payment initialization failed. Please try again.");
        }

        console.error("SERVER ERROR DATA:", serverData);
      } else if (error.request) {
        alert("Cannot connect to ShopSphere server.");
      } else {
        alert(error.message || "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // EMPTY CART
  // ===================================================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
        {/* HEADER */}

        <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <p className="text-blue-200 text-sm font-black uppercase">
              ShopSphere
            </p>

            <h1 className="text-3xl md:text-4xl font-black mt-1">Checkout</h1>
          </div>
        </section>

        {/* EMPTY */}

        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <div className="text-6xl">🛒</div>

            <h2 className="text-3xl font-black text-slate-800 mt-5">
              Your cart is empty
            </h2>

            <p className="text-slate-500 mt-2">
              Add products before going to checkout.
            </p>

            <Link
              to="/products"
              className="inline-block mt-7 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-black"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-5">
            <div>
              <p className="text-blue-200 text-sm font-black uppercase">
                ShopSphere
              </p>

              <h1 className="text-3xl md:text-4xl font-black mt-1">Checkout</h1>

              <p className="text-blue-100 mt-2">
                Complete your order information.
              </p>
            </div>

            <Link
              to="/cart"
              className="self-start bg-white text-blue-700 px-5 py-3 rounded-xl font-black hover:bg-slate-100"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="xl:col-span-2 space-y-6">
            {/* =================================================
                CUSTOMER INFORMATION
            ================================================= */}

            <section className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-blue-600 text-xs uppercase font-black">
                Step 1
              </p>

              <h2 className="text-2xl font-black text-slate-800 mt-1">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                {/* FIRST NAME */}

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    First Name *
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? "border-red-500" : "border-slate-300"
                    }`}
                  />

                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* LAST NAME */}

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Last Name *
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? "border-red-500" : "border-slate-300"
                    }`}
                  />

                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-slate-300"
                    }`}
                  />

                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* PHONE */}

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="09XXXXXXXX"
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-slate-300"
                    }`}
                  />

                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                DELIVERY INFORMATION
            ================================================= */}

            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-blue-600 text-xs uppercase font-black">
                    Step 2
                  </p>

                  <h2 className="text-2xl font-black text-slate-800 mt-1">
                    Delivery Information
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    Enter your delivery address or use GPS to detect your
                    current location.
                  </p>
                </div>

                {/* GPS BUTTON */}

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={gpsLoading}
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-3 font-black transition-all duration-300 shadow-sm"
                >
                  {gpsLoading
                    ? "📍 Detecting..."
                    : "📍 Use My Current Location"}
                </button>
              </div>

              {/* GPS ERROR */}

              {gpsError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  ❌ {gpsError}
                </div>
              )}

              {/* GPS SUCCESS */}

              {gpsLocation && (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0">
                      📍
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider font-black text-blue-600">
                        Current GPS Location
                      </p>

                      <p className="text-lg font-black text-slate-900 mt-1 break-words">
                        {gpsLocation.placeName}
                      </p>

                      {gpsLocation.address && (
                        <p className="text-sm text-slate-600 mt-1 break-words">
                          {gpsLocation.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[10px] uppercase font-black text-slate-400">
                        Latitude
                      </p>

                      <p className="font-black text-slate-800 mt-1">
                        {gpsLocation.latitude.toFixed(6)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[10px] uppercase font-black text-slate-400">
                        Longitude
                      </p>

                      <p className="font-black text-slate-800 mt-1">
                        {gpsLocation.longitude.toFixed(6)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[10px] uppercase font-black text-slate-400">
                        Accuracy
                      </p>

                      <p className="font-black text-slate-800 mt-1">
                        ±{Math.round(gpsLocation.accuracy)} m
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-blue-700 mt-4 font-semibold">
                    ✅ Your delivery fields were updated from your current GPS
                    location.
                  </p>
                </div>
              )}

              <div className="space-y-5 mt-6">
                {/* ADDRESS */}

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Address *
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street / area / house number"
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? "border-red-500" : "border-slate-300"
                    }`}
                  />

                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* CITY / COUNTRY */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CITY */}

                  <div>
                    <label className="block font-bold text-slate-700 mb-2">
                      City *
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Injibara"
                      className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? "border-red-500" : "border-slate-300"
                      }`}
                    />

                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* COUNTRY */}

                  <div>
                    <label className="block font-bold text-slate-700 mb-2">
                      Country *
                    </label>

                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.country ? "border-red-500" : "border-slate-300"
                      }`}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    {errors.country && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* NOTES */}

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Delivery Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Optional delivery instructions..."
                    className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <section className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-blue-600 text-xs uppercase font-black">
                Step 3
              </p>

              <h2 className="text-2xl font-black text-slate-800 mt-1">
                Payment Method
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Online payments are processed securely through Chapa.
              </p>

              <div className="space-y-3 mt-6">
                {PAYMENT_METHODS.map((method) => {
                  const selected = formData.paymentMethod === method.key;

                  return (
                    <label
                      key={method.key}
                      className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition ${
                        selected
                          ? method.activeClass
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.key}
                        checked={selected}
                        onChange={handleChange}
                        className="h-5 w-5"
                      />

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${method.iconClass}`}
                      >
                        {method.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-800">
                            {method.name}
                          </p>

                          {method.type === "chapa" && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black">
                              CHAPA
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* CHAPA */}

              {selectedPayment.type === "chapa" && (
                <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔒</div>

                    <div>
                      <p className="font-black text-blue-800">
                        Secure Chapa Checkout
                      </p>

                      <p className="text-sm text-blue-700 mt-1">
                        After clicking the button below, you will be redirected
                        to Chapa's secure payment page.
                      </p>

                      <p className="text-xs text-blue-600 mt-2">
                        Selected payment method:{" "}
                        <strong>{selectedPayment.name}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CASH */}

              {selectedPayment.type === "offline" && (
                <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
                  <p className="font-black text-emerald-800">
                    💵 Cash on Delivery
                  </p>

                  <p className="text-sm text-emerald-700 mt-1">
                    Your order will be created immediately and payment will be
                    collected when the order is delivered.
                  </p>
                </div>
              )}

              {errors.paymentMethod && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.paymentMethod}
                </p>
              )}
            </section>
          </div>

          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-2xl font-black text-slate-800">Your Order</h2>

              <p className="text-sm text-slate-500 mt-1">
                {totalItems} item
                {totalItems !== 1 ? "s" : ""}
              </p>

              {/* ITEMS */}

              <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto">
                {cartItems.map((item) => {
                  const price = Number(item.price || 0);

                  const quantity = Number(item.quantity || 0);

                  const itemId = item.id ?? item.product_id;

                  return (
                    <div
                      key={itemId}
                      className="flex justify-between gap-4 border-b pb-4"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 truncate">
                          {item.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {quantity} × {money(price)}
                        </p>
                      </div>

                      <p className="font-black whitespace-nowrap">
                        {money(price * quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* COUPON */}

              <div className="mt-6 p-5 bg-purple-50 border border-purple-100 rounded-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-800">
                      🎟️ Discount Coupon
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Enter your promotional code.
                    </p>
                  </div>

                  {appliedCoupon && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                      Applied
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value.toUpperCase());

                      setCouponError("");

                      if (appliedCoupon) {
                        setAppliedCoupon(null);

                        setDiscountAmount(0);

                        setCouponMessage("");
                      }
                    }}
                    disabled={couponLoading || Boolean(appliedCoupon)}
                    placeholder="WELCOME10"
                    className="flex-1 min-w-0 border border-slate-300 bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-bold uppercase"
                  />

                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-black disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-xl font-black"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {couponMessage && (
                  <p className="text-green-600 text-sm font-bold mt-3">
                    ✅ {couponMessage}
                  </p>
                )}

                {couponError && (
                  <p className="text-red-600 text-sm font-bold mt-3">
                    ❌ {couponError}
                  </p>
                )}

                {appliedCoupon && (
                  <div className="mt-4 bg-white rounded-xl p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Code</span>

                      <span className="font-black">{appliedCoupon.code}</span>
                    </div>

                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-500">Discount</span>

                      <span className="font-black text-green-600">
                        -{money(discountAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PRICE SUMMARY */}

              <div className="border-t mt-6 pt-5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-bold">{money(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between mt-3">
                    <span className="text-green-600 font-bold">
                      Coupon Discount
                    </span>

                    <span className="text-green-600 font-black">
                      -{money(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between mt-3">
                  <span className="text-slate-500">Delivery</span>

                  <span className="text-green-600 font-bold">
                    {deliveryFee === 0 ? "Free" : money(deliveryFee)}
                  </span>
                </div>

                <div className="border-t mt-4 pt-4 flex justify-between items-end gap-3">
                  <span className="text-lg font-black">Total</span>

                  <span className="text-2xl md:text-3xl font-black text-green-600 text-right">
                    {money(finalTotal)}
                  </span>
                </div>
              </div>

              {/* PLACE ORDER */}

              <button
                type="submit"
                disabled={submitting || couponLoading || gpsLoading}
                className="w-full mt-7 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting
                  ? "Processing..."
                  : selectedPayment.type === "chapa"
                    ? `💳 Continue to Chapa ${money(finalTotal)}`
                    : `✅ Place Order ${money(finalTotal)}`}
              </button>

              <Link
                to="/cart"
                className="block text-center mt-4 text-blue-600 font-bold hover:underline"
              >
                ← Back to Cart
              </Link>

              {/* SECURITY */}

              <div className="mt-6 bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-700">🔒 Secure Checkout</p>

                <p className="text-xs text-slate-500 mt-1">
                  Online payments are redirected to Chapa. Your card or payment
                  credentials are not stored by ShopSphere.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}

export default Checkout;
