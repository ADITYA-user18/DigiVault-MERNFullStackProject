import axios from "axios";

// ==== 🔥 Create Axios Instance ====
const api = axios.create({
  baseURL:import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",  // ⬅ change to your backend URL
  withCredentials: true,            // ⬅ allows cookie-based auth
  timeout: 10000,                   // ⬅ request timeout safety
});

// ==== 🔥 Global Request Interceptor ====
api.interceptors.request.use(
  (config) => {
    console.log("📌 Request:", config.method, config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==== 🔥 Global Response Interceptor ====
api.interceptors.response.use(
  (response) => {
    console.log("✔ Response:", response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", error.response.data);

      // Unauthenticated / token expired handling
      if (error.response.status === 401) {
        console.warn("⚠️ Auth required. Redirecting...");
        // window.location.href = "/login"; // ⬅ Don't force redirect, let the app handle it
      }
    }

    return Promise.reject(error);
  }
);

export default api;
