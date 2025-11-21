
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SuperAdminDataTable from "../components/SuperAdminComponents/SuperAdminDataTable";
import PerformanceDashboard from "./PerformanceDashboard"; // ← Your beautiful dashboard
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
        const { data } = await api.get("/api/admin/profile");
        setAdmin({
          name: data.name || "Super Admin",
          position: data.position || "System Administrator",
          role: data.role || "admin",
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

  // Auto redirect to /applications if directly on /SuperAdmin
  useEffect(() => {
    if (location.pathname === "/SuperAdmin") {
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
      <div className="flex-1 p-2 sm:p-4 md:p-6 w-full mx-auto overflow-x-hidden"> 
        <Navbar
          userName={admin.name}
          userPosition={admin.position}
          logoLink="/SuperAdmin/applications"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="mt-6 ml-3">
          <Routes>
            {/* Default Tab: Applications List */}
            <Route
              path="/applications"
              element={<SuperAdminDataTable />}
            />

            {/* Performance Dashboard Tab */}
            <Route
              path="/performance"
              element={<PerformanceDashboard />}
            />

            {/* Optional: Add more tabs later */}
            {/* <Route path="/reports" element={<ReportsPage />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;