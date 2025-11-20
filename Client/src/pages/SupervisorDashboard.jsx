import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import SupervisorDataTable from "../components/SupervisorComponents/SupervisorDataTable";

const SuperAdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supervisor, setSupervisor] = useState({
    name: "Loading…",
    position: "Loading…",
    department: "",
  });
  const [loading, setLoading] = useState(true);

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
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={supervisor.name}
        userPosition={supervisor.position}
      />

      <div className="flex-1 flex flex-col mt-4">
        <Navbar
          userName={supervisor.name}
          userPosition={supervisor.position}
          logoLink="/Supervisor"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Professional Dashboard Header */}
          <div className="bg-white border-l-4 border-indigo-600 rounded-r-lg shadow-md p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-[1250px] mx-auto">
            <div className="flex items-center gap-4">

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-['Montserrat'] tracking-tight">
                  {supervisor.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  {supervisor.department || "Field Operations Department"} <span className="text-gray-400">•</span> Field Supervisor
                </p>
              </div>
            </div>

            {/* Optional: Status / Session Info */}
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs sm:text-sm font-semibold rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active Session
              </div>
            </div>
          </div>

          {/* Your Table */}
          <SupervisorDataTable supervisor={supervisor} />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;