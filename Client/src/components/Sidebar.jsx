import { LayoutDashboard, Settings, User } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="h-screen w-20 bg-gray-900 text-white  flex flex-col items-center py-6 shadow-lg">
      {/* Logo or Mini Title Icon */}
      <div className="mb-10">
        <img
          src="/logo.svg" // Replace with your actual logo image path
          alt="Logo"
          className="w-10 h-10 border border-gray-700 rounded-md p-1"
        />
      </div>

      {/* Navigation Icons Only */}
      <nav className="flex flex-col gap-6">
        <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full">
          <LayoutDashboard className="w-6 h-6" />
        </a>
        <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full">
          <User className="w-6 h-6" />
        </a>
        <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full">
          <Settings className="w-6 h-6" />
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
