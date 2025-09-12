import React, { useState } from "react";
import Navbar from "../components/Navbar";
import SuperAdminDataTable from "../components/SuperAdminComponents/SuperAdminDataTable";
import Sidebar from "../components/Sidebar";

const SuperAdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName="Super Admin"
        userPosition="System Administrator"
        isSuperAdmin={true} // Enable Performance menu item
      />

      {/* Main Content */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 w-full mx-auto overflow-x-hidden">
        <Navbar
          userName="Super Admin"
          userPosition="System Administrator"
          logoLink="/SuperAdmin"
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

export default SuperAdminDashboard;