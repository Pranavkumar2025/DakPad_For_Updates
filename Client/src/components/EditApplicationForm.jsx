import React, { useState, useEffect } from 'react';

const EditApplicationForm = ({ isOpen, onClose, applicationData }) => {
  const [formData, setFormData] = useState(applicationData || {});

  useEffect(() => {
    if (applicationData) {
      setFormData(applicationData);
    }
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
    alert('✅ Application updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-8 relative shadow-xl">
        <h2 className="text-xl font-semibold text-[#ff5010] mb-4">📝 Edit Application</h2>

        <button
          className="absolute top-4 right-5 text-xl text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block mb-1 font-medium">Applicant Name</label>
            <input
              type="text"
              name="applicantName"
              value={formData.applicantName || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="Compliance">Compliance</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Department In/Out</label>
            <select
              name="departmentInOut"
              value={formData.departmentInOut || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-1 font-medium">Send To Department</label>
            <input
              type="text"
              name="departmentSendTo"
              value={formData.departmentSendTo || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
            />
          </div>

          <div className="col-span-2 flex gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-[#ff5010] text-white py-2 rounded-xl hover:bg-[#e6490f]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApplicationForm;
