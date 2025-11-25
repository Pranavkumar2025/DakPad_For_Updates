// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [auth, setAuth] = useState({ loading: true, user: null });
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // CORRECT ENDPOINT
        const res = await api.get("/api/me");   // ← FIXED HERE

        if (res.data?.user) {
          setAuth({ loading: false, user: res.data.user });
        } else {
          setAuth({ loading: false, user: null });
        }
      } catch (err) {
        console.log("Auth check failed:", err.response?.data || err.message);
        setAuth({ loading: false, user: null });
      }
    };

    checkAuth();
  }, []);

  if (auth.loading) {
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry?.type === "back_forward") {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-indigo-50">
        <div className="text-xl font-semibold text-gray-700 animate-pulse">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!auth.user) {
    const isSupervisorPath = location.pathname.toLowerCase().includes("supervisor");
    const redirectTo = isSupervisorPath ? "/supervisor-login" : "/admin-login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = auth.user.role || (auth.user.supervisorId ? "Supervisor" : "admin");
    if (!allowedRoles.includes(userRole)) {
      const homePath = userRole === "Supervisor" ? "/supervisor-dashboard" : "/dashboard";
      return <Navigate to={homePath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;