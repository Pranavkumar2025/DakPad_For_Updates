// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SuperAdminDataTable from "../components/SuperAdminComponents/SuperAdminDataTable";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

const SupervisorDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
    role: "admin",
  });
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // --------------------------------------------------------------
  // Fetch Admin Profile (name, position, role)
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setAdmin({
          name: data.name || "Supervisor Admin",
          position: data.position || "Supervisor Administrator",
          role: data.role || "admin",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        // fallback
        setAdmin({
          name: "Supervisor Admin",
          position: "Supervisor Administrator",
          role: "admin",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // --------------------------------------------------------------
  // Show loader while profile loads
  // --------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse">Loading profile…</div>
      </div>
    );
  }

  // --------------------------------------------------------------
  // Main Dashboard
  // --------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={admin.name}
        userPosition={admin.position}
      />

      {/* Main Content */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 w-full mx-auto overflow-x-hidden">
        <Navbar
          userName={admin.name}
          userPosition={admin.position}
          logoLink="/Supervisor"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="mt-6">
          <SuperAdminDataTable />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;