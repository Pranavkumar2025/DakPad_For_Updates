import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

// DropdownButton Component
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#ff5010 #f3f4f6",
            }}
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
    attachment: null,
  });
  const [randomId, setRandomId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const generateRandomId = () => {
    let id;
    const existingApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    do {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      id = `BP${randomNum}`;
    } while (existingApplications.some((app) => app.ApplicantId === id));
    return id;
  };

  useEffect(() => {
    setRandomId(generateRandomId());
  }, []);

  const generateQRCode = async (id, name, date) => {
    try {
      const qrData = {
        applicationId: id,
        applicantName: name,
        submissionDate: date,
        type: "DakPad Application",
        verificationUrl: `https://dakpad.com/verify/${id}`,
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.applicationDate)
      newErrors.applicationDate = "Date is required";
    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit phone number";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.source) newErrors.source = "Please select a source";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.block) newErrors.block = "Please select a block";
    if (!formData.attachment) newErrors.attachment = "Please upload a file";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/applications";

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const form = new FormData();
  form.append("applicantId", randomId);
  form.append("name", formData.name);
  form.append("applicationDate", formData.applicationDate);
  form.append("phone", formData.phone);
  form.append("email", formData.email);
  form.append("source", formData.source);
  form.append("subject", formData.subject);
  form.append("block", formData.block);
  if (formData.attachment) form.append("attachment", formData.attachment);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) setErrors(data.errors);
      else alert(data.message || "Error");
      return;
    }

    await generateQRCode(randomId, formData.name, formData.applicationDate);
    setShowModal(true);

    // Reset form
    setFormData({
      name: "",
      applicationDate: "",
      phone: "",
      email: "",
      source: "",
      subject: "",
      block: "",
      attachment: null,
    });
    setRandomId(generateRandomId());
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};



  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment" && files[0]) {
      if (files[0].type !== "application/pdf") {
        setErrors((prev) => ({
          ...prev,
          attachment: "Please upload a PDF file",
        }));
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachment: "File size must be less than 5MB",
        }));
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
        setErrors((prev) => ({
          ...prev,
          attachment: "Please upload a PDF file",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachment: "File size must be less than 5MB",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, attachment: file }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-[#ff5010] tracking-tight">
          Add New Application
        </h2>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors duration-200"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-5 h-5"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <p className="text-xs mb-3">
          Application ID:{" "}
          <span className="text-xs font-medium text-gray-600">{randomId}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Applicant Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter applicant name"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Application Date
              </label>
              <input
                type="date"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleInputChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.applicationDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.applicationDate}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#ff5010] transition-all duration-200">
                <span className="px-2 text-gray-500 text-sm">+91</span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit number"
                  className="w-full p-2 text-sm rounded-lg focus:outline-none"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Email ID
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@hello.com"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Source At
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              >
                <option value="" disabled>
                  Select source
                </option>
                <option value="in-person">In-person</option>
                <option value="mla">MP/MLA</option>
                <option value="whatsapp">Whatsapp</option>
                <option value="email">Email</option>
                <option value="newspaper">Newspaper</option>
              </select>
              {errors.source && (
                <p className="text-red-500 text-xs mt-1">{errors.source}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Block</label>
              <DropdownButton
                label={formData.block || "Select Block"}
                items={[
                  {
                    label: "All",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "" })),
                  },
                  {
                    label: "Agiaon",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Agiaon" })),
                  },
                  {
                    label: "Ara Sadar",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Ara Sadar" })),
                  },
                  {
                    label: "Barhara",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Barhara" })),
                  },
                  {
                    label: "Behea",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Behea" })),
                  },
                  {
                    label: "Charpokhari",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Charpokhari" })),
                  },
                  {
                    label: "Garhani",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Garhani" })),
                  },
                  {
                    label: "Jagdishpur",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Jagdishpur" })),
                  },
                  {
                    label: "Koilwar",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Koilwar" })),
                  },
                  {
                    label: "Piro",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Piro" })),
                  },
                  {
                    label: "Sahar",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Sahar" })),
                  },
                  {
                    label: "Sandesh",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Sandesh" })),
                  },
                  {
                    label: "Shahpur",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Shahpur" })),
                  },
                  {
                    label: "Tarari",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Tarari" })),
                  },
                  {
                    label: "Udwant Nagar",
                    onClick: () =>
                      setFormData((prev) => ({ ...prev, block: "Udwant Nagar" })),
                  },
                ]}
              />
              {errors.block && (
                <p className="text-red-500 text-xs mt-1">{errors.block}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter subject"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition-all duration-200"
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
              )}
            </div>
          </div>
          <div className="pt-4 pb-2">
            <label className="text-xs font-medium text-gray-600">
              Attach Application PDF
            </label>
            <div
              className={`w-full mt-1 p-4 bg-gray-50 rounded-lg border-2 border-dashed transition-all duration-200 ${isDragging
                ? "border-[#ff5010] bg-orange-50"
                : "border-gray-300 hover:border-[#ff5010]"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`w-10 h-10 ${isDragging ? "text-[#ff5010]" : "text-gray-400"
                    } transition-colors duration-200`}
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
                  {isDragging
                    ? "Drop your PDF here"
                    : "Drag & drop a PDF or click to upload (max 5MB)"}
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
                    <span className="text-xs text-gray-700 truncate flex-1">
                      {formData.attachment.name}
                    </span>
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
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.attachment}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full flex gap-4 mt-4">
            <button
              onClick={onClose}
              type="button"
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-[#ff5010] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#e6490f] transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-xl p-6 relative animate-scaleIn border-t-4 border-green-500">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={() => {
                setShowModal(false);
                setQrCodeUrl(null);
                onClose();
              }}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex flex-col items-center gap-4">
              <svg
                className="w-12 h-12 text-green-600 animate-check"
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
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                Application Submitted Successfully!
              </h2>

              <div className="w-full space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Your Application ID:
                  </p>
                  <p className="text-lg font-bold text-blue-600 break-all text-center">
                    {randomId}
                  </p>
                </div>

                {qrCodeUrl && (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      QR Code for Quick Access:
                    </p>
                    <div className="flex justify-center mb-3">
                      <img
                        src={qrCodeUrl}
                        alt="Application QR Code"
                        className="border rounded-lg shadow-sm w-32 h-32"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.download = `dakpad-application-${randomId}.png`;
                        link.href = qrCodeUrl;
                        link.click();
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Download QR Code
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 text-center">
                Please save your Application ID for future reference.
              </p>

              <button
                onClick={() => {
                  setShowModal(false);
                  setQrCodeUrl(null);
                  onClose();
                }}
                className="mt-3 bg-[#ff5010] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#e6490f] transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff5010, #fc641c);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default AddCaseForm;