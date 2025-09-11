import { LayoutDashboard, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isMenuOpen, toggleMenu }) => {
  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Dashboard", link: "#" },
    { icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Users", link: "/user" },
    { icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Settings", link: "#" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-16 bg-gray-900 text-white flex-col items-center py-6 shadow-lg">
        <div className="mb-12">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-10 h-10 border border-gray-700 rounded-lg p-1"
          />
        </div>
        <nav className="flex flex-col gap-6">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="group relative flex items-center justify-center p-2 rounded-full hover:bg-[#ff5010] transition focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
              aria-label={item.label}
            >
              {item.icon}
              <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            className="md:hidden fixed top-0 left-0 h-screen w-3/4 sm:w-64 bg-gray-900 text-white flex flex-col py-4 z-50 shadow-lg"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-4 mb-8">
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-700 rounded-lg p-1"
              />
              <button
                className="text-white text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-4 px-4">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#ff5010] transition text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
                  aria-label={item.label}
                  onClick={toggleMenu}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;