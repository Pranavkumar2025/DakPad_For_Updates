import React, { useState } from "react";
import { motion } from "framer-motion";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import DropdownButton from "../DropdownButton";
import DateRangePicker from "../DateRangePicker";

const FilterHeader = ({
  searchQuery,
  setSearchQuery,
  filteredCount,
  selectedStatus,
  setSelectedStatus,
  selectedDate,
  setSelectedDate,
  onExcelClick,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const displayDate = selectedDate?.startDate && selectedDate?.endDate
    ? `${selectedDate.startDate} to ${selectedDate.endDate}`
    : selectedDate?.startDate
    ? `${selectedDate.startDate} to Select End Date`
    : selectedDate?.endDate
    ? `Select Start Date to ${selectedDate.endDate}`
    : "All";

  return (
    <>
      {/* Mobile Layout: Clean, Compact Professional Design */}
      <motion.div
        className="md:hidden flex flex-col p-4 gap-3 mb-4 font-['Inter'] bg-white border border-gray-200 shadow-sm rounded-lg w-full max-w-[360px] mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Application Management
          </h2>
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search by name or description"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search applications"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredCount} application{filteredCount !== 1 && "s"} •
            <span className="font-medium text-gray-800"> {selectedStatus || "All"} status</span> •
            <span className="font-medium text-gray-800"> {displayDate} dates</span>
          </p>
          <button
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-blue-600"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-label={isFiltersOpen ? "Collapse filters" : "Expand filters"}
            aria-expanded={isFiltersOpen}
          >
            <span className="text-sm font-medium text-gray-800">Advanced Filters</span>
            {isFiltersOpen ? (
              <FaChevronUp className="text-gray-600 text-sm" />
            ) : (
              <FaChevronDown className="text-gray-600 text-sm" />
            )}
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={isFiltersOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-3 mt-2">
              <DropdownButton
                label={selectedStatus || "Select Status"}
                items={[
                  { label: "All", onClick: () => setSelectedStatus("") },
                  { label: "Not Assigned Yet", onClick: () => setSelectedStatus("Not Assigned Yet") },
                  { label: "In Process", onClick: () => setSelectedStatus("In Process") },
                  { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
                  // { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
                  { label: "Disposed", onClick: () => setSelectedStatus("Disposed") },
                ]}
              />
              
              <DateRangePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
          </motion.div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 w-full max-w-[360px] mx-auto bg-white border-t border-gray-200 shadow-md p-3 flex justify-between gap-3 z-20 md:hidden">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("");
              setSelectedDate({ startDate: null, endDate: null });
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm transition-all"
            aria-label="Reset filters"
          >
            Reset Filters
          </button>
        
          <motion.button
            onClick={onExcelClick}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm transition-all"
            aria-label="Download Excel"
          >
            <RiFileExcel2Fill className="text-white text-base" />
            <span>Download Excel</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop Layout: Spacious, Professional Horizontal Design */}
      <div className="hidden md:flex md:flex-col md:ml-16 md:p-6 md:gap-4 md:mb-6 font-['Inter'] bg-white border border-gray-200 shadow-sm rounded-lg">
        <div className="flex items-center justify-between gap-6">
          <h2 className="text-3xl font-semibold text-gray-800">
            Application Management Dashboard
          </h2>
          <div className="relative w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base" />
            <input
              type="text"
              placeholder="Search by name or description"
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-md focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search applications"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          <p className="text-sm text-gray-600">
            Showing {filteredCount} application{filteredCount !== 1 && "s"} •
            <span className="font-medium text-gray-800"> {selectedStatus || "All"} status</span> •
            <span className="font-medium text-gray-800"> {displayDate} dates</span>
          </p>
          <div className="flex items-center gap-4">
            <DropdownButton
              label={selectedStatus || "Select Status"}
              items={[
                { label: "All", onClick: () => setSelectedStatus("") },
                { label: "Not Assigned Yet", onClick: () => setSelectedStatus("Not Assigned Yet") },
                { label: "In Process", onClick: () => setSelectedStatus("In Process") },
                { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
                // { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
                { label: "Disposed", onClick: () => setSelectedStatus("Disposed") },
              ]}
            />
            <DateRangePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("");
                setSelectedDate({ startDate: null, endDate: null });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium text-sm shadow-sm transition-all"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
            <motion.button
              onClick={onExcelClick}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-sm shadow-sm transition-all"
              aria-label="Download Excel"
            >
              <RiFileExcel2Fill className="text-white text-lg" />
              <span>Download Excel</span>
            </motion.button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        .backdrop-blur-md {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
        .rdrCalendarWrapper {
          font-family: "Inter", sans-serif !important;
          font-size: 12px !important;
        }
        .rdrDayToday .rdrDayNumber span:after {
          background: #3b82f6 !important;
        }
        .rdrDayHovered, .rdrDaySelected {
          background: #3b82f6 !important;
          color: white !important;
        }
        .rdrMonthAndYearWrapper, .rdrDateInput {
          background: #f9fafb !important;
        }
      `}</style>
    </>
  );
};

export default FilterHeader;