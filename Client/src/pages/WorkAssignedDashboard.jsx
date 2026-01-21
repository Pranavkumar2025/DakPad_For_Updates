// src/pages/WorkAssignedDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import WorkAssignedDataTable from "../components/WorkAssignedComponents/WorkAssignedDataTable";
import AdminProfilePage from "./AdminProfilePage"; // ← Pure profile content
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const WorkAssignedDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Fetch Admin Profile (name + position)
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/me");
        setAdmin({
          name: data.user?.name || "Work Assign Officer",
          position: data.user?.position || data.user?.role || "Work Assigned",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setAdmin({
          name: "Work Assign Officer",
          position: "Work Assigned",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // Redirect base path /work-assigned → /work-assigned/applications
  useEffect(() => {
    if (location.pathname === "/work-assigned" || location.pathname === "/work-assigned/") {
      navigate("/work-assigned/applications", { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse text-xl">Loading Work Assigned Panel…</div>
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
        isSuperAdmin={false} // Work Assigned role is not superadmin
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar
          userName={admin.name}
          userPosition={admin.position}
          logoLink="/work-assigned/applications"
          profileLink="/work-assigned/profile"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        {/* Nested Routes */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Routes>
            {/* Main Tab */}
            <Route path="applications" element={<WorkAssignedDataTable />} />

            {/* Profile Tab */}
            <Route path="profile" element={<AdminProfilePage />} />

            {/* Add more nested routes later if needed */}
            {/* <Route path="reports" element={<ReportsPage />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default WorkAssignedDashboard;