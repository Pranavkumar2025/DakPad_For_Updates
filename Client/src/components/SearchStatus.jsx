import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import casesData from '../JsonData/DataTable.json';

const SearchStatus = () => {
  const [appId, setAppId] = useState('');
  const [application, setApplication] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const found = casesData.find(app =>
      app.applicationId.toLowerCase() === appId.toLowerCase()
    );
    if (found) {
      setApplication(found);
      setNotFound(false);
    } else {
      setApplication(null);
      setNotFound(true);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafafa] to-[#e7e7e7] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-2xl space-y-4">
        {/* Back Button Outside */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          ⬅ Go Back
        </button>

        {/* Main Box */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            🔍 Check Application Status
          </h1>

          {/* Search Area */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Enter your Application ID"
              className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5010] transition"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-5 py-3 bg-[#ff5010] hover:bg-[#e0480f] text-white rounded-md text-sm font-medium transition"
            >
              Search
            </button>
          </div>

          {/* Not Found */}
          {notFound && (
            <p className="text-center text-red-600 font-medium mt-2">
              ❌ No application found with ID: <span className="font-semibold">{appId}</span>
            </p>
          )}

          {/* Application Result */}
          {application && (
            <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-inner space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                📝 Application Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-medium">Application ID:</span> {application.applicationId}</div>
                <div><span className="font-medium">Applicant Name:</span> {application.applicantName}</div>
                <div><span className="font-medium">Title:</span> {application.title}</div>
                <div><span className="font-medium">Date of Application:</span> {application.dateOfApplication}</div>
                <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeColor(application.status)}`}
                  >
                    {application.status}
                  </span>
                </div>
                <div><span className="font-medium">Last Action:</span> {application.lastActionDate || '—'}</div>
                <div><span className="font-medium">Current Department:</span> {application.departmentSendTo || '—'}</div>
                <div>
                  <span className="font-medium">Department IN/OUT:</span>{' '}
                  <span
                    className={`font-semibold ${
                      application.departmentInOut === 'IN' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {application.departmentInOut}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchStatus;
