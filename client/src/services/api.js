import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",

  headers: {
    Accept: "application/json",
  },

  withCredentials: true,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData must NOT receive manually-set
    // application/json content type.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    console.log(
      "🌐 API REQUEST:",
      config.method?.toUpperCase(),
      config.baseURL + config.url,
    );

    return config;
  },
  (error) => Promise.reject(error),
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE:", response.status, response.config.url);

    return response;
  },

  (error) => {
    console.error("❌ API ERROR:", error);

    if (error.response) {
      console.error(
        "SERVER RESPONSE:",
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.error("❌ NO RESPONSE FROM SERVER");
    } else {
      console.error("❌ REQUEST ERROR:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
