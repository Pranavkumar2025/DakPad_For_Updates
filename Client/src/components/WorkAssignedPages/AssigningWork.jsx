import React, { useState, useEffect } from "react";
import { FaFilePdf, FaUpload, FaSpinner, FaPaperPlane, FaCheckCircle, FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Select from "react-select";
import { Dialog, Transition } from "@headlessui/react";

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
  const [comment, setComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [assignmentNote, setAssignmentNote] = useState("");

  // List of unique departments from JSON
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
    if (selectedDepartment.value === data.concernedOfficer) {
      setErrorMessage("Selected department is already assigned.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // Confirm save
  const confirmSave = () => {
    setIsSaving(true);
    setIsConfirmOpen(false);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // In a real app, update data.concernedOfficer and add to timeline
    }, 1000);
  };

  // Clean up file URL
  useEffect(() => {
    return () => {
      if (uploadedFile?.url) {
        URL.revokeObjectURL(uploadedFile.url);
      }
    };
  }, [uploadedFile]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto py-8 px-10 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Application ID: <span className="text-green-700">{data.applicationId}</span>
          </h2>
          <button
            className="text-gray-500 hover:text-red-600 text-2xl transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <IoClose />
          </button>
        </div>

        {/* Applicant Details */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicant Details</h3>
        <div className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Sr. No</span>
                <p className="text-gray-900 font-medium">{data.sNo}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Applicant Name</span>
                <p className="text-gray-900 font-medium">{data.applicantName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Mobile No.</span>
                <p className="text-gray-900 font-medium">{data.mobileNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">GP, Block</span>
                <p className="text-gray-900 font-medium">{data.gpBlock}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Date of Application</span>
                <p className="text-gray-900 font-medium">{data.dateOfApplication}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email</span>
                <p className="text-gray-900 font-medium">{data.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Issue Letter No</span>
                <p className="text-gray-900 font-medium">{data.issueLetterNo}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Issue Date</span>
                <p className="text-gray-900 font-medium">{data.issueDate}</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Description</span>
              <p className="text-gray-900">{data.description}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <p>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                  <FaSpinner className="animate-spin-slow" /> {data.status}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
              <p className="text-gray-900 font-semibold">{data.concernedOfficer}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Pending Days</span>
              <p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    data.pendingDays <= 10
                      ? "bg-green-500 text-white"
                      : data.pendingDays <= 15
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {data.pendingDays}
                </span>
              </p>
            </div>
          </div>
          {data.pdfLink && (
            <a
              href={data.pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mt-4"
            >
              <FaFilePdf /> View Attached PDF
            </a>
          )}
        </div>

        {/* Assigning Work Section */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigning Work</h3>
        <div className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Current Status</span>
              <p className="text-gray-900 font-semibold">
                {data.timeline?.length > 0 ? data.timeline[data.timeline.length - 1].section : "No status available"}
              </p>
              <p className="text-xs text-gray-500">
                Last updated on {data.timeline?.length > 0 ? data.timeline[data.timeline.length - 1].date : data.issueDate}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Assigned Department</span>
              <div className="flex flex-col sm:flex-row items-center gap-4">
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
                      borderColor: "#e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#10b981" },
                      padding: "0.25rem",
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected ? "#10b981" : isFocused ? "#d1fae5" : "white",
                      color: isSelected ? "white" : "#1f2937",
                      cursor: "pointer",
                    }),
                  }}
                  aria-label="Select department for assignment"
                />
                <button
                  onClick={handleSaveAssignment}
                  disabled={isSaving || selectedDepartment?.value === data.concernedOfficer}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                    isSaving || selectedDepartment?.value === data.concernedOfficer
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  aria-label="Save department assignment"
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin-slow" /> Saving...
                    </>
                  ) : (
                    "Save Assignment"
                  )}
                </button>
              </div>
              <textarea
                placeholder="Add assignment notes (optional)"
                rows={2}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                aria-label="Assignment notes"
              />
              {saveSuccess && (
                <p className="text-green-600 text-sm flex items-center gap-2 mt-2">
                  <FaCheckCircle /> Department assignment saved successfully!
                </p>
              )}
              {errorMessage && (
                <p className="text-red-600 text-sm flex items-center gap-2 mt-2">
                  <FaCheckCircle className="rotate-45" /> {errorMessage}
                </p>
              )}
            </div>
            <div>
              <button
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
                aria-label="Toggle timeline"
              >
                <FaHistory /> {isTimelineOpen ? "Hide" : "Show"} Timeline
              </button>
              {isTimelineOpen && (
                <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200">
                  {data.timeline?.length > 0 ? (
                    <ul className="space-y-2">
                      {data.timeline.map((entry, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          <span className="font-semibold">{entry.section}</span> - {entry.comment} (
                          {entry.date})
                          {entry.pdfLink && (
                            <a
                              href={entry.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 ml-2"
                            >
                              View PDF
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No timeline entries available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Confirmation Modal */}
        <Transition show={isConfirmOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsConfirmOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              </Transition.Child>
              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    Confirm Department Assignment
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to assign this application to{" "}
                      <span className="font-semibold">{selectedDepartment?.label}</span>?
                    </p>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                      onClick={confirmSave}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Custom CSS for slow spin animation */}
        <style jsx>{`
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AssigningWork;