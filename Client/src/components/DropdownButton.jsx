import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const DropdownButton = ({ label, items }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or touch
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleItemClick = (onClick) => {
    onClick();
    setDropdownOpen(false);
  };

  return (
    <div className="relative inline-block text-left mb-2" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="border border-green-500 bg-white flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#ffbda0] w-full font-['Montserrat'] truncate"
        aria-label={`Select ${label}`}
        aria-expanded={dropdownOpen}
      >
        <span className="truncate">{label}</span>
        <span className="pl-2">
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current"
            animate={{ rotate: dropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4063 5.65625 17.6875 5.9375C17.9687 6.21875 17.9687 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1563 10.1875 14.25 10 14.25Z" />
          </motion.svg>
        </span>
      </button>

      {/* Mobile Dropdown (Modal) */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className="md:hidden fixed inset-0 backdrop-blur-md flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDropdownOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-4 w-full max-w-[300px] mx-auto font-['Montserrat'] border border-gray-100"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold bg-gradient-to-r from-[#ff5010] to-[#fc641c] bg-clip-text text-transparent truncate relative">
                  {label}
                  <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#ff5010] to-[#fc641c]" />
                </h3>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                  aria-label="Close dropdown"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-1.5">
                {items.map((item, index) => (
                  <motion.button
                    key={index}
                    className="w-full text-left px-3 py-2 text-[10px] sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#ff5010]/10 hover:to-[#fc641c]/10 rounded-lg shadow-sm truncate transition-colors"
                    onClick={() => handleItemClick(item.onClick)}
                    aria-label={`Select ${item.label}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop/Laptop Dropdown (Unchanged) */}
      <div
        className={`hidden md:block absolute left-0 z-40 mt-1 w-full rounded-md bg-gray-100 shadow-lg py-1 transition-all ${
          dropdownOpen ? "top-full opacity-100 visible" : "top-[110%] opacity-0 invisible"
        }`}
      >
        {items.map((item, index) => (
          <a
            key={index}
            href="#"
            onClick={() => handleItemClick(item.onClick)}
            className="block px-4 py-1 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default DropdownButton;