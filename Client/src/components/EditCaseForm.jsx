// src/components/ApplicationRecieveComponents/EditCaseForm.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api"; // <-- NEW: axios with cookies

const EditCaseForm = ({ isOpen, onClose, editApplication }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with parent
  useEffect(() => {
    if (editApplication) {
      setFormData(editApplication);
      setErrors({});
    }
  }, [editApplication]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.applicantName?.trim()) newErrors.applicantName = "Name is required";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber))
      newErrors.mobileNumber = "Enter 10-digit number";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await api.put(`/api/applications/${formData.ApplicantId}`, formData);

      // Notify parent & table
      onClose(res.data);
      window.dispatchEvent(new Event("applicationUpdated"));

      alert("Application updated successfully!");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else alert(data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#ff5010]">Edit Application</h2>
              <button
                onClick={() => onClose()}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold transition"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Applicant Name */}
              <div>
                <label className="block text-gray-600 mb-1">Applicant Name *</label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition"
                  required
                  disabled={isSubmitting}
                />
                {errors.applicantName && <p className="text-red-500 text-xs mt-1">{errors.applicantName}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-gray-600 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber || ""}
                  onChange={handleChange}
                  placeholder="10-digit"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={isSubmitting}
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-600 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5010]"
                  required
                  disabled={isSubmitting}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={isSubmitting}
                >
                  <option value="Pending">Pending</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Disposed">Disposed</option>
                </select>
              </div>

              {/* Department IN/OUT */}
              <div>
                <label className="block text-gray-600 mb-1">Department IN/OUT</label>
                <select
                  name="departmentInOut"
                  value={formData.departmentInOut || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={isSubmitting}
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>

              {/* Conditional Send To Department */}
              {formData.departmentInOut === "OUT" && (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-gray-600 mb-1">Send To Department</label>
                  <input
                    type="text"
                    name="departmentSendTo"
                    value={formData.departmentSendTo || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g. Public Works Department"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="border border-gray-400 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#ff5010] text-white px-6 py-2 rounded-md hover:bg-[#e64a0f] transition disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditCaseForm;