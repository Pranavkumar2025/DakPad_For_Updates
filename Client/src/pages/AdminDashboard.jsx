// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/AdminComponents/DataTable";
import AdminProfilePage from "./AdminProfilePage"; // ← Import the pure content profile
import api from "../utils/api";

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Fetch admin profile (name + position)
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/me");
        setAdmin({
          name: data.user?.name || "Admin",
          position: data.user?.position || data.user?.role || "Administrator",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setAdmin({ name: "Admin", position: "Administrator" });
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // Optional: Redirect /Admin to /Admin/applications (or main tab) if you add more tabs later
  useEffect(() => {
    if (location.pathname === "/Admin" || location.pathname === "/Admin/") {
      navigate("/Admin/applications", { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse text-xl">Loading Admin Panel…</div>
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
        isSuperAdmin={false} // Regular admin, not superadmin
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar
          userName={admin.name}
          userPosition={admin.position}
          logoLink="/Admin/applications"
          profileLink="/Admin/profile"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        {/* Nested Routes Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Routes>
            {/* Default/Main Tab */}
            <Route path="applications" element={<DataTable />} />

            {/* Profile Tab */}
            <Route path="profile" element={<AdminProfilePage />} />

            {/* Add more nested routes here in the future */}
            {/* <Route path="settings" element={<SettingsPage />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;