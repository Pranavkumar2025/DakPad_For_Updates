// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [auth, setAuth] = useState({ loading: true, user: null });
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/api/admin/auth-check");
        setAuth({ loading: false, user: res.data.user });
      } catch {
        setAuth({ loading: false, user: null });
      }
    };
    check();
  }, []);

  if (auth.loading) return <div className="text-center p-10">Loading...</div>;

  if (!auth.user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default ProtectedRoute;