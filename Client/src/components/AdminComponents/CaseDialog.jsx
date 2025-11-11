import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaFilePdf,
  FaUpload,
  FaSpinner,
  FaPaperPlane,
  FaCheckCircle,
  FaHistory,
} from "react-icons/fa";
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

import api from "../../utils/api"; // <-- Your Axios wrapper

const CaseDialog = ({ data, onClose, onUpdate }) => {
  // State
  const [applicationData, setApplicationData] = useState(null);
  const [comment, setComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const markComplianceRef = useRef(null);

  // Helper: Calculate pending days
  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) return 0;
    const diff = Date.now() - issue.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Helper: Determine status from timeline
  const determineStatus = (timeline = [], concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A") return "Not Assigned Yet";
    if (!Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latest = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latest.includes("disposed")) return "Disposed";
    if (latest.includes("compliance")) return "Compliance";
    if (latest.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // === FETCH SINGLE APPLICATION ===
  const fetchApplication = useCallback(async () => {
    if (!data.applicationId) {
      setErrorMessage("Invalid application ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get(`/api/applications/${data.applicationId}`);
      const dbApp = res.data;

      const status = determineStatus(dbApp.timeline, dbApp.concernedOfficer);
      const pendingDays = calculatePendingDays(dbApp.applicationDate, status);

      const uiData = {
        ...data,
        applicationId: dbApp.applicantId || data.applicationId,
        applicantName: dbApp.applicant || "Unknown",
        dateOfApplication: dbApp.applicationDate?.split("T")[0] || "N/A",
        description: dbApp.subject || "N/A",
        gpBlock: dbApp.block || "N/A",
        mobileNumber: dbApp.phoneNumber || "N/A",
        email: dbApp.emailId || "N/A",
        issueDate: dbApp.applicationDate?.split("T")[0] || "N/A",
        issueLetterNo: data.issueLetterNo || "N/A",
        status,
        concernedOfficer: dbApp.concernedOfficer || "N/A",
        pendingDays,
        pdfLink: dbApp.attachment
          ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${dbApp.attachment}`
          : null,
        timeline: Array.isArray(dbApp.timeline) && dbApp.timeline.length > 0
          ? dbApp.timeline
          : [
              {
                section: "Application Received",
                comment: `Application received on ${dbApp.applicationDate?.split("T")[0] || "N/A"}`,
                date: dbApp.applicationDate?.split("T")[0] || "N/A",
                pdfLink: dbApp.attachment
                  ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${dbApp.attachment}`
                  : null,
                department: "N/A",
                officer: "N/A",
              },
            ],
      };

      setApplicationData(uiData);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message || "Failed to load application");
    } finally {
      setIsLoading(false);
    }
  }, [data.applicationId, data.issueLetterNo]);

  // === MARK COMPLIANCE ===
  const markCompliance = useCallback(async () => {
    if (!comment.trim()) {
      setErrorMessage("Please enter a comment.");
      return;
    }

    setIsSaving(true);
    const form = new FormData();
    form.append("status", "Compliance");
    form.append("comment", comment);
    if (uploadedFile?.file) form.append("file", uploadedFile.file);

    try {
      const res = await api.patch(`/api/applications/${data.applicationId}/compliance`, form);
      const updatedDbApp = res.data;

      const status = determineStatus(updatedDbApp.timeline, updatedDbApp.concernedOfficer);
      const pendingDays = calculatePendingDays(updatedDbApp.applicationDate, status);

      const newUiData = {
        ...applicationData,
        status,
        pendingDays,
        timeline: updatedDbApp.timeline,
        pdfLink: updatedDbApp.attachment
          ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${updatedDbApp.attachment}`
          : applicationData.pdfLink,
      };

      setApplicationData(newUiData);
      setSaveSuccess(true);

      // Notify parent table
      onUpdate?.({
        ...data,
        status,
        pendingDays,
        concernedOfficer: updatedDbApp.concernedOfficer || data.concernedOfficer,
        timeline: updatedDbApp.timeline,
      });

      // Reset form
      setTimeout(() => {
        setSaveSuccess(false);
        setComment("");
        setUploadedFile(null);
      }, 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message || "Failed to mark compliance");
    } finally {
      setIsSaving(false);
    }
  }, [
    comment,
    uploadedFile,
    data.applicationId,
    applicationData,
    onUpdate,
    data.concernedOfficer,
  ]);

  // === EFFECTS ===
  useEffect(() => {
    fetchApplication();

    const handleUpdate = () => fetchApplication();
    window.addEventListener("applicationUpdated", handleUpdate);

    return () => {
      window.removeEventListener("applicationUpdated", handleUpdate);
    };
  }, [fetchApplication]);

  useEffect(() => {
    if (uploadedFile?.url) {
      return () => URL.revokeObjectURL(uploadedFile.url);
    }
  }, [uploadedFile]);

  // === HANDLERS ===
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds 5MB limit.");
      return;
    }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setErrorMessage("Only PDF, JPEG, or PNG files are allowed.");
      return;
    }
    setUploadedFile({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    });
    setErrorMessage("");
  };

  const handleCompliance = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage("Please enter a comment.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmCompliance = () => {
    setIsConfirmOpen(false);
    markCompliance();
  };

  const scrollToMarkCompliance = () => {
    markComplianceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // === STATUS STYLING ===
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

  // === LOADING UI ===
  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <FaSpinner className="animate-spin text-green-600 text-4xl" />
          <p className="mt-4 text-gray-700">Loading application...</p>
        </div>
      </motion.div>
    );
  }

  // === MAIN DIALOG ===
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
            Application ID: <span className="text-green-800">{applicationData?.applicationId}</span>
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

        {/* Mark Compliance Button */}
        <motion.span
          onClick={scrollToMarkCompliance}
          className={`text-green-600 hover:text-green-800 hover:underline text-md font-semibold cursor-pointer mb-6 block ${
            applicationData?.status === "Disposed" || applicationData?.status === "Compliance"
              ? "pointer-events-none opacity-50"
              : ""
          }`}
          whileHover={{
            scale: applicationData?.status === "Disposed" || applicationData?.status === "Compliance" ? 1 : 0.99,
          }}
          whileTap={{
            scale: applicationData?.status === "Disposed" || applicationData?.status === "Compliance" ? 1 : 0.95,
          }}
          aria-label="Go to Mark Compliance"
        >
          Mark Compliance
        </motion.span>

        {/* Applicant Details */}
        <motion.div
          className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicant Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Sr. No", value: applicationData?.sNo || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Applicant Name", value: applicationData?.applicantName || "Unknown", icon: <User className="w-5 h-5 text-green-600" /> },
              { label: "Mobile No.", value: applicationData?.mobileNumber || "N/A", icon: <Phone className="w-5 h-5 text-green-600" /> },
              { label: "GP, Block", value: applicationData?.gpBlock || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Date of Application", value: applicationData?.dateOfApplication || "N/A", icon: <Calendar className="w-5 h-5 text-green-600" /> },
              { label: "Email", value: applicationData?.email || "N/A", icon: <Mail className="w-5 h-5 text-green-600" /> },
              { label: "Issue Letter No", value: applicationData?.issueLetterNo || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
              { label: "Issue Date", value: applicationData?.issueDate || "N/A", icon: <Calendar className="w-5 h-5 text-green-600" /> },
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
              <p className="text-base font-medium text-gray-900">{applicationData?.description || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(applicationData?.status).badge}`}
                >
                  {getStatusStyle(applicationData?.status).icon}
                  {applicationData?.status}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
              <p className="text-base font-medium text-gray-900">{applicationData?.concernedOfficer || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Pending Days</span>
              <p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    applicationData?.pendingDays === 0
                      ? "bg-green-500 text-white"
                      : applicationData?.pendingDays <= 10
                      ? "bg-green-500 text-white"
                      : applicationData?.pendingDays <= 15
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {applicationData?.pendingDays}
                </span>
              </p>
            </div>
            {applicationData?.pdfLink && (
              <motion.div className="md:col-span-2">
                <motion.a
                  href={applicationData.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2 mt-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaFilePdf /> View Attached Document
                </motion.a>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Timeline Toggle */}
        <motion.button
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <FaHistory /> {isTimelineOpen ? "Hide" : "Show"} Application Timeline
        </motion.button>

        {/* Timeline */}
        <AnimatePresence>
          {isTimelineOpen && (
            <motion.div
              className="mb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h3>
              {applicationData?.timeline?.length > 0 ? (
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
                          className={`w-full p-4 rounded-lg border transition-all ${
                            idx === applicationData.timeline.length - 1
                              ? item.section.toLowerCase().includes("disposed")
                                ? "bg-purple-50 border-purple-300 shadow-lg"
                                : "bg-green-50 border-green-300 shadow-lg"
                              : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-semibold text-blue-700">{item.section}</h4>
                            <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                          </div>
                          <p className="text-sm text-gray-700">{item.comment}</p>
                          {!isCompliance && item.department !== "N/A" && (
                            <p className="text-xs text-gray-600 mt-1">Department: {item.department}</p>
                          )}
                          {!isCompliance && item.officer !== "N/A" && (
                            <p className="text-xs text-gray-600 mt-1">Officer: {item.officer}</p>
                          )}
                          {item.pdfLink && (
                            <motion.a
                              href={item.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm mt-1 flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <FaFilePdf /> View Document
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
          )}
        </AnimatePresence>

        {/* Mark Compliance Form */}
        <div ref={markComplianceRef}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mark Compliance</h3>
          <form className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6" onSubmit={handleCompliance}>
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Current Status</span>
                <p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(applicationData?.status).badge}`}
                  >
                    {getStatusStyle(applicationData?.status).icon}
                    {applicationData?.status}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Last updated on{" "}
                  {applicationData?.timeline?.length > 0
                    ? applicationData.timeline[applicationData.timeline.length - 1].date
                    : applicationData?.issueDate || "N/A"}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Compliance Comment</span>
                <textarea
                  placeholder="Enter your compliance comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition shadow-sm ${
                    applicationData?.status === "Disposed" || applicationData?.status === "Compliance"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={applicationData?.status === "Disposed" || applicationData?.status === "Compliance"}
                />
                {saveSuccess && (
                  <motion.p className="text-green-600 text-sm flex items-center gap-2 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FaCheckCircle /> Compliance marked successfully!
                  </motion.p>
                )}
                {errorMessage && (
                  <motion.p className="text-red-600 text-sm flex items-center gap-2 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <XCircle size={16} /> {errorMessage}
                  </motion.p>
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Upload Document (Optional)</span>
                <label
                  className={`flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-xl transition bg-white shadow-sm ${
                    applicationData?.status === "Disposed" || applicationData?.status === "Compliance"
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:border-green-500"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={applicationData?.status === "Disposed" || applicationData?.status === "Compliance"}
                  />
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUpload
                      className={
                        applicationData?.status === "Disposed" || applicationData?.status === "Compliance"
                          ? "text-gray-400"
                          : "text-green-600"
                      }
                    />
                    <span className="text-sm">
                      {uploadedFile ? uploadedFile.name : "Drag or click to upload (PDF, JPEG, PNG, max 5MB)"}
                    </span>
                  </div>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isSaving || applicationData?.status === "Disposed" || applicationData?.status === "Compliance"}
                className={`w-full py-2.5 text-sm font-semibold rounded-xl shadow-sm transition ${
                  isSaving || applicationData?.status === "Disposed" || applicationData?.status === "Compliance"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                whileHover={{
                  scale: applicationData?.status === "Disposed" || applicationData?.status === "Compliance" ? 1 : 1.05,
                }}
                whileTap={{
                  scale: applicationData?.status === "Disposed" || applicationData?.status === "Compliance" ? 1 : 0.95,
                }}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" /> Saving...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="inline mr-2" /> Mark Compliance
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Confirm Modal */}
        <AnimatePresence>
          {isConfirmOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Compliance</h3>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Are you sure you want to mark this application as completed?
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                    onClick={confirmCompliance}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => setIsConfirmOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom CSS */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,.05); }
          .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05); }
          .backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default CaseDialog;