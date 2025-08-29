import React, { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaUpload, FaSpinner, FaCheckCircle, FaHistory, FaEdit } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const CaseDialog = ({ data, onClose }) => {
  // State management
  const [applicationData, setApplicationData] = useState(data);
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({
    value: data.status || "In Progress",
    label: data.status || "In Progress",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editStatus, setEditStatus] = useState(null);
  const markComplianceRef = useRef(null);

  // Status options for compliance
  const statusOptions = [
    { value: "In Progress", label: "In Progress" },
    { value: "Compliance Completed", label: "Compliance Completed" },
    { value: "Dismissed", label: "Dismissed" },
  ];

  // Calculate pending days
  const calculatePendingDays = (issueDate, status) => {
    if (status === "Compliance Completed") return 0;
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
      const status = matchedApp.status || "In Progress";
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
        timeline: matchedApp.timeline || [
          {
            section: "Application Received",
            comment: `Application received at ${matchedApp.block || "N/A"} on ${matchedApp.applicationDate}`,
            date: matchedApp.applicationDate,
            pdfLink: matchedApp.attachment || null,
          },
        ],
      });
      setSelectedStatus({
        value: status,
        label: status === "Compliance Completed" ? "Updated on time" : status,
      });
    }
  };

  // Real-time localStorage updates with polling
  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        updateApplicationData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Polling for same-tab updates
    const intervalId = setInterval(() => {
      updateApplicationData();
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
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
    if (!selectedStatus?.value) {
      setErrorMessage("Please select a status.");
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
              status: selectedStatus.value,
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
                  section: selectedStatus.value,
                  comment: comment || "Status updated",
                  date: new Date().toLocaleDateString("en-GB"),
                  pdfLink: uploadedFile?.url || null,
                },
              ],
            }
          : app
      );
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      setApplicationData((prev) => ({
        ...prev,
        status: selectedStatus.value,
        pendingDays: selectedStatus.value === "Compliance Completed" ? 0 : prev.pendingDays,
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
            section: selectedStatus.value,
            comment: comment || "Status updated",
            date: new Date().toLocaleDateString("en-GB"),
            pdfLink: uploadedFile?.url || null,
          },
        ],
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setComment("");
      setUploadedFile(null);
      setSelectedStatus({ value: "In Progress", label: "In Progress" });
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Handle edit timeline entry
  const handleEditTimeline = (index, entry) => {
    setEditIndex(index);
    setEditComment(entry.comment);
    setEditStatus(
      statusOptions.find((opt) => opt.value === entry.section) || {
        value: "In Progress",
        label: "In Progress",
      }
    );
    setIsEditConfirmOpen(true);
  };

  // Confirm edit
  const confirmEdit = () => {
    if (!editStatus?.value) {
      setErrorMessage("Please select a status for editing.");
      return;
    }
    setIsSaving(true);
    setIsEditConfirmOpen(false);
    setTimeout(() => {
      const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApplications = storedApplications.map((app) =>
        app.ApplicantId === applicationData.applicationId
          ? {
              ...app,
              status: editStatus.value,
              timeline: app.timeline.map((entry, idx) =>
                idx === editIndex
                  ? {
                      ...entry,
                      section: editStatus.value,
                      comment: editComment || "Status updated",
                      date: new Date().toLocaleDateString("en-GB"),
                      pdfLink: uploadedFile?.url || entry.pdfLink,
                    }
                  : entry
              ),
            }
          : app
      );
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      setApplicationData((prev) => ({
        ...prev,
        status: editStatus.value,
        pendingDays: editStatus.value === "Compliance Completed" ? 0 : prev.pendingDays,
        timeline: prev.timeline.map((entry, idx) =>
          idx === editIndex
            ? {
                ...entry,
                section: editStatus.value,
                comment: editComment || "Status updated",
                date: new Date().toLocaleDateString("en-GB"),
                pdfLink: uploadedFile?.url || entry.pdfLink,
              }
            : entry
        ),
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setEditIndex(null);
      setEditComment("");
      setEditStatus(null);
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Scroll to Mark Compliance
  const scrollToMarkCompliance = () => {
    if (markComplianceRef.current) {
      markComplianceRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Compliance Completed":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "In Progress":
        return { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600 text-white", icon: <FaSpinner className="animate-spin-slow" size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-600 text-white", icon: <Loader2 size={20} /> };
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
        className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-900 font-['Montserrat']">
            Application ID: <span className="text-green-700">{applicationData.applicationId}</span>
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
          className="bg-white rounded-xl shadow-md p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Applicant Details</h3>
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
                  <span className="text-sm font-medium text-gray-600 font-['Montserrat']">{item.label}</span>
                  <p className="text-base font-medium text-gray-900 font-['Montserrat']">{item.value}</p>
                </div>
              </motion.div>
            ))}
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Description</span>
              <p className="text-base font-medium text-gray-900 font-['Montserrat']">{applicationData.description}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Status</span>
              <p>
                <motion.button
                  onClick={scrollToMarkCompliance}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(applicationData.status).badge} shadow-sm`}
                  whileHover={{ scale: 1.05 }}
                  aria-label="Scroll to Mark Compliance section"
                >
                  {getStatusStyle(applicationData.status).icon}
                  {applicationData.status === "Compliance Completed" ? "Updated on time" : applicationData.status}
                </motion.button>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Concerned Officer</span>
              <p className="text-base font-medium text-gray-900 font-['Montserrat']">{applicationData.concernedOfficer}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Pending Days</span>
              <p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    applicationData.pendingDays === 0
                      ? "bg-green-600 text-white"
                      : applicationData.pendingDays <= 10
                      ? "bg-green-500 text-white"
                      : applicationData.pendingDays <= 15
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                  aria-label={`Pending days: ${applicationData.pendingDays}`}
                >
                  {applicationData.pendingDays}
                </span>
              </p>
            </div>
            {applicationData.pdfLink && (
              <motion.a
                href={applicationData.pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="md:col-span-2 text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2 font-['Montserrat']"
                whileHover={{ scale: 1.05 }}
                aria-label="View attached PDF"
              >
                <FaFilePdf /> View Attached Document
              </motion.a>
            )}
          </div>
        </motion.div>

        {/* Toggle for Application Timeline */}
        <motion.button
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6 font-['Montserrat']"
          whileHover={{ scale: 1.05 }}
          aria-label="Toggle application timeline"
        >
          <FaHistory /> {isTimelineOpen ? "Hide Application Timeline" : "Show Application Timeline"}
        </motion.button>

        {/* Application Timeline Section */}
        <AnimatePresence>
          {isTimelineOpen && (
            <motion.div
              className="mb-6 p-5 bg-white rounded-lg border border-gray-100 shadow-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Application Timeline</h3>
              {applicationData.timeline?.length > 0 ? (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-green-200"></div>
                  {applicationData.timeline.map((item, idx) => {
                    const isCompleted = item.section.toLowerCase().includes("compliance");
                    const isPending = item.section.toLowerCase().includes("received");
                    const isRejected = item.section.toLowerCase().includes("dismissed");
                    const dotClass = isCompleted
                      ? "bg-green-600 border-2 border-white"
                      : isPending
                      ? "bg-amber-500"
                      : isRejected
                      ? "bg-red-600"
                      : "bg-gray-300";
                    const icon = isCompleted ? <CheckCircle size={18} className="text-white" /> : null;
                    return (
                      <motion.div
                        key={idx}
                        className="relative mb-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <div className={`absolute left-[-18px] top-1 w-3 h-3 ${dotClass} rounded-full shadow-sm flex items-center justify-center`}>
                          {icon}
                        </div>
                        <div className="ml-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">{item.section}</p>
                            <p className="text-xs text-gray-600 font-['Montserrat']">{item.comment}</p>
                            <p className="text-xs text-gray-500 font-['Montserrat']">{item.date}</p>
                            {item.pdfLink && (
                              <motion.a
                                href={item.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-xs font-semibold flex items-center gap-1 mt-1 font-['Montserrat'] group"
                                whileHover={{ scale: 1.05 }}
                                aria-label="View timeline document"
                              >
                                <FaFilePdf /> View Document
                                <span className="absolute hidden group-hover:block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2 font-['Montserrat']">
                                  Open PDF
                                </span>
                              </motion.a>
                            )}
                          </div>
                          {idx !== 0 && idx === applicationData.timeline.length - 1 && (
                            <motion.button
                              onClick={() => handleEditTimeline(idx, item)}
                              className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-1 font-['Montserrat']"
                              whileHover={{ scale: 1.05 }}
                              aria-label="Edit timeline entry"
                            >
                              <FaEdit /> Edit
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm italic text-gray-500 font-['Montserrat']">No timeline entries available.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mark Compliance Section */}
        <div ref={markComplianceRef}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Mark Compliance</h3>
          <form className="bg-white rounded-xl shadow-md p-6 mb-6" onSubmit={handleCompliance}>
            <div className="space-y-6">
              <div className={`p-4 rounded-xl ${getStatusStyle(applicationData.status).bg}`}>
                <div className="flex items-center gap-3">
                  {getStatusStyle(applicationData.status).icon}
                  <div>
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Current Status</span>
                    <p className={`text-base font-semibold ${getStatusStyle(applicationData.status).text} font-['Montserrat']`}>
                      {applicationData.status === "Compliance Completed" ? "Updated on time" : applicationData.status}
                    </p>
                    <p className="text-xs text-gray-500 font-['Montserrat']">
                      Last updated on{" "}
                      {applicationData.timeline?.length > 0
                        ? applicationData.timeline[applicationData.timeline.length - 1].date
                        : applicationData.issueDate}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Select Status</span>
                <Select
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(option) =>
                    setSelectedStatus(option || { value: "In Progress", label: "In Progress" })
                  }
                  className="w-full mt-2"
                  placeholder="Select status"
                  isClearable
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      "&:hover": { borderColor: "#16a34a" },
                      padding: "0.25rem",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.875rem",
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected ? "#16a34a" : isFocused ? "#f0fff4" : "white",
                      color: isSelected ? "white" : "#111827",
                      cursor: "pointer",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.875rem",
                    }),
                  }}
                  aria-label="Select compliance status"
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Compliance Comment</span>
                <textarea
                  placeholder="Enter your compliance comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition font-['Montserrat'] shadow-sm"
                  aria-label="Compliance comment"
                />
                {saveSuccess && (
                  <motion.p
                    className="text-green-600 text-sm flex items-center gap-2 mt-2 font-['Montserrat']"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaCheckCircle /> Compliance marked successfully!
                  </motion.p>
                )}
                {errorMessage && (
                  <motion.p
                    className="text-red-600 text-sm flex items-center gap-2 mt-2 font-['Montserrat']"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <XCircle size={16} /> {errorMessage}
                  </motion.p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Upload Document (Optional)</span>
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
                    <span className="text-sm font-['Montserrat']">
                      {uploadedFile ? uploadedFile.name : "Drag or click to upload (PDF, JPEG, PNG, max 5MB)"}
                    </span>
                  </div>
                </label>
              </div>
              <motion.button
                type="submit"
                disabled={isSaving}
                className={`w-full py-2.5 text-sm font-semibold rounded-xl shadow-sm transition font-['Montserrat'] ${
                  isSaving ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Mark compliance"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin-slow inline mr-2" /> Saving...
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
                <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Confirm Compliance</h3>
                <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">
                  Mark this application as <span className="font-semibold text-green-700">{selectedStatus.label}</span>?
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-['Montserrat'] shadow-sm"
                    onClick={confirmCompliance}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Confirm compliance"
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-['Montserrat'] shadow-sm"
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

        {/* Edit Timeline Confirmation Modal */}
        <AnimatePresence>
          {isEditConfirmOpen && (
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
                <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Edit Timeline Entry</h3>
                <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">Modify the status and comment.</p>
                <div className="mt-4 space-y-4">
                  <Select
                    options={statusOptions}
                    value={editStatus}
                    onChange={(option) =>
                      setEditStatus(option || { value: "In Progress", label: "In Progress" })
                    }
                    className="w-full text-sm"
                    placeholder="Select status"
                    isClearable
                    isSearchable
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#d1d5db",
                        borderRadius: "0.5rem",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        "&:hover": { borderColor: "#16a34a" },
                        padding: "0.25rem",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.875rem",
                      }),
                      option: (base, { isFocused, isSelected }) => ({
                        ...base,
                        backgroundColor: isSelected ? "#16a34a" : isFocused ? "#f0fff4" : "white",
                        color: isSelected ? "white" : "#111827",
                        cursor: "pointer",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.875rem",
                      }),
                    }}
                    aria-label="Select status for editing"
                  />
                  <textarea
                    placeholder="Edit compliance comment"
                    rows={3}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 transition font-['Montserrat'] shadow-sm"
                    aria-label="Edit compliance comment"
                  />
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition bg-white shadow-sm">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      aria-label="Upload new document"
                    />
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaUpload className="text-green-600" />
                      <span className="text-sm font-['Montserrat']">
                        {uploadedFile ? uploadedFile.name : "Upload new document (optional, PDF, JPEG, PNG, max 5MB)"}
                      </span>
                    </div>
                  </label>
                </div>
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-['Montserrat'] shadow-sm"
                    onClick={confirmEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Confirm edit"
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-['Montserrat'] shadow-sm"
                    onClick={() => setIsEditConfirmOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel edit"
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
          .shadow-md {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .shadow-2xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          .transition-all {
            transition: all 0.3s ease-in-out;
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default CaseDialog;