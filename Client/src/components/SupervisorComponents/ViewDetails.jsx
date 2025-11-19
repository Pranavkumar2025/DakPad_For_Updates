// src/components/WorkAssignedComponents/ViewDetails.jsx
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import {
  User,
  Calendar,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api"; // <-- NEW: axios with cookies

const ViewDetails = ({ data, onClose }) => {
  const [applicationData, setApplicationData] = useState(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const applicationId = data?.applicationId;

  // ---------- Helpers ----------
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "N/A" : d.toISOString().split("T")[0];
  };

  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) return 0;
    const diff = Date.now() - issue.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline = [], concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A") return "Not Assigned Yet";
    if (!Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latest = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latest.includes("disposed")) return "Disposed";
    if (latest.includes("compliance")) return "Compliance";
    if (latest.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // ---------- Fetch (with JWT cookie) ----------
  const fetchApplication = async () => {
    if (!applicationId) {
      setError("No application ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await api.get(`/api/applications/${applicationId}`); // <-- sends cookie
      const app = res.data;

      const timeline = Array.isArray(app.timeline) ? app.timeline : [];
      const status = determineStatus(timeline, app.concernedOfficer);
      const pendingDays = calculatePendingDays(app.applicationDate, status);

      const processed = {
        applicationId: app.applicantId,
        sNo: data.sNo || "N/A",
        applicantName: app.applicant || "Unknown",
        dateOfApplication: formatDate(app.applicationDate),
        description: app.subject || "N/A",
        gpBlock: app.block || "N/A",
        mobileNumber: app.phoneNumber || "N/A",
        email: app.emailId || "N/A",
        issueDate: formatDate(app.applicationDate),
        issueLetterNo: "N/A",
        status,
        concernedOfficer: app.concernedOfficer || "N/A",
        pendingDays,
        pdfLink: app.attachment ? `http://localhost:5000${app.attachment}` : null,
        timeline,
      };

      setApplicationData(processed);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchApplication();

    const handleUpdate = () => fetchApplication();
    window.addEventListener("applicationUpdated", handleUpdate);
    return () => window.removeEventListener("applicationUpdated", handleUpdate);
  }, [applicationId]);

  // ---------- Status Styling ----------
  const getStatusStyle = (status) => {
    switch (status) {
      case "Not Assigned Yet":
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <Loader2 size={20} /> };
      case "In Process":
        return { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-500 text-white" };
      case "Compliance":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      case "Disposed":
        return { bg: "bg-purple-100", text: "text-purple-700", badge: "bg-purple-500 text-white", icon: <CheckCircle size={20} /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <Loader2 size={20} /> };
    }
  };

  // ---------- Loading UI ----------
  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-green-600 text-3xl" />
            <span className="text-lg font-medium text-gray-700 font-['Montserrat']">
              Loading application...
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---------- Error UI ----------
  if (error || !applicationData) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
          <div className="text-center">
            <XCircle className="mx-auto text-red-600 text-4xl mb-3" />
            <p className="text-lg font-medium text-gray-800 mb-2">Error</p>
            <p className="text-sm text-gray-600 mb-4">{error || "Application not found"}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-['Montserrat']"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---------- Main UI ----------
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 font-['Montserrat']"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Application ID: <span className="text-green-600">{applicationData.applicationId}</span>
          </h2>
          <motion.button
            className="text-gray-500 hover:text-red-600 text-xl transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IoClose />
          </motion.button>
        </div>

        {/* Applicant Details */}
        <motion.div className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicant Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Sr. No", value: applicationData.sNo, icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Applicant Name", value: applicationData.applicantName, icon: <User className="w-5 h-5 text-green-600" /> },
              { label: "Mobile No.", value: applicationData.mobileNumber, icon: <Phone className="w-5 h-5 text-green-600" /> },
              { label: "GP, Block", value: applicationData.gpBlock, icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Date of Application", value: applicationData.dateOfApplication, icon: <Calendar className="w-5 h-5 text-green-600" /> },
              { label: "Email", value: applicationData.email, icon: <Mail className="w-5 h-5 text-green-600" /> },
              { label: "Issue Letter No", value: applicationData.issueLetterNo, icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Issue Date", value: applicationData.issueDate, icon: <Calendar className="w-5 h-5 text-green-600" /> },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {item.icon}
                <div>
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  <p className="text-base font-medium text-gray-900">{item.value}</p>
                </div>
              </motion.div>
            ))}

            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Description</span>
              <p className="text-base font-medium text-gray-900 mt-1">{applicationData.description}</p>
            </div>

            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(
                    applicationData.status
                  ).badge}`}
                >
                  {getStatusStyle(applicationData.status).icon}
                  {applicationData.status}
                </span>
              </p>
            </div>

            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
              <p className="text-base font-medium text-gray-900 mt-1">{applicationData.concernedOfficer}</p>
            </div>

            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Pending Days</span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    applicationData.pendingDays === 0
                      ? "bg-green-500 text-white"
                      : applicationData.pendingDays <= 10
                      ? "bg-green-500 text-white"
                      : applicationData.pendingDays <= 15
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {applicationData.pendingDays}
                </span>
              </p>
            </div>

            {applicationData.pdfLink && (
              <motion.div className="md:col-span-2">
                <motion.a
                  href={applicationData.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2 mt-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaFilePdf size={18} /> View Attached Document
                </motion.a>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Timeline Toggle */}
        <motion.button
          onClick={() => setIsTimelineOpen(true)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaHistory size={18} /> Show Application Timeline
        </motion.button>

        {/* Timeline Modal */}
        <AnimatePresence>
          {isTimelineOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Application Timeline</h3>
                  <motion.button
                    onClick={() => setIsTimelineOpen(false)}
                    className="text-gray-500 hover:text-red-600 text-xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoClose />
                  </motion.button>
                </div>

                {applicationData.timeline?.length > 0 ? (
                  <div className="relative space-y-4">
                    {applicationData.timeline.map((item, idx) => {
                      const isLast = idx === applicationData.timeline.length - 1;
                      const isDisposed = item.section.toLowerCase().includes("disposed");
                      const isCompliance = item.section.toLowerCase().includes("compliance");
                      const isDismissed = item.section.toLowerCase().includes("dismissed");
                      const isCompleted = isLast || isCompliance || isDisposed;

                      const dotClass =
                        isDisposed ? "bg-purple-600" :
                        isCompliance ? "bg-green-600" :
                        isDismissed ? "bg-red-600" :
                        isCompleted ? "bg-green-600" : "bg-blue-600";

                      return (
                        <div key={idx} className="relative flex items-start pl-10">
                          <div
                            className={`absolute left-0 top-0 w-6 h-6 ${dotClass} rounded-full shadow-md z-10 flex items-center justify-center border-2 border-white`}
                          >
                            {isCompleted && <CheckCircle size={16} className="text-white" />}
                          </div>
                          <div
                            className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${
                              idx === applicationData.timeline.length - 1 ? "bg-transparent" : "bg-gray-300"
                            }`}
                          />
                          <div
                            className={`w-full p-4 rounded-lg border ${
                              isLast ? "bg-blue-50 border-blue-300 shadow-md" : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-semibold text-blue-700">{item.section}</h4>
                              <span className="text-xs text-gray-600 font-medium">
                                {formatDate(item.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{item.comment}</p>
                            {item.department && item.department !== "N/A" && (
                              <p className="text-xs text-gray-600 mt-1">Department: {item.department}</p>
                            )}
                            {item.officer && item.officer !== "N/A" && (
                              <p className="text-xs text-gray-600 mt-1">Officer: {item.officer}</p>
                            )}
                            {item.pdfLink && (
                              <motion.a
                                href={`http://localhost:5000${item.pdfLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-sm mt-1 flex items-center gap-1"
                                whileHover={{ scale: 1.05 }}
                              >
                                <FaFilePdf size={14} /> View Document
                              </motion.a>
                            )}
                            {isLast && (
                              <p className="text-blue-600 text-xs font-semibold mt-1.5">Latest Update</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">No timeline entries available.</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global styles */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          .animate-spin-slow { animation: spin 2s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
          .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
          .backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default ViewDetails;