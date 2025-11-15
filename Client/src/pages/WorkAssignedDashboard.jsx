// src/pages/WorkAssignedDashboard.jsx
import { useState, useEffect } from "react";
import WorkAssignedDataTable from "../components/WorkAssignedComponents/WorkAssignedDataTable";
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

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // --------------------------------------------------------------
  // Fetch Admin Profile (name + position)
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setAdmin({
          name: data.name || "Work Assign Officer",
          position: data.position || "Work Assigned",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        // fallback
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
          logoLink="/work-assigned"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="mt-4 sm:mt-6">
          <WorkAssignedDataTable />
        </div>
      </div>
    </div>
  );
};

export default WorkAssignedDashboard;