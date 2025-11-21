// components/Dashboard/ApplicationsTable.jsx
import React from "react";
import { Search, AlertCircle } from "lucide-react";

const ApplicationsTable = ({
  activeTable,
  setActiveTable,
  searchTerm,
  setSearchTerm,
  filteredApplicationData,
  getFilteredApplications,
  getUniqueBlocks,
  currentPage,
  setCurrentPage,
  itemsPerPage = 10,
  tableRef,
  averageDays,
}) => {
  // === HELPER FUNCTIONS ===
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculatePendingDays = (appDate) => {
    const today = new Date();
    const app = new Date(appDate);
    const diff = Math.ceil((today - app) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getStatusDisplay = (status) => {
    if (status === "Compliance" || status === "Disposed") {
      return { text: "Compliance", color: "bg-green-100 text-green-800" };
    }
    if (status === "In Process" || status === "Not Assigned Yet") {
      return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: status || "Unknown", color: "bg-gray-100 text-gray-700" };
  };

  // === DATA ===
  const applications = getFilteredApplications();
  const blocks = getUniqueBlocks();
  const currentData = activeTable === "blocks" ? blocks : applications;

  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = applications.filter(a => !["Compliance", "Disposed"].includes(a.status)).length;
  const resolvedCount = applications.filter(a => ["Compliance", "Disposed"].includes(a.status)).length;

  return (
    <div
      ref={tableRef}
      className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-xl"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {activeTable === "pending" && "Pending Applications"}
          {activeTable === "resolved" && "Compliance Achieved"}
          {activeTable === "blocks" && "Block-wise Performance"}
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
          </span>
          <AlertCircle className="w-5 h-5 text-gray-400 cursor-help" />
        </div>
      </div>

      {/* SEARCH BAR - FULLY FIXED */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTable === "blocks"
                ? "Search blocks..."
                : "Search by name, ID, block, officer..."
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xl font-light"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-2">
            Found {totalItems} result{totalItems !== 1 ? "s" : ""} for "{searchTerm}"
          </p>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => { setActiveTable("pending"); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-full font-medium transition-all shadow-sm ${
            activeTable === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => { setActiveTable("resolved"); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-full font-medium transition-all shadow-sm ${
            activeTable === "resolved"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Compliance ({resolvedCount})
        </button>
        <button
          onClick={() => { setActiveTable("blocks"); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-full font-medium transition-all shadow-sm ${
            activeTable === "blocks"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Blocks ({blocks.length})
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {activeTable === "blocks" ? (
                <>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">S.No</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Block Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Pending</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Compliance</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Rate</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">S.No</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Applicant ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Applicant</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Block</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Officer</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Pending Days</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeTable === "blocks" ? 6 : 8} className="text-center py-16 text-gray-500 text-lg">
                  No data found
                </td>
              </tr>
            ) : activeTable === "blocks" ? (
              paginatedData.map((block, i) => (
                <tr key={block.blockName} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{startIndex + i + 1}</td>
                  <td className="px-6 py-4 font-medium">{block.blockName}</td>
                  <td className="px-6 py-4">{block.totalApplications}</td>
                  <td className="px-6 py-4 text-yellow-600 font-medium">{block.pendingApplications}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{block.resolvedApplications}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${
                        block.resolvedPercentage >= 70 ? "text-green-600" :
                        block.resolvedPercentage >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {block.resolvedPercentage}%
                      </span>
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            block.resolvedPercentage >= 70 ? "bg-green-500" :
                            block.resolvedPercentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${block.resolvedPercentage}%` }}
                        />
                      </div>
                    </div>
  </td>
                </tr>
              ))
            ) : (
              paginatedData.map((app, i) => {
                const pendingDays = calculatePendingDays(app.applicationDate);
                const { text: statusText, color: statusColor } = getStatusDisplay(app.status);

                return (
                  <tr key={app._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">{startIndex + i + 1}</td>
                    <td className="px-6 py-4">{formatDate(app.applicationDate)}</td>
                    <td className="px-6 py-4 font-mono text-blue-600 text-xs">{app.applicantId}</td>
                    <td className="px-6 py-4 font-medium">{app.applicant}</td>
                    <td className="px-6 py-4">{app.block}</td>
                    <td className="px-6 py-4 text-gray-600">{app.concernedOfficer}</td>
                    <td className={`px-6 py-4 font-bold text-lg ${pendingDays > 30 ? "text-red-600" : pendingDays > 15 ? "text-yellow-600" : "text-green-600"}`}>
                      {pendingDays}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 rounded-xl bg-gray-100 disabled:opacity-50 hover:bg-gray-200 font-medium transition"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-12 h-12 rounded-xl font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 rounded-xl bg-gray-100 disabled:opacity-50 hover:bg-gray-200 font-medium transition"
          >
            Next
          </button>
        </div>
      )}

      {/* SUMMARY FOOTER */}
      <div className="mt-10 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Applications</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{applications.length}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Average Pending Days</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{averageDays || "0"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Overall Compliance Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {applications.length > 0
                ? Math.round((resolvedCount / applications.length) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTable;