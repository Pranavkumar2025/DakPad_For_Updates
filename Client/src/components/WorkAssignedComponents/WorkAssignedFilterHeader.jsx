import React, { useState } from "react";
import { motion } from "framer-motion";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import DropdownButton from "../DropdownButton";

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
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <>
      {/* Mobile Layout */}
      <motion.div
        className="md:hidden flex flex-col p-4 sm:p-5 gap-3 mb-4 font-['Montserrat'] bg-white rounded-xl shadow-md w-full max-w-[340px] mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header and Search */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-700">
            Work Assign Application Dashboard
          </h2>
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
            <input
              type="text"
              placeholder="Search by name or description"
              className="border border-gray-300 bg-gray-50 pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md focus:ring-2 focus:ring-[#ff5010] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search applications"
            />
          </div>
        </div>

        {/* Filter Text and Accordion Toggle */}
        <div className="flex flex-col gap-3">
          <p className="text-xs sm:text-sm text-gray-500">
            Showing {filteredCount} application{filteredCount !== 1 && "s"} filtered by
            <strong className="text-gray-700"> {selectedStatus || "All"} status</strong>,
            <strong className="text-gray-700"> {selectedDepartment || "All"} department</strong>,
            <strong className="text-gray-700"> {selectedBlock || "All"} block</strong>,
            <strong className="text-gray-700"> {selectedDate || "All"} date</strong>.
          </p>
          <button
            className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#ff5010]"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-label={isFiltersOpen ? "Collapse filters" : "Expand filters"}
            aria-expanded={isFiltersOpen}
          >
            <span className="text-[11px] sm:text-sm font-semibold text-gray-700">Filters</span>
            {isFiltersOpen ? (
              <FaChevronUp className="text-gray-500 text-[10px] sm:text-sm" />
            ) : (
              <FaChevronDown className="text-gray-500 text-[10px] sm:text-sm" />
            )}
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={isFiltersOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-1">
              {/* Status */}
              <DropdownButton
                label={selectedStatus || "Select Status"}
                items={[
                  { label: "All", onClick: () => setSelectedStatus("") },
                  { label: "In Process", onClick: () => setSelectedStatus("In Process") },
                ]}
              />
              {/* Department */}
              <DropdownButton
                label={selectedDepartment || "Select Department"}
                items={[
                  { label: "All", onClick: () => setSelectedDepartment("") },
                  { label: "BDO, Barhara", onClick: () => setSelectedDepartment("BDO, Barhara") },
                  {
                    label: "Director Accounts, DRDA",
                    onClick: () => setSelectedDepartment("Director Accounts, DRDA"),
                  },
                  { label: "BDO Shahpur", onClick: () => setSelectedDepartment("BDO Shahpur") },
                  { label: "BDO Ara Sadar", onClick: () => setSelectedDepartment("BDO Ara Sadar") },
                  { label: "BDO Tarari", onClick: () => setSelectedDepartment("BDO Tarari") },
                  { label: "RDO Mohsin Khan", onClick: () => setSelectedDepartment("RDO Mohsin Khan") },
                ]}
              />
              {/* Block */}
              <DropdownButton
                label={selectedBlock || "Select Block"}
                items={[
                  { label: "All", onClick: () => setSelectedBlock("") },
                  { label: "Barhara", onClick: () => setSelectedBlock("Barhara") },
                  { label: "Shahpur", onClick: () => setSelectedBlock("Shahpur") },
                  { label: "Ara Sadar", onClick: () => setSelectedBlock("Ara Sadar") },
                  { label: "Bagar, Tarari", onClick: () => setSelectedBlock("Bagar, Tarari") },
                  { label: "Sandesh", onClick: () => setSelectedBlock("Sandesh") },
                  { label: "Behea", onClick: () => setSelectedBlock("Behea") },
                  { label: "Sahar", onClick: () => setSelectedBlock("Sahar") },
                ]}
              />
              {/* Date */}
              <DropdownButton
                label={selectedDate || "Select Date"}
                items={[
                  { label: "All", onClick: () => setSelectedDate("") },
                  { label: "2025-05-27", onClick: () => setSelectedDate("2025-05-27") },
                  { label: "2025-05-28", onClick: () => setSelectedDate("2025-05-28") },
                  { label: "2025-05-29", onClick: () => setSelectedDate("2025-05-29") },
                ]}
              />
            </div>
          </motion.div>
        </div>

        {/* Mobile Action Buttons (Fixed Bottom Bar) */}
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-[340px] mx-auto bg-white shadow-md p-2 flex justify-between gap-2 border-t border-gray-200 z-20 md:hidden">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("");
              setSelectedDepartment("");
              setSelectedBlock("");
              setSelectedDate("");
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-xl font-medium text-[10px] sm:text-xs shadow-md"
            aria-label="Reset filters"
          >
            Reset Filters
          </button>
          <motion.button
            onClick={onExcelClick}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-3 py-1.5 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-[10px] sm:text-xs"
            aria-label="Download Excel"
          >
            <motion.div
              variants={{ rest: { x: 0 }, hover: { x: 10 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <RiFileExcel2Fill className="text-white text-[14px] sm:text-base" />
            </motion.div>
            <motion.span
              variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
              transition={{ duration: 0.3 }}
              className="text-[10px] sm:text-xs"
            >
              Download Excel
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop Layout (Original) */}
      <div className="hidden md:flex md:flex-col md:ml-16 md:p-6 md:gap-3 md:mb-4 font-['Montserrat']">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-3xl font-bold text-gray-700 mb-3">
            Work Assign Application Dashboard
          </h2>
          <input
            type="text"
            placeholder="Search by name or description"
            className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-md focus:ring-[#ff5010] w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search applications"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Showing {filteredCount} application{filteredCount !== 1 && "s"} filtered by
              <strong className="text-gray-700"> {selectedStatus || "All"} status</strong>,
              <strong className="text-gray-700"> {selectedDepartment || "All"} department</strong>,
              <strong className="text-gray-700"> {selectedBlock || "All"} block</strong>,
              <strong className="text-gray-700"> {selectedDate || "All"} date</strong>.
            </p>

            <div className="flex flex-wrap gap-3 mt-1">
              {/* Status */}
              <DropdownButton
                label={selectedStatus || "Select Status"}
                items={[
                  { label: "All", onClick: () => setSelectedStatus("") },
                  { label: "In Process", onClick: () => setSelectedStatus("In Process") },
                ]}
              />
              {/* Department */}
              <DropdownButton
                label={selectedDepartment || "Select Department"}
                items={[
                  { label: "All", onClick: () => setSelectedDepartment("") },
                  { label: "BDO, Barhara", onClick: () => setSelectedDepartment("BDO, Barhara") },
                  {
                    label: "Director Accounts, DRDA",
                    onClick: () => setSelectedDepartment("Director Accounts, DRDA"),
                  },
                  { label: "BDO Shahpur", onClick: () => setSelectedDepartment("BDO Shahpur") },
                  { label: "BDO Ara Sadar", onClick: () => setSelectedDepartment("BDO Ara Sadar") },
                  { label: "BDO Tarari", onClick: () => setSelectedDepartment("BDO Tarari") },
                  { label: "RDO Mohsin Khan", onClick: () => setSelectedDepartment("RDO Mohsin Khan") },
                ]}
              />
              {/* Block */}
              <DropdownButton
                label={selectedBlock || "Select Block"}
                items={[
                  { label: "All", onClick: () => setSelectedBlock("") },
                  { label: "Barhara", onClick: () => setSelectedBlock("Barhara") },
                  { label: "Shahpur", onClick: () => setSelectedBlock("Shahpur") },
                  { label: "Ara Sadar", onClick: () => setSelectedBlock("Ara Sadar") },
                  { label: "Bagar, Tarari", onClick: () => setSelectedBlock("Bagar, Tarari") },
                  { label: "Sandesh", onClick: () => setSelectedBlock("Sandesh") },
                  { label: "Behea", onClick: () => setSelectedBlock("Behea") },
                  { label: "Sahar", onClick: () => setSelectedBlock("Sahar") },
                ]}
              />
              {/* Date */}
              <DropdownButton
                label={selectedDate || "Select Date"}
                items={[
                  { label: "All", onClick: () => setSelectedDate("") },
                  { label: "2025-05-27", onClick: () => setSelectedDate("2025-05-27") },
                  { label: "2025-05-28", onClick: () => setSelectedDate("2025-05-28") },
                  { label: "2025-05-29", onClick: () => setSelectedDate("2025-05-29") },
                ]}
              />
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
                setSelectedDate("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
            <motion.button
              onClick={onExcelClick}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-sm"
              aria-label="Download Excel"
            >
              <motion.div
                variants={{ rest: { x: 0 }, hover: { x: 40 } }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <RiFileExcel2Fill className="text-white text-xl" />
              </motion.div>
              <motion.span
                variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
                transition={{ duration: 0.3 }}
                className="text-xs"
              >
                Download Excel
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkAssignedFilterHeader;