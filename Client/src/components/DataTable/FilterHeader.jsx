import React, { useState } from "react";
import { motion } from "framer-motion";
import { RiFileExcel2Fill } from "react-icons/ri";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
    <div className=" relative z-10 bg-white shadow-lg rounded-xl p-6 mx-4 md:mx-16 mb-6 max-w-10xl">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Applications List</h2>
        <input
          type="text"
          placeholder="Search by name or description"
          className="border border-gray-200 bg-gray-50 text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredCount}</span> application
            {filteredCount !== 1 ? "s" : ""} filtered by
            <span className="font-semibold text-blue-600"> {selectedStatus || "All"} status</span>,
            <span className="font-semibold text-blue-600"> {selectedDepartment || "All"} department</span>,
            <span className="font-semibold text-blue-600"> {selectedBlock || "All"} block</span>,
            <span className="font-semibold text-blue-600"> {selectedDate || "All"} date</span>.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Status Dropdown */}
            <DropdownButton
              label={selectedStatus || "Select Status"}
              items={[
                { label: "All", onClick: () => setSelectedStatus("") },
                { label: "In Process", onClick: () => setSelectedStatus("In Process") },
              ]}
              className="bg-gray-50 hover:bg-gray-100 border-gray-200"
              menuClassName="z-[100]" // Increased z-index to appear above table header
            />

            {/* Department Dropdown */}
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
              className="bg-gray-50 hover:bg-gray-100 border-gray-200"
              menuClassName="z-[100]" // Increased z-index to appear above table header
            />

            {/* Block Dropdown */}
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
              className="bg-gray-50 hover:bg-gray-100 border-gray-200"
              menuClassName="z-[100]" // Increased z-index to appear above table header
            />

            {/* Date Range Picker */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm space-x-2">
              <CalendarDays className="text-gray-500" size={16} />
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  handleDateChange(date, endDate);
                }}
                placeholderText="From"
                className="outline-none bg-transparent w-24 text-sm"
                dateFormat="dd/MM/yyyy"
                popperClassName="z-[100]" // Match dropdown z-index
                popperPlacement="bottom-start"
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
                className="outline-none bg-transparent w-24 text-sm"
                dateFormat="dd/MM/yyyy"
                popperClassName="z-[100]" // Match dropdown z-index
                popperPlacement="bottom-start"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3">
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
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 font-medium text-sm transition-all"
          >
            Reset Filters
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm transition-all"
          >
            + Add New Application
          </button>
          <motion.button
            onClick={onExcelClick}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-md transition-all"
          >
            <RiFileExcel2Fill className="text-white text-lg" />
            <span>Download Excel</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FilterHeader;