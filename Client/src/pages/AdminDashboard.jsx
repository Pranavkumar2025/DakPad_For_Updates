import Navbar from "../components/Navbar";
import DataTable from "../components/AdminComponents/DataTable";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const AdminDashboard = () => {
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
        userName="Aditya Kumar"
        userPosition="Management Officer"
      />

      {/* Main Content */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 w-full mx-auto overflow-x-hidden">
        <Navbar
          userName="Aditya Kumar"
          userPosition="Management Officer"
          logoLink="/Admin"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />
        <div className="mt-4 sm:mt-6">
          <DataTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;