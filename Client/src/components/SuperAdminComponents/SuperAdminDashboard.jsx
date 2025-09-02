
import SuperAdminDataTable from "./SuperAdminDataTable";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminNavbar from "./SuperAdminNavbar";

const SuperAdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
        <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <SuperAdminNavbar />
        <div className="mt-6">
            <SuperAdminDataTable />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;