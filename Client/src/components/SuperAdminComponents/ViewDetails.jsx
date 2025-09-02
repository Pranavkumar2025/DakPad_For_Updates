import React, { useState, useEffect } from "react";
import { FaFilePdf, FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5"; // Added for close button
import { User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ViewDetails = ({ data, onClose }) => {
  // State management
  const [applicationData, setApplicationData] = useState(data);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Calculate pending days
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
    if (latestEntry.includes("closed")) return "Closed";
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // Update application data from localStorage
  const updateApplicationData = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const matchedApp = storedApplications.find((app) => app.ApplicantId === data.applicationId);
    if (matchedApp) {
      const timeline = matchedApp.timeline || [
        {
          section: "Application Received",
          comment: `Application received at ${matchedApp.block || "N/A"} on ${matchedApp.applicationDate}`,
          date: matchedApp.applicationDate,
          pdfLink: matchedApp.attachment || null,
        },
      ];
      const status = determineStatus(timeline, matchedApp.concernedOfficer);
      const pendingDays = calculatePendingDays(matchedApp.applicationDate, status);
      setApplicationData({
        ...data,
        applicationId: matchedApp.ApplicantId,
        applicantName: matchedApp.applicant,
        dateOfApplication: matchedApp.applicationDate,
        description: matchedApp.subject,
        gpBlock: matchedApp.block || "N/A",
        mobileNumber: matchedApp.phoneNumber || "N/A",
        email: matchedApp.emailId || "N/A",
        issueDate: matchedApp.applicationDate,
        issueLetterNo: data.issueLetterNo || "N/A",
        status: status,
        concernedOfficer: matchedApp.concernedOfficer || "N/A",
        pendingDays: pendingDays,
        pdfLink: matchedApp.attachment,
        timeline: timeline,
      });
    }
  };

  // Real-time localStorage updates
  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        updateApplicationData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [data.applicationId]);

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Not Assigned Yet":
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-600 text-white", icon: <Loader2 size={20} /> };
      case "In Process":
        return { bg: "bg-teal-100", text: "text-teal-700", badge: "bg-teal-500 text-white", icon: <Loader2 className="animate-spin-slow" size={20} /> };
      case "Compliance":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      case "Closed":
        return { bg: "bg-indigo-100", text: "text-indigo-700", badge: "bg-indigo-500 text-white", icon: <CheckCircle size={20} /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-600 text-white", icon: <Loader2 size={20} /> };
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 font-['Inter'] border border-gray-200"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Application ID: <span className="text-teal-600">{applicationData.applicationId}</span>
          </h2>
          <motion.button
            className="text-gray-600 hover:text-red-600 text-2xl transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IoClose />
          </motion.button>
        </div>

        {/* Application Details Section */}
        <motion.div
          className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Application Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Sr. No", value: applicationData.sNo, icon: <FileText className="w-5 h-5 text-teal-600" /> },
              { label: "Applicant Name", value: applicationData.applicantName, icon: <User className="w-5 h-5 text-teal-600" /> },
              { label: "Mobile No.", value: applicationData.mobileNumber, icon: <Phone className="w-5 h-5 text-teal-600" /> },
              { label: "GP, Block", value: applicationData.gpBlock, icon: <FileText className="w-5 h-5 text-teal-600" /> },
              { label: "Date of Application", value: applicationData.dateOfApplication, icon: <Calendar className="w-5 h-5 text-teal-600" /> },
              { label: "Email", value: applicationData.email, icon: <Mail className="w-5 h-5 text-teal-600" /> },
              { label: "Issue Letter No", value: applicationData.issueLetterNo, icon: <FileText className="w-5 h-5 text-teal-600" /> },
              { label: "Issue Date", value: applicationData.issueDate, icon: <Calendar className="w-5 h-5 text-teal-600" /> },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                {item.icon}
                <div>
                  <span className="text-sm font-medium text-gray-500">{item.label}</span>
                  <p className="text-base font-semibold text-gray-800">{item.value}</p>
                </div>
              </motion.div>
            ))}
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-500">Description</span>
              <p className="text-base font-semibold text-gray-800 mt-1">{applicationData.description}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusStyle(applicationData.status).badge}`}
                >
                  {getStatusStyle(applicationData.status).icon}
                  {applicationData.status}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-500">Concerned Officer</span>
              <p className="text-base font-semibold text-gray-800 mt-1">{applicationData.concernedOfficer}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-500">Pending Days</span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                    applicationData.pendingDays === 0
                      ? "bg-green-600 text-white"
                      : applicationData.pendingDays <= 10
                      ? "bg-green-600 text-white"
                      : applicationData.pendingDays <= 15
                      ? "bg-orange-500 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {applicationData.pendingDays}
                </span>
              </p>
            </div>
          </div>
          {applicationData.pdfLink && (
            <motion.a
              href={applicationData.pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-800 font-semibold text-sm flex items-center gap-2 mt-6"
              whileHover={{ scale: 1.05 }}
              aria-label="View attached PDF"
            >
              <FaFilePdf size={18} /> View Attached Document
            </motion.a>
          )}
        </motion.div>

        {/* Toggle for Application Timeline */}
        <motion.button
          onClick={() => setIsTimelineOpen(true)}
          className="text-teal-600 hover:text-teal-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Show application timeline"
        >
          <FaHistory size={18} /> Show Application Timeline
        </motion.button>

        {/* Timeline Modal */}
        <AnimatePresence>
          {isTimelineOpen && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-60 p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 relative"
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Timeline Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Application Timeline</h3>
                  <motion.button
                    className="text-gray-600 hover:text-red-600 text-2xl transition-colors"
                    onClick={() => setIsTimelineOpen(false)}
                    aria-label="Close timeline"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoClose />
                  </motion.button>
                </div>

                {/* Timeline Content */}
                {applicationData.timeline?.length > 0 ? (
                  <div className="relative space-y-6">
                    {applicationData.timeline.map((item, idx) => {
                      const isCompleted =
                        idx < applicationData.timeline.length - 1 ||
                        item.section.toLowerCase().includes("compliance") ||
                        item.section.toLowerCase().includes("closed");
                      const isNotAssigned = applicationData.status === "Not Assigned Yet";
                      const isRejected = item.section.toLowerCase().includes("dismissed");
                      const dotClass = isCompleted
                        ? item.section.toLowerCase().includes("closed")
                          ? "bg-indigo-600 border-2 border-white"
                          : "bg-green-600 border-2 border-white"
                        : isNotAssigned
                        ? "bg-gray-600"
                        : isRejected
                        ? "bg-red-600"
                        : "bg-teal-600";
                      const icon = isCompleted ? <CheckCircle size={18} className="text-white" /> : null;
                      return (
                        <div key={idx} className="relative flex items-start pl-10">
                          <div className={`absolute left-0 top-0 w-6 h-6 ${dotClass} rounded-full shadow-md z-10 flex items-center justify-center`}>
                            {icon}
                          </div>
                          <div
                            className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${
                              idx === applicationData.timeline.length - 1 ? "bg-transparent" : item.section.toLowerCase().includes("closed") ? "bg-indigo-200" : "bg-green-200"
                            }`}
                          />
                          <div
                            className={`w-full p-5 rounded-lg border transition-all duration-200 ${
                              idx === applicationData.timeline.length - 1
                                ? item.section.toLowerCase().includes("closed")
                                  ? "bg-indigo-50 border-indigo-200 shadow-md"
                                  : "bg-green-50 border-green-200 shadow-md"
                                : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-base font-semibold text-gray-800">{item.section}</h4>
                              <span className="text-sm text-gray-500 font-medium">{item.date}</span>
                            </div>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              {item.comment}
                              {item.pdfLink && (
                                <motion.a
                                  href={item.pdfLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-600 hover:text-teal-800 transition-colors"
                                  title="View PDF"
                                  whileHover={{ scale: 1.05 }}
                                  aria-label="View timeline document"
                                >
                                  <FaFilePdf size={16} />
                                </motion.a>
                              )}
                            </p>
                            {idx === applicationData.timeline.length - 1 && (
                              <p className="text-teal-600 text-xs font-semibold mt-2">Latest Update</p>
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

        {/* Custom CSS */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .shadow-sm {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .shadow-2xl {
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
          }
          .backdrop-blur-md {
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default ViewDetails;