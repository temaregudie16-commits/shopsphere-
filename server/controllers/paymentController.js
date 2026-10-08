const axios = require("axios");
const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Chapa Configuration
|--------------------------------------------------------------------------
*/

const CHAPA_BASE_URL = "https://api.chapa.co/v1";

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

const getBackendUrl = () => process.env.BACKEND_URL || "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

// Keep only numbers
const digitsOnly = (value) => {
  return String(value || "").replace(/\D/g, "");
};

// Normalize Ethiopian phone number
const normalizePhone = (phone) => {
  const digits = digitsOnly(phone);

  if (!digits) {
    return null;
  }

  // 09xxxxxxxx
  if (/^09\d{8}$/.test(digits)) {
    return digits;
  }

  // 07xxxxxxxx
  if (/^07\d{8}$/.test(digits)) {
    return digits;
  }

  // 2519xxxxxxxx -> 09xxxxxxxx
  if (/^2519\d{8}$/.test(digits)) {
    return `0${digits.slice(3)}`;
  }

  // 2517xxxxxxxx -> 07xxxxxxxx
  if (/^2517\d{8}$/.test(digits)) {
    return `0${digits.slice(3)}`;
  }

  return null;
};

// Validate and format amount
const parseAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Number(amount.toFixed(2));
};

/*
|--------------------------------------------------------------------------
| Verify Payment With Chapa
|--------------------------------------------------------------------------
| - 30 second timeout
| - Up to 3 attempts
| - Retry temporary/network failures
| - Do not retry normal 4xx errors
|--------------------------------------------------------------------------
*/

const verifyWithChapa = async (txRef) => {
  if (!process.env.CHAPA_SECRET_KEY) {
    throw new Error("CHAPA_SECRET_KEY is not configured.");
  }

  if (!txRef) {
    throw new Error("Transaction reference is required.");
  }

  const url =
    `${CHAPA_BASE_URL}/transaction/verify/` + encodeURIComponent(txRef);

  const headers = {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔎 Chapa verification attempt ${attempt}/3`);

      const response = await axios.get(url, {
        headers,
        timeout: 30000,
      });

      console.log(
        "✅ CHAPA VERIFY RESPONSE:",
        JSON.stringify(response.data, null, 2),
      );

      return response.data;
    } catch (error) {
      lastError = error;

      const responseStatus = error.response?.status;
      const responseData = error.response?.data;

      console.error(
        `❌ Chapa verification attempt ${attempt}/3 failed:`,
        error.message,
      );

      if (responseData) {
        console.error(
          "Chapa verification response:",
          JSON.stringify(responseData, null, 2),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Don't retry client errors such as:
      | 400 Bad Request
      | 401 Unauthorized
      | 403 Forbidden
      | 404 Not Found
      |--------------------------------------------------------------------------
      */

      if (responseStatus && responseStatus >= 400 && responseStatus < 500) {
        throw error;
      }

      /*
      |--------------------------------------------------------------------------
      | Retry temporary/network/server errors
      |--------------------------------------------------------------------------
      */

      if (attempt < 3) {
        console.log("⏳ Waiting 2 seconds before retry...");

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError;
};

/*
|--------------------------------------------------------------------------
| 1. Initialize Chapa Payment
|--------------------------------------------------------------------------
| POST /api/payments/chapa/initialize
|--------------------------------------------------------------------------
*/

exports.initializePayment = async (req, res) => {
  try {
    console.log("========================================");
    console.log("💳 CHAPA PAYMENT INITIALIZATION");
    console.log("========================================");

    /*
    |--------------------------------------------------------------------------
    | Check Secret Key
    |--------------------------------------------------------------------------
    */

    if (!process.env.CHAPA_SECRET_KEY) {
      console.error("❌ CHAPA_SECRET_KEY is missing.");

      return res.status(500).json({
        success: false,
        message: "Chapa secret key is not configured on the server.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Read Request Body
    |--------------------------------------------------------------------------
    */

    const { amount, email, first_name, last_name, phone, payment_method } =
      req.body || {};

    /*
    |--------------------------------------------------------------------------
    | Validate Amount
    |--------------------------------------------------------------------------
    */

    const parsedAmount = parseAmount(amount);

    if (!parsedAmount) {
      return res.status(400).json({
        success: false,
        message: "A valid payment amount is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Email
    |--------------------------------------------------------------------------
    */

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate First Name
    |--------------------------------------------------------------------------
    */

    if (!first_name || !String(first_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer first name is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Last Name
    |--------------------------------------------------------------------------
    */

    if (!last_name || !String(last_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer last name is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Unique Transaction Reference
    |--------------------------------------------------------------------------
    */

    const randomPart = crypto.randomBytes(5).toString("hex");

    const txRef = `SHOPSPHERE-PAY-${Date.now()}-${randomPart}`;

    /*
    |--------------------------------------------------------------------------
    | Callback URL
    |--------------------------------------------------------------------------
    */

    const callbackUrl = `${getBackendUrl()}/api/payments/chapa/callback`;

    /*
    |--------------------------------------------------------------------------
    | Return URL
    |--------------------------------------------------------------------------
    */

    const returnUrl =
      `${getFrontendUrl()}/payment-success` +
      `?tx_ref=${encodeURIComponent(txRef)}` +
      `&payment_method=${encodeURIComponent(payment_method || "chapa")}`;

    /*
    |--------------------------------------------------------------------------
    | Normalize Phone
    |--------------------------------------------------------------------------
    */

    const normalizedPhone = normalizePhone(phone);

    /*
    |--------------------------------------------------------------------------
    | Chapa Payload
    |--------------------------------------------------------------------------
    */

    const payload = {
      amount: String(parsedAmount),

      currency: "ETB",

      email: String(email).trim(),

      first_name: String(first_name).trim(),

      last_name: String(last_name).trim(),

      tx_ref: txRef,

      callback_url: callbackUrl,

      return_url: returnUrl,

      /*
      |--------------------------------------------------------------------------
      | Chapa allows max 16 characters for customization.title
      |--------------------------------------------------------------------------
      */

      customization: {
        title: "ShopSphere",
        description: "ShopSphere order payment",
      },

      meta: {
        user_id: req.user?.id || null,
        payment_method: payment_method || "chapa",
      },
    };

    /*
    |--------------------------------------------------------------------------
    | Add Phone Only If Valid
    |--------------------------------------------------------------------------
    */

    if (normalizedPhone) {
      payload.phone_number = normalizedPhone;
    }

    /*
    |--------------------------------------------------------------------------
    | Safe Logging
    |--------------------------------------------------------------------------
    */

    console.log("📤 Sending Chapa request:");

    console.log({
      amount: payload.amount,
      currency: payload.currency,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      tx_ref: payload.tx_ref,
      callback_url: payload.callback_url,
      return_url: payload.return_url,
      phone_number: payload.phone_number || "(not sent)",
      payment_method: payment_method || "chapa",
    });

    /*
    |--------------------------------------------------------------------------
    | Initialize Payment
    |--------------------------------------------------------------------------
    */

    const response = await axios.post(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,

          "Content-Type": "application/json",
        },

        timeout: 30000,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    console.log("✅ CHAPA INITIALIZATION SUCCESS");

    console.log("Chapa response:", JSON.stringify(response.data, null, 2));

    /*
    |--------------------------------------------------------------------------
    | Get Checkout URL
    |--------------------------------------------------------------------------
    */

    const chapaData = response.data?.data || {};

    const checkoutUrl =
      chapaData.checkout_url || response.data?.checkout_url || null;

    if (!checkoutUrl) {
      console.error("❌ Chapa did not return checkout_url.");

      return res.status(500).json({
        success: false,

        message: "Chapa did not return a checkout URL.",

        chapa: response.data || null,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Return Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message: "Payment initialized successfully.",

      tx_ref: txRef,

      checkout_url: checkoutUrl,

      data: response.data,
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Error Information
    |--------------------------------------------------------------------------
    */

    const status = error.response?.status || 500;

    const chapaResponse = error.response?.data || null;

    console.error("========================================");

    console.error("❌ CHAPA INITIALIZATION ERROR");

    console.error("========================================");

    console.error("Status:", status);

    console.error("Message:", error.message);

    if (chapaResponse) {
      console.error("Chapa response:", JSON.stringify(chapaResponse, null, 2));
    }

    return res.status(status).json({
      success: false,

      message:
        typeof chapaResponse?.message === "string"
          ? chapaResponse.message
          : chapaResponse?.error ||
            error.message ||
            "Payment initialization failed.",

      error: chapaResponse?.error || null,

      chapa: chapaResponse || null,
    });
  }
};

/*
|--------------------------------------------------------------------------
| 2. Verify Chapa Payment
|--------------------------------------------------------------------------
| GET /api/payments/chapa/verify/:tx_ref
|--------------------------------------------------------------------------
*/

exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({
        success: false,
        paid: false,
        message: "Transaction reference is required.",
      });
    }

    console.log("🔎 Starting payment verification:", tx_ref);

    const chapaResult = await verifyWithChapa(tx_ref);

    const data = chapaResult?.data || {};

    const status = String(
      data.status || chapaResult?.status || "",
    ).toLowerCase();

    const currency = String(
      data.currency || chapaResult?.currency || "",
    ).toUpperCase();

    const amount = parseAmount(data.amount ?? chapaResult?.amount);

    /*
    |--------------------------------------------------------------------------
    | Payment is confirmed only when:
    | status = success
    | currency = ETB
    |--------------------------------------------------------------------------
    */

    const paid = status === "success" && currency === "ETB";

    console.log("💰 PAYMENT VERIFICATION:", {
      tx_ref,
      status,
      amount,
      currency,
      paid,
    });

    return res.status(200).json({
      success: true,

      paid,

      tx_ref,

      status,

      amount,

      currency,

      data: chapaResult,
    });
  } catch (error) {
    const status = error.response?.status || 500;

    const chapaResponse = error.response?.data || null;

    console.error("========================================");

    console.error("❌ CHAPA VERIFY ERROR");

    console.error("========================================");

    console.error("Status:", status);

    console.error("Message:", error.message);

    if (chapaResponse) {
      console.error("Chapa response:", JSON.stringify(chapaResponse, null, 2));
    }

    return res.status(status).json({
      success: false,

      paid: false,

      message:
        typeof chapaResponse?.message === "string"
          ? chapaResponse.message
          : chapaResponse?.error ||
            error.message ||
            "Payment verification failed.",

      chapa: chapaResponse || null,
    });
  }
};

/*
|--------------------------------------------------------------------------
| 3. Chapa Callback
|--------------------------------------------------------------------------
| GET /api/payments/chapa/callback
|--------------------------------------------------------------------------
*/

exports.chapaCallback = async (req, res) => {
  try {
    const txRef =
      req.query?.tx_ref || req.query?.trx_ref || req.query?.transaction_id;

    console.log("🔔 CHAPA CALLBACK:");

    console.log(JSON.stringify(req.query, null, 2));

    /*
    |--------------------------------------------------------------------------
    | Missing tx_ref
    |--------------------------------------------------------------------------
    */

    if (!txRef) {
      console.error("❌ Callback has no tx_ref.");

      return res.redirect(
        `${getFrontendUrl()}` + `/payment-failed` + `?reason=missing_tx_ref`,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Payment Server-Side
    |--------------------------------------------------------------------------
    */

    const result = await verifyWithChapa(txRef);

    const data = result?.data || {};

    const status = String(data.status || result?.status || "").toLowerCase();

    const currency = String(
      data.currency || result?.currency || "",
    ).toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    if (status === "success" && currency === "ETB") {
      console.log("✅ CALLBACK PAYMENT SUCCESS:", txRef);

      return res.redirect(
        `${getFrontendUrl()}` +
          `/payment-success` +
          `?tx_ref=${encodeURIComponent(txRef)}`,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Failed
    |--------------------------------------------------------------------------
    */

    console.log("❌ CALLBACK PAYMENT FAILED:", {
      txRef,
      status,
      currency,
    });

    return res.redirect(
      `${getFrontendUrl()}` +
        `/payment-failed` +
        `?tx_ref=${encodeURIComponent(txRef)}`,
    );
  } catch (error) {
    console.error("========================================");

    console.error("❌ CHAPA CALLBACK ERROR");

    console.error("========================================");

    console.error("Message:", error.message);

    if (error.response?.data) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }

    return res.redirect(
      `${getFrontendUrl()}` + `/payment-failed` + `?reason=verification_failed`,
    );
  }
};

/*
|--------------------------------------------------------------------------
| 4. Chapa Webhook
|--------------------------------------------------------------------------
| POST /api/payments/chapa/webhook
|--------------------------------------------------------------------------
*/

exports.chapaWebhook = async (req, res) => {
  try {
    console.log("🔔 CHAPA WEBHOOK RECEIVED");

    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;

    /*
    |--------------------------------------------------------------------------
    | Optional Signature Verification
    |--------------------------------------------------------------------------
    */

    if (webhookSecret) {
      const signature =
        req.headers["x-chapa-signature"] ||
        req.headers["chapa-signature"] ||
        "";

      const rawBody = JSON.stringify(req.body || {});

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature && signature !== expectedSignature) {
        console.error("❌ Invalid Chapa webhook signature.");

        return res.status(401).json({
          success: false,

          message: "Invalid webhook signature.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Log webhook
    |--------------------------------------------------------------------------
    */

    console.log("Webhook data:", JSON.stringify(req.body, null, 2));

    return res.status(200).json({
      success: true,

      message: "Webhook received.",
    });
  } catch (error) {
    console.error("❌ CHAPA WEBHOOK ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Webhook processing failed.",
    });
  }
};
