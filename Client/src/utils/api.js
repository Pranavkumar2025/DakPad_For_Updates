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
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        let refreshed = false;

        // Try Admin refresh first
        try {
          const res = await api.post("/api/admin/refresh");
          if (res.status === 200) refreshed = true;
        } catch (adminErr) {
          console.log("Admin refresh failed, trying Supervisor...");
        }

        // If Admin failed, try Supervisor
        if (!refreshed) {
          try {
            const res = await api.post("/api/supervisor/refresh");
            if (res.status === 200) refreshed = true;
          } catch (supervisorErr) {
            console.log("Supervisor refresh also failed");
          }
        }

        if (refreshed) {
          processQueue(null);
          return api(original); // retry original request with new token
        } else {
          throw new Error("All refresh attempts failed");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);

        // FULL LOGOUT CLEANUP
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Smart redirect
        const isSupervisorPage = window.location.pathname.includes("supervisor");
        window.location.href = isSupervisorPage ? "/admin-login" : "/admin-login";
        
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;