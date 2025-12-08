import axios from "axios";

const instance = axios.create({
  // Use VITE_API_URL if set, otherwise fallback to localhost
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  withCredentials: true, // Keep this true to allow cookies if they work
});

// 🚀 INTERCEPTOR: Automatically attach token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;