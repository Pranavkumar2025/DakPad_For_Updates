import React from "react";
import { motion } from "framer-motion";
import { RiFileExcel2Fill } from "react-icons/ri";
import DropdownButton from "../DropdownButton";

const FilterHeader = ({
  searchQuery,
  setSearchQuery,
  filteredCount,
  selectedStatus,
  setSelectedStatus,
  selectedDepartment,
  setSelectedDepartment,
  selectedSource,
  setSelectedSource,
  selectedBlock,
  setSelectedBlock,
  selectedDate,
  setSelectedDate,
  onAddClick,
  onExcelClick,
}) => {
  return (
    <div className="flex flex-col ml-16 p-6 gap-3 mb-4">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-semibold text-gray-700">Applications List</h2>
        <input
          type="text"
          placeholder="Search by name or title"
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
            <strong className="text-gray-700"> {selectedSource || "All"} source</strong>,
            <strong className="text-gray-700"> {selectedBlock || "All"} block</strong>,
            <strong className="text-gray-700"> {selectedDate || "All"} date</strong>.
          </p>

          <div className="flex flex-wrap gap-3 mt-1">
            {/* Status */}
            <DropdownButton
              label={selectedStatus || "Select Status"}
              items={[
                { label: "All", onClick: () => setSelectedStatus("") },
                { label: "Pending", onClick: () => setSelectedStatus("Pending") },
                { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
                { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
              ]}
            />

            {/* Department */}
            <DropdownButton
              label={selectedDepartment || "Select Department"}
              items={[
                { label: "All", onClick: () => setSelectedDepartment("") },
                { label: "Registrar Office", onClick: () => setSelectedDepartment("Registrar Office") },
                { label: "Land Revenue Office", onClick: () => setSelectedDepartment("Land Revenue Office") },
                { label: "Welfare Department", onClick: () => setSelectedDepartment("Welfare Department") },
                { label: "Circle Office", onClick: () => setSelectedDepartment("Circle Office") },
                { label: "Tehsildar Office", onClick: () => setSelectedDepartment("Tehsildar Office") },
                { label: "Municipal Engineer", onClick: () => setSelectedDepartment("Municipal Engineer") },
                { label: "Rural Works Dept", onClick: () => setSelectedDepartment("Rural Works Dept") },
              ]}
            />

            {/* Source */}
            <DropdownButton
              label={selectedSource || "Source of Application"}
              items={[
                { label: "All", onClick: () => setSelectedSource("") },
                { label: "In Person", onClick: () => setSelectedSource("In Person") },
                { label: "MLA/MP", onClick: () => setSelectedSource("MLA/MP") },
                { label: "WhatsApp", onClick: () => setSelectedSource("WhatsApp") },
                { label: "Email", onClick: () => setSelectedSource("Email") },
              ]}
            />

            {/* Block */}
            <DropdownButton
              label={selectedBlock || "Select Block"}
              items={[
                { label: "All", onClick: () => setSelectedBlock("") },
                { label: "Block A", onClick: () => setSelectedBlock("Block A") },
                { label: "Block B", onClick: () => setSelectedBlock("Block B") },
                { label: "Block C", onClick: () => setSelectedBlock("Block C") },
                { label: "Block D", onClick: () => setSelectedBlock("Block D") },
              ]}
            />

         
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 mt-3">
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
