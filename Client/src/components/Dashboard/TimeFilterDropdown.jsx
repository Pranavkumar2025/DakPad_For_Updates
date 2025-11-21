// components/Dashboard/TimeFilterDropdown.jsx
import React from "react";
import { CalendarDays } from "lucide-react";

const TimeFilterDropdown = ({
  timeFilter,
  setTimeFilter,
  showCustomMonthModal,
  selectedCustomMonth, // ← THIS WAS MISSING!
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatMonth = (monthString) => {
    if (!monthString) return "Custom Month";
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getDisplayText = () => {
    if (timeFilter === "all") return "All Time";
    if (timeFilter === "month") return "This Month";
    if (timeFilter === "custom" && selectedCustomMonth) {
      return `Custom (${formatMonth(selectedCustomMonth)})`;
    }
    return "Custom Month";
  };

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-300"
      >
        <CalendarDays className="text-purple-600" size={18} />
        <span className="font-medium text-gray-800 min-w-32 text-left">
          {getDisplayText()}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
          <button
            onClick={() => {
              setTimeFilter("all");
              setIsOpen(false);
            }}
            className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
              timeFilter === "all" ? "bg-purple-100 text-purple-800" : "hover:bg-gray-50"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => {
              setTimeFilter("month");
              setIsOpen(false);
            }}
            className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
              timeFilter === "month" ? "bg-purple-100 text-purple-800" : "hover:bg-gray-50"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => {
              showCustomMonthModal();
              setIsOpen(false);
            }}
            className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Custom Month
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeFilterDropdown;