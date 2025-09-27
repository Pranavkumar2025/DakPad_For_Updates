import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSearch, FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import DropdownButton from "../DropdownButton";
import DateRangePicker from "../DateRangePicker";
import AddCaseForm from "../AddCaseForm";

// Utility function to format date display
const formatDisplayDate = (selectedDate) => {
  if (selectedDate?.startDate && selectedDate?.endDate) {
    return `${selectedDate.startDate} to ${selectedDate.endDate}`;
  }
  if (selectedDate?.startDate) {
    return `${selectedDate.startDate} to Select End Date`;
  }
  if (selectedDate?.endDate) {
    return `Select Start Date to ${selectedDate.endDate}`;
  }
  return "All";
};

const WorkAssignedFilterHeader = ({
  searchQuery,
  setSearchQuery,
  filteredCount,
  selectedStatus,
  setSelectedStatus,
  selectedDepartment,
  setSelectedDepartment,
  selectedBlock,
  setSelectedBlock,
  selectedDate,
  setSelectedDate,
  onExcelClick,
  applications,
  setApplications,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter dropdown configurations
  const statusItems = [
    { label: "All", onClick: () => setSelectedStatus("") },
    { label: "In Process", onClick: () => setSelectedStatus("In Process") },
    { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
    { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
    { label: "Not Assigned Yet", onClick: () => setSelectedStatus("Not Assigned Yet") },
    { label: "Disposed", onClick: () => setSelectedStatus("Disposed") },
  ];

  const departmentItems = [
    { label: "All", onClick: () => setSelectedDepartment("") },
    { label: "Collectorate/District Magistrate Office", onClick: () => setSelectedDepartment("Collectorate/District Magistrate Office") },
    { label: "Additional Collector/ADM", onClick: () => setSelectedDepartment("Additional Collector/ADM") },
    { label: "District Development Commissioner", onClick: () => setSelectedDepartment("District Development Commissioner") },
    { label: "Health Department", onClick: () => setSelectedDepartment("Health Department") },
    { label: "Education Department", onClick: () => setSelectedDepartment("Education Department") },
    { label: "Agriculture Department", onClick: () => setSelectedDepartment("Agriculture Department") },
    { label: "Animal Husbandry Department", onClick: () => setSelectedDepartment("Animal Husbandry Department") },
    { label: "Fishery Department", onClick: () => setSelectedDepartment("Fishery Department") },
    { label: "Disaster Management Department", onClick: () => setSelectedDepartment("Disaster Management Department") },
    { label: "Social Welfare Department", onClick: () => setSelectedDepartment("Social Welfare Department") },
    { label: "Minority Welfare Department", onClick: () => setSelectedDepartment("Minority Welfare Department") },
    { label: "Backward Class Welfare Department", onClick: () => setSelectedDepartment("Backward Class Welfare Department") },
    { label: "Labour Department", onClick: () => setSelectedDepartment("Labour Department") },
    { label: "Electricity Department", onClick: () => setSelectedDepartment("Electricity Department") },
    { label: "Planning and Development Department", onClick: () => setSelectedDepartment("Planning and Development Department") },
    { label: "Public Health Engineering Department", onClick: () => setSelectedDepartment("Public Health Engineering Department") },
    { label: "Water Resources Department", onClick: () => setSelectedDepartment("Water Resources Department") },
    { label: "Panchayati Raj Department", onClick: () => setSelectedDepartment("Panchayati Raj Department") },
    { label: "Transport Department", onClick: () => setSelectedDepartment("Transport Department") },
    { label: "Local Bodies/Municipality", onClick: () => setSelectedDepartment("Local Bodies/Municipality") },
  ];

  const blockItems = [
    { label: "All", onClick: () => setSelectedBlock("") },
    { label: "Agiaon", onClick: () => setSelectedBlock("Agiaon") },
    { label: "Ara Sadar", onClick: () => setSelectedBlock("Ara Sadar") },
    { label: "Barhara", onClick: () => setSelectedBlock("Barhara") },
    { label: "Behea", onClick: () => setSelectedBlock("Behea") },
    { label: "Charpokhari", onClick: () => setSelectedBlock("Charpokhari") },
    { label: "Garhani", onClick: () => setSelectedBlock("Garhani") },
    { label: "Jagdishpur", onClick: () => setSelectedBlock("Jagdishpur") },
    { label: "Koilwar", onClick: () => setSelectedBlock("Koilwar") },
    { label: "Piro", onClick: () => setSelectedBlock("Piro") },
    { label: "Sahar", onClick: () => setSelectedBlock("Sahar") },
    { label: "Sandesh", onClick: () => setSelectedBlock("Sandesh") },
    { label: "Shahpur", onClick: () => setSelectedBlock("Shahpur") },
    { label: "Tarari", onClick: () => setSelectedBlock("Tarari") },
    { label: "Udwant Nagar", onClick: () => setSelectedBlock("Udwant Nagar") },
  ];

  return (
    <>
      {/* Mobile Layout */}
      <motion.div
        className="md:hidden flex flex-col p-3 gap-2 mb-3 font-['Montserrat'] bg-white rounded-xl shadow-md w-full max-w-[320px] mx-auto overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header and Search */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-700 text-center">
            Work Assign Application Dashboard
          </h2>
          <div className="relative w-full">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-sm" />
            <input
              type="text"
              placeholder="Search by name or description"
              className="border border-gray-300 bg-gray-50 pl-8 pr-2 py-1 text-[10px] sm:text-sm rounded-md focus:ring-2 focus:ring-[#ff5010] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search applications"
            />
          </div>
        </div>

        {/* Filter Text and Accordion Toggle */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] sm:text-sm text-gray-500 truncate">
            Showing {filteredCount} application{filteredCount !== 1 && "s"} filtered by
            <strong className="text-gray-700"> {selectedStatus || "All"} status</strong>,
            <strong className="text-gray-700"> {selectedDepartment || "All"} department</strong>,
            <strong className="text-gray-700"> {selectedBlock || "All"} block</strong>,
            <strong className="text-gray-700"> {formatDisplayDate(selectedDate)} date</strong>.
          </p>
          <button
            className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#ff5010]"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-label={isFiltersOpen ? "Collapse filters" : "Expand filters"}
            aria-expanded={isFiltersOpen}
          >
            <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Filters</span>
            {isFiltersOpen ? <FaChevronUp className="text-gray-500 text-[10px] sm:text-sm" /> : <FaChevronDown className="text-gray-500 text-[10px] sm:text-sm" />}
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={isFiltersOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-1 gap-2 mt-2">
              <DropdownButton label={selectedStatus || "Select Status"} items={statusItems} />
              <DropdownButton label={selectedDepartment || "Select Department"} items={departmentItems} />
              <DropdownButton label={selectedBlock || "Select Block"} items={blockItems} />
              <DateRangePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
          </motion.div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-between gap-1 border-t border-gray-200 z-20 md:hidden">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("");
              setSelectedDepartment("");
              setSelectedBlock("");
              setSelectedDate({ startDate: null, endDate: null });
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-xl font-medium text-[10px] sm:text-xs shadow-md"
            aria-label="Reset filters"
          >
            Reset Filters
          </button>
          <motion.button
            onClick={() => setShowAddForm(true)}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-2 py-1 rounded-xl shadow-lg hover:bg-teal-700 hover:scale-[1.02] font-semibold text-[10px] sm:text-xs"
            aria-label="Add new application"
          >
            <motion.div variants={{ rest: { x: 0 }, hover: { x: 5 } }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <FaPlus className="text-white text-[12px] sm:text-base" />
            </motion.div>
            <motion.span variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }} transition={{ duration: 0.3 }} className="text-[10px] sm:text-xs">
              Add Application
            </motion.span>
          </motion.button>
          <motion.button
            onClick={onExcelClick}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-2 py-1 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-[10px] sm:text-xs"
            aria-label="Download Excel"
          >
            <motion.div variants={{ rest: { x: 0 }, hover: { x: 5 } }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <RiFileExcel2Fill className="text-white text-[12px] sm:text-base" />
            </motion.div>
            <motion.span variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }} transition={{ duration: 0.3 }} className="text-[10px] sm:text-xs">
              Download Excel
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:ml-16 md:p-6 md:gap-3 md:mb-4 font-['Montserrat']">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-3xl font-bold text-gray-700 mb-3">Work Assign Application Dashboard</h2>
          <input
            type="text"
            placeholder="Search by name or description"
            className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-md focus:ring-[#ff5010] w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search applications"
          />
        </div>

        {/* Filters and Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Showing {filteredCount} application{filteredCount !== 1 && "s"} filtered by
              <strong className="text-gray-700"> {selectedStatus || "All"} status</strong>,
              <strong className="text-gray-700"> {selectedDepartment || "All"} department</strong>,
              <strong className="text-gray-700"> {selectedBlock || "All"} block</strong>,
              <strong className="text-gray-700"> {formatDisplayDate(selectedDate)} date</strong>.
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              <DropdownButton label={selectedStatus || "Select Status"} items={statusItems} />
              <DropdownButton label={selectedDepartment || "Select Department"} items={departmentItems} />
              <DropdownButton label={selectedBlock || "Select Block"} items={blockItems} />
              <DateRangePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 mt-3">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("");
                setSelectedDepartment("");
                setSelectedBlock("");
                setSelectedDate({ startDate: null, endDate: null });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
            <motion.button
              onClick={() => setShowAddForm(true)}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-teal-700 hover:scale-[1.02] font-semibold text-sm"
              aria-label="Add new application"
            >
              <motion.div variants={{ rest: { x: 0 }, hover: { x: 40 } }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <FaPlus className="text-white text-xl" />
              </motion.div>
              <motion.span variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }} transition={{ duration: 0.3 }} className="text-sm">
                Add Application
              </motion.span>
            </motion.button>
            <motion.button
              onClick={onExcelClick}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-sm"
              aria-label="Download Excel"
            >
              <motion.div variants={{ rest: { x: 0 }, hover: { x: 40 } }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <RiFileExcel2Fill className="text-white text-xl" />
              </motion.div>
              <motion.span variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }} transition={{ duration: 0.3 }} className="text-sm">
                Download Excel
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* AddCaseForm Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <AddCaseForm
              isOpen={showAddForm}
              onClose={() => {
                setShowAddForm(false);
                const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
                setApplications(storedApplications);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff5010, #fc641c);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
        .rdrCalendarWrapper {
          font-family: "Montserrat", sans-serif !important;
          font-size: 10px !important;
        }
        .rdrDayToday .rdrDayNumber span:after {
          background: linear-gradient(to right, #ff5010, #fc641c) !important;
        }
        .rdrDayHovered,
        .rdrDaySelected {
          background: linear-gradient(to right, #ff5010, #fc641c) !important;
          color: white !important;
        }
        .rdrMonthAndYearWrapper,
        .rdrDateInput {
          background: #f9fafb !important;
        }
      `}</style>
    </>
  );
};

export default WorkAssignedFilterHeader;