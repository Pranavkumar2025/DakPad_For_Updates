import {
  LayoutDashboard,
  Settings,
  User,
  Home,
  FilePlus,
  Search,
  LogOut
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-16 bg-[#1a102c] text-white flex flex-col items-center py-4 shadow-lg z-50">
      {/* Logo Section */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <img
          src="/logo.svg" // Replace with your actual logo path
          alt="Logo"
          className="w-10 h-10 rounded-md p-1 bg-gray-800"
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-5 flex-1 mt-4">
        <SidebarIcon icon={<LayoutDashboard size={22} />} />
        <SidebarIcon icon={<Home size={22} />} />
        <SidebarIcon icon={<User size={22} />} />
        <SidebarIcon icon={<FilePlus size={22} />} />
        <SidebarIcon icon={<Search size={22} />} />
        <SidebarIcon icon={<Settings size={22} />} />
      </nav>

      {/* Logout at bottom */}
      <div className="mt-auto pb-4">
        <SidebarIcon icon={<LogOut size={22} />} />
      </div>
    </div>
  );
};

// Sidebar icon component
const SidebarIcon = ({ icon }) => (
  <div className="group relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#ff5010] transition-all duration-200 cursor-pointer">
    {icon}
  </div>
);

export default Sidebar;
