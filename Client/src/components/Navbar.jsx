import React, { useState } from "react";
import { FaUsers, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ userName, userPosition, logoLink = "/" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    console.log("User logged out");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className={`h-12 sm:h-14 bg-white shadow-md flex items-center justify-between px-2 sm:px-3 md:p-6 md:rounded-full md:h-16 ${
        logoLink !== "/" ? "md:ml-16" : ""
      }`}
    >
      {/* Logo */}
      <div className="flex-shrink-0">
        <a href={logoLink} aria-label="Jan Samadhan Home" className="block">
          <motion.div
            className="flex items-center gap-1 sm:gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <FaUsers className="text-lg sm:text-xl md:text-3xl text-[#ff5010]" />
            <span
              className="text-sm sm:text-base md:text-2xl font-bold text-transparent uppercase bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c] tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Jan Samadhan
            </span>
          </motion.div>
        </a>
      </div>

      {/* Desktop Right Section */}
      <div className="hidden md:flex md:items-center md:space-x-6">
        <span className="text-sm text-gray-600 font-medium">{today}</span>

        <div className="flex items-center gap-3 border border-gray-300 py-2 px-4 rounded-full bg-gray-50 shadow-sm max-w-[200px]">
          <img
            src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
            alt="user"
            className="w-10 h-10 rounded-full shadow-md flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-800 truncate">{userName}</span>
            <span className="text-xs text-gray-500 font-light truncate">{userPosition}</span>
          </div>
        </div>

        <motion.button
          className="group flex items-center justify-start w-11 h-11 bg-[#ff5010] rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-full active:scale-95"
          onClick={handleLogout}
          whileTap={{ scale: 0.95 }}
          aria-label="Logout"
        >
          <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
          </div>
          <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Logout
          </div>
        </motion.button>
      </div>

      {/* Mobile Hamburger Icon */}
      <motion.button
        className="md:hidden text-lg sm:text-xl text-[#ff5010] focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
        onClick={toggleMenu}
        whileTap={{ scale: 0.9 }}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute top-12 sm:top-14 left-2 right-2 bg-white shadow-lg rounded-lg p-3 sm:p-4 md:hidden z-50 border border-gray-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <span className="text-[10px] sm:text-xs text-gray-600 font-medium bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {today}
              </span>

              <div className="flex items-center gap-2 border border-gray-300 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full bg-gray-50 shadow-sm w-full max-w-[120px] sm:max-w-[140px]">
                <img
                  src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
                  alt="user"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate">{userName}</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-light truncate">{userPosition}</span>
                </div>
              </div>

              <motion.button
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-[#ff5010] rounded-full shadow-md hover:bg-[#fc641c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
                onClick={handleLogout}
                whileTap={{ scale: 0.95 }}
                aria-label="Logout"
              >
                <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap");

        @media (max-width: 768px) {
          .h-12 {
            height: 3rem;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
          }
          .h-14 {
            height: 3.5rem;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
          }
        }
        @media (max-width: 360px) {
          .h-12 {
            height: 2.75rem;
          }
          .h-14 {
            height: 3.25rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .text-xl {
            font-size: 1rem;
          }
          .max-w-\[120px\] {
            max-width: 100px;
          }
          .max-w-\[140px\] {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;