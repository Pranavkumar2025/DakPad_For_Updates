// components/Dashboard/CustomMonthModal.jsx
import React from "react";

const CustomMonthModal = ({
  isOpen,
  onClose,
  selectedMonth,
  setSelectedMonth,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl p-6 max-w-sm w-full drop-shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Select Custom Month
        </h3>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month & Year
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 text-gray-800"
            min="2024-01"
            max="2026-12"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium text-sm shadow-md"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomMonthModal;