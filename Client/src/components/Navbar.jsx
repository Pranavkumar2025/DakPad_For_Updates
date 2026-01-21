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
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const Navbar = ({
  userName = "Admin User",
  userPosition = "Administrator",
  logoLink = "/",
  profileLink = "/Admin/profile", // Default fallback
  isMenuOpen,
  toggleMenu,
  sidebarOpen = false,
}) => {
  const navigate = useNavigate();
  // const location = useLocation(); // Not needed anymore for profile logic

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const goToProfile = () => {
    navigate(profileLink);
    if (isMenuOpen) toggleMenu();
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.warn("Logout failed", err);
    }
    window.dispatchEvent(new Event("applicationUpdated"));
    if (isMenuOpen) toggleMenu();

    // Force hard reload to clear any client-side state/cache
    window.location.href = "/admin-login";
  };

  return (
    <>
      {/* Clean Professional Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex items-center justify-between h-20 px-6 lg:px-10">

          {/* Left: Logo & Title */}
          <div className={`flex items-center transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
            <a href={logoLink} className="flex items-center gap-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4"
              >
                {/* Simple Solid Professional Logo */}
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg border border-gray-300">
                  <img src="/logo.svg" alt="Jan Samadhan" className="w-8 h-8 object-contain" />
                </div>

                {/* Clean Typography */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Jan Samadhan
                  </h1>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Government Portal
                  </p>
                </div>
              </motion.div>
            </a>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center gap-8">

            {/* Minimal Date Display */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <FaCalendarAlt className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{today}</span>
            </div>

            {/* Professional User Info - Clickable */}
            <motion.button
              onClick={goToProfile}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="flex items-center gap-4 px-5 py-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-12 h-12 bg-gray-200 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-gray-600">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{userName}</p>
                <p className="text-sm text-gray-600">{userPosition}</p>
              </div>
            </motion.button>

            {/* Clean Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-3 cursor-pointer bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={toggleMenu}
            className="lg:hidden p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </motion.button>
        </div>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Global Clean Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </>
  );
};

export default Navbar;