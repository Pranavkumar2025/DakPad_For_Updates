import { LayoutDashboard, Settings, User } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard className="w-6 h-6" />, label: "Dashboard", link: "#" },
    { icon: <User className="w-6 h-6" />, label: "Users", link: "/user" },
    { icon: <Settings className="w-6 h-6" />, label: "Settings", link: "#" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 bg-gray-900 text-white flex flex-col items-center py-6 shadow-lg">
      {/* Logo */}
      <div className="mb-12">
        <img
          src="/logo.svg"
          alt="Logo"
          className="w-10 h-10 border border-gray-700 rounded-lg p-1"
        />
      </div>

      {/* Menu Icons */}
      <nav className="flex flex-col gap-6">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className="group relative flex items-center justify-center p-2 rounded-full hover:bg-[#ff5010] transition"
          >
            {item.icon}
            {/* Tooltip */}
            <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;