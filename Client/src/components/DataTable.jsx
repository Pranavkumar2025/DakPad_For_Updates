// Keep your import section the same
import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaRegClock } from 'react-icons/fa';
import { GrCompliance } from 'react-icons/gr';
import { RiCloseCircleLine, RiFileExcel2Fill, RiDeleteBin5Line } from 'react-icons/ri';
import DropdownButton from '../components/DropdownButton.jsx';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import axios from 'axios';

const statusOptions = ['Pending', 'Compliance', 'Dismissed'];

const DataTable = () => {
  const [cases, setCases] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [statusDropdownId, setStatusDropdownId] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cases');
      setCases(res.data);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setStatusDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRowClick = (row) => {
    setSelectedCase(row);
    setMessageText(row.adminMessage || '');
    setOpenDialog(true);
  };

const handleStatusChange = async (caseId, newStatus) => {
  try {
    const token = localStorage.getItem("adminToken");

    const response = await axios.put(
      `http://localhost:5000/api/cases/${caseId}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ Update UI locally
    setCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, status: newStatus } : c))
    );

    // ✅ Hide dropdown (if applicable)
    setStatusDropdownId(null);

    console.log("Status updated:", response.data);
  } catch (error) {
    console.error("Failed to update status:", error);
    alert("Unauthorized or failed to update status.");
  }
};


  const handleDelete = async (caseId) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/cases/${caseId}`);
      setCases(prev => prev.filter(c => c.id !== caseId));
      alert("Case deleted successfully!");
    } catch (error) {
      console.error("Failed to delete case:", error);
      alert("Failed to delete case.");
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchStatus = !selectedStatus || c.status === selectedStatus;
    const matchLawyer = !selectedLawyer || c.advocate === selectedLawyer;
    const matchCaseType = !selectedCaseType || c.caseType === selectedCaseType;
    const matchSection = !selectedSection || c.stage?.toLowerCase() === selectedSection.toLowerCase();
    return matchStatus && matchLawyer && matchCaseType && matchSection;
  });

  const handleExcelDownload = () => {
    const exportData = cases.map((item, index) => ({
      "Sr. No": index + 1,
      "Applicant Name": item.applicantName || '',
      "Title": item.title || '',
      "Date of Application": item.dateOfApplication || '',
      "Description": item.description || '',
      "Table At": item.addAt || '',
      "Received Date": item.receivedDate || '',
      "Department IN/OUT": item.departmentInOut || '',
      "Department Sent To": item.departmentSendTo || '',
      "Date": item.date || '',
      "Status": item.status || '',
      "Message": item.adminMessage || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
    XLSX.writeFile(workbook, "cases_data.xlsx");
  };

  return (
    <div className="overflow-x-auto p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-600">Case Details</h2>
        <div className="flex space-x-2 rounded-full">
          {/* Filters */}
          <DropdownButton label={selectedLawyer || 'Select A'} items={[
            { label: 'Advocate X', onClick: () => setSelectedLawyer('Advocate X') },
            { label: 'Advocate Y', onClick: () => setSelectedLawyer('Advocate Y') },
            { label: 'Advocate Z', onClick: () => setSelectedLawyer('Advocate Z') },
            { label: 'All', onClick: () => setSelectedLawyer('') }
          ]} />
          <DropdownButton label={selectedStatus || 'Select B'} items={[
            { label: 'All', onClick: () => setSelectedStatus('') },
            { label: 'Pending', onClick: () => setSelectedStatus('Pending') },
            { label: 'Compliance', onClick: () => setSelectedStatus('Compliance') },
            { label: 'Dismissed', onClick: () => setSelectedStatus('Dismissed') }
          ]} />
          <DropdownButton label={selectedSection || 'Select Section'} items={[
            { label: 'Stage 1', onClick: () => setSelectedSection('Stage 1') },
            { label: 'Stage 2', onClick: () => setSelectedSection('Stage 2') },
            { label: 'Stage 3', onClick: () => setSelectedSection('Stage 3') },
            { label: 'All', onClick: () => setSelectedSection('') }
          ]} />
          <DropdownButton label={selectedCaseType || 'Select C'} items={[
            { label: 'CWJC', onClick: () => setSelectedCaseType('CWJC') },
            { label: 'MJC', onClick: () => setSelectedCaseType('MJC') },
            { label: 'SLP', onClick: () => setSelectedCaseType('SLP') },
            { label: 'Other', onClick: () => setSelectedCaseType('Other') },
            { label: 'All', onClick: () => setSelectedCaseType('') }
          ]} />
        </div>
        {/* Excel Button */}
        <motion.button
          onClick={handleExcelDownload}
          className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-base"
        >
          <RiFileExcel2Fill className="text-white text-2xl" />
          <span className="text-xs cursor-pointer">Download Excel</span>
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 min-h-96 shadow-md shadow-[#ffbda0]">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-xs text-gray-600">
            <tr>
              {[
                "Sr. No", "Applicant's Name", "Title", "Date of Application", "Description", "Table at",
                "Received", "Department IN/OUT", "Department send to", "Date", "Status", "Application PDF", "Delete"
              ].map((header, idx) => (
                <th key={idx} className="px-4 py-2 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((caseDetail, index) => (
              <tr key={caseDetail.id} className="border-t text-xs border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(caseDetail)}>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{caseDetail.applicantName}</td>
                <td className="px-4 py-2">{caseDetail.title}</td>
                <td className="px-4 py-2">{caseDetail.dateOfApplication}</td>
                <td className="px-4 py-2">{caseDetail.description}</td>
                <td className="px-4 py-2">{caseDetail.addAt}</td>
                <td className="px-4 py-2">{caseDetail.receivedDate}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${caseDetail.departmentInOut === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {caseDetail.departmentInOut}
                  </span>
                </td>
                <td className="px-4 py-2">{caseDetail.departmentInOut === 'OUT' ? caseDetail.departmentSendTo : ''}</td>
                <td className="px-4 py-2">{caseDetail.date}</td>
                <td className="px-4 py-2 relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusDropdownId(statusDropdownId === caseDetail.id ? null : caseDetail.id);
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-full text-white text-xs font-medium ${
                      caseDetail.status === 'Pending' ? 'bg-[#13c2FF]' :
                      caseDetail.status === 'Compliance' ? 'bg-[#13B56C]' :
                      'bg-[#0969F9]'
                    }`}
                  >
                    {caseDetail.status === 'Pending' && <FaRegClock />}
                    {caseDetail.status === 'Compliance' && <GrCompliance />}
                    {caseDetail.status === 'Dismissed' && <RiCloseCircleLine />}
                    {caseDetail.status}
                  </button>
                  {statusDropdownId === caseDetail.id && (
                    <div className="absolute top-full left-0 mt-1 w-36 z-50 bg-white shadow-lg rounded-md border border-gray-100" onClick={(e) => e.stopPropagation()}>
                      {statusOptions.map((status) => (
                        <div
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(caseDetail.id, status);
                          }}
                          className="px-4 py-2 text-xs hover:bg-gray-100 cursor-pointer text-gray-700"
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button onClick={(e) => { e.stopPropagation(); handleRowClick(caseDetail); }} className="flex items-center text-[#ff5010] hover:underline text-sm">
                    <FaFilePdf className="mr-1" /> View PDF
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(caseDetail.id); }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <RiDeleteBin5Line className="text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Modal */}
      {openDialog && selectedCase && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Case Timeline & Messages</h3>
        <button onClick={() => setOpenDialog(false)} className="text-gray-600 text-xl hover:text-red-500">&times;</button>
      </div>

      {/* Case Details */}
      <div className="text-sm space-y-3 text-gray-700 mb-4">
        <p><strong>Applicant:</strong> {selectedCase.applicantName}</p>
        <p><strong>Title:</strong> {selectedCase.title}</p>
        <p><strong>Date:</strong> {selectedCase.dateOfApplication}</p>
        <p><strong>Description:</strong> {selectedCase.description}</p>
        <p><strong>Status:</strong> {selectedCase.status}</p>
      </div>

      {/* Timeline */}
      <h4 className="text-gray-800 font-semibold mb-2">Timeline</h4>
      <div className="border-l-2 border-[#ff5010] pl-4 space-y-4 text-sm mb-6">
        {selectedCase.timeline?.length ? (
          selectedCase.timeline.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-2 top-1 w-3 h-3 bg-[#ff5010] rounded-full shadow-md"></div>
              <p className="font-semibold text-[#ff5010]">{item.section || item.title}</p>
              <p className="text-gray-600 italic">{item.comment || item.description}</p>
              <p className="text-xs text-gray-400">{item.date}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No timeline entries.</p>
        )}
      </div>

      {/* Messages */}
      <h4 className="text-gray-800 font-semibold mb-2">Messages</h4>
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
        {selectedCase.messages?.length > 0 ? (
          selectedCase.messages.map((msg, idx) => (
            <div key={idx} className={`text-sm p-3 rounded-md ${msg.from === 'user' ? 'bg-blue-50 text-left' : 'bg-yellow-50 text-right'}`}>
              <p className="mb-1"><strong>{msg.from === 'user' ? 'User' : 'You'}:</strong></p>
              <p className="text-gray-700">{msg.message}</p>
              <p className="text-xs text-gray-400">{msg.date}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No messages yet.</p>
        )}
      </div>

      {/* Send Message Form (Admin) */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!messageText.trim()) return;

          try {
            await axios.post(`http://localhost:5000/api/cases/${selectedCase.id}/message`, {
              message: messageText.trim(),
              from: 'admin',
            });

            const updatedMessages = [
              ...(selectedCase.messages || []),
              {
                message: messageText.trim(),
                from: 'admin',
                date: new Date().toISOString().split('T')[0],
              },
            ];

            setSelectedCase({ ...selectedCase, messages: updatedMessages });
            setMessageText('');
          } catch (err) {
            console.error(err);
            alert('Failed to send message.');
          }
        }}
        className="mt-4 space-y-2"
      >
        <textarea
          rows={3}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message to user..."
          className="w-full border px-3 py-2 rounded-md text-sm border-gray-300"
          required
        />
        <button
          type="submit"
          className="w-full bg-[#13c2FF] text-white py-2 text-sm font-medium rounded-md hover:bg-[#0f9cd5] transition"
        >
          Send Message
        </button>
      </form>
    </div>
  </div>
)}


    </div>
  );
};

export default DataTable;
