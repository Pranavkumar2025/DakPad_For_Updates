import React, { useState, useEffect } from "react";
import {
  FaFilePdf,
  FaUpload,
  FaCheckCircle,
  FaHistory,
  FaInfoCircle,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import Data from "./Data.json";

const AssigningWork = ({ data, onClose }) => {
  const [selectedType, setSelectedType] = useState({ value: "", label: "Select a type" });
  const [selectedOption, setSelectedOption] = useState({
    value: data.concernedOfficer || "",
    label: data.concernedOfficer || "Select an option",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [modalState, setModalState] = useState({ type: null, isOpen: false, data: {} });
  const [assignmentNote, setAssignmentNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [applicationData, setApplicationData] = useState(data);

  const { types, optionsByType } = Data;

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
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") return "Not Assigned Yet";
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latestEntry = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latestEntry.includes("disposed")) return "Disposed";
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  const updateLocalStorage = (updatedApp) => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    console.log("Current localStorage applications:", storedApplications);

    // Normalize applicationId for case-insensitive comparison
    const normalizedAppId = updatedApp.applicationId.toLowerCase();
    const applicationExists = storedApplications.some(
      (app) => app.ApplicantId.toLowerCase() === normalizedAppId
    );

    let updatedApplications;
    if (applicationExists) {
      // Update existing application
      updatedApplications = storedApplications.map((app) =>
        app.ApplicantId.toLowerCase() === normalizedAppId
          ? {
              ...app,
              concernedOfficer: updatedApp.concernedOfficer,
              status: updatedApp.status,
              timeline: updatedApp.timeline,
              pendingDays: updatedApp.pendingDays,
              attachment: updatedApp.attachment || app.attachment,
            }
          : app
      );
    } else {
      // Add new application if it doesn't exist
      console.warn(`Application ${updatedApp.applicationId} not found in localStorage. Adding new entry.`);
      updatedApplications = [
        ...storedApplications,
        {
          ApplicantId: updatedApp.applicationId,
          applicant: updatedApp.applicant || "Unknown",
          applicationDate: updatedApp.applicationDate || new Date().toLocaleDateString("en-GB"),
          subject: updatedApp.subject || "N/A",
          block: updatedApp.block || "N/A",
          phoneNumber: updatedApp.phoneNumber || "N/A",
          emailId: updatedApp.emailId || "N/A",
          concernedOfficer: updatedApp.concernedOfficer || "N/A",
          status: updatedApp.status,
          timeline: updatedApp.timeline,
          pendingDays: updatedApp.pendingDays,
          attachment: updatedApp.attachment || null,
        },
      ];
    }

    console.log("Updating localStorage with:", updatedApplications);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    setApplicationData({
      ...applicationData,
      concernedOfficer: updatedApp.concernedOfficer,
      status: updatedApp.status,
      timeline: updatedApp.timeline,
      pendingDays: updatedApp.pendingDays,
      attachment: updatedApp.attachment || applicationData.attachment,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Dispatch events for real-time updates
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("customStorageUpdate"));
  };

  const updateApplicationData = () => {
    if (!data.applicationId) {
      console.error("No applicationId provided in data prop:", data);
      setErrorMessage("Invalid application ID. Please ensure the application exists.");
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

    const officer = updatedData.concernedOfficer;
    if (officer && officer !== "N/A") {
      const foundType = Object.keys(optionsByType).find((type) =>
        optionsByType[type].some((opt) => opt.value === officer)
      );
      if (foundType) {
        setSelectedType({ value: foundType, label: foundType });
        setSelectedOption(
          optionsByType[foundType].find((opt) => opt.value === officer) || {
            value: "",
            label: "Select an option",
          }
        );
      }
    }
  };

  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        console.log("Storage changed:", JSON.parse(event.newValue || "[]"));
        updateApplicationData();
      }
    };
    const handleCustomStorageUpdate = () => {
      console.log("Custom storage update event received in AssigningWork");
      updateApplicationData();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && modalState.type === "details") {
        setModalState({ type: null, isOpen: false });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("customStorageUpdate", handleCustomStorageUpdate);
    window.addEventListener("keydown", handleKeyDown);

    // Poll localStorage for changes in the same tab
    const pollingInterval = setInterval(() => {
      updateApplicationData();
    }, 1000); // Poll every 1 second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("customStorageUpdate", handleCustomStorageUpdate);
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(pollingInterval);
      if (uploadedFile?.url) URL.revokeObjectURL(uploadedFile.url);
    };
  }, [data.applicationId, uploadedFile, modalState]);

  const handleTypeChange = (option) => {
    setSelectedType(option || { value: "", label: "Select a type" });
    setSelectedOption({ value: "", label: "Select an option" });
    setSaveSuccess(false);
    setErrorMessage("");
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option || { value: "", label: "Select an option" });
    setSaveSuccess(false);
    setErrorMessage("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setErrorMessage("File size exceeds 5MB limit.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
      return setErrorMessage("Only PDF, JPEG, or PNG files are allowed.");
    setUploadedFile({ name: file.name, url: URL.createObjectURL(file), type: file.type });
    setErrorMessage("");
  };

  const handleSaveAssignment = () => {
    if (!selectedType?.value) return setErrorMessage("Please select a type.");
    if (!selectedOption?.value) return setErrorMessage(`Please select a ${selectedType.value.toLowerCase()}.`);
    if (selectedOption.value === applicationData.concernedOfficer)
      return setErrorMessage(`Selected ${selectedType.value.toLowerCase()} is already assigned.`);
    setModalState({ type: "confirm", isOpen: true });
  };

  const confirmSave = () => {
    setIsSaving(true);
    setModalState({ type: null, isOpen: false });
    setTimeout(() => {
      const newTimelineEntry = {
        section: `Assigned to ${selectedType.label}`,
        comment: assignmentNote || `Assigned to ${selectedOption.label} in ${selectedType.label} department`,
        date: new Date().toLocaleDateString("en-GB"),
        pdfLink: uploadedFile?.url || null,
        department: selectedType.label,
        officer: selectedOption.label,
      };
      const updatedTimeline = [...(applicationData.timeline || []), newTimelineEntry];
      const updatedApp = {
        applicationId: applicationData.applicationId,
        applicant: applicationData.applicantName || "Unknown",
        applicationDate: applicationData.dateOfApplication || new Date().toLocaleDateString("en-GB"),
        subject: applicationData.description || "N/A",
        block: applicationData.gpBlock || "N/A",
        phoneNumber: applicationData.mobileNumber || "N/A",
        emailId: applicationData.email || "N/A",
        attachment: uploadedFile?.url || applicationData.pdfLink || null,
        concernedOfficer: selectedOption.value,
        status: determineStatus(updatedTimeline, selectedOption.value),
        timeline: updatedTimeline,
        pendingDays: calculatePendingDays(
          applicationData.issueDate,
          determineStatus(updatedTimeline, selectedOption.value)
        ),
      };
      console.log("Saving updated app to localStorage:", updatedApp);
      updateLocalStorage(updatedApp);
      setSelectedType({ value: "", label: "Select a type" });
      setSelectedOption({ value: "", label: "Select an option" });
      setAssignmentNote("");
      setUploadedFile(null);
    }, 1000);
  };

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

  const selectStyles = {
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
  };

  const ConfirmModal = ({ type, onConfirm, onCancel, children }) => (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60"
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
        {children}
        <div className="mt-6 flex gap-4 justify-center">
          <motion.button
            className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-sm font-['Montserrat']"
            onClick={onConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Confirm assignment"
          >
            Confirm
          </motion.button>
          <motion.button
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm font-['Montserrat']"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Cancel assignment"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

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

        {/* Assign Work Section */}
        <motion.div
          className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Assign Work</h3>
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Current Status</span>
              <p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(applicationData.status).badge}`}
                >
                  {getStatusStyle(applicationData.status).icon}
                  {applicationData.status}
                </span>
              </p>
              <p className="text-xs text-gray-500 font-['Montserrat']">
                Last updated on{" "}
                {applicationData.timeline?.length > 0
                  ? applicationData.timeline[applicationData.timeline.length - 1].date
                  : applicationData.issueDate}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Select Type</span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                <Select
                  options={types}
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full sm:w-40 text-sm"
                  placeholder="Select a type"
                  isClearable
                  isSearchable
                  isDisabled={applicationData.status === "Disposed" || applicationData.status === "Compliance"}
                  styles={selectStyles}
                />
                <AnimatePresence>
                  {selectedType?.value && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Select
                        options={optionsByType[selectedType.value] || []}
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className="w-full sm:w-80 text-sm"
                        placeholder={`Select a ${selectedType.value.toLowerCase()}`}
                        isClearable
                        isSearchable
                        isDisabled={applicationData.status === "Disposed" || applicationData.status === "Compliance"}
                        styles={selectStyles}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Assignment Note</span>
              <textarea
                placeholder="Enter your assignment note"
                rows={4}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                className={`w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm ${
                  applicationData.status === "Disposed" || applicationData.status === "Compliance"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                disabled={applicationData.status === "Disposed" || applicationData.status === "Compliance"}
                aria-label="Assignment note"
              />
              {saveSuccess && (
                <motion.p
                  className="text-green-600 text-sm flex items-center gap-2 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaCheckCircle /> Assignment saved successfully!
                </motion.p>
              )}
              {errorMessage && (
                <motion.p
                  className="text-red-600 text-sm flex items-center gap-2 mt-2"
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
              <label
                className={`flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-xl transition bg-white shadow-sm ${
                  applicationData.status === "Disposed" || applicationData.status === "Compliance"
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:border-green-500"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={applicationData.status === "Disposed" || applicationData.status === "Compliance"}
                  aria-label="Upload document"
                />
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUpload
                    className={
                      applicationData.status === "Disposed" || applicationData.status === "Compliance"
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
              onClick={handleSaveAssignment}
              disabled={
                isSaving ||
                !selectedType?.value ||
                !selectedOption?.value ||
                applicationData.status === "Disposed" ||
                applicationData.status === "Compliance"
              }
              className={`w-full py-2.5 text-sm font-semibold rounded-xl shadow-sm transition font-['Montserrat'] ${
                isSaving ||
                !selectedType?.value ||
                !selectedOption?.value ||
                applicationData.status === "Disposed" ||
                applicationData.status === "Compliance"
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              whileHover={{
                scale:
                  isSaving ||
                  !selectedType?.value ||
                  !selectedOption?.value ||
                  applicationData.status === "Disposed" ||
                  applicationData.status === "Compliance"
                    ? 1
                    : 1.05,
              }}
              whileTap={{
                scale:
                  isSaving ||
                  !selectedType?.value ||
                  !selectedOption?.value ||
                  applicationData.status === "Disposed" ||
                  applicationData.status === "Compliance"
                    ? 1
                    : 0.95,
              }}
              aria-label="Assign work"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" /> Saving...
                </>
              ) : (
                <>
                  <FaPaperPlane className="inline mr-2" /> Assign
                </>
              )}
            </motion.button>
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
              className="mb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Application Timeline</h3>
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
                            <h4 className="text-sm font-semibold text-blue-700 font-['Montserrat']">{item.section}</h4>
                            <span className="text-xs text-gray-500 font-medium font-['Montserrat']">{item.date}</span>
                          </div>
                          <p className="text-sm text-gray-700 font-['Montserrat']">{item.comment}</p>
                          {!isCompliance && item.department !== "N/A" && (
                            <p className="text-xs text-gray-600 font-['Montserrat'] mt-1">
                              Department: {item.department}
                            </p>
                          )}
                          {!isCompliance && item.officer !== "N/A" && (
                            <p className="text-xs text-gray-600 font-['Montserrat'] mt-1">Officer: {item.officer}</p>
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
                              <FaFilePdf /> View Document
                            </motion.a>
                          )}
                          {idx === applicationData.timeline.length - 1 && (
                            <p className="text-blue-600 text-xs font-semibold mt-1.5 font-['Montserrat']">Latest Update</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm italic text-gray-500 font-['Montserrat']">No timeline entries available.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application Details Button */}
        <motion.button
          onClick={() => setModalState({ type: "details", isOpen: true })}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6 font-['Montserrat']"
          whileHover={{ scale: 1.05 }}
          aria-label="Show application details"
        >
          <FaInfoCircle /> Show Application Details
        </motion.button>

        {/* Application Details Modal */}
        <AnimatePresence>
          {modalState.isOpen && modalState.type === "details" && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-semibold text-gray-800 font-['Montserrat']">Application Details</h3>
                  <motion.button
                    className="text-gray-500 hover:text-red-600 text-xl transition-colors"
                    onClick={() => setModalState({ type: null, isOpen: false })}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close details modal"
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
                    <p className="text-base font-medium text-gray-900 font-['Montserrat']">{applicationData.description}</p>
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
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(
                          applicationData.status
                        ).badge}`}
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
                    <p className="text-base font-medium text-gray-900 font-['Montserrat']">{applicationData.concernedOfficer}</p>
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
                        className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2 font-['Montserrat']"
                        whileHover={{ scale: 1.05 }}
                        aria-label="View attached PDF"
                      >
                        <FaFilePdf /> View Attached Document
                      </motion.a>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
          {modalState.isOpen && modalState.type === "confirm" && (
            <ConfirmModal
              type="confirm"
              onConfirm={confirmSave}
              onCancel={() => setModalState({ type: null, isOpen: false })}
            >
              <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Confirm Assignment</h3>
              <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">
                Assign to <span className="font-semibold text-green-700">{selectedOption?.label}</span> ({selectedType?.label})?
              </p>
            </ConfirmModal>
          )}
        </AnimatePresence>

        {/* Inline Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
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

export default AssigningWork;