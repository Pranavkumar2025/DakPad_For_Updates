import { motion } from "framer-motion";

const Pagination = ({ currentPage, totalPages, setCurrentPage, applications, indexOfFirstRecord, indexOfLastRecord }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
      <span className="text-sm text-gray-600">
        Showing {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, applications.length)} of{" "}
        {applications.length}
      </span>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-md text-sm ${currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
          aria-label="Previous page"
        >
          Previous
        </motion.button>
        {[...Array(totalPages)].map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1.5 rounded-md text-sm ${currentPage === i + 1 ? "bg-[#ff5010] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            whileHover={{ scale: currentPage === i + 1 ? 1 : 1.05 }}
            aria-label={`Page ${i + 1}`}
          >
            {i + 1}
          </motion.button>
        ))}
        <motion.button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-md text-sm ${currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
          aria-label="Next page"
        >
          Next
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;