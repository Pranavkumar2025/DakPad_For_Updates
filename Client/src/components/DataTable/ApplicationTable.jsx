import React, { useState, useEffect } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { Trash2 } from "lucide-react";

const ApplicationTable = ({ data, onRowClick }) => {
  const [applications, setApplications] = useState([]);

  // Calculate pending days based on issue date
  const calculatePendingDays = (issueDate) => {
    const issue = new Date(issueDate);
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to update applications from localStorage and JSON data
  const updateApplications = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    
    // Map localStorage data to match WorkAssignedApplicationTable structure
    const mappedStoredApplications = storedApplications
      .map((app, index) => ({
        applicationId: app.ApplicantId,
        sNo: index + 1, // Temporary sNo, will be re-indexed
        dateOfApplication: app.applicationDate,
        applicantName: app.applicant,
        subject: app.subject,
        gpBlock: app.block || "N/A",
        issueDate: app.applicationDate, // Use applicationDate as issueDate
        pendingDays: calculatePendingDays(app.applicationDate),
        status: "In Process", // Default status
        attachment: app.attachment,
        concernedOfficer: "N/A", // Default, not present in ApplicationReceive
        isFromLocalStorage: true, // Flag to identify localStorage entries
      }))
      .sort((a, b) => new Date(b.dateOfApplication) - new Date(a.dateOfApplication)); // Sort by date, newest first

    // Combine with JSON data, re-index sNo
    const combinedData = [
      ...mappedStoredApplications,
      ...data.map((item, index) => ({
        ...item,
        sNo: mappedStoredApplications.length + index + 1,
        isFromLocalStorage: false, // Flag for JSON data
      })),
    ].map((item, index) => ({ ...item, sNo: index + 1 })); // Re-index sNo

    setApplications(combinedData);
  };

  // Initial load and listen for localStorage changes
  useEffect(() => {
    // Initial load
    updateApplications();

    // Listen for storage events to detect localStorage changes
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        updateApplications();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup event listener
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [data]);

  // Handle removal of localStorage applications
  const handleRemove = (applicationId) => {
    if (window.confirm("Are you sure you want to remove this application?")) {
      const updatedStoredApplications = JSON.parse(localStorage.getItem("applications") || "[]").filter(
        (app) => app.ApplicantId !== applicationId
      );
      localStorage.setItem("applications", JSON.stringify(updatedStoredApplications));
      updateApplications(); // Refresh applications
    }
  };

  const getPendingDaysColor = (days) => {
    if (days <= 10) return "bg-green-500 text-white";
    if (days <= 15) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Process":
        return "bg-blue-500 text-white whitespace-nowrap";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="md:pl-20 lg:pl-20">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white mx-auto max-w-8xl p-6 my-6">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-5 shadow-sm"> {/* Lowered z-index from 10 to 5 */}
            <tr className="text-xs uppercase tracking-wider text-gray-700 font-semibold">
              {[
                "Sr. No",
                "Date",
                "Applicant",
                "Subject",
                "GP, Block",
                "Issue Date",
                "Pending Days",
                "Status",
                "Attachment",
                "Remove",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500 text-sm">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((caseDetail) => (
                <tr
                  key={caseDetail.applicationId}
                  className="text-sm hover:bg-blue-50 transition cursor-pointer even:bg-gray-50"
                  onClick={() => onRowClick(caseDetail)}
                >
                  <td className="px-6 py-4">{caseDetail.sNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{caseDetail.dateOfApplication}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {caseDetail.applicantName}
                  </td>
                  <td className="px-6 py-4">{caseDetail.subject}</td>
                  <td className="px-6 py-4">{caseDetail.gpBlock}</td>
                  <td className="px-6 py-4">{caseDetail.issueDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(
                        caseDetail.pendingDays
                      )}`}
                    >
                      {caseDetail.pendingDays}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                        caseDetail.status
                      )}`}
                    >
                      {caseDetail.status === "In Process" && (
                        <FaSpinner className="animate-spin-slow" />
                      )}
                      {caseDetail.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(caseDetail);
                      }}
                      className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                    >
                      <FaFilePdf /> PDF
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {caseDetail.isFromLocalStorage ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(caseDetail.applicationId);
                        }}
                        className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4 py-4 px-4">
        {applications.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            No applications found.
          </div>
        ) : (
          applications.map((caseDetail) => (
            <div
              key={caseDetail.applicationId}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-5 hover:shadow-lg transition mx-auto max-w-md"
              onClick={() => onRowClick(caseDetail)}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  {caseDetail.applicantName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                    caseDetail.status
                  )}`}
                >
                  {caseDetail.status === "In Process" && (
                    <FaSpinner className="animate-spin-slow" />
                  )}
                  {caseDetail.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>
                    <strong>Sr. No:</strong> {caseDetail.sNo}
                  </span>
                  <span>
                    <strong>Date:</strong> {caseDetail.dateOfApplication}
                  </span>
                </div>
                <div>
                  <strong>Subject:</strong> {caseDetail.subject}
                </div>
                <div>
                  <strong>GP, Block:</strong> {caseDetail.gpBlock}
                </div>
                <div>
                  <strong>Officer:</strong> {caseDetail.concernedOfficer}
                </div>
                <div>
                  <strong>Issue Date:</strong> {caseDetail.issueDate}
                </div>
                <div>
                  <strong>Pending Days:</strong>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(
                      caseDetail.pendingDays
                    )}`}
                  >
                    {caseDetail.pendingDays}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(caseDetail);
                  }}
                  className="inline-flex items-center gap-1 px-4 py-1.5 text-xs rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                >
                  <FaFilePdf /> PDF
                </button>
                {caseDetail.isFromLocalStorage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(caseDetail.applicationId);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom CSS for slow spin animation */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationTable;