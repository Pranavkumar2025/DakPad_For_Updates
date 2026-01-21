import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import api from "../utils/api";

// ──────────────────────────────────────────────────────────────
// DropdownButton (unchanged)
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
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#ff5010 #f3f4f6" }}
          >
            {items.map((item, i) => (
              <button
                key={i}
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

// ──────────────────────────────────────────────────────────────
const AddCaseForm = ({ isOpen, onClose }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    applicationDate: "",
    phone: "",
    email: "",
    source: "",
    subject: "",
    block: "",
  });
  const [selectedFile, setSelectedFile] = useState(null); // ← Actual File object
  const [randomId, setRandomId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique ID
  const generateRandomId = () => {
    let id;
    const existing = JSON.parse(localStorage.getItem("applications") || "[]");
    do {
      const num = Math.floor(10000 + Math.random() * 90000);
      id = `BP${num}`;
    } while (existing.some((a) => a.ApplicantId === id));
    return id;
  };

  useEffect(() => {
    setRandomId(generateRandomId());
  }, []);

  // QR Code
  const generateQRCode = async (id, name, date) => {
    try {
      const data = JSON.stringify({
        applicationId: id,
        applicantName: name,
        submissionDate: date,
        type: "DakPad Application",
        verificationUrl: `https://dakpad.com/verify/${id}`,
      });
      const url = await QRCode.toDataURL(data, { width: 256, margin: 2 });
      setQrCodeUrl(url);
    } catch (e) {
      console.error("QR Code generation failed:", e);
    }
  };

  // Validation
  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) e.name = "Name should not contain numbers or special characters";

    if (!formData.applicationDate) e.applicationDate = "Date is required";
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) e.phone = "Enter valid 10-digit phone number";
    if (formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) e.email = "Enter a valid email address";
    if (!formData.source) e.source = "Please select a source";
    if (!formData.subject.trim()) e.subject = "Subject is required";
    if (!formData.block) e.block = "Please select a block";

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      e.attachment = "File must be less than 10 MB";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit with actual file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const form = new FormData();
    form.append("applicantId", randomId);
    form.append("name", formData.name.trim());
    form.append("applicationDate", formData.applicationDate);
    if (formData.phone) form.append("phone", formData.phone);
    if (formData.email) form.append("email", formData.email);
    form.append("source", formData.source);
    form.append("subject", formData.subject.trim());
    form.append("block", formData.block);

    // Only append file if one is selected
    if (selectedFile) {
      form.append("attachment", selectedFile); // This sends the actual file
    }

    try {
      await api.post("/api/applications", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await generateQRCode(randomId, formData.name, formData.applicationDate);
      setShowModal(true);

      // Reset form
      setFormData({
        name: "", applicationDate: "", phone: "", email: "", source: "",
        subject: "", block: "",
      });
      setSelectedFile(null);
      setRandomId(generateRandomId());
      window.dispatchEvent(new Event("applicationUpdated"));
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else alert(data?.message || err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors((p) => ({ ...p, attachment: "Only PDF files are allowed" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((p) => ({ ...p, attachment: "File must be < 10 MB" }));
      return;
    }

    setSelectedFile(file);
    setErrors((p) => ({ ...p, attachment: undefined }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors((p) => ({ ...p, attachment: "Only PDF files are allowed" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((p) => ({ ...p, attachment: "File must be < 10 MB" }));
      return;
    }

    setSelectedFile(file);
    setErrors((p) => ({ ...p, attachment: undefined }));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrors((p) => ({ ...p, attachment: undefined }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl p-6 relative overflow-y-auto max-h-[95vh]">
        <h2 className="text-xl font-bold mb-4 text-[#ff5010] tracking-tight">
          Add New Application
        </h2>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-xs mb-3">
          Application ID: <span className="font-medium text-gray-600">{randomId}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* All your existing inputs (unchanged) */}
            <div>
              <label className="text-xs font-medium text-gray-600">Applicant Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="Enter applicant name"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Application Date *</label>
              <input type="date" name="applicationDate" value={formData.applicationDate} onChange={handleInputChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all" />
              {errors.applicationDate && <p className="text-red-500 text-xs mt-1">{errors.applicationDate}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Phone Number <span className="text-gray-400">(Optional)</span></label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#ff5010]">
                <span className="px-2 text-gray-500 text-sm">+91</span>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full p-2 text-sm rounded-lg focus:outline-none" />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Email ID <span className="text-gray-400">(Optional)</span></label>
              <input type="text" name="email" value={formData.email} onChange={handleInputChange}
                placeholder="example@hello.com"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Source At *</label>
              <select name="source" value={formData.source} onChange={handleInputChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all">
                <option value="" disabled>Select source</option>
                <option value="in-person">In-person</option>
                <option value="mla">MP/MLA</option>
                <option value="whatsapp">Whatsapp</option>
                <option value="email">Email</option>
                <option value="newspaper">Newspaper</option>
              </select>
              {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Block *</label>
              <DropdownButton
                label={formData.block || "Select Block"}
                items={[
                  { label: "Agiaon", onClick: () => setFormData(p => ({ ...p, block: "Agiaon" })) },
                  { label: "Ara Sadar", onClick: () => setFormData(p => ({ ...p, block: "Ara Sadar" })) },
                  { label: "Barhara", onClick: () => setFormData(p => ({ ...p, block: "Barhara" })) },
                  { label: "Behea", onClick: () => setFormData(p => ({ ...p, block: "Behea" })) },
                  { label: "Charpokhari", onClick: () => setFormData(p => ({ ...p, block: "Charpokhari" })) },
                  { label: "Garhani", onClick: () => setFormData(p => ({ ...p, block: "Garhani" })) },
                  { label: "Jagdishpur", onClick: () => setFormData(p => ({ ...p, block: "Jagdishpur" })) },
                  { label: "Koilwar", onClick: () => setFormData(p => ({ ...p, block: "Koilwar" })) },
                  { label: "Piro", onClick: () => setFormData(p => ({ ...p, block: "Piro" })) },
                  { label: "Sahar", onClick: () => setFormData(p => ({ ...p, block: "Sahar" })) },
                  { label: "Sandesh", onClick: () => setFormData(p => ({ ...p, block: "Sandesh" })) },
                  { label: "Shahpur", onClick: () => setFormData(p => ({ ...p, block: "Shahpur" })) },
                  { label: "Tarari", onClick: () => setFormData(p => ({ ...p, block: "Tarari" })) },
                  { label: "Udwant Nagar", onClick: () => setFormData(p => ({ ...p, block: "Udwant Nagar" })) },
                ]}
              />
              {errors.block && <p className="text-red-500 text-xs mt-1">{errors.block}</p>}
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Subject *</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                placeholder="Enter subject"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all" />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
          </div>

          {/* PDF Upload - Now uploads real file */}
          <div className="pt-4 pb-2">
            <label className="text-xs font-medium text-gray-600">
              Attach Application PDF <span className="text-gray-400">(Optional • Max 10 MB)</span>
            </label>
            <div
              className={`w-full mt-1 p-4 bg-gray-50 rounded-lg border-2 border-dashed transition-all ${isDragging ? "border-[#ff5010] bg-orange-50" : "border-gray-300 hover:border-[#ff5010]"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className={`w-10 h-10 ${isDragging ? "text-[#ff5010]" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <h2 className="text-xs font-medium text-gray-500 text-center">
                  {isDragging ? "Drop your PDF here" : "Drag & drop a PDF or click to select"}
                </h2>

                <label className="relative cursor-pointer">
                  <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
                  <div className="flex w-32 h-8 px-4 py-2 bg-[#ff5010] text-white rounded-full text-xs font-semibold items-center justify-center hover:bg-[#e6490f] transition-colors">
                    Select PDF
                  </div>
                </label>

                {selectedFile && (
                  <div className="flex items-center gap-2 mt-2 bg-green-50 border border-green-200 p-3 rounded-lg w-full max-w-md">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {errors.attachment && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{errors.attachment}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="w-full flex gap-4 mt-6">
            <button type="button" onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all ${isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#ff5010] hover:bg-[#e6490f]"
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-xl p-6 relative border-t-4 border-green-500">
              <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => { setShowModal(false); setQrCodeUrl(""); onClose(); }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col items-center gap-4">
                <svg className="w-12 h-12 text-green-600 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="text-xl font-bold text-gray-800">Application Submitted Successfully!</h2>

                <div className="w-full space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Your Application ID:</p>
                    <p className="text-2xl font-bold text-[#ff5010]">{randomId}</p>
                  </div>

                  {qrCodeUrl && (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-3 font-medium">Scan to Track Status</p>
                      <img src={qrCodeUrl} alt="QR Code" className="mx-auto border rounded-lg shadow-sm w-40 h-40" />
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = qrCodeUrl;
                          a.download = `dakpad-${randomId}-qr.png`;
                          a.click();
                        }}
                        className="mt-3 px-4 py-2 bg-[#ff5010] text-white rounded-lg hover:bg-[#e6490f] text-sm font-medium"
                      >
                        Download QR Code
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setShowModal(false); setQrCodeUrl(""); onClose(); }}
                  className="mt-4 bg-[#ff5010] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e6490f] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes check { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .animate-check { animation: check 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default AddCaseForm;