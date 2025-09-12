import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Calendar } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangePicker = ({ selectedDate, setSelectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("options"); // options, startDate, endDate
  const dropdownRef = useRef(null);

  // Close on outside click or touch
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setMode("options");
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setMode("options");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (date) => {
    if (mode === "startDate") {
      setSelectedDate({ ...selectedDate, startDate: format(date, "yyyy-MM-dd") });
      setMode("options");
      setIsOpen(false);
    } else if (mode === "endDate") {
      setSelectedDate({ ...selectedDate, endDate: format(date, "yyyy-MM-dd") });
      setMode("options");
      setIsOpen(false);
    }
  };

  const displayLabel = selectedDate?.startDate && selectedDate?.endDate
    ? `${selectedDate.startDate} - ${selectedDate.endDate}`
    : selectedDate?.startDate
    ? `${selectedDate.startDate} - Select End Date`
    : selectedDate?.endDate
    ? `Select Start Date - ${selectedDate.endDate}`
    : "Select Date Range";

  return (
    <div className="relative inline-block text-left mb-2" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-green-500 bg-white flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#ffbda0] w-full font-['Montserrat'] truncate"
        aria-label="Select date range"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayLabel}</span>
        <span className="pl-2">
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4063 5.65625 17.6875 5.9375C17.9687 6.21875 17.9687 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1563 10.1875 14.25 10 14.25Z" />
          </motion.svg>
        </span>
      </button>

      {/* Mobile Options/Calendar (Modal) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed inset-0 backdrop-blur-md flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setIsOpen(false);
              setMode("options");
            }}
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
                  {mode === "options" ? "Select Date Range" : mode === "startDate" ? "Select Start Date" : "Select End Date"}
                  <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#ff5010] to-[#fc641c]" />
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setMode("options");
                  }}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                  aria-label="Close date picker"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {mode === "options" ? (
                  <div className="space-y-1.5">
                    <motion.button
                      className="w-full text-left px-3 py-2 text-[10px] sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#ff5010]/10 hover:to-[#fc641c]/10 rounded-lg shadow-sm truncate transition-colors"
                      onClick={() => setMode("startDate")}
                      aria-label="Select start date"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Date
                    </motion.button>
                    <motion.button
                      className="w-full text-left px-3 py-2 text-[10px] sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#ff5010]/10 hover:to-[#fc641c]/10 rounded-lg shadow-sm truncate transition-colors"
                      onClick={() => setMode("endDate")}
                      aria-label="Select end date"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      End Date
                    </motion.button>
                  </div>
                ) : (
                  <Calendar
                    date={selectedDate?.[mode === "startDate" ? "startDate" : "endDate"]
                      ? new Date(selectedDate[mode === "startDate" ? "startDate" : "endDate"])
                      : new Date()}
                    onChange={handleSelect}
                    className="w-full"
                    color="#ff5010"
                    showDateDisplay={false}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Options/Calendar (Dropdown) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="hidden md:block absolute left-0 z-40 mt-1 w-full min-w-[300px] bg-gray-100 rounded-md shadow-lg py-1 transition-all"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === "options" ? (
              <div className="space-y-1">
                <button
                  className="w-full text-left px-4 py-1 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setMode("startDate")}
                  aria-label="Select start date"
                >
                  Start Date
                </button>
                <button
                  className="w-full text-left px-4 py-1 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setMode("endDate")}
                  aria-label="Select end date"
                >
                  End Date
                </button>
              </div>
            ) : (
              <Calendar
                date={selectedDate?.[mode === "startDate" ? "startDate" : "endDate"]
                  ? new Date(selectedDate[mode === "startDate" ? "startDate" : "endDate"])
                  : new Date()}
                onChange={handleSelect}
                className="w-full"
                color="#ff5010"
                showDateDisplay={false}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker;