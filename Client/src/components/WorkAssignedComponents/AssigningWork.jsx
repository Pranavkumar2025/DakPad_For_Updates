import React, { useState, useEffect, useCallback } from "react";
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
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import Data from "./Data.json";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api/applications";

const AssigningWork = ({ data, onClose, onUpdate }) => {
  // ---------- UI state ----------
  const [selectedType, setSelectedType] = useState({ value: "", label: "Select a type" });
  const [selectedOption, setSelectedOption] = useState({
    value: data.concernedOfficer || "",
    label: data.concernedOfficer || "Select an option",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [modalState, setModalState] = useState({ type: null, isOpen: false });
  const [assignmentNote, setAssignmentNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // ---------- Application data (from DB) ----------
  const [applicationData, setApplicationData] = useState(data);

  const { types, optionsByType } = Data;

  // ---------- Helpers ----------
  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) return 0;
    const diff = Date.now() - issue.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline = [], officer) => {
    if (!officer || officer === "N/A") return "Not Assigned Yet";
    if (!Array.isArray(timeline) || timeline.length === 0) return "In Process";

    const latest = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latest.includes("disposed")) return "Disposed";
    if (latest.includes("compliance")) return "Compliance";
    if (latest.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // ---------- Map DB App → Table Row ----------
  const mapDbAppToTableRow = (dbApp, originalSNo = null) => {
    const status = determineStatus(dbApp.timeline, dbApp.concernedOfficer);
    const pendingDays = calculatePendingDays(dbApp.applicationDate, status);

    return {
      applicationId: dbApp.applicantId,
      sNo: originalSNo,
      dateOfApplication: dbApp.applicationDate.split("T")[0],
      applicantName: dbApp.applicant,
      subject: dbApp.subject,
      gpBlock: dbApp.block,
      issueDate: dbApp.applicationDate.split("T")[0],
      attachment: dbApp.attachment ? `http://localhost:5000${dbApp.attachment}` : null,
      concernedOfficer: dbApp.concernedOfficer || "N/A",
      timeline: Array.isArray(dbApp.timeline) ? dbApp.timeline : [],
      status,
      pendingDays,
    };
  };

  // ---------- API calls ----------
  const fetchApplication = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/${data.applicationId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const dbApp = await res.json();

      const status = determineStatus(dbApp.timeline, dbApp.concernedOfficer);
      const pendingDays = calculatePendingDays(dbApp.applicationDate, status);

      const uiApp = {
        ...data,
        applicationId: dbApp.applicantId,
        applicantName: dbApp.applicant,
        dateOfApplication: dbApp.applicationDate.split("T")[0],
        description: dbApp.subject,
        gpBlock: dbApp.block,
        mobileNumber: dbApp.phoneNumber,
        email: dbApp.emailId,
        issueDate: dbApp.applicationDate.split("T")[0],
        status,
        concernedOfficer: dbApp.concernedOfficer,
        pendingDays,
        pdfLink: dbApp.attachment ? `http://localhost:5000${dbApp.attachment}` : null,
        timeline:
          dbApp.timeline && dbApp.timeline.length > 0
            ? dbApp.timeline
            : [
                {
                  section: "Application Received",
                  comment: `Application received on ${dbApp.applicationDate?.split("T")[0] || "N/A"}`,
                  date: dbApp.applicationDate?.split("T")[0] || "N/A",
                  pdfLink: dbApp.attachment ? `http://localhost:5000${dbApp.attachment}` : null,
                  department: "N/A",
                  officer: "N/A",
                },
              ],
      };

      setApplicationData(uiApp);

      // Pre-fill selects
      if (dbApp.concernedOfficer && dbApp.concernedOfficer !== "N/A") {
        const typeKey = Object.keys(optionsByType).find((t) =>
          optionsByType[t].some((o) => o.value === dbApp.concernedOfficer)
        );
        if (typeKey) {
          setSelectedType({ value: typeKey, label: typeKey });
          setSelectedOption(
            optionsByType[typeKey].find((o) => o.value === dbApp.concernedOfficer) || {
              value: "",
              label: "Select an option",
            }
          );
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  }, [data.applicationId]);

  const assignWork = async () => {
    if (!selectedType?.value || !selectedOption?.value) return;

    setIsSaving(true);
    const form = new FormData();
    form.append("concernedOfficer", selectedOption.value);
    form.append("status", "In Process");
    if (assignmentNote) form.append("note", assignmentNote);
    if (selectedType.label) form.append("department", selectedType.label);
    if (uploadedFile?.file) form.append("file", uploadedFile.file);

    try {
      const res = await fetch(`${API_BASE}/${data.applicationId}/assign`, {
        method: "PATCH",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to assign");
      }
      const updatedDbApp = await res.json();

      // Update local modal state
      const status = determineStatus(updatedDbApp.timeline, updatedDbApp.concernedOfficer);
      const pendingDays = calculatePendingDays(updatedDbApp.applicationDate, status);

      setApplicationData((prev) => ({
        ...prev,
        concernedOfficer: updatedDbApp.concernedOfficer,
        status,
        pendingDays,
        pdfLink: updatedDbApp.attachment ? `http://localhost:5000${updatedDbApp.attachment}` : prev.pdfLink,
        timeline: updatedDbApp.timeline,
      }));

      setSaveSuccess(true);

      // INSTANT UPDATE + CLOSE
      setTimeout(() => {
        setSaveSuccess(false);
        // SEND UPDATED ROW TO PARENT
        onUpdate?.(mapDbAppToTableRow(updatedDbApp, data.sNo));
        
      }, 1500);

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
      setUploadedFile(null);
      setAssignmentNote("");
      setSelectedType({ value: "", label: "Select a type" });
      setSelectedOption({ value: "", label: "Select an option" });
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // ---------- Handlers ----------
  const handleTypeChange = (opt) => {
    setSelectedType(opt || { value: "", label: "Select a type" });
    setSelectedOption({ value: "", label: "Select an option" });
    setErrorMessage("");
  };

  const handleOptionChange = (opt) => {
    setSelectedOption(opt || { value: "", label: "Select an option" });
    setErrorMessage("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setErrorMessage("File size > 5 MB");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
      return setErrorMessage("Only PDF/JPEG/PNG");
    setUploadedFile({ file, name: file.name, url: URL.createObjectURL(file) });
    setErrorMessage("");
  };

  const handleSaveAssignment = () => {
    if (!selectedType?.value) return setErrorMessage("Select a type");
    if (!selectedOption?.value) return setErrorMessage(`Select a ${selectedType.value.toLowerCase()}`);
    if (selectedOption.value === applicationData.concernedOfficer)
      return setErrorMessage("Already assigned to this officer");
    setModalState({ type: "confirm", isOpen: true });
  };

  const confirmSave = () => {
    setModalState({ type: null, isOpen: false });
    assignWork();
  };

  // ---------- UI helpers ----------
  const getStatusStyle = (status) => {
    const map = {
      "Not Assigned Yet": { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <Loader2 size={20} /> },
      "In Process": { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-500 text-white" },
      Compliance: { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> },
      Dismissed: { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> },
      Disposed: { bg: "bg-purple-100", text: "text-purple-700", badge: "bg-purple-500 text-white", icon: <CheckCircle size={20} /> },
    };
    return map[status] || map["Not Assigned Yet"];
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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

  // ---------- Modals ----------
  const ConfirmModal = ({ onConfirm, onCancel, children }) => (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {children}
        <div className="mt-6 flex gap-4 justify-center">
          <motion.button
            className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-sm font-['Montserrat']"
            onClick={onConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Confirm
          </motion.button>
          <motion.button
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm font-['Montserrat']"
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

  // ---------- Render ----------
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
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Application ID: <span className="text-green-800">{applicationData.applicationId}</span>
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

        {/* Assign Work */}
        <motion.div className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assign Work</h3>

          {/* Current status badge */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600">Current Status</span>
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

          {/* Type → Officer selects */}
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Select Type</span>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Select
                  options={types}
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full sm:w-40 text-sm"
                  placeholder="Select a type"
                  isClearable
                  isSearchable
                  isDisabled={["Disposed", "Compliance"].includes(applicationData.status)}
                  styles={selectStyles}
                />
                <AnimatePresence>
                  {selectedType?.value && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      <Select
                        options={optionsByType[selectedType.value] || []}
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className="w-full sm:w-80 text-sm"
                        placeholder={`Select a ${selectedType.value.toLowerCase()}`}
                        isClearable
                        isSearchable
                        isDisabled={["Disposed", "Compliance"].includes(applicationData.status)}
                        styles={selectStyles}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Note */}
            <div>
              <span className="text-sm font-medium text-gray-600">Assignment Note</span>
              <textarea
                placeholder="Enter your assignment note"
                rows={4}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                className={`w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm ${["Disposed", "Compliance"].includes(applicationData.status) ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                disabled={["Disposed", "Compliance"].includes(applicationData.status)}
              />
            </div>

            {/* File upload */}
            <div>
              <span className="text-sm font-medium text-gray-600">Upload Document (Optional)</span>
              <label
                className={`flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-xl transition bg-white shadow-sm ${["Disposed", "Compliance"].includes(applicationData.status)
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:border-green-500"
                  }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={["Disposed", "Compliance"].includes(applicationData.status)}
                />
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUpload
                    className={
                      ["Disposed", "Compliance"].includes(applicationData.status)
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

            {/* Save button */}
            <motion.button
              onClick={handleSaveAssignment}
              disabled={
                isSaving ||
                !selectedType?.value ||
                !selectedOption?.value ||
                ["Disposed", "Compliance"].includes(applicationData.status)
              }
              className={`w-full py-2.5 text-sm font-semibold rounded-xl shadow-sm transition ${isSaving ||
                !selectedType?.value ||
                !selectedOption?.value ||
                ["Disposed", "Compliance"].includes(applicationData.status)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
              whileHover={{
                scale:
                  isSaving ||
                    !selectedType?.value ||
                    !selectedOption?.value ||
                    ["Disposed", "Compliance"].includes(applicationData.status)
                    ? 1
                    : 1.05,
              }}
              whileTap={{
                scale:
                  isSaving ||
                    !selectedType?.value ||
                    !selectedOption?.value ||
                    ["Disposed", "Compliance"].includes(applicationData.status)
                    ? 1
                    : 0.95,
              }}
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

            {/* Success / error */}
            {saveSuccess && (
              <motion.p
                className="text-green-600 text-sm flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FaCheckCircle /> Assignment saved! Updating...
              </motion.p>
            )}
            {errorMessage && (
              <motion.p
                className="text-red-600 text-sm flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <XCircle size={16} /> {errorMessage}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Timeline toggle */}
        <motion.button
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <FaHistory /> {isTimelineOpen ? "Hide Application Timeline" : "Show Application Timeline"}
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
              {applicationData.timeline?.length > 0 ? (
                <div className="relative space-y-4">
                  {applicationData.timeline.map((item, idx) => {
                    const isLast = idx === applicationData.timeline.length - 1;
                    const isCompleted =
                      idx < applicationData.timeline.length - 1 ||
                      item.section.toLowerCase().includes("compliance") ||
                      item.section.toLowerCase().includes("disposed");
                    const dotClass = isCompleted
                      ? item.section.toLowerCase().includes("disposed")
                        ? "bg-purple-600 border-2 border-white"
                        : "bg-green-600 border-2 border-white"
                      : applicationData.status === "Not Assigned Yet"
                        ? "bg-gray-500"
                        : item.section.toLowerCase().includes("dismissed")
                          ? "bg-red-600"
                          : "bg-blue-600";

                    return (
                      <div key={idx} className="relative flex items-start pl-10">
                        <div
                          className={`absolute left-0 top-0 w-6 h-6 ${dotClass} rounded-full shadow-md z-10 flex items-center justify-center`}
                        >
                          {isCompleted && <CheckCircle size={18} className="text-white" />}
                        </div>
                        <div
                          className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${isLast ? "bg-transparent" : "bg-green-300"
                            }`}
                        />
                        <div
                          className={`w-full p-4 rounded-lg border transition-all ${isLast
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
                              className="text-green-600 hover:text-green-800 transition-colors text-sm mt-1 flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <FaFilePdf /> View Document
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
                <p className="text-sm italic text-gray-500">No timeline entries yet.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details button */}
        <motion.button
          onClick={() => setModalState({ type: "details", isOpen: true })}
          className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <FaInfoCircle /> Show Application Details
        </motion.button>

        {/* Details modal */}
        <AnimatePresence>
          {modalState.isOpen && modalState.type === "details" && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Application Details</h3>
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
                    { label: "Issue Date", value: applicationData.issueDate, icon: <Calendar className="w-5 h-5 text-green-600" /> },
                  ].map((item, i) => (
                    <motion.div key={i} className="flex items-start gap-3">
                      {item.icon}
                      <div>
                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                        <p className="text-base font-medium text-gray-900">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}

                  <div className="sm:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Description</span>
                    <p className="text-base font-medium text-gray-900">{applicationData.description}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Status</span>
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
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
                    <p className="text-base font-medium text-gray-900">{applicationData.concernedOfficer}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Pending Days</span>
                    <p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${applicationData.pendingDays === 0
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
                    <div className="sm:col-span-2">
                      <motion.a
                        href={applicationData.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaFilePdf /> View Attached Document
                      </motion.a>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Confirm modal */}
          {modalState.isOpen && modalState.type === "confirm" && (
            <ConfirmModal
              onConfirm={confirmSave}
              onCancel={() => setModalState({ type: null, isOpen: false })}
            >
              <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Assignment</h3>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Assign to <span className="font-semibold text-green-700">{selectedOption?.label}</span> (
                {selectedType?.label})?
              </p>
            </ConfirmModal>
          )}
        </AnimatePresence>

        {/* Inline CSS */}
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
          .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
          .backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default AssigningWork;