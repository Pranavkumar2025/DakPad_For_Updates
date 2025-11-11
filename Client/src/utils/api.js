// src/utils/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // THIS SENDS COOKIES
});

// Optional: Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post("/api/admin/refresh");
        return api(error.config);
      } catch {
        window.location.href = "/admin-login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;