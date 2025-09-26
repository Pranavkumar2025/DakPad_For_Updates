// src/components/UserNavbar.js
import React from "react";
import { FaBell } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const UserNavbar = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook
  const today = new Date().toLocaleDateString(i18n.language === "hi" ? "hi-IN" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const navigate = useNavigate();

  const onLogout = () => {
    navigate("/admin-login");
  };

  // Function to change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 rounded-full w-full">
      {/* Left Side: Logo + Portal Info */}
      <div className="flex items-center gap-4">
        <img
          src="/logo.svg"
          alt="Logo"
          className="w-12 h-12 border border-gray-300 rounded-xl p-1 bg-gray-50"
        />
        <div className="flex flex-col">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <span
              className="text-2xl font-bold text-transparent uppercase bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c] tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("portalName")}
            </span>
          </motion.div>
          <p className="text-xs text-gray-500 hidden md:inline-block">
            {t("servingCitizens")}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {/* Current Date */}
        <span className="text-sm text-gray-500">{today}</span>

        {/* Language Switcher */}
        <div className="relative">
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="appearance-none bg-gray-100 text-gray-700 text-sm font-medium rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
            aria-label="Select Language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Info Section */}
        <div className="hidden md:flex flex-col items-end text-xs leading-tight">
          <p className="text-[#ff5010] text-xl">{t("publicUserAccess")}</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="group flex items-center justify-start w-11 h-11 bg-[#ff5010] rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 shadow-lg hover:w-32 hover:rounded-full active:translate-x-1 active:translate-y-1"
        >
          <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
          </div>
          <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            {t("admin")}
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserNavbar;