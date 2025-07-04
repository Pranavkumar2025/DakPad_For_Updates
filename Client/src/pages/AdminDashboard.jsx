import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import Sidebar from "../components/Sidebar";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Navbar />
        <div className="mt-6">
          <DataTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
