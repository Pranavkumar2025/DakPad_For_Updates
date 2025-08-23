import React, { useState } from "react";
import { motion } from "framer-motion";
import { RiFileExcel2Fill } from "react-icons/ri";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker CSS
import DropdownButton from "../DropdownButton";

const FilterHeader = ({
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
  onAddClick,
  onExcelClick,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Handle date range changes
  const handleDateChange = (start, end) => {
    if (start && end) {
      setSelectedDate(`${start.toISOString().split("T")[0]} - ${end.toISOString().split("T")[0]}`);
    } else {
      setSelectedDate("");
    }
  };

  return (
    <div className="flex flex-col ml-16 p-6 gap-3 mb-4 relative" style={{ zIndex: 100 }}>
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-semibold text-gray-700">Applications List</h2>
        <input
          type="text"
          placeholder="Search by name or description"
          className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-md focus:ring-[#ff5010] w-full md:w-80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">
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
                { label: "Director Accounts, DRDA", onClick: () => setSelectedDepartment("Director Accounts, DRDA") },
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

            {/* Date Range Picker */}
            <div className="flex items-center bg-white border px-3 py-2 rounded-xl text-sm space-x-1 relative">
              <CalendarDays className="text-gray-500" size={16} />
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  handleDateChange(date, endDate);
                }}
                placeholderText="From"
                className="outline-none bg-transparent w-[90px]"
                dateFormat="dd/MM/yyyy"
                popperClassName="z-[3000]" // Increased z-index further
                popperPlacement="top" // Force upward direction
              />
              <span className="text-gray-400">-</span>
              <CalendarDays className="text-gray-500" size={16} />
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  handleDateChange(startDate, date);
                }}
                placeholderText="To"
                className="outline-none bg-transparent w-[90px]"
                dateFormat="dd/MM/yyyy"
                popperClassName="z-[3000]" // Increased z-index further
                popperPlacement="top" // Force upward direction
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 mt-3">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("");
              setSelectedDepartment("");
              setSelectedBlock("");
              setSelectedDate("");
              setStartDate(null);
              setEndDate(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
          >
            Reset Filters
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#0ea769] text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
          >
            + Add New Application
          </button>
          <motion.button
            onClick={onExcelClick}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-sm"
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
  );
};

export default FilterHeader;