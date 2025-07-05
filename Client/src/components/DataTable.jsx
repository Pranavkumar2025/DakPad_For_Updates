import React, { useState } from 'react';
import { FaFilePdf, FaRegClock, FaUpload } from 'react-icons/fa';
import { GrCompliance } from 'react-icons/gr';
import { RiCloseCircleLine, RiFileExcel2Fill } from 'react-icons/ri';
import DropdownButton from '../components/DropdownButton.jsx';
import { motion } from 'framer-motion';
import casesData from "../JsonData/DataTable.json";
import { useNavigate } from "react-router-dom";
// import AddCaseFor from "./AddCaseForm.jsx";

const DataTable = () => {
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  // const displayStatus = selectedStatus || 'Pending';

  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const handleRowClick = (row) => {
    setSelectedCase(row);
    setOpenDialog(true);
  };

  const filteredCases = casesData.filter((c) => {
    const matchStatus = !selectedStatus || c.status === selectedStatus;
    const matchLawyer = !selectedLawyer || c.advocate === selectedLawyer;
    const matchCaseType = !selectedCaseType || c.caseType === selectedCaseType;
    const matchSection = !selectedSection || c.stage?.toLowerCase() === selectedSection.toLowerCase();
    return matchStatus && matchLawyer && matchCaseType && matchSection;
  });

  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto p-4">
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
    <h2 className="text-xl font-semibold text-gray-600">Applications List</h2>

    <div className="flex flex-wrap gap-2">
      <DropdownButton
        label={selectedLawyer || 'Select Advocate'}
        items={[
          { label: 'Advocate X', onClick: () => setSelectedLawyer('Advocate X') },
          { label: 'Advocate Y', onClick: () => setSelectedLawyer('Advocate Y') },
          { label: 'Advocate Z', onClick: () => setSelectedLawyer('Advocate Z') },
          { label: 'All', onClick: () => setSelectedLawyer('') },
        ]}
      />
      <DropdownButton
        label={selectedStatus || 'Select Status'}
        items={[
          { label: 'All', onClick: () => setSelectedStatus('') },
          { label: 'Pending', onClick: () => setSelectedStatus('Pending') },
          { label: 'Compliance', onClick: () => setSelectedStatus('Compliance') },
          { label: 'Dismissed', onClick: () => setSelectedStatus('Dismissed') },
          { label: 'Disposed', onClick: () => setSelectedStatus('Disposed') },
          { label: 'Out of Department', onClick: () => setSelectedStatus('Out of Department') },
        ]}
      />
      <DropdownButton
        label={selectedSection || 'Select Section'}
        items={[
          { label: 'Stage 1', onClick: () => setSelectedSection('Stage 1') },
          { label: 'Stage 2', onClick: () => setSelectedSection('Stage 2') },
          { label: 'Stage 3', onClick: () => setSelectedSection('Stage 3') },
          { label: 'All', onClick: () => setSelectedSection('') },
        ]}
      />
      <DropdownButton
        label={selectedCaseType || 'Select Case Type'}
        items={[
          { label: 'CWJC', onClick: () => setSelectedCaseType('CWJC') },
          { label: 'MJC', onClick: () => setSelectedCaseType('MJC') },
          { label: 'SLP', onClick: () => setSelectedCaseType('SLP') },
          { label: 'Other', onClick: () => setSelectedCaseType('Other') },
          { label: 'All', onClick: () => setSelectedCaseType('') },
        ]}
      />
    </div>

    {/* Add New Application Button */}
    <button
      onClick={() => navigate('/addCaseForm')}
      className="flex items-center gap-2 bg-[#10b981] hover:bg-[#0ea769] text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
    >
      + Add New Application
    </button>

    {/* Download Excel Button */}
    <motion.button
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-base"
    >
      <motion.div
        variants={{ rest: { x: 0 }, hover: { x: 40 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <RiFileExcel2Fill className="text-white text-2xl" />
      </motion.div>
      <motion.span
        variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
        transition={{ duration: 0.3 }}
        className="text-xs"
      >
        Download Excel
      </motion.span>
    </motion.button>
  </div>

      {/* Table Section */}
{/* Table Section */}
<div className="overflow-x-auto rounded-2xl border border-gray-200 min-h-96 shadow-md shadow-[#ffbda0]">
  <table className="min-w-full table-auto">
    <thead className="bg-gray-200 text-xs text-gray-600">
      <tr>
        {[
          'Sr. No',
          "Applicant's Name",
          'Title',
          'Date of Application',
          'Source At',
          'Dept IN/OUT',
          'Send To',
          'Last Action Date',
          'Status',
          'Attachment'
        ].map((header, idx) => (
          <th key={idx} className="px-4 py-2 text-left whitespace-nowrap">{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {filteredCases.map((caseDetail, index) => {
        const lastUpdated = caseDetail.timeline?.length
          ? caseDetail.timeline[caseDetail.timeline.length - 1].date
          : '—';

        return (
          <tr
            key={caseDetail.caseId || index}
            className="border-t text-xs border-gray-200 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleRowClick(caseDetail)}
          >
            <td className="px-4 py-2">{index + 1}</td>
            <td className="px-4 py-2">{caseDetail.applicantName}</td>
            <td className="px-4 py-2">{caseDetail.title}</td>
            <td className="px-4 py-2">{caseDetail.dateOfApplication}</td>
            <td className="px-4 py-2">{caseDetail.addAt}</td>
            <td className="px-4 py-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  caseDetail.departmentInOut === 'IN'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {caseDetail.departmentInOut}
              </span>
            </td>
            <td className="px-4 py-2">
              {caseDetail.departmentInOut === 'OUT' ? caseDetail.departmentSendTo : '—'}
            </td>
            <td className="px-4 py-2">{lastUpdated}</td>
            <td className="px-4 py-2">
              <span
                className={`flex items-center gap-2 px-2 py-1 rounded-full ${
                  caseDetail.status === 'Pending'
                    ? 'bg-[#13c2FF]'
                    : caseDetail.status === 'Compliance'
                    ? 'bg-[#13B56C]'
                    : caseDetail.status === 'Dismissed'
                    ? 'bg-[#ff4d4f]'
                    : 'bg-[#0969F9]'
                } text-white`}
              >
                {caseDetail.status === 'Pending' && <FaRegClock />}
                {caseDetail.status === 'Compliance' && <GrCompliance />}
                {caseDetail.status === 'Dismissed' && <RiCloseCircleLine />}
                <span className="text-xs font-medium">{caseDetail.status}</span>
              </span>
            </td>
            <td className="px-4 py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCase(caseDetail);
                  setOpenDialog(true);
                }}
                className="flex items-center text-[#ff5010] hover:underline text-sm"
              >
                <FaFilePdf className="mr-1" /> View PDF
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


      {/* Modal */}
      {openDialog && selectedCase && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-3xl shadow-lg w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Application ID: <span className="text-[#ff5010]">{selectedCase.applicationId}</span>
        </h3>
        <button className="text-gray-500 hover:text-red-500 text-xl" onClick={() => setOpenDialog(false)}>
          &times;
        </button>
      </div>

      {/* Applicant Details */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
        <p><strong>Applicant's Name:</strong> {selectedCase.applicantName}</p>
        <p><strong>Date of Application:</strong> {selectedCase.dateOfApplication}</p>
        <p><strong>Mobile No:</strong> {selectedCase.mobileNumber}</p>
        <p><strong>Email ID:</strong> {selectedCase.email}</p>
        <p className="col-span-2"><strong>Title:</strong> {selectedCase.title}</p>
        <p className="col-span-2"><strong>Description:</strong> {selectedCase.description}</p>
        <p className="col-span-2">
          <strong>Status:</strong>
          <span className="ml-2 inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {selectedCase.status}
          </span>
        </p>
        <p className="col-span-2">
          <strong>Last Action Date:</strong>
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {selectedCase.lastActionDate || '—'}
          </span>
        </p>
        <p className="col-span-2">
          <strong>Table At:</strong>
          <span className="ml-2 text-sm font-medium text-gray-700">Mukesh Kumar (Clerk)</span>
        </p>
      </div>

      {/* View PDF */}
      {selectedCase.pdfLink && (
        <a
          href={selectedCase.pdfLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#ff5010] hover:text-[#e0480f] font-medium underline mb-4 inline-block"
        >
          View Attached PDF
        </a>
      )}

      {/* Forward File To */}
      <div className="mt-6">
        <h4 className="text-base font-semibold mb-2 text-gray-800">Forward File To</h4>
        <div className="grid grid-cols-2 gap-4 items-center">
          <div>
            <label htmlFor="department" className="text-sm font-medium block mb-1">Department</label>
            <select
              id="department"
              className="w-full border border-gray-300 text-sm px-3 py-2 rounded-md focus:ring-[#ff5010]"
              onChange={() => {}} // Add logic as needed
            >
              <option value="">-- Select Department --</option>
              <option value="Registrar Office">Registrar Office</option>
              <option value="Land Revenue Office">Land Revenue Office</option>
              <option value="Welfare Department">Welfare Department</option>
              <option value="Electoral Office">Electoral Office</option>
              <option value="Circle Office">Circle Office</option>
            </select>
          </div>
          <div>
            <label htmlFor="stage" className="text-sm font-medium block mb-1">Stage</label>
            <select
              id="stage"
              className="w-full border border-gray-300 text-sm px-3 py-2 rounded-md focus:ring-[#ff5010]"
            >
              <option value="">-- Select Stage --</option>
              <option value="Clerk Review">Clerk Review</option>
              <option value="Officer Verification">Officer Verification</option>
              <option value="Final Approval">Final Approval</option>
              <option value="Record Filing">Record Filing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-gray-800 mb-4">Application Timeline</h4>
        {selectedCase.timeline?.length > 0 ? (
          <div className="relative pl-4 border-l-4 border-dashed border-[#ff5010] space-y-6">
            {selectedCase.timeline.map((item, idx) => (
              <div key={idx} className="relative pl-4">
                <div className="absolute -left-[10px] top-2 w-4 h-4 rounded-full bg-[#ff5010] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className={`p-4 rounded-xl shadow-sm ${
                  idx === selectedCase.timeline.length - 1
                    ? 'bg-[#f0fff4] border border-green-400'
                    : 'bg-[#fff8f4] border border-[#ffe0d3]'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#ff5010] font-semibold text-sm">{item.section}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm italic">{item.comment}</p>
                  {idx === selectedCase.timeline.length - 1 && (
                    <p className="text-green-700 text-xs font-semibold mt-1">Latest Update</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">No timeline entries found.</p>
        )}
      </div>

      {/* Add Comment + Upload PDF & Image */}
      <div className="mt-6">
        <h4 className="text-base font-semibold mb-2 text-gray-800">Add Comment</h4>
        <form className="space-y-3">
          <textarea
            placeholder="Enter comment"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#ff5010]"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 w-full sm:w-auto">
              <FaUpload />
              Upload PDF
              <input type="file" accept="application/pdf" className="hidden" />
            </label>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 w-full sm:w-auto">
              <FaUpload />
              Upload Image
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#ff5010] text-white text-sm font-medium rounded-md hover:bg-[#e0480f] transition"
          >
            Submit Comment
          </button>
        </form>
      </div>

    </div>
  </div>
)}

    </div>
  );
};

export default DataTable;
