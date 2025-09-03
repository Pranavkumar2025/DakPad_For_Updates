import React, { useState, useEffect } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";


const ApplicationTable = ({ data, onRowClick }) => {
  const [applications, setApplications] = useState([]);

  // Calculate pending days based on issue date and status
  const calculatePendingDays = (issueDate, status) => {
    if (status === "Compliance" || status === "Closed") return 0; // Updated to include "Closed"
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
    if (latestEntry.includes("closed")) return "Closed"; // Check for "Closed"
    if (latestEntry.includes("compliance")) return "Compliance"; // Simplified to include both "compliance" and "compliance completed"
    if (latestEntry.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // Function to update applications from localStorage and JSON data
  const updateApplications = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");

    // Map localStorage data to match ApplicationTable structure
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

    // Merge with JSON data, avoiding duplicates
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
        console.log("Storage event triggered, updating applications...");
        updateApplications();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Polling for same-tab updates
    const intervalId = setInterval(() => {
      console.log("Polling for updates...");
      updateApplications();
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [data]);

  // Handle removal of localStorage applications
  const handleRemove = (applicationId) => {
    if (window.confirm("Are you sure you want to remove this application?")) {
      const updatedStoredApplications = JSON.parse(localStorage.getItem("applications") || "[]").filter(
        (app) => app.ApplicantId !== applicationId
      );
      localStorage.setItem("applications", JSON.stringify(updatedStoredApplications));
      updateApplications();
    }
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
        return "bg-purple-500 text-white whitespace-nowrap"; // Added for "Closed"
      default:
        return "bg-gray-500 text-white whitespace-nowrap";
    }
  };

  return (
    <div className="md:pl-20 lg:pl-20">
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
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500 text-sm font-['Montserrat']">
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
              </div>
            </div>
          ))
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default ApplicationTable;