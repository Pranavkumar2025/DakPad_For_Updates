// // src/components/Navbar.jsx
// import React from "react";
// import { FaUsers, FaBars, FaTimes } from "react-icons/fa";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom"; // <-- NEW
// import api from "../utils/api"; // <-- NEW

// const Navbar = ({ userName, userPosition, logoLink = "/", isMenuOpen, toggleMenu }) => {
//   const navigate = useNavigate(); // <-- NEW
//   const today = new Date().toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   // ---------- LOGOUT ----------
//   const handleLogout = async () => {
//     try {
//       await api.post("/api/admin/logout"); // clears httpOnly cookie
//     } catch (err) {
//       console.warn("Logout API failed (cookie already cleared?)", err);
//     }

//     // Notify all components to refresh
//     window.dispatchEvent(new Event("applicationUpdated"));

//     // Close mobile menu
//     if (isMenuOpen) toggleMenu();

//     // Redirect
//     navigate("/admin-login", { replace: true });
//   };

//   return (
//     <div
//       className={`h-12 sm:h-14 bg-white shadow-md flex items-center justify-between px-2 sm:px-3 md:p-6 md:rounded-full md:h-16 transition-colors duration-300 ${
//         isMenuOpen ? "bg-orange-50 border-orange-200" : ""
//       } ${logoLink !== "/" ? "md:ml-16" : ""}`}
//     >
//       {/* Logo */}
//       <div className="flex-shrink-0">
//         <a href={logoLink} aria-label="Jan Samadhan Home" className="block">
//           <motion.div
//             className="flex items-center gap-1 sm:gap-2"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             whileHover={{ scale: 1.05 }}
//           >
//             <FaUsers className="text-lg sm:text-xl md:text-3xl text-[#ff5010]" />
//             <span
//               className="text-sm sm:text-base md:text-2xl font-bold text-transparent uppercase bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c] tracking-tight"
//               style={{ fontFamily: "'Montserrat', sans-serif" }}
//             >
//               Jan Samadhan
//             </span>
//           </motion.div>
//         </a>
//       </div>

//       {/* Desktop Right Section */}
//       <div className="hidden md:flex md:items-center md:space-x-6">
//         <span className="text-sm text-gray-600 font-medium">{today}</span>

//         <div className="flex items-center gap-3 border border-gray-300 py-2 px-4 rounded-full bg-gray-50 shadow-sm max-w-[200px]">
//           <img
//             src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
//             alt="user"
//             className="w-10 h-10 rounded-full shadow-md flex-shrink-0"
//           />
//           <div className="flex flex-col min-w-0">
//             <span className="text-sm font-semibold text-gray-800 truncate">{userName}</span>
//             <span className="text-xs text-gray-500 font-light truncate">{userPosition}</span>
//           </div>
//         </div>

//         {/* Logout Button */}
//         <motion.button
//           className="group flex items-center justify-start w-11 h-11 bg-[#ff5010] rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-full active:scale-95"
//           onClick={handleLogout}
//           whileTap={{ scale: 0.95 }}
//           aria-label="Logout"
//         >
//           <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
//             <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
//               <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
//             </svg>
//           </div>
//           <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
//             Logout
//           </div>
//         </motion.button>
//       </div>

//       {/* Mobile Hamburger */}
//       <motion.button
//         className={`md:hidden text-lg sm:text-xl text-[#ff5010] p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff5010] ${
//           isMenuOpen ? "bg-orange-100" : "bg-transparent"
//         }`}
//         onClick={toggleMenu}
//         whileTap={{ scale: 0.9 }}
//         aria-label={isMenuOpen ? "Close sidebar" : "Open sidebar"}
//       >
//         {isMenuOpen ? <FaTimes /> : <FaBars />}
//       </motion.button>

//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap");

//         @media (max-width: 768px) {
//           .h-12 {
//             height: 3rem;
//             border-radius: 0.5rem;
//             padding: 0.5rem 0.75rem;
//           }
//           .h-14 {
//             height: 3.5rem;
//             border-radius: 0.5rem;
//             padding: 0.5rem 0.75rem;
//           }
//         }
//         @media (max-width: 360px) {
//           .h-12 {
//             height: 2.75rem;
//           }
//           .h-14 {
//             height: 3.25rem;
//           }
//           .text-sm {
//             font-size: 0.75rem;
//           }
//           .text-base {
//             font-size: 0.875rem;
//           }
//           .text-xl {
//             font-size: 1rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Navbar;









// src/components/Navbar.jsx
import React from "react";
import { FaBars, FaTimes, FaCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Navbar = ({
  userName = "Admin User",
  userPosition = "Administrator",
  logoLink = "/",
  isMenuOpen,
  toggleMenu,
  sidebarOpen = false, // optional: to adjust left margin when sidebar is open
}) => {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleLogout = async () => {
    try {
      await api.post("/api/admin/logout");
    } catch (err) {
      console.warn("Logout failed", err);
    }
    window.dispatchEvent(new Event("applicationUpdated"));
    if (isMenuOpen) toggleMenu();
    navigate("/admin-login", { replace: true });
  };

  const goToProfile = () => {
    navigate("/admin-profile");
    if (isMenuOpen) toggleMenu();
  };

  return (
    <>
      {/* Fixed Professional Navbar */}
      <header className="fixed top-0 left-0 right-0 z-1 bg-white shadow-lg border-b border-gray-100">
        <div className="mx-auto flex items-center justify-between h-20 px-5 lg:px-8">

          {/* Left: Logo & Title */}
          <div className={`flex items-center transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
            <a href={logoLink} className="flex items-center gap-4 select-none">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3"
              >
                {/* Gradient Logo Circle */}
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#0f4c8a] to-[#1e88e5] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  <img src="/logo.svg" alt="Jan Samadhan" className="w-7 h-7" />
                  <div className="absolute inset-0 rounded-full shadow-inner"></div>
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0f4c8a] to-[#1e56a0] tracking-tight">
                    Jan Samadhan
                  </h1>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Admin Portal
                  </p>
                </div>
              </motion.div>
            </a>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Date Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200"
            >
              <FaCalendarAlt className="w-5 h-5 text-[#0f4c8a]" />
              <span className="text-sm font-semibold text-gray-700">{today}</span>
            </motion.div>

            {/* User Card - Clickable */}
            <motion.button
              onClick={goToProfile}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 px-6 py-3 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?w=740"
                  alt={userName}
                  className="w-12 h-12 rounded-full ring-4 ring-white shadow-lg group-hover:ring-blue-100 transition-all"
                />
                <div className="absolute inset-0 rounded-full ring-4 ring-transparent group-hover:ring-blue-200 transition-all"></div>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-600 font-medium">{userPosition}</p>
              </div>
            </motion.button>

            {/* Animated Expanding Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full shadow-xl overflow-hidden transition-all duration-500 hover:w-40 hover:rounded-3xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Logout"
            >
              {/* Icon */}
              <FaSignOutAlt className="w-6 h-6 absolute left-4 transition-all duration-500 group-hover:left-6 z-10" />

              {/* Text */}
              <span className="absolute font-bold text-sm opacity-0 translate-x-10 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-500 whitespace-nowrap">
                Logout
              </span>

              {/* Background shine effect */}
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={toggleMenu}
            className={`lg:hidden p-4 rounded-full transition-all duration-300 ${
              isMenuOpen
                ? "bg-orange-100 text-orange-600 shadow-lg"
                : "bg-gradient-to-r from-[#0f4c8a] to-[#1e56a0] text-white shadow-xl"
            }`}
            whileTap={{ scale: 0.9 }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
          </motion.button>
        </div>
      </header>

      {/* Spacer to push content below fixed navbar */}
      <div className="h-20" />

      {/* Global Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Montserrat:wght@700;800&display=swap');
        
        body {
          font-family: 'Inter', 'Montserrat', system-ui, sans-serif;
        }
      `}</style>
    </>
  );
};

export default Navbar;