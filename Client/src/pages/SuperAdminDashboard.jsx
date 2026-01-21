// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SuperAdminDataTable from "../components/SuperAdminComponents/SuperAdminDataTable";
import PerformanceDashboard from "./PerformanceDashboard";
import AdminProfilePage from "./AdminProfilePage";  // ← Import Profile Content Only
import api from "../utils/api";

const SuperAdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
    role: "admin",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/me");
        setAdmin({
          name: data.user?.name || "Super Admin",
          position: data.user?.position || data.user?.role || "System Administrator",
          role: data.user?.role || "admin",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setAdmin({
          name: "Super Admin",
          position: "System Administrator",
          role: "superadmin",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // Redirect /SuperAdmin → /SuperAdmin/applications
  useEffect(() => {
    if (location.pathname === "/SuperAdmin" || location.pathname === "/SuperAdmin/") {
      navigate("/SuperAdmin/applications", { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse text-xl">Loading SuperAdmin Panel…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={admin.name}
        userPosition={admin.position}
        isSuperAdmin={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar
          userName={admin.name}
          userPosition={admin.position}
          logoLink="/SuperAdmin/applications"
          profileLink="/SuperAdmin/profile"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <Routes>
            <Route path="applications" element={<SuperAdminDataTable />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="profile" element={<AdminProfilePage />} />  {/* ← Nested Profile */}
            {/* Add more nested routes later */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;