import React, { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaUpload, FaSpinner, FaPaperPlane, FaCheckCircle, FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { User, Calendar, Mail, Phone, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CaseDialog = ({ data, onClose }) => {
  // State management
  const [applicationData, setApplicationData] = useState(data);
  const [comment, setComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(false); // Timeline hidden by default
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const markComplianceRef = useRef(null); // Ref for Mark Compliance section

  // Calculate pending days
  const calculatePendingDays = (issueDate) => {
    const issue = new Date(issueDate);
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Update application data from localStorage
  const updateApplicationData = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const matchedApp = storedApplications.find((app) => app.ApplicantId === data.applicationId);
    if (matchedApp) {
      const pendingDays = calculatePendingDays(matchedApp.applicationDate);
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
        status: matchedApp.status || "In Progress",
        concernedOfficer: matchedApp.concernedOfficer || "N/A",
        pendingDays: pendingDays,
        pdfLink: matchedApp.attachment,
        timeline: matchedApp.timeline || [
          {
            section: "Application Received",
            comment: `Application received at ${matchedApp.block || "N/A"} on ${matchedApp.applicationDate}`,
            date: matchedApp.applicationDate,
            pdfLink: matchedApp.attachment || null,
          },
        ],
      });
    }
  };

  // Real-time localStorage updates
  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        console.log("CaseDialog: Storage event triggered, updating application data...");
        updateApplicationData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (uploadedFile?.url) {
        URL.revokeObjectURL(uploadedFile.url);
      }
    };
  }, [data.applicationId, uploadedFile]);

  // Handle file upload with validation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size exceeds 5MB limit.");
        return;
      }
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        setErrorMessage("Only PDF, JPEG, or PNG files are allowed.");
        return;
      }
      setUploadedFile({ name: file.name, url: URL.createObjectURL(file), type: file.type });
      setErrorMessage("");
    }
  };

  // Handle compliance submission
  const handleCompliance = (e) => {
    e.preventDefault();
    if (!comment) {
      setErrorMessage("Please enter a comment.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // Confirm compliance
  const confirmCompliance = () => {
    setIsSaving(true);
    setIsConfirmOpen(false);
    setTimeout(() => {
      const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApplications = storedApplications.map((app) =>
        app.ApplicantId === applicationData.applicationId
          ? {
              ...app,
              status: "Compliance", // Store "Compliance" instead of "Compliance Completed"
              timeline: [
                ...(app.timeline || [
                  {
                    section: "Application Received",
                    comment: `Application received at ${app.block || "N/A"} on ${app.applicationDate}`,
                    date: app.applicationDate,
                    pdfLink: app.attachment || null,
                  },
                ]),
                {
                  section: "Compliance Completed", // Keep timeline entry as "Compliance Completed"
                  comment: comment || "Compliance marked as completed",
                  date: new Date().toLocaleDateString("en-GB"),
                  pdfLink: uploadedFile?.url || null,
                },
              ],
            }
          : app
      );
      console.log("CaseDialog: Saving to localStorage:", updatedApplications);
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      setApplicationData((prev) => ({
        ...prev,
        status: "Compliance", // Update state to "Compliance"
        timeline: [
          ...(prev.timeline || [
            {
              section: "Application Received",
              comment: `Application received at ${prev.gpBlock || "N/A"} on ${prev.dateOfApplication}`,
              date: prev.dateOfApplication,
              pdfLink: prev.pdfLink || null,
            },
          ]),
          {
            section: "Compliance Completed",
            comment: comment || "Compliance marked as completed",
            date: new Date().toLocaleDateString("en-GB"),
            pdfLink: uploadedFile?.url || null,
          },
        ],
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setComment("");
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Scroll to Mark Compliance section
  const scrollToMarkCompliance = () => {
    markComplianceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Display status for UI (shortened for Compliance Completed)
  const getDisplayStatus = (status) => {
    return status === "Compliance Completed" ? "Compliance" : status;
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
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Application ID: <span className="text-green-800">{applicationData.applicationId}</span>
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

        <motion.span
          onClick={scrollToMarkCompliance}
          className="text-green-600 hover:text-green-800 hover:underline text-sm font-semibold cursor-pointer mb-6 block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Visit Mark Compliance"
        >
          Visit Mark Compliance
        </motion.span>

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
              <p className="text-base font-medium text-gray-900">{applicationData.description}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    applicationData.status === "Compliance" || applicationData.status === "Compliance Completed"
                      ? "bg-green-600 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {applicationData.status === "In Progress" && <FaSpinner className="animate-spin" />}
                  {getDisplayStatus(applicationData.status)}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
              <p className="text-base font-medium text-gray-900">{applicationData.concernedOfficer}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Pending Days</span>
              <p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    applicationData.pendingDays <= 10
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
          </div>
          {applicationData.pdfLink && (
            <motion.a
              href={applicationData.pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2 mt-4"
              whileHover={{ scale: 1.05 }}
              aria-label="View attached PDF"
            >
              <FaFilePdf /> View Attached Document
            </motion.a>
          )}
        </motion.div>

        {/* Toggle for Application Timeline */}
        <motion.button
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
          aria-label="Toggle application timeline"
        >
          <FaHistory /> {isTimelineOpen ? "Hide Application Timeline" : "Show Application Timeline"}
        </motion.button>

        {/* Application Timeline Section */}
        <AnimatePresence>
          {isTimelineOpen && (
            <motion.div
              className="mb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h3>
              {applicationData.timeline?.length > 0 ? (
                <div className="relative space-y-4">
                  {applicationData.timeline.map((item, idx) => (
                    <div key={idx} className="relative flex items-start pl-10">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-600 border-2 border-white shadow-md z-10 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                      <div
                        className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${
                          idx === applicationData.timeline.length - 1 ? "bg-transparent" : "bg-green-300"
                        }`}
                      />
                      <div
                        className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                          idx === applicationData.timeline.length - 1
                            ? "bg-green-50 border-green-300 shadow-lg"
                            : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-semibold text-blue-700">{item.section}</h4>
                          <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          {item.comment}
                          {item.pdfLink && (
                            <motion.a
                              href={item.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="View PDF"
                              whileHover={{ scale: 1.05 }}
                              aria-label="View timeline document"
                            >
                              <FaFilePdf />
                            </motion.a>
                          )}
                        </p>
                        {idx === applicationData.timeline.length - 1 && (
                          <p className="text-blue-600 text-xs font-semibold mt-1.5">Latest Update</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-500">No timeline entries available.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mark Compliance Section */}
        <div ref={markComplianceRef}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mark Compliance</h3>
          <form className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6" onSubmit={handleCompliance}>
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Current Status</span>
                <p className="text-base font-semibold text-gray-900">
                  {applicationData.timeline?.length > 0
                    ? applicationData.timeline[applicationData.timeline.length - 1].section
                    : "No status available"}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated on{" "}
                  {applicationData.timeline?.length > 0
                    ? applicationData.timeline[applicationData.timeline.length - 1].date
                    : applicationData.issueDate}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Compliance Comment</span>
                <textarea
                  placeholder="Enter your compliance comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                  aria-label="Compliance comment"
                />
                {saveSuccess && (
                  <motion.p
                    className="text-green-600 text-sm flex items-center gap-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaCheckCircle /> Compliance marked successfully!
                  </motion.p>
                )}
                {errorMessage && (
                  <motion.p
                    className="text-red-600 text-sm flex items-center gap-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaCheckCircle className="rotate-45" /> {errorMessage}
                  </motion.p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Upload Document (Optional)</span>
                <label className="flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition bg-white shadow-sm">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload document"
                  />
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUpload className="text-green-600" />
                    <span className="text-sm">
                      {uploadedFile ? uploadedFile.name : "Drag or click to upload (PDF, JPEG, PNG, max 5MB)"}
                    </span>
                  </div>
                </label>
              </div>
              <motion.button
                type="submit"
                disabled={isSaving}
                className={`w-full py-2.5 text-sm font-semibold rounded-xl shadow-sm transition ${
                  isSaving ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Mark compliance"
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

        {/* Compliance Confirmation Modal */}
        <AnimatePresence>
          {isConfirmOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Compliance</h3>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Are you sure you want to mark this application as completed?
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-sm"
                    onClick={confirmCompliance}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Confirm compliance"
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm"
                    onClick={() => setIsConfirmOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel compliance"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CaseDialog;