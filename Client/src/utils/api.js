// src/utils/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

// ==================== REFRESH INTERCEPTOR ====================
api.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970; path=/;";
        window.location.href = window.location.pathname.includes("supervisor") 
          ? "/supervisor-login" 
          : "/admin-login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ==================== ALL ENDPOINTS WITH /api PREFIX ====================
export const adminLogin = (data) => api.post("/api/auth/admin/login", data);
export const supervisorLogin = (data) => api.post("/api/auth/supervisor/login", data);
export const refreshToken = () => api.post("/api/auth/refresh");
export const getMe = () => api.get("/api/me");                    // FIXED
export const getApplications = () => api.get("/api/applications");
export const getApplication = (id) => api.get(`/api/applications/${id}`);
export const createApplication = (data) => api.post("/api/applications", data);
export const assignApplication = (id, data) => api.patch(`/api/applications/${id}/assign`, data);
export const trackApplication = (id) => api.get(`/api/track/${id}`);
export const getDashboardStats = () => api.get("/api/dashboard/performance");

export const logout = () => {
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970; path=/;";
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970; path=/;";
};

export default api;