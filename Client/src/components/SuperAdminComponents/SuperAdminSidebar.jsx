import { User, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const SuperAdminSidebar = () => {
  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: "Users", link: "/user" },
    { icon: <BarChart2 className="w-5 h-5" />, label: "Performance", link: "/performance" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 md:w-20 bg-gray-900 text-white flex flex-col items-center py-6 shadow-lg z-40">
      <div className="mb-10">
        <a href="/SuperAdmin" aria-label="">
          <img
            src="/logo.svg"
            alt="Jan Samadhan Logo"
            className="w-10 h-10 border border-gray-700 rounded-lg p-1"
            onError={(e) => (e.target.src = "/fallback-logo.png")}
          />
        </a>
      </div>
      <nav className="flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className="group relative flex items-center justify-center p-2 rounded-lg hover:bg-[#ff5010] transition-colors"
            aria-label={item.label}
          >
            {item.icon}
            <span className="absolute left-16 md:left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar;