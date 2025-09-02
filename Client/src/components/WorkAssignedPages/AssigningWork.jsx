import React, { useState, useEffect } from "react";
import { FaFilePdf, FaUpload, FaSpinner, FaCheckCircle, FaHistory, FaEdit, FaInfoCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const AssigningWork = ({ data, onClose }) => {
  // State management
  const [selectedType, setSelectedType] = useState({
    value: "",
    label: "Select a type",
  });
  const [selectedOption, setSelectedOption] = useState({
    value: data.concernedOfficer || "",
    label: data.concernedOfficer || "Select an option",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assignmentNote, setAssignmentNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [applicationData, setApplicationData] = useState(data);
  const [editIndex, setEditIndex] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editOption, setEditOption] = useState(null);
  const [editNote, setEditNote] = useState("");

  // Type options
  const types = [
    { value: "Department", label: "Department" },
    { value: "Sub Division", label: "Sub Division" },
    { value: "Block", label: "Block" },
  ];

  // Options for each type
  const optionsByType = {
    Department: [
      { value: "Inspection from committee (Director DRDA Accounts, DC Ranjay, Mis Santosh)", label: "DRDA Committee" },
      { value: "Director Accounts, DRDA", label: "Director Accounts, DRDA" },
      { value: "Complainant & Related (RDD, Patna)", label: "RDD, Patna" },
      { value: "Senior Charged Officer, Sandesh cum DTO Bhojpur", label: "Senior Charged Officer, Sandesh" },
      { value: "Hearing dt. 20-06-2025", label: "Hearing Committee" },
      { value: "Inspection from committee (DMWO, Senior Charged Officer, Sahpur Hina madam cum and MIS Pmay G)", label: "DMWO Committee" },
      { value: "Hearing Of Awas Sahayak and Complainer", label: "Awas Sahayak Hearing" },
      { value: "Hearing Of Awas Sahayak, Awas Parwechhak Mukhiya and Complainer", label: "Awas Sahayak and Mukhiya Hearing" },
    ],
    SubDivision: [
      { value: "Ara", label: "Ara" },
      { value: "Jagdishpur", label: "Jagdishpur" },
      { value: "Piro", label: "Piro" },
      { value: "Udwantnagar", label: "Udwantnagar" },
    ],
    Block: [
      { value: "BDO, Barhara", label: "BDO, Barhara" },
      { value: "BDO Sandesh & CO Sandesh", label: "BDO Sandesh & CO Sandesh" },
      { value: "BDO Ara Sadar", label: "BDO Ara Sadar" },
      { value: "BDO Shahpur", label: "BDO Shahpur" },
      { value: "RDO Mohsin Khan", label: "RDO Mohsin Khan" },
      { value: "BDO Tarari", label: "BDO Tarari" },
    ],
  };

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
    if (!concernedOfficer || concernedOfficer === "N/A" || concernedOfficer === "") {
      return "Not Assigned Yet";
    }
    if (!timeline || timeline.length === 0) return "In Process";
    const latestEntry = timeline[timeline.length - 1].section.toLowerCase();
    if (latestEntry.includes("compliance")) return "Compliance";
    if (latestEntry.includes("dismissed")) return "Dismissed";
    if (latestEntry.includes("closed")) return "Closed";
    return "In Process";
  };

  // Update application data from localStorage
  const updateApplicationData = () => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const matchedApp = storedApplications.find((app) => app.ApplicantId === data.applicationId);
    if (matchedApp) {
      const status = determineStatus(matchedApp.timeline, matchedApp.concernedOfficer);
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
      // Set initial type and option based on concernedOfficer
      const officer = matchedApp.concernedOfficer;
      if (officer) {
        const foundType = Object.keys(optionsByType).find((type) =>
          optionsByType[type].some((opt) => opt.value === officer)
        );
        if (foundType) {
          setSelectedType({ value: foundType, label: foundType });
          const foundOption = optionsByType[foundType].find((opt) => opt.value === officer);
          setSelectedOption(foundOption || { value: "", label: "Select an option" });
        }
      }
    }
  };

  // Real-time localStorage updates and Escape key listener
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

  // Handle type selection
  const handleTypeChange = (option) => {
    setSelectedType(option || { value: "", label: "Select a type" });
    setSelectedOption({ value: "", label: "Select an option" }); // Reset option when type changes
    setSaveSuccess(false);
    setErrorMessage("");
  };

  // Handle option selection
  const handleOptionChange = (option) => {
    setSelectedOption(option || { value: "", label: "Select an option" });
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
    if (!selectedType?.value) {
      setErrorMessage("Please select a type.");
      return;
    }
    if (!selectedOption?.value) {
      setErrorMessage(`Please select a ${selectedType.value.toLowerCase()}.`);
      return;
    }
    if (selectedOption.value === applicationData.concernedOfficer) {
      setErrorMessage(`Selected ${selectedType.value.toLowerCase()} is already assigned.`);
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
              concernedOfficer: selectedOption.value,
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
                  section: selectedOption.label,
                  comment: assignmentNote || `Assigned to ${selectedType.value.toLowerCase()}`,
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
        concernedOfficer: selectedOption.value,
        status: determineStatus(
          [
            ...(prev.timeline || [
              {
                section: "Application Received",
                comment: `Application received at ${prev.gpBlock || "N/A"} on ${prev.dateOfApplication}`,
                date: prev.dateOfApplication,
                pdfLink: prev.pdfLink || null,
              },
            ]),
            {
              section: selectedOption.label,
              comment: assignmentNote || `Assigned to ${selectedType.value.toLowerCase()}`,
              date: new Date().toLocaleDateString("en-GB"),
              pdfLink: uploadedFile?.url || null,
            },
          ],
          selectedOption.value
        ),
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
            section: selectedOption.label,
            comment: assignmentNote || `Assigned to ${selectedType.value.toLowerCase()}`,
            date: new Date().toLocaleDateString("en-GB"),
            pdfLink: uploadedFile?.url || null,
          },
        ],
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setSelectedType({ value: "", label: "Select a type" });
      setSelectedOption({ value: "", label: "Select an option" });
      setAssignmentNote("");
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Handle close application
  const handleCloseApplication = () => {
    setIsCloseConfirmOpen(true);
  };

  // Confirm close
  const confirmClose = () => {
    setIsSaving(true);
    setIsCloseConfirmOpen(false);
    setTimeout(() => {
      const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApplications = storedApplications.map((app) =>
        app.ApplicantId === applicationData.applicationId
          ? {
              ...app,
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
                  section: "Closed",
                  comment: `Application closed on ${new Date().toLocaleDateString("en-GB")}`,
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
        status: "Closed",
        pendingDays: 0,
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
            section: "Closed",
            comment: `Application closed on ${new Date().toLocaleDateString("en-GB")}`,
            date: new Date().toLocaleDateString("en-GB"),
            pdfLink: uploadedFile?.url || null,
          },
        ],
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Handle edit timeline entry
  const handleEditTimeline = (index, entry) => {
    setEditIndex(index);
    const foundType = Object.keys(optionsByType).find((type) =>
      optionsByType[type].some((opt) => opt.label === entry.section)
    );
    setEditType(
      foundType ? { value: foundType, label: foundType } : { value: "", label: "Select a type" }
    );
    setEditOption(
      foundType
        ? optionsByType[foundType].find((opt) => opt.label === entry.section) || {
            value: "",
            label: "Select an option",
          }
        : { value: "", label: "Select an option" }
    );
    setEditNote(entry.comment);
    setIsEditConfirmOpen(true);
  };

  // Handle edit type change
  const handleEditTypeChange = (option) => {
    setEditType(option || { value: "", label: "Select a type" });
    setEditOption({ value: "", label: "Select an option" }); // Reset option when type changes
  };

  // Confirm edit
  const confirmEdit = () => {
    if (!editType?.value) {
      setErrorMessage("Please select a type for editing.");
      return;
    }
    if (!editOption?.value) {
      setErrorMessage(`Please select a ${editType.value.toLowerCase()} for editing.`);
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
              concernedOfficer: editOption.value,
              status: determineStatus(
                app.timeline.map((entry, idx) =>
                  idx === editIndex
                    ? {
                        ...entry,
                        section: editOption.label,
                        comment: editNote || `Assigned to ${editType.value.toLowerCase()}`,
                        date: new Date().toLocaleDateString("en-GB"),
                        pdfLink: uploadedFile?.url || entry.pdfLink,
                      }
                    : entry
                ),
                editOption.value
              ),
              timeline: app.timeline.map((entry, idx) =>
                idx === editIndex
                  ? {
                      ...entry,
                      section: editOption.label,
                      comment: editNote || `Assigned to ${editType.value.toLowerCase()}`,
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
        concernedOfficer: editOption.value,
        status: determineStatus(
          prev.timeline.map((entry, idx) =>
            idx === editIndex
              ? {
                  ...entry,
                  section: editOption.label,
                  comment: editNote || `Assigned to ${editType.value.toLowerCase()}`,
                  date: new Date().toLocaleDateString("en-GB"),
                  pdfLink: uploadedFile?.url || entry.pdfLink,
                }
              : entry
          ),
          editOption.value
        ),
        timeline: prev.timeline.map((entry, idx) =>
          idx === editIndex
            ? {
                ...entry,
                section: editOption.label,
                comment: editNote || `Assigned to ${editType.value.toLowerCase()}`,
                date: new Date().toLocaleDateString("en-GB"),
                pdfLink: uploadedFile?.url || entry.pdfLink,
              }
            : entry
        ),
      }));
      setIsSaving(false);
      setSaveSuccess(true);
      setEditIndex(null);
      setEditType(null);
      setEditOption(null);
      setEditNote("");
      setUploadedFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Not Assigned Yet":
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <Loader2 size={20} /> };
      case "In Process":
        return { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600 text-white", icon: <FaSpinner className="animate-spin-slow" size={20} /> };
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
            Application Id: <span className="text-green-700">{applicationData.applicationId}</span>
          </h2>
          <div className="flex gap-2">
            {applicationData.status !== "Closed" && (
              <motion.button
                onClick={handleCloseApplication}
                className="text-gray-500 hover:text-red-600 text-xl transition-colors"
                aria-label="Close application"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IoClose />
              </motion.button>
            )}
            <motion.button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 text-xl transition-colors"
              aria-label="Close dialog"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IoClose />
            </motion.button>
          </div>
        </div>

        {/* Assigning Work Section */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">Assign Work</h3>
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
                  aria-label="Select type for assignment"
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
                        isDisabled={applicationData.status === "Closed"}
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
                        aria-label={`Select ${selectedType.value.toLowerCase()} for assignment`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  onClick={handleSaveAssignment}
                  disabled={isSaving || !selectedType?.value || !selectedOption?.value || applicationData.status === "Closed"}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition font-['Montserrat'] ${
                    isSaving || !selectedType?.value || !selectedOption?.value || applicationData.status === "Closed"
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Save assignment"
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
              <textarea
                placeholder="Add assignment notes (optional)"
                rows={3}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                disabled={applicationData.status === "Closed"}
                className="w-full mt-4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 transition font-['Montserrat'] shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                aria-label="Assignment notes"
              />
              {saveSuccess && (
                <motion.p
                  className="text-green-600 text-sm flex items-center gap-2 mt-2 font-['Montserrat']"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaCheckCircle /> Action saved successfully!
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
              <label
                className={`flex items-center justify-center w-full h-24 mt-2 border-2 border-dashed border-gray-300 rounded-lg transition bg-white shadow-sm ${
                  applicationData.status === "Closed" ? "cursor-not-allowed" : "cursor-pointer hover:border-green-600"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={applicationData.status === "Closed"}
                  aria-label="Upload document"
                />
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUpload className={applicationData.status === "Closed" ? "text-gray-400" : "text-green-600"} />
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
                            : "bg-blue-600";
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
                                {idx !== 0 && idx === applicationData.timeline.length - 1 && applicationData.status !== "Closed" && (
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
                          applicationData.pendingDays === 0
                            ? "bg-green-600 text-white"
                            : applicationData.pendingDays <= 10
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
                  <span className="font-semibold text-green-700">{selectedOption?.label}</span> ({selectedType?.label})?
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

        {/* Close Confirmation Modal */}
        <AnimatePresence>
          {isCloseConfirmOpen && (
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
                <h3 className="text-lg font-semibold text-gray-900 text-center font-['Montserrat']">Confirm Closure</h3>
                <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">
                  Are you sure you want to close this application? This will update its status to "Closed".
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-['Montserrat'] shadow-sm"
                    onClick={confirmClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Confirm closure"
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-['Montserrat'] shadow-sm"
                    onClick={() => setIsCloseConfirmOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel closure"
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
                <p className="text-sm text-gray-600 mt-2 text-center font-['Montserrat']">Modify the type, option, and note.</p>
                <div className="mt-4 space-y-4">
                  <Select
                    options={types}
                    value={editType}
                    onChange={handleEditTypeChange}
                    className="w-full text-sm"
                    placeholder="Select a type"
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
                    aria-label="Select type for editing"
                  />
                  {editType?.value && (
                    <Select
                      options={optionsByType[editType.value] || []}
                      value={editOption}
                      onChange={(option) =>
                        setEditOption(option || { value: "", label: "Select an option" })
                      }
                      className="w-full text-sm"
                      placeholder={`Select a ${editType.value.toLowerCase()}`}
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
                      aria-label={`Select ${editType.value.toLowerCase()} for editing`}
                    />
                  )}
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