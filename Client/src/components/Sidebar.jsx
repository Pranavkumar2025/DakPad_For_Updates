// src/components/Sidebar.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  User,
  BarChart2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../utils/api";

import UserDashboardContent from "../pages/UserDashboard";

const Sidebar = ({
  isMenuOpen,
  toggleMenu,
  userName = "Siddharth Singh",
  userPosition = "Application Receiver",
  isSuperAdmin = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // ← NEW: To detect current path
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [showDashboardModal, setShowDashboardModal] = useState(false);

  const openDashboardModal = () => {
    setShowDashboardModal(true);
    if (isMenuOpen) toggleMenu();
  };

  const closeDashboardModal = () => setShowDashboardModal(false);

  // ---------- DYNAMIC PROFILE LINK ----------
  const getProfileLink = () => {
    const path = location.pathname;

    if (path.startsWith("/SuperAdmin")) return "/SuperAdmin/profile";
    if (path.startsWith("/Admin")) return "/Admin/profile";
    if (path.startsWith("/supervisor-dashboard")) return "/supervisor-dashboard/profile";
    if (path.startsWith("/work-assigned")) return "/work-assigned/profile";
    if (path.startsWith("/application-receive")) return "/application-receive/profile";

    // Fallback
    // return "/Admin/profile";
  };

  // ---------- CHECK ACTIVE STATE ----------
  const isActive = (link) => {
    if (!link) return false;
    return location.pathname === link || location.pathname.startsWith(link + "/");
  };

  // ---------- MENU ITEMS ----------
  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "User Dashboard",
      action: openDashboardModal,
    },
    {
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Profile",
      link: getProfileLink(),
    },
    ...(isSuperAdmin
      ? [
          {
            icon: <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />,
            label: "Performance",
            link: "/SuperAdmin/performance",
          },
        ]
      : []),
  ];

  // ---------- LOGOUT ----------
  const handleLogout = async () => {
    try {
      await api.post("/api/admin/logout");
    } catch (err) {
      console.warn("Logout API failed", err);
    }
    window.dispatchEvent(new Event("applicationUpdated"));
    if (isMenuOpen) toggleMenu();
    navigate("/admin-login", { replace: true });
  };

  return (
    <>
      {/* ------------------- Desktop Sidebar ------------------- */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-16 bg-gray-900 text-white flex-col items-center py-6 shadow-lg z-40">
        <div className="mb-12">
          <img src="/logo.svg" alt="Logo" className="w-10 h-10 border border-gray-700 rounded-lg p-1" />
        </div>
        <nav className="flex flex-col gap-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action || (() => navigate(item.link))}
              className={`group relative flex items-center justify-center p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#ff5010] ${
                item.link && isActive(item.link)
                  ? "bg-[#ff5010]"
                  : "hover:bg-[#ff5010]"
              }`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ------------------- Mobile Sidebar ------------------- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            className="md:hidden fixed top-0 left-0 h-screen w-3/4 sm:w-64 bg-gray-900 text-white flex flex-col z-50 shadow-lg"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gray-950 p-3 sm:p-4 flex items-center justify-between">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-700 rounded-lg p-1" />
              <span
                className="text-sm sm:text-base font-bold text-transparent uppercase bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c] tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Jan Samadhan
              </span>
              <motion.button
                onClick={toggleMenu}
                whileTap={{ scale: 0.9 }}
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* User info + actions */}
            <div className="px-4 py-3 flex flex-col gap-3 bg-gray-800/50">
              <span className="text-xs sm:text-sm text-gray-300 font-medium bg-gray-700/50 px-3 py-1 rounded-full text-center">
                {today}
              </span>

              {/* Updated: Dynamic Profile Link */}
              <Link
                to={getProfileLink()}
                onClick={toggleMenu}
                className="flex items-center gap-2 border border-gray-600 py-1.5 px-3 rounded-full bg-gray-800 shadow-sm hover:bg-gray-700 transition"
              >
                <img
                  src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
                  alt="user"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-sm flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">{userName}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-light truncate">{userPosition}</span>
                </div>
              </Link>

              <motion.button
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#ff5010] rounded-lg shadow-md hover:bg-[#fc641c] transition-colors"
                onClick={handleLogout}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 512 512" fill="white">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
                <span className="text-xs sm:text-sm font-medium">Logout</span>
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 px-4 pt-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={
                    item.action ||
                    (() => {
                      navigate(item.link);
                      toggleMenu();
                    })
                  }
                  className={`flex items-center gap-3 p-3 rounded-lg transition text-sm sm:text-base font-medium text-left w-full ${
                    item.link && isActive(item.link)
                      ? "bg-[#ff5010] text-white"
                      : "hover:bg-[#ff5010] text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Dashboard Modal */}
      <AnimatePresence>
        {showDashboardModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDashboardModal}
            />
            <motion.div
              className="fixed inset-4 md:inset-8 lg:inset-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-8 lg:bottom-8 max-w-6xl w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-4 border-b bg-gray-700 text-white">
                <h2 className="text-lg sm:text-xl font-bold font-['Montserrat']">User Dashboard</h2>
                <button onClick={closeDashboardModal} className="p-1 rounded-full hover:bg-white/20">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <UserDashboardContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
      `}</style>
    </>
  );
};

export default Sidebar;