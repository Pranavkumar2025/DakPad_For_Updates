// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DataTable from "../components/AdminComponents/DataTable";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
  });
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // --------------------------------------------------------------
  // 1. Fetch admin profile (name + position) once on mount
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setAdmin({
          name: data.name || "Admin",
          position: data.position || "Administrator",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        // fallback – still allow UI to render
        setAdmin({ name: "Admin", position: "Administrator" });
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // --------------------------------------------------------------
  // 2. Show a minimal loader while fetching (optional)
  // --------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse">Loading profile…</div>
      </div>
    );
  }

  // --------------------------------------------------------------
  // 3. Render Dashboard with dynamic data
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
          logoLink="/Admin"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="">
          <DataTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;