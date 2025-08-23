
import WorkAssignedDataTable from "./WorkAssignedDataTable";
import Sidebar from "../Sidebar";
import WorkAssignNavbar from "./WorkAssignNavbar";

const WorkAssignedDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <WorkAssignNavbar />
        <div className="mt-6">
            <WorkAssignedDataTable />
        </div>
      </div>
    </div>
  );
};

export default WorkAssignedDashboard;
