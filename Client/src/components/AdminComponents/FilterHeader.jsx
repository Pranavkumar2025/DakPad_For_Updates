// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { RiFileExcel2Fill } from "react-icons/ri";
// import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
// import DropdownButton from "../DropdownButton";
// import DateRangePicker from "../DateRangePicker";

// const FilterHeader = ({
//   searchQuery,
//   setSearchQuery,
//   filteredCount,
//   selectedStatus,
//   setSelectedStatus,
//   selectedDate,
//   setSelectedDate,
//   onExcelClick,
// }) => {
//   const [isFiltersOpen, setIsFiltersOpen] = useState(false);

//   const displayDate = selectedDate?.startDate && selectedDate?.endDate
//     ? `${selectedDate.startDate} to ${selectedDate.endDate}`
//     : selectedDate?.startDate
//     ? `${selectedDate.startDate} to Select End Date`
//     : selectedDate?.endDate
//     ? `Select Start Date to ${selectedDate.endDate}`
//     : "All";

//   return (
//     <>
//       {/* Mobile Layout */}
//       <motion.div
//         className="md:hidden flex flex-col p-3 gap-2 mb-3 font-['Montserrat'] bg-white rounded-xl shadow-md w-full max-w-[320px] mx-auto overflow-x-hidden"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="flex flex-col gap-2">
//           <h2 className="text-base sm:text-lg font-bold text-gray-700 text-center">
//             Application Management Dashboard
//           </h2>
//           <div className="relative w-full">
//             <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-sm" />
//             <input
//               type="text"
//               placeholder="Search by name or description"
//               className="border border-gray-300 bg-gray-50 pl-8 pr-2 py-1 text-[10px] sm:text-sm rounded-md focus:ring-2 focus:ring-[#ff5010] w-full"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               aria-label="Search applications"
//             />
//           </div>
//         </div>

//         <div className="flex flex-col gap-2">
//           <p className="text-[10px] sm:text-sm text-gray-500 truncate">
//             Showing {filteredCount} application{filteredCount !== 1 && "s"} filtered by
//             <strong className="text-gray-700"> {selectedStatus || "All"} status</strong>,
//             <strong className="text-gray-700"> {displayDate} date</strong>.
//           </p>
//           <button
//             className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#ff5010]"
//             onClick={() => setIsFiltersOpen(!isFiltersOpen)}
//             aria-label={isFiltersOpen ? "Collapse filters" : "Expand filters"}
//             aria-expanded={isFiltersOpen}
//           >
//             <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Filters</span>
//             {isFiltersOpen ? (
//               <FaChevronUp className="text-gray-500 text-[10px] sm:text-sm" />
//             ) : (
//               <FaChevronDown className="text-gray-500 text-[10px] sm:text-sm" />
//             )}
//           </button>
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={isFiltersOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             style={{ overflow: "hidden" }}
//           >
//             <div className="grid grid-cols-1 gap-2 mt-2">
//               <DropdownButton
//                 label={selectedStatus || "Select Status"}
//                 items={[
//                   { label: "All", onClick: () => setSelectedStatus("") },
//                   { label: "Not Assigned Yet", onClick: () => setSelectedStatus("Not Assigned Yet") },
//                   { label: "In Process", onClick: () => setSelectedStatus("In Process") },
//                   { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
//                   // { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
//                   { label: "Disposed", onClick: () => setSelectedStatus("Disposed") },
//                 ]}
//               />

//               <DateRangePicker
//                 selectedDate={selectedDate}
//                 setSelectedDate={setSelectedDate}
//               />
//             </div>
//           </motion.div>
//         </div>

//         <div className="fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-between gap-1 border-t border-gray-200 z-20 md:hidden">
//           <button
//             onClick={() => {
//               setSearchQuery("");
//               setSelectedStatus("");
//               setSelectedDate({ startDate: null, endDate: null });
//             }}
//             className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-xl font-medium text-[10px] sm:text-xs shadow-md"
//             aria-label="Reset filters"
//           >
//             Reset Filters
//           </button>

//           <motion.button
//             onClick={onExcelClick}
//             initial="rest"
//             whileHover="hover"
//             animate="rest"
//             className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-2 py-1 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-[10px] sm:text-xs"
//             aria-label="Download Excel"
//           >
//             <motion.div
//               variants={{ rest: { x: 0 }, hover: { x: 5 } }}
//               transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             >
//               <RiFileExcel2Fill className="text-white text-[12px] sm:text-base" />
//             </motion.div>
//             <motion.span
//               variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
//               transition={{ duration: 0.3 }}
//               className="text-[10px] sm:text-xs"
//             >
//               Download Excel
//             </motion.span>
//           </motion.button>
//         </div>
//       </motion.div>

//       {/* Desktop Layout */}
//       <div className="hidden md:flex md:flex-col md:ml-16 md:p-6 md:gap-3 md:mb-4 font-['Montserrat']">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <h2 className="text-3xl font-bold text-gray-700 mb-3">
//             Application Management Dashboard
//           </h2>
//           <input
//             type="text"
//             placeholder="Search by name or description"
//             className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-md focus:ring-[#ff5010] w-full md:w-80"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             aria-label="Search applications"
//           />
//         </div>

//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <div>
//             <p className="text-sm text-gray-500 mb-2">
//               Showing {filteredCount} application{filteredCount !== 1 && "s"} filtered by
//               <strong className="text-gray-700"> {selectedStatus || "All"} status</strong>,
//               <strong className="text-gray-700"> {displayDate} date</strong>.
//             </p>
//             <div className="flex flex-wrap gap-3 mt-1">
//               <DropdownButton
//                 label={selectedStatus || "Select Status"}
//                 items={[
//                   { label: "All", onClick: () => setSelectedStatus("") },
//                   { label: "Not Assigned Yet", onClick: () => setSelectedStatus("Not Assigned Yet") },
//                   { label: "In Process", onClick: () => setSelectedStatus("In Process") },
//                   { label: "Compliance", onClick: () => setSelectedStatus("Compliance") },
//                   // { label: "Dismissed", onClick: () => setSelectedStatus("Dismissed") },
//                   { label: "Disposed", onClick: () => setSelectedStatus("Disposed") },
//                 ]}
//               />
//               <DateRangePicker
//                 selectedDate={selectedDate}
//                 setSelectedDate={setSelectedDate}
//               />
//             </div>
//           </div>
//           <div className="flex flex-wrap justify-end gap-3 mt-3">
//             <button
//               onClick={() => {
//                 setSearchQuery("");
//                 setSelectedStatus("");
//                 setSelectedDate({ startDate: null, endDate: null });
//               }}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
//               aria-label="Reset filters"
//             >
//               Reset Filters
//             </button>
//             <motion.button
//               onClick={onExcelClick}
//               initial="rest"
//               whileHover="hover"
//               animate="rest"
//               className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-sm"
//               aria-label="Download Excel"
//             >
//               <motion.div
//                 variants={{ rest: { x: 0 }, hover: { x: 40 } }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//               >
//                 <RiFileExcel2Fill className="text-white text-xl" />
//               </motion.div>
//               <motion.span
//                 variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
//                 transition={{ duration: 0.3 }}
//                 className="text-xs"
//               >
//                 Download Excel
//               </motion.span>
//             </motion.button>
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         * {
//           box-sizing: border-box;
//         }
//         .backdrop-blur-md {
//           backdrop-filter: blur(8px);
//           -webkit-backdrop-filter: blur(8px);
//         }
//         .overflow-y-auto::-webkit-scrollbar {
//           width: 6px;
//         }
//         .overflow-y-auto::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #ff5010, #fc641c);
//           border-radius: 3px;
//         }
//         .overflow-y-auto::-webkit-scrollbar-track {
//           background-color: #f3f4f6;
//         }
//         .rdrCalendarWrapper {
//           font-family: "Montserrat", sans-serif !important;
//           font-size: 10px !important;
//         }
//         .rdrDayToday .rdrDayNumber span:after {
//           background: linear-gradient(to right, #ff5010, #fc641c) !important;
//         }
//         .rdrDayHovered, .rdrDaySelected {
//           background: linear-gradient(to right, #ff5010, #fc641c) !important;
//           color: white !important;
//         }
//         .rdrMonthAndYearWrapper, .rdrDateInput {
//           background: #f9fafb !important;
//         }
//       `}</style>
//     </>
//   );
// };

// export default FilterHeader;



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