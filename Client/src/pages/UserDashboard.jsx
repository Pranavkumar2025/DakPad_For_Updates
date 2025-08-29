import React, { useState, useEffect } from "react";
import { FileText, User, Calendar, CheckCircle, XCircle, Clock, Search, X, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserNavbar from "../components/UserNavbar";

const UserDashboard = () => {
  const [cases, setCases] = useState([]);
  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [foundApplication, setFoundApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Load applications from localStorage
  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    setCases(storedApplications);
  }, []);

  // Real-time localStorage updates
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        setCases(JSON.parse(localStorage.getItem("applications") || "[]"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Search for application by ApplicantId
  const handleApplicationIdSearch = () => {
    if (!applicationIdInput.trim()) return;
    setIsLoading(true);
    setIsModalLoading(true);
    setTimeout(() => {
      const match = cases.find((c) => c.ApplicantId === applicationIdInput.trim());
      setFoundApplication(
        match
          ? {
              applicationId: match.ApplicantId,
              applicantName: match.applicant,
              dateOfApplication: match.applicationDate,
              subject: match.subject,
              description: match.subject,
              status: match.status === "Compliance Completed" ? "Compliance" : match.status || "Pending",
              timeline: match.timeline || [
                {
                  section: "Application Received",
                  comment: `Application received at ${match.block || "N/A"} on ${match.applicationDate}`,
                  date: match.applicationDate,
                  pdfLink: match.attachment || null,
                },
              ],
              lastUpdated: match.timeline?.length > 0 ? match.timeline[match.timeline.length - 1].date : match.applicationDate,
            }
          : false
      );
      setIsLoading(false);
      setTimeout(() => setIsModalLoading(false), 300); // Simulate modal data load
    }, 500); // Simulate API delay
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleApplicationIdSearch();
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-100", text: "text-amber-700", badge: "bg-amber-500 text-white", icon: <Clock size={20} /> };
      case "Compliance":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <FileText size={20} /> };
    }
  };

  // Simulate downloading timeline as PDF
  const handleDownloadTimeline = (applicationId) => {
    alert(`Downloading timeline for Application ID: ${applicationId}`);
    // In production, implement PDF generation (e.g., using jsPDF)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />

      {/* Search Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <motion.h1
            className="text-4xl font-bold text-gray-900 mb-3 font-['Montserrat']"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Track Your Application
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 mb-8 font-['Montserrat']"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Enter your Application ID to view the latest status and timeline
          </motion.p>

          {/* Search Input */}
          <motion.div
            className="flex items-center shadow-md rounded-xl border border-gray-200 bg-white max-w-xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Search className="ml-4 text-gray-500" size={22} />
            <input
              type="text"
              value={applicationIdInput}
              onChange={(e) => setApplicationIdInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-4 py-4 text-gray-900 rounded-xl focus:outline-none text-base font-['Montserrat']"
              placeholder="e.g., BPXXXXX"
              aria-label="Application ID"
            />
            <motion.button
              onClick={handleApplicationIdSearch}
              disabled={isLoading || !applicationIdInput.trim()}
              className="mr-2 px-6 py-2.5 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-['Montserrat'] shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Search application"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Searching...
                </div>
              ) : (
                "Check"
              )}
            </motion.button>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {foundApplication === false && applicationIdInput.trim() && !isLoading && (
              <motion.p
                className="mt-4 text-red-600 text-sm font-['Montserrat']"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              >
                No application found with this ID.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {foundApplication && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isModalLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="animate-spin text-green-600" size={40} />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 font-['Montserrat']">
                      Application ID: <span className="text-green-700">{foundApplication.applicationId}</span>
                    </h2>
                    <motion.button
                      onClick={() => setFoundApplication(null)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Close modal"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={28} />
                    </motion.button>
                  </div>

                  {/* Modal Content */}
                  <div className="space-y-8">
                    {/* Status Card */}
                    <motion.div
                      className={`p-6 rounded-xl shadow-md ${getStatusStyle(foundApplication.status).bg} flex items-center gap-5`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {getStatusStyle(foundApplication.status).icon}
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className={`text-xl font-semibold ${getStatusStyle(foundApplication.status).text} font-['Montserrat']`}>
                            Status: {foundApplication.status}
                          </h2>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(foundApplication.status).badge}`}
                          >
                            {foundApplication.status}
                          </span>
                        </div>
                        <p className={`text-sm ${getStatusStyle(foundApplication.status).text} mt-1 font-['Montserrat']`}>
                          {foundApplication.status === "Pending" &&
                            "Your application is under review. Check the timeline for updates."}
                          {foundApplication.status === "Compliance" &&
                            "Your application has been approved and is compliant."}
                          {foundApplication.status === "Dismissed" &&
                            "Your application has been dismissed. See details below."}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-['Montserrat']">
                          Last Updated: {foundApplication.lastUpdated}
                        </p>
                      </div>
                    </motion.div>

                    {/* Application Details Card */}
                    <motion.div
                      className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat']">
                        Application Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
                        {[
                          {
                            label: "ID",
                            value: foundApplication.applicationId,
                            icon: <FileText size={18} className="text-green-600 mt-0.5" />,
                          },
                          {
                            label: "Name",
                            value: foundApplication.applicantName,
                            icon: <User size={18} className="text-green-600 mt-0.5" />,
                          },
                          {
                            label: "Date",
                            value: foundApplication.dateOfApplication,
                            icon: <Calendar size={18} className="text-green-600 mt-0.5" />,
                          },
                          {
                            label: "Subject",
                            value: foundApplication.subject,
                            icon: <FileText size={18} className="text-green-600 mt-0.5" />,
                          },
                          {
                            label: "Description",
                            value: foundApplication.description,
                            icon: <FileText size={18} className="text-green-600 mt-0.5" />,
                            colSpan: true,
                          },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            className={`flex items-start gap-3 ${item.colSpan ? "sm:col-span-2" : ""}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.06 }}
                          >
                            {item.icon}
                            <div>
                              <span className="text-xs font-medium text-gray-500 font-['Montserrat']">{item.label}</span>
                              <p className="text-base font-medium text-gray-900 font-['Montserrat']">{item.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Timeline Card */}
                    {foundApplication.timeline && foundApplication.timeline.length > 0 && (
                      <motion.div
                        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat']">
                          Progress Timeline
                        </h3>
                        <div className="relative pl-8">
                          <div className="absolute left-3.5 top-0 bottom-0 w-1 bg-green-200" />
                          {foundApplication.timeline.map((step, index) => {
                            const isCompleted =
                              index < foundApplication.timeline.length - 1 || step.section === "Compliance Completed";
                            const isPending = step.section === "Application Received" || step.section.includes("Assigned");
                            const isRejected = step.section === "Dismissed";
                            const dotClass = isCompleted
                              ? "bg-green-600 border-2 border-white"
                              : isPending
                              ? "bg-orange-500"
                              : isRejected
                              ? "bg-red-600"
                              : "bg-gray-300";
                            const icon = isCompleted ? (
                              <CheckCircle size={18} className="text-white" />
                            ) : null;

                            return (
                              <motion.div
                                key={index}
                                className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 relative hover:bg-gray-100 transition-colors"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                              >
                                <div className="relative">
                                  <div
                                    className={`w-6 h-6 rounded-full ${dotClass} flex items-center justify-center shadow-md`}
                                    style={{ zIndex: 1 }}
                                  >
                                    {icon}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">
                                      {step.section}
                                    </p>
                                    <p className="text-xs text-gray-400 font-['Montserrat']">{step.date}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 font-['Montserrat']">{step.comment}</p>
                                  {step.pdfLink && (
                                    <motion.a
                                      href={step.pdfLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="relative inline-block text-sm text-green-600 hover:text-green-800 hover:underline transition-colors font-['Montserrat'] mt-1 group"
                                      whileHover={{ scale: 1.05 }}
                                      aria-label="View timeline document"
                                    >
                                      View Document
                                      <span className="absolute hidden group-hover:block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2 font-['Montserrat']">
                                        Open PDF
                                      </span>
                                    </motion.a>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Footer Actions */}
                    <motion.div
                      className="flex justify-end gap-4 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      {foundApplication.timeline && (
                        <motion.button
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-['Montserrat'] shadow-sm"
                          onClick={() => handleDownloadTimeline(foundApplication.applicationId)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Download timeline"
                        >
                          <Download size={18} /> Download Timeline
                        </motion.button>
                      )}
                      <motion.button
                        className="px-5 py-2.5 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors font-['Montserrat'] shadow-sm"
                        onClick={() => setFoundApplication(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Close modal"
                      >
                        Close
                      </motion.button>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        input:focus,
        button:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;