// src/components/ApplicationTable.jsx
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaSpinner, FaChevronDown, FaChevronUp, FaTimesCircle, FaCalendarAlt, FaComment } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toISOString().split("T")[0];
};

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
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) return 0;
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline, concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") return "Not Assigned Yet";
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latestEntry = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
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

  const updateApplications = async () => {
    try {
      const res = await api.get("/api/applications");
      const rawData = Array.isArray(res.data) ? res.data : [];

      const processed = rawData.map((app, index) => {
        const timeline = Array.isArray(app.timeline) ? app.timeline : [];
        const status = determineStatus(timeline, app.concernedOfficer);
        return {
          applicationId: app.applicantId || app._id || `temp-${index}`,
          sNo: index + 1,
          dateOfApplication: formatDate(app.applicationDate),
          applicantName: app.applicant || "Unknown",
          subject: app.subject || "N/A",
          gpBlock: app.block || app.gpBlock || "N/A",
          issueDate: formatDate(app.applicationDate),
          pendingDays: calculatePendingDays(app.applicationDate, status),
          status: status,
          attachment: app.attachment || null,
          concernedOfficer: app.concernedOfficer || "N/A",
          isFromLocalStorage: false,
          timeline: timeline,
        };
      });

      const filtered = filterApplications(processed);
      setApplications(filtered);
    } catch (err) {
      console.error("Fetch error:", err);
      setApplications([]);
    }
  };

  useEffect(() => {
    updateApplications();

    const handleUpdate = () => updateApplications();
    window.addEventListener("applicationUpdated", handleUpdate);
    const intervalId = setInterval(updateApplications, 5000);

    return () => {
      window.removeEventListener("applicationUpdated", handleUpdate);
      clearInterval(intervalId);
    };
  }, [data, searchQuery, selectedStatus, selectedDepartment, selectedBlock, selectedDate]);

  const handleDisposeClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setIsDisposeModalOpen(true);
  };

  const handleDisposeConfirm = async () => {
    if (!disposeForm.disposingDate || !disposeForm.comment.trim()) {
      alert("Please fill in both disposing date and comment.");
      return;
    }

    try {
      await api.patch(`/api/applications/${selectedApplicationId}/dispose`, {
        note: disposeForm.comment,
        date: disposeForm.disposingDate,
      });

      window.dispatchEvent(new Event("applicationUpdated"));
      setIsDisposeModalOpen(false);
      setDisposeForm({
        disposingDate: new Date().toISOString().split('T')[0],
        comment: "",
      });
    } catch (err) {
      console.error("Dispose error:", err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
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
      case "Not Assigned Yet": return "bg-gray-500 text-white whitespace-nowrap";
      case "In Process": return "bg-blue-500 text-white whitespace-nowrap";
      case "Compliance": return "bg-green-500 text-white whitespace-nowrap";
      case "Dismissed": return "bg-red-500 text-white whitespace-nowrap";
      case "Disposed": return "bg-purple-500 text-white whitespace-nowrap";
      default: return "bg-gray-500 text-white whitespace-nowrap";
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
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 font-['Montserrat']">Dispose Application</h2>
                <button onClick={handleDisposeCancel} className="text-gray-500 hover:text-gray-700">
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Montserrat']">Disposing Date</label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      name="disposingDate"
                      value={disposeForm.disposingDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-['Montserrat']">Comment</label>
                  <div className="relative mt-1">
                    <textarea
                      name="comment"
                      value={disposeForm.comment}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your comment..."
                      required
                    />
                    <FaComment className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  onClick={handleDisposeCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDisposeConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
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
              {["Sr. No", "Date", "Applicant", "Subject", "GP, Block", "Issue Date", "Pending Days", "Status", "Attachment", "Action"].map((h, i) => (
                <th key={i} className="px-6 py-4 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr><td colSpan={10} className="px-6 py-4 text-center text-gray-500">No applications found.</td></tr>
            ) : (
              applications.map((c) => (
                <tr key={c.applicationId} className="text-sm hover:bg-blue-50 even:bg-gray-50 cursor-pointer" onClick={() => onRowClick(c)}>
                  <td className="px-6 py-4">{c.sNo}</td>
                  <td className="px-6 py-4">{c.dateOfApplication}</td>
                  <td className="px-6 py-4 font-medium">{c.applicantName}</td>
                  <td className="px-6 py-4">{c.subject}</td>
                  <td className="px-6 py-4">{c.gpBlock}</td>
                  <td className="px-6 py-4">{c.issueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(c.pendingDays)}`}>
                      {c.pendingDays}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.attachment ? (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          // FIXED: Force .pdf for Cloudinary raw files
                          const pdfUrl = c.attachment.endsWith(".pdf") ? c.attachment : `${c.attachment}.pdf`;
                          window.open(pdfUrl, "_blank", "noopener,noreferrer");
                        }}
                        className="px-4 py-1.5 text-sm border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaFilePdf className="inline mr-1" /> PDF
                      </motion.button>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.status !== "Disposed" ? (
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handleDisposeClick(c.applicationId); }}
                        className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
      <div className="block md:hidden space-y-3 py-3 px-2 pb-[100px]">
        {applications.length === 0 ? (
          <div className="text-center text-gray-500">No applications found.</div>
        ) : (
          applications.map((c) => (
            <motion.div
              key={c.applicationId}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-3 w-full max-w-[320px] mx-auto"
              onClick={() => onRowClick(c)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold truncate max-w-[50%]">{c.applicantName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(c.status)}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-xs text-gray-700 mb-2 truncate">
                <strong>Subject:</strong> {c.subject}
              </div>

              <button
                className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200"
                onClick={(e) => { e.stopPropagation(); toggleCardDetails(c.applicationId); }}
              >
                <span className="text-sm font-semibold">Details</span>
                {openCardId === c.applicationId ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={openCardId === c.applicationId ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-1 text-xs mt-2">
                  <div className="flex justify-between"><span>Sr. No: {c.sNo}</span><span>Date: {c.dateOfApplication}</span></div>
                  <div>GP, Block: {c.gpBlock}</div>
                  <div>Officer: {c.concernedOfficer}</div>
                  <div>Issue Date: {c.issueDate}</div>
                  <div>
                    Pending Days: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPendingDaysColor(c.pendingDays)}`}>{c.pendingDays}</span>
                  </div>
                </div>
              </motion.div>

              {/* Mobile Bottom Buttons */}
              {openCardId === c.applicationId && (
                <div className="fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-between gap-1 border-t md:hidden z-10">
                  {c.attachment ? (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        // FIXED: Force .pdf for Cloudinary raw files
                        const pdfUrl = c.attachment.endsWith(".pdf") ? c.attachment : `${c.attachment}.pdf`;
                        window.open(pdfUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="flex-1 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-2 py-1 rounded-xl text-xs flex items-center justify-center gap-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaFilePdf /> PDF
                    </motion.button>
                  ) : (
                    <span className="flex-1 text-center text-gray-400 text-xs">No PDF</span>
                  )}
                  {c.status !== "Disposed" ? (
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleDisposeClick(c.applicationId); }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-xl text-xs"
                    >
                      Dispose
                    </motion.button>
                  ) : (
                    <span className="flex-1 text-center text-gray-400 text-xs">N/A</span>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
      `}</style>
    </div>
  );
};

export default ApplicationTable;