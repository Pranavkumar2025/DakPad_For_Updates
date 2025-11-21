// components/Dashboard/DashboardLayout.jsx
import React from "react";
import Navbar from "../Navbar";

const DashboardLayout = ({ children, timeFilterComponent }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Header + Time Filter */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-10">
          {/* Title */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Performance Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Real-time grievance redressal analytics
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Updated: {new Date().toLocaleString("en-IN")}
            </p>
          </div>

          {/* Time Filter Dropdown */}
          <div className="flex justify-center lg:justify-end">
            {timeFilterComponent}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;