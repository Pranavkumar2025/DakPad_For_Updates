import React, { useState, useEffect } from "react";
import { FaFilePdf, FaUpload, FaSpinner, FaCheckCircle, FaHistory, FaEdit, FaInfoCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const AssigningWork = ({ data, onClose }) => {
  // State management
  const [selectedDepartment, setSelectedDepartment] = useState({
    value: data.concernedOfficer || "",
    label: data.concernedOfficer || "Select a department",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assignmentNote, setAssignmentNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [applicationData, setApplicationData] = useState(data);
  const [editIndex, setEditIndex] = useState(null);
  const [editDepartment, setEditDepartment] = useState(null);
  const [editNote, setEditNote] = useState("");

  // Department options
  const departments = [
    { value: "Inspection from committee (Director DRDA Accounts, DC Ranjay, Mis Santosh)", label: "DRDA Committee" },
    { value: "Director Accounts, DRDA", label: "Director Accounts, DRDA" },
    { value: "Complainant & Related (RDD, Patna)", label: "RDD, Patna" },
    { value: "Senior Charged Officer, Sandesh cum DTO Bhojpur", label: "Senior Charged Officer, Sandesh" },
    { value: "Hearing dt. 20-06-2025", label: "Hearing Committee" },
    { value: "BDO, Barhara", label: "BDO, Barhara" },
    { value: "Inspection from committee (DMWO, Senior Charged Officer, Sahpur Hina madam cum and MIS Pmay G)", label: "DMWO Committee" },
    { value: "Hearing Of Awas Sahayak and Complainer", label: "Awas Sahayak Hearing" },
    { value: "Hearing Of Awas Sahayak, Awas Parwechhak Mukhiya and Complainer", label: "Awas Sahayak and Mukhiya Hearing" },
    { value: "BDO Sandesh & CO Sandesh", label: "BDO Sandesh & CO Sandesh" },
    { value: "BDO Ara Sadar", label: "BDO Ara Sadar" },
    { value: "BDO Shahpur", label: "BDO Shahpur" },
    { value: "RDO Mohsin Khan", label: "RDO Mohsin Khan" },
    { value: "BDO Tarari", label: "BDO Tarari" },
  ];

  // Calculate pending days
  const calculatePendingDays = (issueDate) => {
    const issue = new Date(issueDate);
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Determine dynamic status based on timeline
  const determineStatus = (timeline) => {
    if (!timeline || timeline.length === 0) return "Pending";
    const latestEntry = timeline[timeline.length - 1].section.toLowerCase();
    if (latestEntry.includes("received") || latestEntry.includes("assigned")) return "Pending";
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // Update application data from localStorage
  const updateApplicationData = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const matchedApp = storedApplications.find((app) => app.ApplicantId === data.applicationId);
    if (matchedApp) {
      const pendingDays = calculatePendingDays(matchedApp.applicationDate);
      const status = determineStatus(matchedApp.timeline);
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
    }
  };

  // Real-time localStorage updates and Escape key listener for details modal
  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        updateApplicationData();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("keydown", handleKeyDown);
      if (uploadedFile?.url) {
        URL.revokeObjectURL(uploadedFile.url);
      }
    };
  }, [data.applicationId, uploadedFile, isDetailsOpen]);

  // Handle department selection
  const handleDepartmentChange = (option) => {
    setSelectedDepartment(option || { value: "", label: "Select a department" });
    setSaveSuccess(false);
    setErrorMessage("");
  };

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

  // Handle save assignment
  const handleSaveAssignment = () => {
    if (!selectedDepartment?.value) {
      setErrorMessage("Please select a department.");
      return;
    }
    if (selectedDepartment.value === applicationData.concernedOfficer) {
      setErrorMessage("Selected department is already assigned.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // Confirm save
  const confirmSave = () => {
    setIsSaving(true);
    setIsConfirmOpen(false);
    setTimeout(() => {
      const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApplications = storedApplications.map((app) =>
        app.ApplicantId === applicationData.applicationId
          ? {
              ...app,
              concernedOfficer: selectedDepartment.value,
              status: determineStatus([
                ...(app.timeline || []),
                {
                  section: selectedDepartment.label,
                  comment: assignmentNote || "Assigned to department",
                  date: new Date().toLocaleDateString("en-GB"),
                  pdfLink: uploadedFile?.url || null,
                },
              ]),
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
                  section: selectedDepartment.label,
                  comment: assignmentNote || "Assigned to department",
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
        concernedOfficer: selectedDepartment.value,
        status: determineStatus([
          ...(prev.timeline || []),
          {
            section: selectedDepartment.label,
            comment: assignmentNote || "Assigned to department",
            date: new Date().toLocaleDateString("en-GB"),
            pdfLink: uploadedFile?.url || null,
          },
        ]),
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
            section: selectedDepartment.label,
            comment: assignmentNote || "Assigned to department",
            date: new Date().toLocaleDateString("en-GB"),
            pdfLink: uploadedFile?.url || null,
          },
        ],
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setSelectedDepartment({ value: "", label: "Select a department" });
      setAssignmentNote("");
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Handle edit timeline entry
  const handleEditTimeline = (index, entry) => {
    setEditIndex(index);
    setEditDepartment(
      departments.find((dept) => dept.label === entry.section) || {
        value: "",
        label: "Select a department",
      }
    );
    setEditNote(entry.comment);
    setIsEditConfirmOpen(true);
  };

  // Confirm edit
  const confirmEdit = () => {
    if (!editDepartment?.value) {
      setErrorMessage("Please select a department for editing.");
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
              concernedOfficer: editDepartment.value,
              status: determineStatus(
                app.timeline.map((entry, idx) =>
                  idx === editIndex
                    ? {
                        ...entry,
                        section: editDepartment.label,
                        comment: editNote || "Assigned to department",
                        date: new Date().toLocaleDateString("en-GB"),
                        pdfLink: uploadedFile?.url || entry.pdfLink,
                      }
                    : entry
                )
              ),
              timeline: app.timeline.map((entry, idx) =>
                idx === editIndex
                  ? {
                      ...entry,
                      section: editDepartment.label,
                      comment: editNote || "Assigned to department",
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
        concernedOfficer: editDepartment.value,
        status: determineStatus(
          prev.timeline.map((entry, idx) =>
            idx === editIndex
              ? {
                  ...entry,
                  section: editDepartment.label,
                  comment: editNote || "Assigned to department",
                  date: new Date().toLocaleDateString("en-GB"),
                  pdfLink: uploadedFile?.url || entry.pdfLink,
                }
              : entry
          )
        ),
        timeline: prev.timeline.map((entry, idx) =>
          idx === editIndex
            ? {
                ...entry,
                section: editDepartment.label,
                comment: editNote || "Assigned to department",
                date: new Date().toLocaleDateString("en-GB"),
                pdfLink: uploadedFile?.url || entry.pdfLink,
              }
            : entry
        ),
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setEditIndex(null);
      setEditDepartment(null);
      setEditNote("");
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-100", text: "text-amber-700", badge: "bg-amber-500 text-white", icon: <Loader2 size={20} /> };
      case "Compliance":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      default:
        return { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600 text-white", icon: <FaSpinner className="animate-spin-slow" size={20} /> };
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
            Assign Work: <span className="text-green-700">{applicationData.applicationId}</span>
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

        {/* Assigning Work Section */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Assign Department</h3>
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${getStatusStyle(applicationData.status).bg}`}>
              <div className="flex items-center gap-3">
                {getStatusStyle(applicationData.status).icon}
                <div>
                  <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Current Status</span>
                  <p className={`text-base font-semibold ${getStatusStyle(applicationData.status).text} font-['Montserrat']`}>
                    {applicationData.status}
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
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Select Department</span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                <Select
                  options={departments}
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  className="w-full sm:w-80 text-sm"
                  placeholder="Select a department"
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
                  aria-label="Select department for assignment"
                />
                <motion.button
                  onClick={handleSaveAssignment}
                  disabled={isSaving || selectedDepartment?.value === applicationData.concernedOfficer}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition font-['Montserrat'] ${
                    isSaving || selectedDepartment?.value === applicationData.concernedOfficer
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Save department assignment"
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin-slow" /> Saving...
                    </>
                  ) : (
                    "Assign Department"
                  )}
                </motion.button>
              </div>
              <textarea
                placeholder="Add assignment notes (optional)"
                rows={3}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                className="w-full mt-4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 transition font-['Montserrat'] shadow-sm"
                aria-label="Assignment notes"
              />
              {saveSuccess && (
                <motion.p
                  className="text-green-600 text-sm flex items-center gap-2 mt-2 font-['Montserrat']"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaCheckCircle /> Assignment saved successfully!
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
              <label className="flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition bg-white shadow-sm">
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
            <div>
              <motion.button
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 font-['Montserrat']"
                whileHover={{ scale: 1.05 }}
                aria-label="Toggle timeline"
              >
                <FaHistory /> {isTimelineOpen ? "Hide Timeline" : "Show Timeline"}
              </motion.button>
              <AnimatePresence>
                {isTimelineOpen && (
                  <motion.div
                    className="mt-4 p-5 bg-white rounded-lg border border-gray-100 shadow-sm"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {applicationData.timeline?.length > 0 ? (
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-green-200"></div>
                        {applicationData.timeline.map((entry, idx) => {
                          const isCompleted = idx < applicationData.timeline.length - 1 || entry.section.toLowerCase().includes("compliance");
                          const isPending = entry.section.toLowerCase().includes("received") || entry.section.toLowerCase().includes("assigned");
                          const isRejected = entry.section.toLowerCase().includes("dismissed");
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
                                  <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">{entry.section}</p>
                                  <p className="text-xs text-gray-600 font-['Montserrat']">{entry.comment}</p>
                                  <p className="text-xs text-gray-500 font-['Montserrat']">{entry.date}</p>
                                  {entry.pdfLink && (
                                    <motion.a
                                      href={entry.pdfLink}
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
                                    onClick={() => handleEditTimeline(idx, entry)}
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
                      <p className="text-sm text-gray-500 italic font-['Montserrat']">No timeline entries available.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Toggle for Applicant Details */}
        <motion.button
          onClick={() => setIsDetailsOpen(true)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6 font-['Montserrat']"
          whileHover={{ scale: 1.05 }}
          aria-label="Show application details"
        >
          <FaInfoCircle /> Show Application Details
        </motion.button>

        {/* Applicant Details Modal */}
        <AnimatePresence>
          {isDetailsOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-md p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-semibold text-gray-800 font-['Montserrat']">Application Details</h3>
                  <motion.button
                    className="text-gray-500 hover:text-red-600 text-xl transition-colors"
                    onClick={() => setIsDetailsOpen(false)}
                    aria-label="Close details modal"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoClose />
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "Sr. No", value: applicationData.sNo || "N/A", icon: <FileText className="w-5 h-5 text-green-600" /> },
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
                  <motion.div
                    className="sm:col-span-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Description</span>
                    <p className="text-base text-gray-900 font-['Montserrat']">{applicationData.description}</p>
                  </motion.div>
                  <motion.div
                    className="sm:col-span-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.45 }}
                  >
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Status</span>
                    <p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(applicationData.status).badge} shadow-sm`}
                      >
                        {getStatusStyle(applicationData.status).icon}
                        {applicationData.status}
                      </span>
                    </p>
                  </motion.div>
                  <motion.div
                    className="sm:col-span-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Concerned Officer</span>
                    <p className="text-base font-semibold text-gray-900 font-['Montserrat']">{applicationData.concernedOfficer}</p>
                  </motion.div>
                  <motion.div
                    className="sm:col-span-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.55 }}
                  >
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Pending Days</span>
                    <p>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          applicationData.pendingDays <= 10
                            ? "bg-green-600 text-white"
                            : applicationData.pendingDays <= 15
                            ? "bg-amber-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {applicationData.pendingDays}
                      </span>
                    </p>
                  </motion.div>
                  {applicationData.pdfLink && (
                    <motion.div
                      className="sm:col-span-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <motion.a
                        href={applicationData.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center gap-2 font-['Montserrat'] group"
                        whileHover={{ scale: 1.05 }}
                        aria-label="View attached document"
                      >
                        <FaFilePdf /> View Attached Document
                        <span className="absolute hidden group-hover:block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2 font-['Montserrat']">
                          Open PDF
                        </span>
                      </motion.a>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Confirmation Modal */}
        <AnimatePresence>
          {isConfirmOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60"
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
                <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Confirm Assignment</h3>
                <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">
                  Assign this application to{" "}
                  <span className="font-semibold text-green-700">{selectedDepartment?.label}</span>?
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-['Montserrat'] shadow-sm"
                    onClick={confirmSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Confirm assignment"
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-['Montserrat'] shadow-sm"
                    onClick={() => setIsConfirmOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel assignment"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Confirmation Modal */}
        <AnimatePresence>
          {isEditConfirmOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60"
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
                <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Edit Assignment</h3>
                <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">Modify the department and note.</p>
                <div className="mt-4 space-y-4">
                  <Select
                    options={departments}
                    value={editDepartment}
                    onChange={(option) =>
                      setEditDepartment(option || { value: "", label: "Select a department" })
                    }
                    className="w-full text-sm"
                    placeholder="Select a department"
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
                    aria-label="Select department for editing"
                  />
                  <textarea
                    placeholder="Edit assignment note (optional)"
                    rows={3}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 transition font-['Montserrat'] shadow-sm"
                    aria-label="Edit assignment note"
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
          input:focus,
          button:focus,
          select:focus {
            outline: none;
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default AssigningWork;