

import SuperAdminDataTable from "../components/SuperAdminComponents/SuperAdminDataTable";
import Navbar from "../components/Navbar";
import SuperAdminSidebar from "../components/SuperAdminComponents/SuperAdminSidebar";

const SuperAdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Navbar
          userName="Prashant Singh"
          userPosition="Super Admin"
          logoLink="/SuperAdmin"
        />
        <div className="mt-6">
          <SuperAdminDataTable />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;