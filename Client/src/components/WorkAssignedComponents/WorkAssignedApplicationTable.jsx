import React, { useState, useEffect } from "react";
import { FaFilePdf, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";

const WorkAssignedApplicationTable = ({
  data,
  onRowClick,
  searchQuery,
  selectedStatus,
  selectedDepartment,
  selectedBlock,
  selectedDate,
}) => {
  const [applications, setApplications] = useState([]);
  const [openCardId, setOpenCardId] = useState(null);

  // Calculate pending days based on issue date and status
  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) {
      console.warn(`Invalid issueDate for application: ${issueDate}`);
      return 0;
    }
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Determine dynamic status based on timeline and concernedOfficer
  const determineStatus = (timeline, concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") return "Not Assigned Yet";
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latestEntry = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latestEntry.includes("disposed")) return "Disposed";
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // Filter applications based on props
  const filterApplications = (rawApplications) => {
    console.log("Filter props:", { searchQuery, selectedStatus, selectedDepartment, selectedBlock, selectedDate });
    console.log("Raw applications:", rawApplications);
    return rawApplications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        (app.applicantName && app.applicantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.subject && app.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatus === "" || app.status === selectedStatus;
      const matchesDepartment = selectedDepartment === "" || app.concernedOfficer === selectedDepartment;
      const matchesBlock = selectedBlock === "" || app.gpBlock === selectedBlock;
      let matchesDate = true;
      if (selectedDate?.startDate && selectedDate?.endDate) {
        const appDate = new Date(app.dateOfApplication);
        const startDate = new Date(selectedDate.startDate);
        const endDate = new Date(selectedDate.endDate);
        matchesDate = appDate >= startDate && appDate <= endDate;
      }
      const isMatch = matchesSearch && matchesStatus && matchesDepartment && matchesBlock && matchesDate;
      if (!isMatch) {
        console.log(`Application ${app.applicationId} filtered out:`, {
          matchesSearch,
          matchesStatus,
          matchesDepartment,
          matchesBlock,
          matchesDate,
          app,
        });
      }
      return isMatch;
    });
  };

  // Update applications from localStorage and JSON data
  const updateApplications = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    console.log("Stored applications from localStorage:", storedApplications);

    const mappedStoredApplications = storedApplications
      .map((app, index) => {
        const timeline = Array.isArray(app.timeline)
          ? app.timeline
          : [
              {
                section: "Application Received",
                comment: `Application received at ${app.block || "N/A"} on ${app.applicationDate || "N/A"}`,
                date: app.applicationDate || new Date().toLocaleDateString("en-GB"),
                pdfLink: app.attachment || null,
                department: app.department || "N/A",
                officer: app.concernedOfficer || "N/A",
              },
            ];
        const status = determineStatus(timeline, app.concernedOfficer);
        return {
          applicationId: app.ApplicantId || `temp-${index}`,
          sNo: index + 1,
          dateOfApplication: app.applicationDate || "N/A",
          applicantName: app.applicant || "Unknown",
          subject: app.subject || "N/A",
          gpBlock: app.block || "N/A",
          issueDate: app.applicationDate || "N/A",
          pendingDays: calculatePendingDays(app.applicationDate, status),
          status: status,
          attachment: app.attachment || null,
          concernedOfficer: app.concernedOfficer || "N/A",
          isFromLocalStorage: true,
          timeline: timeline,
        };
      })
      .sort((a, b) => new Date(b.dateOfApplication || 0) - new Date(a.dateOfApplication || 0));

    const storedAppIds = new Set(mappedStoredApplications.map((app) => app.applicationId));
    const filteredData = data.filter((item) => !storedAppIds.has(item.applicationId));
    const combinedData = [
      ...mappedStoredApplications,
      ...filteredData.map((item, index) => {
        const timeline = Array.isArray(item.timeline)
          ? item.timeline
          : [
              {
                section: "Application Received",
                comment: `Application received at ${item.gpBlock || "N/A"} on ${item.dateOfApplication || "N/A"}`,
                date: item.dateOfApplication || new Date().toLocaleDateString("en-GB"),
                pdfLink: item.attachment || null,
                department: item.department || "N/A",
                officer: item.concernedOfficer || "N/A",
              },
            ];
        const status = determineStatus(timeline, item.concernedOfficer);
        return {
          ...item,
          applicationId: item.applicationId || `temp-${index}`,
          sNo: mappedStoredApplications.length + index + 1,
          isFromLocalStorage: false,
          pendingDays: calculatePendingDays(item.issueDate, status),
          status: status,
          timeline: timeline,
        };
      }),
    ].map((item, index) => ({ ...item, sNo: index + 1 }));

    const filteredApplications = filterApplications(combinedData);
    console.log("Filtered applications:", filteredApplications);
    setApplications(filteredApplications);
  };

  // Re-run updateApplications when data or filter states change
  useEffect(() => {
    updateApplications();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        console.log("localStorage 'applications' changed:", JSON.parse(event.newValue || "[]"));
        updateApplications();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Optional: Poll localStorage for changes in the same tab
    const pollingInterval = setInterval(() => {
      updateApplications();
    }, 1000); // Poll every 1 second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollingInterval);
    };
  }, [data, searchQuery, selectedStatus, selectedDepartment, selectedBlock, selectedDate]);

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
        return "bg-gray-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
      case "In Process":
        return "bg-blue-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
      case "Compliance":
        return "bg-green-600 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
      case "Dismissed":
        return "bg-red-600 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
      case "Disposed":
        return "bg-purple-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
      default:
        return "bg-gray-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
    }
  };

  // Toggle accordion for mobile card
  const toggleCardDetails = (applicationId) => {
    setOpenCardId(openCardId === applicationId ? null : applicationId);
  };

  return (
    <div className="md:pl-16 lg:pl-16">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white mx-auto max-w-8xl p-6 my-6 font-['Montserrat']">
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
                <motion.tr
                  key={caseDetail.applicationId}
                  className="text-sm hover:bg-blue-50 transition cursor-pointer even:bg-gray-50 font-['Montserrat']"
                  onClick={() => onRowClick(caseDetail)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4">{caseDetail.sNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{caseDetail.dateOfApplication}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{caseDetail.applicantName}</td>
                  <td className="px-6 py-4">{caseDetail.subject}</td>
                  <td className="px-6 py-4">{caseDetail.gpBlock}</td>
                  <td className="px-6 py-4">{caseDetail.issueDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPendingDaysColor(caseDetail.pendingDays)}`}
                      aria-label={`Pending days: ${caseDetail.pendingDays}`}
                    >
                      {caseDetail.pendingDays.toString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 ${getStatusStyle(caseDetail.status)}`}
                      aria-label={`Status: ${caseDetail.status}`}
                    >
                      {caseDetail.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(caseDetail);
                      }}
                      className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition shadow-sm"
                      aria-label="View PDF"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaFilePdf /> PDF
                    </motion.button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3 py-3 px-2 pb-[100px] overflow-x-hidden font-['Montserrat']">
        {applications.length === 0 ? (
          <div className="text-center text-gray-500 text-sm font-['Montserrat']">
            No applications found.
          </div>
        ) : (
          applications.map((caseDetail) => (
            <motion.div
              key={caseDetail.applicationId}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-3 w-full max-w-[320px] mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => onRowClick(caseDetail)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] sm:text-sm font-semibold text-gray-800 font-['Montserrat'] truncate max-w-[50%]">
                  {caseDetail.applicantName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 ${getStatusStyle(caseDetail.status)}`}
                  aria-label={`Status: ${caseDetail.status}`}
                >
                  {caseDetail.status}
                </span>
              </div>

              {/* Subject (Always Visible) */}
              <div className="text-[9px] sm:text-xs text-gray-700 font-['Montserrat'] mb-2 truncate">
                <strong>Subject:</strong> {caseDetail.subject}
              </div>

              {/* Accordion Toggle for Details */}
              <motion.button
                className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-green-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardDetails(caseDetail.applicationId);
                }}
                aria-label={openCardId === caseDetail.applicationId ? "Collapse details" : "Expand details"}
                aria-expanded={openCardId === caseDetail.applicationId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Details</span>
                {openCardId === caseDetail.applicationId ? (
                  <FaChevronUp className="text-gray-500 text-[9px] sm:text-sm" />
                ) : (
                  <FaChevronDown className="text-gray-500 text-[9px] sm:text-sm" />
                )}
              </motion.button>

              {/* Collapsible Details */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={openCardId === caseDetail.applicationId ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-1 text-[9px] sm:text-xs text-gray-700 font-['Montserrat'] mt-2">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">
                      <strong>Sr. No:</strong> {caseDetail.sNo}
                    </span>
                    <span className="truncate">
                      <strong>Date:</strong> {caseDetail.dateOfApplication}
                    </span>
                  </div>
                  <div className="truncate">
                    <strong>GP, Block:</strong> {caseDetail.gpBlock}
                  </div>
                  <div className="truncate">
                    <strong>Officer:</strong> {caseDetail.concernedOfficer}
                  </div>
                  <div className="truncate">
                    <strong>Issue Date:</strong> {caseDetail.issueDate}
                  </div>
                  <div>
                    <strong>Pending Days:</strong>{" "}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold shadow-sm ${getPendingDaysColor(caseDetail.pendingDays)}`}
                      aria-label={`Pending days: ${caseDetail.pendingDays}`}
                    >
                      {caseDetail.pendingDays.toString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Per-Card Bottom Bar (Visible when Accordion is Open) */}
              <div
                className={`fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-between gap-1 border-t border-gray-200 ${
                  openCardId === caseDetail.applicationId ? "block" : "hidden"
                } md:hidden z-10`}
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(caseDetail);
                  }}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1 rounded-xl shadow-sm hover:bg-green-700 transition font-semibold text-[9px] sm:text-xs"
                  aria-label="View PDF"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    variants={{ rest: { x: 0 }, hover: { x: 5 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <FaFilePdf className="text-white text-[12px] sm:text-base" />
                  </motion.div>
                  <motion.span
                    variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
                    transition={{ duration: 0.3 }}
                    className="text-[9px] sm:text-xs"
                  >
                    PDF
                  </motion.span>
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Inline Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * {
          box-sizing: border-box;
        }
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .shadow-xl {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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