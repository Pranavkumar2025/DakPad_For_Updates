import React, { useState, useEffect } from "react";
import { FaFilePdf, FaSpinner, FaChevronDown, FaChevronUp, FaTimesCircle, FaCalendarAlt, FaComment } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ApplicationTable = ({
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
  const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [disposeForm, setDisposeForm] = useState({
    disposingDate: new Date().toISOString().split('T')[0],
    comment: "",
  });

  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) {
      console.warn(`Invalid issueDate or status for pending days calculation: ${issueDate}, ${status}`);
      return 0;
    }
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) {
      console.warn(`Invalid issueDate format: ${issueDate}`);
      return 0;
    }
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline, concernedOfficer) => {
    console.log("Determining status:", { timeline, concernedOfficer });
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") return "Not Assigned Yet";
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latestEntry = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    console.log("Latest timeline entry:", latestEntry);
    if (latestEntry.includes("disposed")) return "Disposed";
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  const filterApplications = (rawApplications) => {
    return rawApplications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        (app.applicantName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (app.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "" || app.status === selectedStatus;
      const matchesDepartment = selectedDepartment === "" || (app.concernedOfficer || "").includes(selectedDepartment);
      const matchesBlock = selectedBlock === "" || app.gpBlock === selectedBlock;
      let matchesDate = true;
      if (selectedDate.startDate && selectedDate.endDate) {
        const appDate = new Date(app.dateOfApplication);
        const startDate = new Date(selectedDate.startDate);
        const endDate = new Date(selectedDate.endDate);
        matchesDate = appDate >= startDate && appDate <= endDate && !isNaN(appDate.getTime());
      }
      return matchesSearch && matchesStatus && matchesDepartment && matchesBlock && matchesDate;
    });
  };

  const updateApplications = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const mappedStoredApplications = storedApplications
      .map((app, index) => {
        const defaultTimeline = [
          {
            section: "Application Received",
            comment: `Application received at ${app.block || "N/A"} on ${app.applicationDate || "N/A"}`,
            date: app.applicationDate || new Date().toLocaleDateString("en-GB"),
            pdfLink: app.attachment || null,
            department: "N/A",
            officer: "N/A",
          },
        ];
        const timeline = Array.isArray(app.timeline) ? app.timeline : defaultTimeline;
        const status = determineStatus(timeline, app.concernedOfficer);
        return {
          applicationId: app.ApplicantId,
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

    const storedAppIds = new Set(mappedStoredApplications.map((app) => app.applicationId?.toLowerCase()));
    const filteredData = data.filter((item) => !storedAppIds.has(item.applicationId?.toLowerCase()));
    const combinedData = [
      ...mappedStoredApplications,
      ...filteredData.map((item, index) => {
        const defaultTimeline = [
          {
            section: "Application Received",
            comment: `Application received at ${item.gpBlock || "N/A"} on ${item.dateOfApplication || "N/A"}`,
            date: item.dateOfApplication || new Date().toLocaleDateString("en-GB"),
            pdfLink: item.attachment || null,
            department: "N/A",
            officer: "N/A",
          },
        ];
        const timeline = Array.isArray(item.timeline) ? item.timeline : defaultTimeline;
        const status = determineStatus(timeline, item.concernedOfficer);
        return {
          ...item,
          applicationId: item.applicationId || `temp-${index}`,
          sNo: mappedStoredApplications.length + index + 1,
          isFromLocalStorage: false,
          pendingDays: calculatePendingDays(item.issueDate || item.dateOfApplication, status),
          status: status,
          timeline: timeline,
          applicantName: item.applicantName || "Unknown",
          subject: item.subject || "N/A",
          gpBlock: item.gpBlock || "N/A",
          issueDate: item.issueDate || item.dateOfApplication || "N/A",
          concernedOfficer: item.concernedOfficer || "N/A",
          attachment: item.attachment || null,
        };
      }),
    ].map((item, index) => ({ ...item, sNo: index + 1 }));

    const filteredApplications = filterApplications(combinedData);
    console.log("Updated applications:", filteredApplications);
    setApplications(filteredApplications);
  };

  useEffect(() => {
    updateApplications();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        console.log("ApplicationTable: Storage event triggered, updating applications:", JSON.parse(event.newValue || "[]"));
        updateApplications();
      }
    };
    const handleCustomStorageUpdate = () => {
      console.log("ApplicationTable: Custom storage update event received");
      updateApplications();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("customStorageUpdate", handleCustomStorageUpdate);
    const intervalId = setInterval(() => {
      updateApplications();
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("customStorageUpdate", handleCustomStorageUpdate);
      clearInterval(intervalId);
    };
  }, [data, searchQuery, selectedStatus, selectedDepartment, selectedBlock, selectedDate]);

  const handleDisposeClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setIsDisposeModalOpen(true);
  };

  const handleDisposeConfirm = () => {
    if (!disposeForm.disposingDate || !disposeForm.comment.trim()) {
      alert("Please fill in both disposing date and comment.");
      return;
    }

    const updatedStoredApplications = JSON.parse(localStorage.getItem("applications") || "[]").map((app) => {
      if (app.ApplicantId.toLowerCase() === selectedApplicationId.toLowerCase()) {
        const newTimeline = [
          ...(app.timeline || []),
          {
            section: "Disposed",
            comment: disposeForm.comment,
            date: disposeForm.disposingDate,
            pdfLink: null,
            department: "N/A",
            officer: "N/A",
          },
        ];
        return {
          ...app,
          timeline: newTimeline,
          status: "Disposed",
          pendingDays: 0,
        };
      }
      return app;
    });

    console.log("ApplicationTable: Saving to localStorage:", updatedStoredApplications);
    localStorage.setItem("applications", JSON.stringify(updatedStoredApplications));
    window.dispatchEvent(new Event("customStorageUpdate"));
    setIsDisposeModalOpen(false);
    setDisposeForm({
      disposingDate: new Date().toISOString().split('T')[0],
      comment: "",
    });
    updateApplications();
  };

  const handleDisposeCancel = () => {
    setIsDisposeModalOpen(false);
    setDisposeForm({
      disposingDate: new Date().toISOString().split('T')[0],
      comment: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDisposeForm((prev) => ({ ...prev, [name]: value }));
  };

  const getPendingDaysColor = (days) => {
    if (days === 0) return "bg-green-500 text-white";
    if (days <= 10) return "bg-green-500 text-white";
    if (days <= 15) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

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
      case "Disposed":
        return "bg-purple-500 text-white whitespace-nowrap";
      default:
        return "bg-gray-500 text-white whitespace-nowrap";
    }
  };

  const toggleCardDetails = (applicationId) => {
    setOpenCardId(openCardId === applicationId ? null : applicationId);
  };

  return (
    <div className="md:pl-16 lg:pl-16">
      {/* Dispose Modal */}
      <AnimatePresence>
        {isDisposeModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 font-['Montserrat']">Dispose Application</h2>
                <button
                  onClick={handleDisposeCancel}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="disposingDate" className="block text-sm font-medium text-gray-700 font-['Montserrat']">
                    Disposing Date
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      id="disposingDate"
                      name="disposingDate"
                      value={disposeForm.disposingDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-['Montserrat']"
                      required
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 font-['Montserrat']">
                    Comment
                  </label>
                  <div className="relative mt-1">
                    <textarea
                      id="comment"
                      name="comment"
                      value={disposeForm.comment}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-['Montserrat']"
                      placeholder="Enter your comment here..."
                      required
                    />
                    <FaComment className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  onClick={handleDisposeCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold font-['Montserrat'] transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDisposeConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold font-['Montserrat'] transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      {caseDetail.status === "In Process"}
                      {caseDetail.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {caseDetail.attachment ? (
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
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {caseDetail.isFromLocalStorage && caseDetail.status !== "Disposed" ? (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisposeClick(caseDetail.applicationId);
                        }}
                        className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-['Montserrat'] shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Dispose application"
                      >
                        Dispose
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
      <div className="block md:hidden space-y-3 py-3 px-2 pb-[100px] overflow-x-hidden">
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] sm:text-sm font-semibold text-gray-800 font-['Montserrat'] truncate max-w-[50%]">
                  {caseDetail.applicantName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium ${getStatusStyle(caseDetail.status)}`}
                  aria-label={`Status: ${caseDetail.status}`}
                >
                  {caseDetail.status === "In Process" }
                  {caseDetail.status}
                </span>
              </div>

              <div className="text-[9px] sm:text-xs text-gray-700 font-['Montserrat'] mb-2 truncate">
                <strong>Subject:</strong> {caseDetail.subject}
              </div>

              <button
                className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#ff5010]"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardDetails(caseDetail.applicationId);
                }}
                aria-label={openCardId === caseDetail.applicationId ? "Collapse details" : "Expand details"}
                aria-expanded={openCardId === caseDetail.applicationId}
              >
                <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Details</span>
                {openCardId === caseDetail.applicationId ? (
                  <FaChevronUp className="text-gray-500 text-[9px] sm:text-sm" />
                ) : (
                  <FaChevronDown className="text-gray-500 text-[9px] sm:text-sm" />
                )}
              </button>

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
                      className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${getPendingDaysColor(caseDetail.pendingDays)}`}
                      aria-label={`Pending days: ${caseDetail.pendingDays}`}
                    >
                      {caseDetail.pendingDays}
                    </span>
                  </div>
                </div>
              </motion.div>

              <div
                className={`fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-between gap-1 border-t border-gray-200 ${
                  openCardId === caseDetail.applicationId ? "block" : "hidden"
                } md:hidden z-10`}
              >
                {caseDetail.attachment ? (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(caseDetail);
                    }}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-2 py-1 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-[9px] sm:text-xs"
                    aria-label="View PDF"
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
                ) : (
                  <span className="flex-1 text-center text-gray-400 text-[9px] sm:text-xs">No PDF</span>
                )}
                {caseDetail.isFromLocalStorage && caseDetail.status !== "Disposed" ? (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisposeClick(caseDetail.applicationId);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-xl font-medium text-[9px] sm:text-xs shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Dispose application"
                  >
                    Dispose
                  </motion.button>
                ) : (
                  <span className="flex-1 text-center text-gray-400 text-[9px] sm:text-xs">N/A</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * {
          box-sizing: border-box;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
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

export default ApplicationTable;