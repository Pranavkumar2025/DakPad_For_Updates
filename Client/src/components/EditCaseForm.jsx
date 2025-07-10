import React, { useEffect, useState } from 'react';

const EditCaseForm = ({ isOpen, onClose, applicationData }) => {
  const [formData, setFormData] = useState(applicationData || {});

  useEffect(() => {
    if (applicationData) setFormData(applicationData);
  }, [applicationData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Data:', formData);
    alert('✅ Application Updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#ff5010]">✏️ Edit Application</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Applicant Name */}
          <div>
            <label className="block text-gray-600 mb-1">Applicant Name</label>
            <input
              type="text"
              name="applicantName"
              value={formData.applicantName || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff5010]"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-600 mb-1">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-600 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-600 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="Compliance">Compliance</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          {/* Department IN/OUT */}
          <div>
            <label className="block text-gray-600 mb-1">Department IN/OUT</label>
            <select
              name="departmentInOut"
              value={formData.departmentInOut || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          {/* Conditional Send To Department */}
          {formData.departmentInOut === 'OUT' && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-600 mb-1">Send To Department</label>
              <input
                type="text"
                name="departmentSendTo"
                value={formData.departmentSendTo || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-400 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#ff5010] text-white px-6 py-2 rounded-md hover:bg-[#e64a0f] transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCaseForm;
