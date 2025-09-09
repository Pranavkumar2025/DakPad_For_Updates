import React, { useState, useEffect } from "react";
import { File, PlusCircle, User, Calendar, Edit, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddCaseForm from "../components/AddCaseForm";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// DropdownButton Component (reused from AddCaseForm)
const DropdownButton = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 flex justify-between items-center focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// EditCaseForm Component
const EditCaseForm = ({ isOpen, onClose, editApplication }) => {
  const [formData, setFormData] = useState({
    ApplicantId: editApplication?.ApplicantId || "",
    applicant: editApplication?.applicant || "",
    applicationDate: editApplication?.applicationDate || "",
    block: editApplication?.block || "",
    sourceAt: editApplication?.sourceAt || "",
    phoneNumber: editApplication?.phoneNumber || "",
    emailId: editApplication?.emailId || "",
    subject: editApplication?.subject || "",
    attachment: editApplication?.attachment ? { name: editApplication.attachment } : null,
  });
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (editApplication) {
      setFormData({
        ApplicantId: editApplication.ApplicantId,
        applicant: editApplication.applicant,
        applicationDate: editApplication.applicationDate,
        block: editApplication.block || "",
        sourceAt: editApplication.sourceAt,
        phoneNumber: editApplication.phoneNumber,
        emailId: editApplication.emailId,
        subject: editApplication.subject,
        attachment: editApplication.attachment ? { name: editApplication.attachment } : null,
      });
    }
  }, [editApplication]);

  const validate = () => {
    const newErrors = {};
    if (!formData.applicant.trim()) newErrors.applicant = "Name is required";
    if (!formData.applicationDate) newErrors.applicationDate = "Date is required";
    if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Enter valid 10-digit phone number";
    if (!/\S+@\S+\.\S+/.test(formData.emailId)) newErrors.emailId = "Enter a valid email";
    if (!formData.sourceAt) newErrors.sourceAt = "Please select a source";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.block) newErrors.block = "Please select a block";
    if (!formData.attachment) newErrors.attachment = "Please upload a file";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment" && files[0]) {
      if (files[0].type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, attachment: "Please upload a PDF file" }));
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachment: "File size must be less than 5MB" }));
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "attachment" ? files[0] : value,
    }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, attachment: null }));
    setErrors((prev) => ({ ...prev, attachment: null }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, attachment: "Please upload a PDF file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachment: "File size must be less than 5MB" }));
        return;
      }
      setFormData((prev) => ({ ...prev, attachment: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const updatedApplication = {
        ApplicantId: formData.ApplicantId,
        applicant: formData.applicant,
        applicationDate: formData.applicationDate,
        block: formData.block,
        sourceAt: formData.sourceAt,
        phoneNumber: formData.phoneNumber,
        emailId: formData.emailId,
        subject: formData.subject,
        attachment: formData.attachment ? formData.attachment.name : "No file",
      };
      const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApplications = storedApplications.map((app) =>
        app.ApplicantId === formData.ApplicantId ? updatedApplication : app
      );
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      onClose(updatedApplication);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl p-6 relative border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4 text-[#ff5010] tracking-tight font-['Montserrat']">
          Edit Application
        </h2>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors duration-200"
          onClick={() => onClose(null)}
          aria-label="Close edit form"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-xs mb-3">
          Application ID: <span className="text-xs font-medium text-gray-600">{formData.ApplicantId}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Applicant Name</label>
              <input
                type="text"
                name="applicant"
                value={formData.applicant}
                onChange={handleInputChange}
                placeholder="Enter applicant name"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.applicant && <p className="text-red-500 text-xs mt-1">{errors.applicant}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Application Date</label>
              <input
                type="date"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleInputChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.applicationDate && (
                <p className="text-red-500 text-xs mt-1">{errors.applicationDate}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Phone Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#ff5010] transition-all duration-200">
                <span className="px-2 text-gray-500 text-sm">+91</span>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit number"
                  className="w-full p-2 text-sm rounded-lg focus:outline-none"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Email ID</label>
              <input
                type="text"
                name="emailId"
                value={formData.emailId}
                onChange={handleInputChange}
                placeholder="example@hello.com"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Source At</label>
              <DropdownButton
                label={formData.sourceAt || "Select Source"}
                items={[
                  {
                    label: "In-person",
                    onClick: () => setFormData((prev) => ({ ...prev, sourceAt: "in-person" })),
                  },
                  {
                    label: "MP/MLA",
                    onClick: () => setFormData((prev) => ({ ...prev, sourceAt: "mla" })),
                  },
                  {
                    label: "Whatsapp",
                    onClick: () => setFormData((prev) => ({ ...prev, sourceAt: "whatsapp" })),
                  },
                  {
                    label: "Email",
                    onClick: () => setFormData((prev) => ({ ...prev, sourceAt: "email" })),
                  },
                  {
                    label: "Newspaper",
                    onClick: () => setFormData((prev) => ({ ...prev, sourceAt: "newspaper" })),
                  },
                ]}
              />
              {errors.sourceAt && <p className="text-red-500 text-xs mt-1">{errors.sourceAt}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Block</label>
              <DropdownButton
                label={formData.block || "Select Block"}
                items={[
                  { label: "All", onClick: () => setFormData((prev) => ({ ...prev, block: "" })) },
                  {
                    label: "Barhara",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Barhara" })),
                  },
                  {
                    label: "Shahpur",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Shahpur" })),
                  },
                  {
                    label: "Ara Sadar",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Ara Sadar" })),
                  },
                  {
                    label: "Bagar, Tarari",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Bagar, Tarari" })),
                  },
                  {
                    label: "Sandesh",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Sandesh" })),
                  },
                  {
                    label: "Behea",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Behea" })),
                  },
                  {
                    label: "Sahar",
                    onClick: () => setFormData((prev) => ({ ...prev, block: "Sahar" })),
                  },
                ]}
              />
              {errors.block && <p className="text-red-500 text-xs mt-1">{errors.block}</p>}
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter subject"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
          </div>
          <div className="pt-4 pb-2">
            <label className="text-xs font-medium text-gray-600">Attach Application PDF</label>
            <div
              className={`w-full mt-1 p-4 bg-gray-50 rounded-lg border-2 border-dashed transition-all duration-200 ${isDragging ? "border-[#ff5010] bg-orange-50" : "border-gray-300 hover:border-[#ff5010]"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`w-10 h-10 ${isDragging ? "text-[#ff5010]" : "text-gray-400"} transition-colors duration-200`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                <h2 className="text-xs font-medium text-gray-500 text-center">
                  {isDragging ? "Drop your PDF here" : "Drag & drop a PDF or click to upload (max 5MB)"}
                </h2>
                <label className="relative">
                  <input
                    name="attachment"
                    onChange={handleInputChange}
                    type="file"
                    accept="application/pdf"
                    hidden
                  />
                  <div className="flex w-32 h-8 px-4 py-2 bg-[#ff5010] text-white rounded-full text-xs font-semibold items-center justify-center cursor-pointer hover:bg-[#e6490f] transition-colors duration-200">
                    Select PDF
                  </div>
                </label>
                {formData.attachment && (
                  <div className="flex items-center gap-2 mt-2 bg-gray-100 p-2 rounded-md w-full max-w-xs">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs text-gray-700 truncate flex-1">{formData.attachment.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 text-xs font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {errors.attachment && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.attachment}</p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-[#ff5010] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#e6490f] transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const ApplicationReceive = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editApplication, setEditApplication] = useState(null);
  const recordsPerPage = 10;

  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    setApplications(storedApplications);
  }, []);

  const handleEdit = (app) => {
    setEditApplication(app);
    setShowEditForm(true);
  };

  const handleEditClose = (updatedData) => {
    if (updatedData) {
      setApplications((prev) =>
        prev.map((app) => (app.ApplicantId === updatedData.ApplicantId ? updatedData : app))
      );
    }
    setShowEditForm(false);
    setEditApplication(null);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-20 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto mr-20">
          <Navbar
            userName="Siddharth Singh"
            userPosition="Application Receiver"
            logoLink="/application-receive"
          />
        </div>
        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-5 h-5 text-[#2810ff]" />
              Applications
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md text-md font-medium hover:bg-green-700 transition-colors"
              aria-label="Add Application"
            >
              <PlusCircle className="w-5 h-5" />
              Add Application
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <AddCaseForm
                  isOpen={showAddForm}
                  onClose={() => {
                    setShowAddForm(false);
                    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
                    setApplications(storedApplications);
                  }}
                />
              </motion.div>
            )}
            {showEditForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <EditCaseForm
                  isOpen={showEditForm}
                  onClose={handleEditClose}
                  editApplication={editApplication}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-200 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium w-12">No.</th>
                    <th className="px-4 py-3 font-medium w-24">ID</th>
                    <th className="px-4 py-3 font-medium min-w-[150px]">Applicant</th>
                    <th className="px-4 py-3 font-medium w-24">Block</th>
                    <th className="px-4 py-3 font-medium w-24">Source</th>
                    <th className="px-4 py-3 font-medium w-32">Phone</th>
                    <th className="px-4 py-3 font-medium min-w-[150px]">Email</th>
                    <th className="px-4 py-3 font-medium min-w-[200px]">Subject</th>
                    <th className="px-4 py-3 font-medium w-24">Attachment</th>
                    <th className="px-4 py-3 font-medium w-12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-500">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((app, index) => (
                      <motion.tr
                        key={app.ApplicantId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{indexOfFirstRecord + index + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs truncate">{app.ApplicantId}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{app.applicant}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                              <Calendar className="w-3 h-3" />
                              {app.applicationDate}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 truncate">{app.block || "N/A"}</td>
                        <td className="px-4 py-3 capitalize truncate">{app.sourceAt}</td>
                        <td className="px-4 py-3 truncate">{app.phoneNumber}</td>
                        <td className="px-4 py-3 truncate">{app.emailId}</td>
                        <td className="px-4 py-3 truncate">{app.subject}</td>
                        <td className="px-4 py-3">
                          {app.attachment && app.attachment !== "No file" ? (
                            <a
                              href={app.attachment}
                              className="flex items-center gap-1 text-[#103cff] hover:underline text-xs"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View attachment for ${app.applicant}`}
                            >
                              <File className="w-4 h-4" />
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleEdit(app)}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                            aria-label={`Edit application ${app.ApplicantId}`}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {applications.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, applications.length)} of{" "}
                {applications.length}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md text-sm ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  aria-label="Previous page"
                >
                  Previous
                </motion.button>
                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 rounded-md text-sm ${currentPage === i + 1 ? "bg-[#ff5010] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    whileHover={{ scale: currentPage === i + 1 ? 1 : 1.05 }}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md text-sm ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                  aria-label="Next page"
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApplicationReceive;