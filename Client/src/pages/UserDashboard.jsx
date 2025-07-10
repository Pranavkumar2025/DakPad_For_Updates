import React, { useState, useEffect } from 'react';
import { FaRegClock } from 'react-icons/fa';
import { GrCompliance } from 'react-icons/gr';
import { RiCloseCircleLine } from 'react-icons/ri';

import backimg from '../assets/back4.jpeg';
import UserNavbar from '../components/UserNavbar';
import casesData from '../JsonData/DataTable.json';
import AddCaseForm from '../components/AddCaseForm';
import EditCaseForm from '../components/EditCaseForm';
import UserSidebar from '../components/UserSidebar';

const UserDashboard = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [applicationIdInput, setApplicationIdInput] = useState('');
  const [foundApplication, setFoundApplication] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDownload = () => {
    if (!foundApplication) return;

    const content = `
    Application ID: ${foundApplication.applicationId}
    Applicant Name: ${foundApplication.applicantName}
    Mobile Number: ${foundApplication.mobileNumber}
    Email: ${foundApplication.email}
    Title: ${foundApplication.title}
    Description: ${foundApplication.description}
    Date of Application: ${foundApplication.dateOfApplication}
    Source: ${foundApplication.addAt}
    Status: ${foundApplication.status}
  `;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${foundApplication.applicationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setCases(casesData);
    setFilteredCases(casesData);
  }, []);

  useEffect(() => {
    const result = cases.filter(c =>
      c.applicantName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCases(result);
  }, [searchTerm, cases]);

  const getStatusBadge = (status) => {
    let color = '', icon = null;
    if (status === 'Pending') {
      color = 'bg-[#13c2FF]';
      icon = <FaRegClock />;
    } else if (status === 'Compliance') {
      color = 'bg-[#13B56C]';
      icon = <GrCompliance />;
    } else if (status === 'Dismissed') {
      color = 'bg-[#ff4d4f]';
      icon = <RiCloseCircleLine />;
    } else {
      color = 'bg-[#0969F9]';
    }

    return (
      <span className={`inline-flex items-center gap-2 text-white px-3 py-1 rounded-full text-xs ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  const handleApplicationIdSearch = () => {
    const match = cases.find(c => c.applicationId === applicationIdInput.trim());
    setFoundApplication(match || null);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed -z-10"
        style={{ backgroundImage: `url(${backimg})` }}
      />

      {/* Main Content */}
      <div className="flex min-h-screen bg-white/80 backdrop-blur-sm">
        <UserSidebar />

        <div className="flex-1">
          <div className="p-4">
            <UserNavbar />
          </div>

          <div className="flex-1 px-4 max-w-7xl mx-auto space-y-8 pb-10">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
              <div className="space-y-1 w-full lg:w-auto">
                <label className="block text-sm text-gray-600 font-medium">
                  Search by Name or Title
                </label>
                <input
                  type="text"
                  placeholder="Enter name or title..."
                  className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-md focus:ring-[#ff5010] w-full md:w-80 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2 w-full lg:w-auto">
                <div className="w-full">
                  <label className="block text-sm text-gray-600 mb-1">Search by Application ID</label>
                  <input
                    type="text"
                    value={applicationIdInput}
                    onChange={(e) => setApplicationIdInput(e.target.value)}
                    className="w-full md:w-64 border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
                    placeholder="e.g., APP-2025-001"
                  />
                </div>

                <button
                  onClick={handleApplicationIdSearch}
                  className="bg-[#ff5010] hover:bg-[#e6490f] text-white font-medium px-5 py-2 rounded-md shadow transition whitespace-nowrap"
                >
                  Check Status
                </button>
              </div>
            </div>

            {/* Application Found Modal */}
            {foundApplication && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-lg relative mx-4">
                  <button
                    onClick={() => setFoundApplication(null)}
                    className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500"
                  >
                    &times;
                  </button>

                  <h2 className="text-xl font-semibold text-[#ff5010] mb-4">📋 Application Details</h2>

                  <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Application ID</td><td className="px-4 py-2">{foundApplication.applicationId}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Applicant Name</td><td className="px-4 py-2">{foundApplication.applicantName}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Mobile Number</td><td className="px-4 py-2">{foundApplication.mobileNumber}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Email</td><td className="px-4 py-2">{foundApplication.email}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Title</td><td className="px-4 py-2">{foundApplication.title}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Description</td><td className="px-4 py-2">{foundApplication.description}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Date of Application</td><td className="px-4 py-2">{foundApplication.dateOfApplication}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Source</td><td className="px-4 py-2">{foundApplication.addAt}</td></tr>
                      <tr><td className="px-4 py-2 font-medium text-gray-600">Status</td><td className="px-4 py-2">{getStatusBadge(foundApplication.status)}</td></tr>
                    </tbody>
                  </table>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleDownload}
                      className="bg-[#ff5010] hover:bg-[#e6490f] text-white font-medium px-6 py-2 rounded-md shadow w-full sm:w-auto"
                    >
                      ⬇️ Download Your Application
                    </button>

                    {/* <button
                      onClick={() => setShowEditForm(true)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium px-6 py-2 rounded-md border border-blue-300 shadow w-full sm:w-auto"
                    >
                      ✏️ Edit this Application
                    </button> */}
                  </div>
                </div>
              </div>
            )}

            {/* Table View */}
            <div>
              <h2 className="text-2xl font-bold pb-6 text-gray-700">Application List</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md min-h-96 bg-white bg-opacity-80">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-100 text-gray-600 text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">Sr. No</th>
                      <th className="px-4 py-2 text-left">Applicant's Name</th>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Date of Application</th>
                      <th className="px-4 py-2 text-left">Source</th>
                      <th className="px-4 py-2 text-left">Last Update</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((caseItem, idx) => (
                      <tr key={caseItem.applicationId || idx} className="border-t border-gray-100 hover:bg-gray-50 cursor-default">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{caseItem.applicantName}</td>
                        <td className="px-4 py-2">{caseItem.title}</td>
                        <td className="px-4 py-2">{caseItem.dateOfApplication}</td>
                        <td className="px-4 py-2">{caseItem.addAt || '—'}</td>
                        <td className="px-4 py-2">{caseItem.lastActionDate || '—'}</td>
                        <td className="px-4 py-2">{getStatusBadge(caseItem.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Case Form */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <AddCaseForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
              </div>
            )}

            {/* Edit Case Form */}
            {showEditForm && foundApplication && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <EditCaseForm
                  isOpen={showEditForm}
                  onClose={() => setShowEditForm(false)}
                  applicationData={foundApplication}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
