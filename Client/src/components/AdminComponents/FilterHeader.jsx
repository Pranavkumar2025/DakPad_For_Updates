import React, { useState, useRef } from "react";
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
  onExcelClick,
}) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Handle date range selection
  const handleDateChange = (range) => {
    const [start, end] = range;
    setDateRange(range);
    if (start && end) {
      setSelectedDate(`${start.toISOString().split("T")[0]} - ${end.toISOString().split("T")[0]}`);
    } else {
      setSelectedDate("");
    }
    setIsDatePickerOpen(false); // Close date picker after selection
  };

  // Toggle date picker visibility
  const toggleDatePicker = () => {
    setIsDatePickerOpen((prev) => !prev);
  };

  // Close date picker if clicking outside
  const handleClickOutside = (event) => {
    if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
      setIsDatePickerOpen(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto my-6 font-['Montserrat']">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Application Management Dashboard</h2>
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
            Showing <span className="font-semibold">{filteredCount}</span> case
            {filteredCount !== 1 ? "s" : ""} filtered by
            <span className="font-semibold text-blue-600"> {selectedStatus || "All"} status</span>,
            <span className="font-semibold text-blue-600"> {selectedDate || "All"} date</span>.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Status Dropdown */}
            <DropdownButton
              label={selectedStatus || "Select Status"}
              items={[
                { label: "All", onClick: () => setSelectedStatus("") },
                { label: "Not Assigned Yet", onClick: () => setSelectedStatus("Not Assigned Yet") },
                { label: "In Process", onClick: () => setSelectedStatus("In Process") },
                { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
                { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
              ]}
              className="bg-gray-50 hover:bg-gray-100 border-gray-200"
              menuClassName="z-[1000]"
            />

            {/* Date Range Picker */}
            <div className="relative" ref={datePickerRef}>
              <DropdownButton
                label={selectedDate || "Select Date Range"}
                items={[]} // No items, as we use custom content
                className="bg-gray-50 hover:bg-gray-100 border-gray-200"
                menuClassName="z-[2000]"
                onClick={toggleDatePicker}
                isOpen={isDatePickerOpen}
                customContent={
                  isDatePickerOpen && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                      <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        inline
                        dateFormat="dd/MM/yyyy"
                        popperClassName="z-[2000]"
                        popperPlacement="bottom-start"
                        popperModifiers={[
                          {
                            name: "offset",
                            options: {
                              offset: [0, 8],
                            },
                          },
                          {
                            name: "preventOverflow",
                            options: {
                              rootBoundary: "viewport",
                            },
                          },
                        ]}
                      />
                    </div>
                  )
                }
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
              setDateRange([null, null]);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 font-medium text-sm transition-all"
          >
            Reset Filters
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

      {/* Custom CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        .react-datepicker {
          font-family: 'Montserrat', sans-serif;
          border: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .react-datepicker__header {
          background-color: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-range,
        .react-datepicker__day--in-selecting-range {
          background-color: #2563eb;
          color: white;
        }
        .react-datepicker__day:hover {
          background-color: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default FilterHeader;