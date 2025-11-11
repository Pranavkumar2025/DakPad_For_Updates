// src/components/UserNavbar.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";

const UserNavbar = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const onLogout = () => {
    navigate("/admin-login");
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* ==================== DESKTOP / TABLET VIEW (md and up) - UNCHANGED ==================== */}
      <div className="hidden md:flex h-16 bg-white items-center justify-between px-6 rounded-full w-full shadow-sm">
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
                {t("navbar.janSamadhan")}
              </span>
            </motion.div>
            <p className="text-xs text-gray-500 hidden md:inline-block">
              {t("navbar.serving")}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 w-32"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567a1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.723 1.447a1 1 0 11-1.79-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t("navbar.language")}</span>
              <svg
                className={`w-4 h-4 transition-transform flex relative -right-2 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg ${
                    currentLanguage === "en"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("hi")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 last:rounded-b-lg ${
                    currentLanguage === "hi"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  हिंदी
                </button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="hidden md:flex flex-col items-end text-xs leading-tight">
            <p className="text-[#ff5010] font-medium">{t("navbar.publicUser")}</p>
          </div>

          {/* Logout Button - Text preserved */}
          <button
            onClick={onLogout}
            className="flex items-center justify-start w-32 h-11 bg-[#ff5010] rounded-full cursor-pointer px-3 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 512 512" fill="white">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
            <span className="text-white text-lg font-semibold px-2">
              {t("navbar.admin")}
            </span>
          </button>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (less than or equal to 640px) - COMPACT & CLEAN ==================== */}
      <div className="md:hidden h-16 bg-white flex items-center justify-between px-4 rounded-full shadow-sm mx-2 mt-2">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-10 h-10 border border-gray-200 rounded-lg p-1 bg-gradient-to-br from-orange-50 to-white"
          />
          <span
            className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("navbar.janSamadhan")}
          </span>
        </div>

        {/* Right: Language (Globe) + Logout */}
        <div className="flex items-center gap-2">
          {/* Language Selector with Globe Icon */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Globe size={18} className="text-gray-700" />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <button
                    onClick={() => handleLanguageChange("en")}
                    className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                      currentLanguage === "en"
                        ? "bg-orange-50 text-[#ff5010]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange("hi")}
                    className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                      currentLanguage === "hi"
                        ? "bg-orange-50 text-[#ff5010]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    हिंदी
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button - Text preserved */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff5010] rounded-full text-white text-sm font-medium shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
            <span className="hidden sm:inline">{t("navbar.admin")}</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserNavbar;