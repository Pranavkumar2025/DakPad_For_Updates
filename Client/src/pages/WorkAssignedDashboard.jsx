
import WorkAssignedDataTable from "../components/WorkAssignedComponents/WorkAssignedDataTable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const WorkAssignedDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Navbar
          userName="Pranav Kumar"
          userPosition="Work Assign Officer"
          logoLink="/work-assigned"
        />
        <div className="mt-6">
          <WorkAssignedDataTable />
        </div>
      </div>
    </div>
  );
};

export default WorkAssignedDashboard;
