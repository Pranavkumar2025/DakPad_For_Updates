import React, { useState, useEffect } from "react";
import { FaFilePdf, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const WorkAssignedApplicationTable = ({ data, onRowClick }) => {
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  // Calculate pending days based on issue date and status
  const calculatePendingDays = (issueDate, status) => {
    if (status === "Compliance" || status === "Closed") return 0;
    const issue = new Date(issueDate);
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Determine dynamic status based on timeline and concernedOfficer
  const determineStatus = (timeline, concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") return "Not Assigned Yet";
    if (!timeline || timeline.length === 0) return "In Process";
    const latestEntry = timeline[timeline.length - 1].section.toLowerCase();
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    if (latestEntry.includes("closed")) return "Closed";
    return "In Process";
  };

  // Update applications from localStorage and JSON data
  const updateApplications = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const mappedStoredApplications = storedApplications
      .map((app, index) => {
        const timeline = app.timeline || [
          {
            section: "Application Received",
            comment: `Application received at ${app.block || "N/A"} on ${app.applicationDate}`,
            date: app.applicationDate,
            pdfLink: app.attachment || null,
          },
        ];
        const status = determineStatus(timeline, app.concernedOfficer);
        return {
          applicationId: app.ApplicantId,
          sNo: index + 1,
          dateOfApplication: app.applicationDate,
          applicantName: app.applicant,
          subject: app.subject,
          gpBlock: app.block || "N/A",
          issueDate: app.applicationDate,
          pendingDays: calculatePendingDays(app.applicationDate, status),
          status: status,
          attachment: app.attachment,
          concernedOfficer: app.concernedOfficer || "N/A",
          isFromLocalStorage: true,
          timeline: timeline,
        };
      })
      .sort((a, b) => new Date(b.dateOfApplication) - new Date(a.dateOfApplication));

    const storedAppIds = new Set(mappedStoredApplications.map((app) => app.applicationId));
    const filteredData = data.filter((item) => !storedAppIds.has(item.applicationId));
    const combinedData = [
      ...mappedStoredApplications,
      ...filteredData.map((item, index) => {
        const timeline = item.timeline || [
          {
            section: "Application Received",
            comment: `Application received at ${item.gpBlock || "N/A"} on ${item.dateOfApplication}`,
            date: item.dateOfApplication,
            pdfLink: item.attachment || null,
          },
        ];
        const status = determineStatus(timeline, item.concernedOfficer);
        return {
          ...item,
          sNo: mappedStoredApplications.length + index + 1,
          isFromLocalStorage: false,
          pendingDays: calculatePendingDays(item.issueDate, status),
          status: status,
          timeline: timeline,
        };
      }),
    ].map((item, index) => ({ ...item, sNo: index + 1 }));

    setApplications(combinedData);
  };

  // Initial load and listen for localStorage changes
  useEffect(() => {
    updateApplications();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        updateApplications();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const intervalId = setInterval(() => {
      updateApplications();
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [data]);

  // Handle opening the confirmation modal
  const handleOpenModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
  };

  // Handle closing the application (update status to Closed)
  const handleCloseApplication = () => {
    if (selectedApplicationId) {
      const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApplications = storedApplications.map((app) => {
        if (app.ApplicantId === selectedApplicationId) {
          const newTimeline = [
            ...app.timeline,
            {
              section: "Closed",
              comment: `Application closed on ${new Date().toISOString().split("T")[0]}`,
              date: new Date().toISOString().split("T")[0],
              pdfLink: null,
            },
          ];
          return { ...app, timeline: newTimeline };
        }
        return app;
      });
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      updateApplications();
      setIsModalOpen(false);
      setSelectedApplicationId(null);
    }
  };

  // Close the modal without action
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedApplicationId(null);
  };

  // Color for pending days
  const getPendingDaysColor = (days) => {
    if (days === 0) return "bg-green-500 text-white";
    if (days <= 10) return "bg-green-500 text-white";
    if (days <= 15) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  // Style for status
  const getStatusStyle = (status) => {
    switch (status) {
      case "Not Assigned Yet":
        return "bg-gray-500 text-white whitespace-nowrap";
      case "In Process":
        return "bg-blue-500 text-white whitespace-nowrap";
      case "Compliance":
        return "bg-green-500 text-white whitespace-nowrap";
      case "Dismissed":
        return "bg-red-500 text-white whitespace-nowrap";
      case "Closed":
        return "bg-purple-500 text-white whitespace-nowrap";
      default:
        return "bg-gray-500 text-white whitespace-nowrap";
    }
  };

//   const getStatusStyle = (status) => {
//   switch (status) {
//     case "Not Assigned Yet":
//       return "bg-gray-200 text-gray-800 whitespace-nowrap font-medium rounded-md px-2 py-1";
//     case "In Process":
//       return "bg-blue-100 text-blue-800 whitespace-nowrap font-medium rounded-md px-2 py-1";
//     case "Compliance":
//       return "bg-green-100 text-green-800 whitespace-nowrap font-medium rounded-md px-2 py-1";
//     case "Dismissed":
//       return "bg-red-100 text-red-800 whitespace-nowrap font-medium rounded-md px-2 py-1";
//     case "Closed":
//       return "bg-orange-100 text-orange-800 whitespace-nowrap font-medium rounded-md px-2 py-1";
//     default:
//       return "bg-gray-200 text-gray-800 whitespace-nowrap font-medium rounded-md px-2 py-1";
//   }
// };

  return (
    <div className="md:pl-16 lg:pl-16">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white mx-auto max-w-8xl p-6 my-6">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr className="text-xs uppercase tracking-wider text-gray-700 font-semibold font-['Montserrat']">
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
                "Action",
              ].map((header, idx) => (
                <th key={idx} className="px-6 py-4 text-left whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500 text-sm font-['Montserrat']">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((caseDetail) => (
                <tr
                  key={caseDetail.applicationId}
                  className="text-sm hover:bg-blue-50 transition cursor-pointer even:bg-gray-50 font-['Montserrat']"
                  onClick={() => onRowClick(caseDetail)}
                >
                  <td className="px-6 py-4">{caseDetail.sNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{caseDetail.dateOfApplication}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{caseDetail.applicantName}</td>
                  <td className="px-6 py-4">{caseDetail.subject}</td>
                  <td className="px-6 py-4">{caseDetail.gpBlock}</td>
                  <td className="px-6 py-4">{caseDetail.issueDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(caseDetail.pendingDays)}`}
                      aria-label={`Pending days: ${caseDetail.pendingDays}`}
                    >
                      {caseDetail.pendingDays}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(caseDetail.status)}`}
                      aria-label={`Status: ${caseDetail.status}`}
                    >
                      {caseDetail.status === "In Process" && <FaSpinner className="animate-spin-slow" />}
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
                      aria-label="View PDF"
                    >
                      <FaFilePdf /> PDF
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {caseDetail.isFromLocalStorage && caseDetail.status !== "Closed" ? (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(caseDetail.applicationId);
                        }}
                        className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-red-100 hover:text-red-600 transition font-['Montserrat'] shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Close application"
                      >
                        Close
                      </motion.button>
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
          <div className="text-center text-gray-500 text-sm font-['Montserrat']">
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
                <h3 className="text-sm font-semibold text-gray-800 font-['Montserrat']">
                  {caseDetail.applicantName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(caseDetail.status)}`}
                  aria-label={`Status: ${caseDetail.status}`}
                >
                  {caseDetail.status === "In Process" && <FaSpinner className="animate-spin-slow" />}
                  {caseDetail.status}
                </span>
              </div>
              <div className="space-y-2 text-xs text-gray-700 font-['Montserrat']">
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(caseDetail.pendingDays)}`}
                    aria-label={`Pending days: ${caseDetail.pendingDays}`}
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
                  aria-label="View PDF"
                >
                  <FaFilePdf /> PDF
                </button>
                {caseDetail.isFromLocalStorage && caseDetail.status !== "Closed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(caseDetail.applicationId);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
                    aria-label="Close application"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 font-['Montserrat']">
                Confirm Closure
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6 font-['Montserrat']">
              Are you sure you want to close this application? This will update its status to "Closed".
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-['Montserrat']"
                aria-label="Cancel closure"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseApplication}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition font-['Montserrat']"
                aria-label="Confirm closure"
              >
                Close Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
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
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default WorkAssignedApplicationTable;