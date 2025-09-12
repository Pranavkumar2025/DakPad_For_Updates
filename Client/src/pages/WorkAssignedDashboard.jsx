// import { useState } from "react";
// import WorkAssignedDataTable from "../components/WorkAssignedComponents/WorkAssignedDataTable";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";

// const WorkAssignedDashboard = () => {

//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };
//   return (
//     <div className="flex min-h-screen bg-gray-100">

//       {/* Sidebar */}
//       <Sidebar
//         isMenuOpen={isMenuOpen}
//         toggleMenu={toggleMenu}
//         userName="Pranav Kumar"
//         userPosition="Work Assign Officer"
//       />

//       {/* Main Content */}
//       <div className="flex-1 p-6">
//         <Navbar
//           userName="Pranav Kumar"
//           userPosition="Work Assign Officer"
//           logoLink="/work-assigned"
//           isMenuOpen={isMenuOpen}
//           toggleMenu={toggleMenu}
//         />
//         <div className="mt-6">
//           <WorkAssignedDataTable />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkAssignedDashboard;

import { useState } from "react";
import WorkAssignedDataTable from "../components/WorkAssignedComponents/WorkAssignedDataTable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const WorkAssignedDashboard = () => {
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
        userName="Pranav Kumar"
        userPosition="Work Assign Officer"
      />

      {/* Main Content */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 w-full max-w-[320px] mx-auto md:max-w-7xl overflow-x-hidden">
        <Navbar
          userName="Pranav Kumar"
          userPosition="Work Assign Officer"
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