// src/components/UserNavbar.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { Globe, LogOut, User, Menu, X } from "lucide-react";

const UserNavbar = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      {/* ==================== DESKTOP / TABLET NAV ==================== */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img
            src="/logo.svg"
            alt="Jan Samadhan Logo"
            className="w-10 h-10 rounded-sm p-1"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
              Jan <span className="text-[#ff5010]">Samadhan</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              Official Grievance Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-sm border border-slate-200 transition-all text-sm font-medium text-slate-700"
            >
              <Globe size={16} className="text-slate-500" />
              {currentLanguage === "hi" ? "हिंदी" : "English"}
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-xl border border-slate-100 overflow-hidden z-50 ring-1 ring-black/5"
                >
                  <button
                    onClick={() => handleLanguageChange("en")}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <span className="text-xs">🇺🇸</span> English
                  </button>
                  <button
                    onClick={() => handleLanguageChange("hi")}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <span className="text-xs">🇮🇳</span> हिंदी
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Admin Login Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2 bg-[#ff5010] hover:bg-[#e6450f] text-white rounded-sm font-semibold text-sm transition-all shadow-md shadow-orange-500/20 active:scale-95"
          >
            <LogOut size={16} />
            {t("navbar.admin")}
          </button>
        </div>
      </nav>

      {/* ==================== MOBILE NAV ==================== */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-9 h-9"
          />
          <div>
            <h1 className="text-lg font-bold text-slate-800">Jan <span className="text-[#ff5010]">Samadhan</span></h1>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-sm"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-x-0 top-[60px] bg-white border-b border-slate-200 shadow-xl z-40 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={() => { handleLanguageChange("en"); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-3 rounded-sm border text-sm font-medium ${currentLanguage === 'en' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { handleLanguageChange("hi"); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-3 rounded-sm border text-sm font-medium ${currentLanguage === 'hi' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  हिंदी
                </button>
              </div>

              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff5010] text-white rounded-sm font-bold"
              >
                <LogOut size={18} />
                Admin {t("navbar.login")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserNavbar;