import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (err) {
    localStorage.removeItem("adminToken");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
