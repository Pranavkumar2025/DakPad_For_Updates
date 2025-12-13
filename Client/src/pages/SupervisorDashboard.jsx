// src/pages/SupervisorDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import SupervisorDataTable from "../components/SupervisorComponents/SupervisorDataTable";
import AdminProfilePage from "./AdminProfilePage"; // ← Profile content

const SupervisorDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supervisor, setSupervisor] = useState({
    name: "Loading…",
    position: "Loading…",
    department: "",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/me");
        setSupervisor({
          name: data.user.name || "Field Supervisor",
          position: data.user.designation || data.user.position || "Field Officer",
          department: data.user.department || "N/A",
        });
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setSupervisor({ name: "Field Supervisor", position: "Field Officer", department: "N/A" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Redirect base path to applications tab
  useEffect(() => {
    if (location.pathname === "/supervisor-dashboard" || location.pathname === "/supervisor-dashboard/") {
      navigate("/supervisor-dashboard/applications", { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-['Montserrat'] text-gray-600 animate-pulse">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={supervisor.name}
        userPosition={supervisor.position}
        isSuperAdmin={false}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar
          userName={supervisor.name}
          userPosition={supervisor.position}
          logoLink="/supervisor-dashboard/applications"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        {/* Nested Routes */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Main Applications Tab */}
            <Route
              path="applications"
              element={<SupervisorDataTable supervisor={supervisor} />}
            />

            {/* Profile Tab */}
            <Route path="profile" element={<AdminProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;