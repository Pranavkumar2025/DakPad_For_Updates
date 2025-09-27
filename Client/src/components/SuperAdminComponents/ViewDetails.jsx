import React, { useState, useEffect } from "react";
import { FaFilePdf, FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ViewDetails = ({ data, onClose }) => {
  // State management
  const [applicationData, setApplicationData] = useState(data);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Calculate pending days
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

  // Determine dynamic status based on timeline and concernedOfficer
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

  // Update application data from localStorage
  const updateApplicationData = () => {
    if (!data.applicationId) {
      console.error("No applicationId provided in data prop:", data);
      return;
    }

    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const normalizedAppId = data.applicationId.toLowerCase();
    const matchedApp = storedApplications.find(
      (app) => app.ApplicantId.toLowerCase() === normalizedAppId
    );

    const defaultTimeline = [
      {
        section: "Application Received",
        comment: `Application received at ${data.gpBlock || "N/A"} on ${data.dateOfApplication || "N/A"}`,
        date: data.dateOfApplication || new Date().toLocaleDateString("en-GB"),
        pdfLink: data.pdfLink || null,
        department: "N/A",
        officer: "N/A",
      },
    ];

    let updatedData;
    if (matchedApp) {
      const timeline = Array.isArray(matchedApp.timeline) ? matchedApp.timeline : defaultTimeline;
      const status = determineStatus(timeline, matchedApp.concernedOfficer);
      const pendingDays = calculatePendingDays(matchedApp.applicationDate || data.issueDate, status);
      updatedData = {
        ...data,
        applicationId: matchedApp.ApplicantId,
        applicantName: matchedApp.applicant || data.applicantName || "Unknown",
        dateOfApplication: matchedApp.applicationDate || data.dateOfApplication || "N/A",
        description: matchedApp.subject || data.description || "N/A",
        gpBlock: matchedApp.block || data.gpBlock || "N/A",
        mobileNumber: matchedApp.phoneNumber || data.mobileNumber || "N/A",
        email: matchedApp.emailId || data.email || "N/A",
        issueDate: matchedApp.applicationDate || data.issueDate || "N/A",
        issueLetterNo: data.issueLetterNo || "N/A",
        status,
        concernedOfficer: matchedApp.concernedOfficer || data.concernedOfficer || "N/A",
        pendingDays,
        pdfLink: matchedApp.attachment || data.pdfLink || null,
        timeline,
      };
    } else {
      console.warn(`Application ${data.applicationId} not found in localStorage. Using prop data.`);
      const timeline = Array.isArray(data.timeline) ? data.timeline : defaultTimeline;
      const status = determineStatus(timeline, data.concernedOfficer);
      const pendingDays = calculatePendingDays(data.issueDate, status);
      updatedData = {
        ...data,
        applicationId: data.applicationId,
        applicantName: data.applicantName || "Unknown",
        dateOfApplication: data.dateOfApplication || "N/A",
        description: data.description || "N/A",
        gpBlock: data.gpBlock || "N/A",
        mobileNumber: data.mobileNumber || "N/A",
        email: data.email || "N/A",
        issueDate: data.issueDate || "N/A",
        issueLetterNo: data.issueLetterNo || "N/A",
        status,
        concernedOfficer: data.concernedOfficer || "N/A",
        pendingDays,
        pdfLink: data.pdfLink || null,
        timeline,
      };
    }

    console.log("Updated application data:", updatedData);
    setApplicationData(updatedData);
  };

  // Real-time localStorage updates
  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        console.log("ViewDetails: Storage event triggered, updating application data:", JSON.parse(event.newValue || "[]"));
        updateApplicationData();
      }
    };
    const handleCustomStorageUpdate = () => {
      console.log("ViewDetails: Custom storage update event received");
      updateApplicationData();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("customStorageUpdate", handleCustomStorageUpdate);
    const intervalId = setInterval(() => {
      updateApplicationData();
    }, 1000); // Poll every second to catch updates
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("customStorageUpdate", handleCustomStorageUpdate);
      clearInterval(intervalId);
    };
  }, [data.applicationId]);

  // Status styling to match CaseDialog
  const getStatusStyle = (status) => {
    switch (status) {
      case "Not Assigned Yet":
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <Loader2 size={20} /> };
      case "In Process":
        return { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-500 text-white", icon: <Loader2 className="animate-spin-slow" size={20} /> };
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

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 font-['Montserrat']"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Application ID: <span className="text-green-600">{applicationData.applicationId}</span>
          </h2>
          <motion.button
            className="text-gray-500 hover:text-red-600 text-xl transition-colors"
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
          className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicant Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Sr. No", value: applicationData.sNo || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Applicant Name", value: applicationData.applicantName || "Unknown", icon: <User className="w-5 h-5 text-green-600" /> },
              { label: "Mobile No.", value: applicationData.mobileNumber || "N/A", icon: <Phone className="w-5 h-5 text-green-600" /> },
              { label: "GP, Block", value: applicationData.gpBlock || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Date of Application", value: applicationData.dateOfApplication || "N/A", icon: <Calendar className="w-5 h-5 text-green-600" /> },
              { label: "Email", value: applicationData.email || "N/A", icon: <Mail className="w-5 h-5 text-green-600" /> },
              { label: "Issue Letter No", value: applicationData.issueLetterNo || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Issue Date", value: applicationData.issueDate || "N/A", icon: <Calendar className="w-5 h-5 text-green-600" /> },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
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
              <p className="text-base font-medium text-gray-900 mt-1">{applicationData.description || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(applicationData.status).badge}`}
                >
                  {getStatusStyle(applicationData.status).icon}
                  {applicationData.status}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
              <p className="text-base font-medium text-gray-900 mt-1">{applicationData.concernedOfficer || "N/A"}</p>
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
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <motion.a
                  href={applicationData.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2 mt-4"
                  whileHover={{ scale: 1.05 }}
                  aria-label="View attached PDF"
                >
                  <FaFilePdf size={18} /> View Attached Document
                </motion.a>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Toggle for Application Timeline */}
        <motion.button
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isTimelineOpen ? "Hide application timeline" : "Show application timeline"}
        >
          <FaHistory size={18} /> {isTimelineOpen ? "Hide Application Timeline" : "Show Application Timeline"}
        </motion.button>

        {/* Timeline Modal */}
        <AnimatePresence>
          {isTimelineOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Timeline Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Application Timeline</h3>
                  <motion.button
                    className="text-gray-500 hover:text-red-600 text-xl transition-colors"
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
                  <div className="relative space-y-4">
                    {applicationData.timeline.map((item, idx) => {
                      const isCompleted =
                        idx < applicationData.timeline.length - 1 ||
                        item.section.toLowerCase().includes("compliance") ||
                        item.section.toLowerCase().includes("disposed");
                      const isNotAssigned = applicationData.status === "Not Assigned Yet";
                      const isRejected = item.section.toLowerCase().includes("dismissed");
                      const dotClass = isCompleted
                        ? item.section.toLowerCase().includes("disposed")
                          ? "bg-purple-600 border-2 border-white"
                          : "bg-green-600 border-2 border-white"
                        : isNotAssigned
                        ? "bg-gray-500"
                        : isRejected
                        ? "bg-red-600"
                        : "bg-blue-600";
                      const icon = isCompleted ? <CheckCircle size={18} className="text-white" /> : null;
                      const isCompliance = item.section.toLowerCase().includes("compliance");
                      return (
                        <div key={idx} className="relative flex items-start pl-10">
                          <div
                            className={`absolute left-0 top-0 w-6 h-6 ${dotClass} rounded-full shadow-md z-10 flex items-center justify-center`}
                          >
                            {icon}
                          </div>
                          <div
                            className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${
                              idx === applicationData.timeline.length - 1
                                ? "bg-transparent"
                                : item.section.toLowerCase().includes("disposed")
                                ? "bg-purple-300"
                                : "bg-green-300"
                            }`}
                          />
                          <div
                            className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                              idx === applicationData.timeline.length - 1
                                ? item.section.toLowerCase().includes("disposed")
                                  ? "bg-purple-50 border-purple-300 shadow-lg"
                                  : "bg-green-50 border-green-300 shadow-lg"
                                : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-semibold text-blue-700">{item.section}</h4>
                              <span className="text-xs text-gray-600 font-medium">{item.date}</span>
                            </div>
                            <p className="text-sm text-gray-700">{item.comment}</p>
                            {!isCompliance && item.department !== "N/A" && (
                              <p className="text-xs text-gray-600 font-['Montserrat'] mt-1">
                                Department: {item.department}
                              </p>
                            )}
                            {!isCompliance && item.officer !== "N/A" && (
                              <p className="text-xs text-gray-600 font-['Montserrat'] mt-1">
                                Officer: {item.officer}
                              </p>
                            )}
                            {item.pdfLink && (
                              <motion.a
                                href={item.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 transition-colors text-sm mt-1 flex items-center gap-2"
                                title="View PDF"
                                whileHover={{ scale: 1.05 }}
                                aria-label="View timeline document"
                              >
                                <FaFilePdf size={16} /> View Document
                              </motion.a>
                            )}
                            {idx === applicationData.timeline.length - 1 && (
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

        {/* Custom CSS */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
      </motion.div>
    </motion.div>
  );
};

export default ViewDetails;