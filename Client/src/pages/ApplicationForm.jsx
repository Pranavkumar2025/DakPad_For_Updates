import React, { useState } from 'react';
import axios from 'axios';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    applicantName: '',
    phone: '',
    title: '',
    description: '',
    table: '',
    dateOfApplication: '',
    caseType: '',
    department: '',
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    try {
      await axios.post('http://localhost:5000/api/cases', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Application submitted successfully!');
      setFormData({
        applicantName: '',
        phone: '',
        title: '',
        description: '',
        table: '',
        dateOfApplication: '',
        caseType: '',
        department: '',
        file: null,
      });
    } catch (error) {
      console.error(error);
      alert('Failed to submit application.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-[#13c2FF] mb-8 text-center">DakPad Application Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Applicant's Name</label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Table No</label>
              <input
                type="text"
                name="table"
                value={formData.table}
                onChange={handleChange}
                placeholder="e.g., Table A"
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Application</label>
              <input
                type="date"
                name="dateOfApplication"
                value={formData.dateOfApplication}
                onChange={handleChange}
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Case Type</label>
              <select
                name="caseType"
                value={formData.caseType}
                onChange={handleChange}
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              >
                <option value="">Select Case Type</option>
                <option value="CWJC">CWJC</option>
                <option value="MJC">MJC</option>
                <option value="SLP">SLP</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
              >
                <option value="">Select Department</option>
                <option value="Revenue">Revenue</option>
                <option value="Legal">Legal</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full border px-4 py-2 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload PDF (optional)</label>
            <input
              type="file"
              name="file"
              accept="application/pdf"
              onChange={handleChange}
              className="mt-1 block w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#13c2FF] hover:bg-[#0f9cd5] text-white py-2 rounded-md font-medium transition"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
