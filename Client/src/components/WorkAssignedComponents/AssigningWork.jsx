import React, { useState, useEffect } from "react";
import { FaFilePdf, FaUpload, FaCheckCircle, FaHistory, FaInfoCircle } from "react-icons/fa";
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
    if (["Compliance", "Closed"].includes(status)) return 0;
    return Math.ceil((new Date() - new Date(issueDate)) / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline, concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") return "Not Assigned Yet";
    if (!timeline?.length) return "In Process";
    const latestEntry = timeline[timeline.length - 1].section.toLowerCase();
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    if (latestEntry.includes("closed")) return "Closed";
    return "In Process";
  };

  const calculateProgress = (timeline) => {
    if (!timeline?.length) return 0;
    const latestEntry = timeline[timeline.length - 1].section.toLowerCase();
    if (latestEntry.includes("closed") || latestEntry.includes("compliance")) return 100;
    if (latestEntry.includes("dismissed")) return 80;
    return Math.min((timeline.length / 5) * 100, 80);
  };

  const getEntryStatus = (entry, isLast) => {
    const section = entry.section.toLowerCase();
    if (section.includes("closed") || section.includes("compliance")) return "Completed";
    if (section.includes("dismissed")) return "Rejected";
    return isLast ? "Pending" : "Completed";
  };

  const getEntryStatusStyle = (entryStatus) => {
    switch (entryStatus) {
      case "Completed":
        return "bg-green-600 text-white";
      case "Pending":
        return "bg-orange-500 text-white";
      case "Rejected":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const isFirstAssignment = (timeline, index, concernedOfficer) => {
    if (concernedOfficer === "N/A" || !concernedOfficer) return false;
    if (index === 0) return true;
    const previousEntries = timeline.slice(0, index);
    return !previousEntries.some((entry) => entry.section !== "Application Received");
  };

  const updateLocalStorage = (updatedApp) => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const updatedApplications = storedApplications.map((app) =>
      app.ApplicantId === applicationData.applicationId ? updatedApp : app
    );
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    setApplicationData(updatedApp);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateApplicationData = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const matchedApp = storedApplications.find((app) => app.ApplicantId === data.applicationId);
    if (matchedApp) {
      const status = determineStatus(matchedApp.timeline, matchedApp.concernedOfficer);
      const pendingDays = calculatePendingDays(matchedApp.applicationDate, status);
      const updatedData = {
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
        status,
        concernedOfficer: matchedApp.concernedOfficer || "N/A",
        pendingDays,
        pdfLink: matchedApp.attachment,
        timeline: matchedApp.timeline || [
          {
            section: "Application Received",
            comment: `Application received at ${matchedApp.block || "N/A"} on ${matchedApp.applicationDate}`,
            date: matchedApp.applicationDate,
            pdfLink: matchedApp.attachment || null,
          },
        ],
      };
      setApplicationData(updatedData);
      const officer = matchedApp.concernedOfficer;
      if (officer) {
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
    }
  };

  useEffect(() => {
    updateApplicationData();
    const handleStorageChange = (event) => event.key === "applications" && updateApplicationData();
    const handleKeyDown = (event) => event.key === "Escape" && modalState.type === "details" && setModalState({ type: null, isOpen: false });
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("keydown", handleKeyDown);
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
        section: selectedOption.label,
        comment: assignmentNote || "Assigned", // Removed "Assigned to department"
        date: new Date().toLocaleDateString("en-GB"),
        pdfLink: uploadedFile?.url || null,
      };
      const updatedApp = {
        ...applicationData,
        concernedOfficer: selectedOption.value,
        status: determineStatus([...(applicationData.timeline || []), newTimelineEntry], selectedOption.value),
        timeline: [...(applicationData.timeline || []), newTimelineEntry],
      };
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
        return { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600 text-white", icon: <FileText size={20} /> }; // Replaced spinner with FileText
      case "Compliance":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      case "Closed":
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
        {children}
        <div className="mt-6 flex gap-4 justify-center">
          <motion.button
            className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-['Montserrat'] shadow-sm"
            onClick={onConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Confirm
          </motion.button>
          <motion.button
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-['Montserrat'] shadow-sm"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

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
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-900 font-['Montserrat']">
            Application Id: <span className="text-green-700">{applicationData.applicationId}</span>
          </h2>
          <motion.button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IoClose />
          </motion.button>
        </div>

        <motion.div className="bg-white rounded-xl shadow-md p-6 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Assign Work</h3>
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${getStatusStyle(applicationData.status).bg}`}>
              <div className="flex items-center gap-3">
                {getStatusStyle(applicationData.status).icon}
                <div>
                  <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Current Status</span>
                  <p className={`text-base font-semibold ${getStatusStyle(applicationData.status).text} font-['Montserrat']`}>{applicationData.status}</p>
                  <p className="text-xs text-gray-500 font-['Montserrat']">
                    Last updated on {applicationData.timeline?.[applicationData.timeline.length - 1]?.date || applicationData.issueDate}
                  </p>
                </div>
              </div>
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
                  isDisabled={applicationData.status === "Closed"}
                  styles={selectStyles}
                />
                <AnimatePresence>
                  {selectedType?.value && (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
                      <Select
                        options={optionsByType[selectedType.value] || []}
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className="w-full sm:w-80 text-sm"
                        placeholder={`Select a ${selectedType.value.toLowerCase()}`}
                        isClearable
                        isSearchable
                        isDisabled={applicationData.status === "Closed"}
                        styles={selectStyles}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                placeholder="Add assignment notes (optional)"
                rows={3}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                disabled={applicationData.status === "Closed"}
                className="w-full mt-4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 font-['Montserrat'] shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {saveSuccess && (
                <motion.p className="text-green-600 text-sm flex items-center gap-2 mt-2 font-['Montserrat']" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <FaCheckCircle /> Action saved successfully!
                </motion.p>
              )}
              {errorMessage && (
                <motion.p className="text-red-600 text-sm flex items-center gap-2 mt-2 font-['Montserrat']" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <XCircle size={16} /> {errorMessage}
                </motion.p>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Upload Document (Optional)</span>
              <label
                className={`flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-sm ${
                  applicationData.status === "Closed" ? "cursor-not-allowed" : "cursor-pointer hover:border-green-600"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={applicationData.status === "Closed"}
                />
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUpload className={applicationData.status === "Closed" ? "text-gray-400" : "text-green-600"} />
                  <span className="text-sm font-['Montserrat']">{uploadedFile ? uploadedFile.name : "Drag or click to upload (PDF, JPEG, PNG, max 5MB)"}</span>
                </div>
              </label>
            </div>
            <div className="flex justify-start">
              <motion.button
                onClick={handleSaveAssignment}
                disabled={isSaving || !selectedType?.value || !selectedOption?.value || applicationData.status === "Closed"}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm font-['Montserrat'] ${
                  isSaving || !selectedType?.value || !selectedOption?.value || applicationData.status === "Closed"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin-slow" /> Saving...
                  </>
                ) : (
                  "Assign"
                )}
              </motion.button>
            </div>
            <motion.button
              onClick={() => setIsTimelineOpen(!isTimelineOpen)}
              className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 font-['Montserrat']"
              whileHover={{ scale: 1.05 }}
              aria-label="Toggle timeline visibility"
            >
              <FaHistory /> {isTimelineOpen ? "Hide Timeline" : "Show Timeline"}
            </motion.button>
            <AnimatePresence>
              {isTimelineOpen && (
                <motion.div
                  className="mt-4 p-5 bg-white rounded-xl border border-gray-100 shadow-md max-h-[300px] overflow-y-auto"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-800 font-['Montserrat']">Progress Timeline</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600 font-['Montserrat']">
                        Total Entries: {applicationData.timeline?.length || 0} | Last Updated: {applicationData.timeline?.[applicationData.timeline.length - 1]?.date || "N/A"}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">
                        Progress: {calculateProgress(applicationData.timeline).toFixed(0)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${calculateProgress(applicationData.timeline)}%` }}
                      ></div>
                    </div>
                  </div>
                  {applicationData.timeline?.length ? (
                    <div className="relative pl-8">
                      <div className="absolute left-3.5 top-0 bottom-0 w-1 bg-green-200" />
                      {applicationData.timeline.map((entry, idx) => {
                        const isCompleted =
                          idx < applicationData.timeline.length - 1 ||
                          entry.section.toLowerCase().includes("compliance") ||
                          entry.section.toLowerCase().includes("closed");
                        const isNotAssigned = applicationData.status === "Not Assigned Yet";
                        const isRejected = entry.section.toLowerCase().includes("dismissed");
                        const dotClass = isCompleted
                          ? entry.section.toLowerCase().includes("closed")
                            ? "bg-purple-600 border-2 border-white"
                            : "bg-green-600 border-2 border-white"
                          : isNotAssigned
                          ? "bg-gray-500"
                          : isRejected
                          ? "bg-red-600"
                          : "bg-orange-500";
                        const entryStatus = getEntryStatus(entry, idx === applicationData.timeline.length - 1);
                        const isFirstAssign = isFirstAssignment(applicationData.timeline, idx, applicationData.concernedOfficer);

                        return (
                          <motion.div
                            key={idx}
                            className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 relative hover:bg-gray-100 transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.06 }}
                          >
                            <div className="relative">
                              <div
                                className={`w-6 h-6 rounded-full ${dotClass} flex items-center justify-center shadow-md`}
                                style={{ zIndex: 1 }}
                              >
                                {isCompleted && (
                                  <CheckCircle size={18} className="text-white" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">
                                  {entry.section}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getEntryStatusStyle(entryStatus)} shadow-sm`}
                                  >
                                    {entryStatus}
                                  </span>
                                  <p className="text-xs text-gray-400 font-['Montserrat']">
                                    {entry.date}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 font-['Montserrat']">
                                {entry.comment}
                              </p>
                              {applicationData.concernedOfficer !== "N/A" && (
                                <p className="text-xs text-gray-500 font-['Montserrat'] mt-1">
                                  {isFirstAssign ? `Assigned to: ${applicationData.concernedOfficer}` : applicationData.concernedOfficer}
                                </p>
                              )}
                              {isFirstAssign && applicationData.concernedOfficer !== "N/A" && (
                                <p className="text-xs text-gray-500 font-['Montserrat'] mt-1">
                                  Assigned on: {entry.date}
                                </p>
                              )}
                              {(entry.section.toLowerCase().includes("compliance") || entry.section.toLowerCase().includes("closed")) && (
                                <p className="text-xs text-gray-500 font-['Montserrat'] mt-1">
                                  Completed on: {entry.date}
                                </p>
                              )}
                              {entry.pdfLink && (
                                <motion.a
                                  href={entry.pdfLink}
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
                  ) : (
                    <p className="text-sm text-gray-500 italic font-['Montserrat']">
                      No timeline entries available.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.button
          onClick={() => setModalState({ type: "details", isOpen: true })}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6 font-['Montserrat']"
          whileHover={{ scale: 1.05 }}
        >
          <FaInfoCircle /> Show Application Details
        </motion.button>

        <AnimatePresence>
          {modalState.isOpen && modalState.type === "details" && (
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
                    onClick={() => setModalState({ type: null, isOpen: false })}
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
                    <motion.div key={idx} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                      {item.icon}
                      <div>
                        <span className="text-sm font-medium text-gray-600 font-['Montserrat']">{item.label}</span>
                        <p className="text-base font-medium text-gray-900 font-['Montserrat']">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Description</span>
                    <p className="text-base text-gray-900 font-['Montserrat']">{applicationData.description}</p>
                  </motion.div>
                  <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.45 }}>
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Status</span>
                    <p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(applicationData.status).badge} shadow-sm`}>
                        {getStatusStyle(applicationData.status).icon} {applicationData.status}
                      </span>
                    </p>
                  </motion.div>
                  <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Concerned Officer</span>
                    <p className="text-base font-semibold text-gray-900 font-['Montserrat']">{applicationData.concernedOfficer}</p>
                  </motion.div>
                  <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.55 }}>
                    <span className="text-sm font-medium text-gray-600 font-['Montserrat']">Pending Days</span>
                    <p>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          applicationData.pendingDays <= 10 ? "bg-green-600 text-white" : applicationData.pendingDays <= 15 ? "bg-amber-600 text-white" : "bg-red-600 text-white"
                        }`}
                      >
                        {applicationData.pendingDays}
                      </span>
                    </p>
                  </motion.div>
                  {applicationData.pdfLink && (
                    <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.6 }}>
                      <motion.a
                        href={applicationData.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center gap-2 font-['Montserrat'] group"
                        whileHover={{ scale: 1.05 }}
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
          {modalState.isOpen && modalState.type === "confirm" && (
            <ConfirmModal type="confirm" onConfirm={confirmSave} onCancel={() => setModalState({ type: null, isOpen: false })}>
              <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Confirm Assignment</h3>
              <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">
                Assign to <span className="font-semibold text-green-700">{selectedOption?.label}</span> ({selectedType?.label})?
              </p>
            </ConfirmModal>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AssigningWork;