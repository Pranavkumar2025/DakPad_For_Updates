import React, { useEffect, useState } from 'react';
import { FaFilePdf, FaRegClock, FaUpload } from 'react-icons/fa';
import { GrCompliance } from 'react-icons/gr';
import { RiCloseCircleLine, RiFileExcel2Fill } from 'react-icons/ri';
import DropdownButton from '../components/DropdownButton.jsx';
import { motion } from 'framer-motion';
import casesData from "../JsonData/DataTable.json";
import { useNavigate } from "react-router-dom";
import AddCaseForm from './AddCaseForm.jsx';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// import AddCaseFor from "./AddCaseForm.jsx";

const DataTable = () => {
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  // const displayStatus = selectedStatus || 'Pending';

  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleRowClick = (row) => {
    setSelectedCase(row);
    setOpenDialog(true);
  };
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = casesData.filter((c) => {
    const matchStatus = !selectedStatus || c.status === selectedStatus;
    const matchDepartment = !selectedDepartment || c.departmentSendTo === selectedDepartment;
    const matchSource = !selectedSource || c.addAt === selectedSource;
    const matchSearch =
      c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchDepartment && matchSource && matchSearch;
  });
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenDialog(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCases); // use filtered or full data
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "ApplicationsList.xlsx");
  };

  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto p-4">
     {/* Header Section */}
{/* Header Section */}
<div className="flex flex-col gap-3 mb-4">

  {/* Top: Title + Search */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <h2 className="text-2xl font-semibold text-gray-700">Applications List</h2>

    <input
      type="text"
      placeholder="Search by name or title"
      className="border border-gray-300 bg-white px-4 py-2 text-sm rounded-md focus:ring-[#ff5010] w-full md:w-80"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

  {/* Filter Summary */}
  <div>
  <p className="text-sm text-gray-500">
    Showing {filteredCases.length} application{filteredCases.length !== 1 && 's'} filtered by
    <strong className="text-gray-700"> {selectedStatus || 'All'} status</strong>,
    <strong className="text-gray-700"> {selectedDepartment || 'All'} department</strong>,
    <strong className="text-gray-700"> {selectedSource || 'All'} source</strong>.
  </p>

  {/* Filters */}
  <div className="flex flex-wrap gap-3 mt-1">
    <DropdownButton
      label={selectedStatus || 'Select Status'}
      items={[
        { label: 'All', onClick: () => setSelectedStatus('') },
        { label: 'Pending', onClick: () => setSelectedStatus('Pending') },
        { label: 'Compliance', onClick: () => setSelectedStatus('Compliance') },
        { label: 'Dismissed', onClick: () => setSelectedStatus('Dismissed') },
      ]}
    />
    <DropdownButton
      label={selectedDepartment || 'Select Department'}
      items={[
        { label: 'All', onClick: () => setSelectedDepartment('') },
        { label: 'Registrar Office', onClick: () => setSelectedDepartment('Registrar Office') },
        { label: 'Land Revenue Office', onClick: () => setSelectedDepartment('Land Revenue Office') },
        { label: 'Welfare Department', onClick: () => setSelectedDepartment('Welfare Department') },
        { label: 'Circle Office', onClick: () => setSelectedDepartment('Circle Office') },
        { label: 'Tehsildar Office', onClick: () => setSelectedDepartment('Tehsildar Office') },
        { label: 'Municipal Engineer', onClick: () => setSelectedDepartment('Municipal Engineer') },
        { label: 'Rural Works Dept', onClick: () => setSelectedDepartment('Rural Works Dept') },
      ]}
    />
    <DropdownButton
      label={selectedSource || 'Source of Application'}
      items={[
        { label: 'All', onClick: () => setSelectedSource('') },
        { label: 'In Person', onClick: () => setSelectedSource('In Person') },
        { label: 'MLA/MP', onClick: () => setSelectedSource('MLA/MP') },
        { label: 'WhatsApp', onClick: () => setSelectedSource('WhatsApp') },
        { label: 'Email', onClick: () => setSelectedSource('Email') },
      ]}
    />
  </div>
  </div>
   <div className="flex flex-wrap justify-end gap-3 mt-3">
    <button
      onClick={() => setShowAddDialog(true)}
      className="flex items-center gap-2 bg-[#10b981] hover:bg-[#0ea769] text-white px-5 py-3 rounded-xl font-medium shadow-md text-sm"
    >
      + Add New Application
    </button>

    <motion.button
      onClick={handleDownloadExcel}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex items-center gap-3 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] font-semibold text-sm"
    >
      <motion.div
        variants={{ rest: { x: 0 }, hover: { x: 40 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <RiFileExcel2Fill className="text-white text-xl" />
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
  </div>

  {/* Action Buttons */}
 
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
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${caseDetail.departmentInOut === 'IN'
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
                      className={`flex items-center gap-2 px-2 py-1 rounded-full ${caseDetail.status === 'Pending'
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


      {openDialog && selectedCase && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto py-6 px-10">

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Application ID: <span className="text-[#ff5010]">{selectedCase.applicationId}</span>
              </h2>
              <button
                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                onClick={() => setOpenDialog(false)}
              >
                &times;
              </button>
            </div>

            {/* Applicant Info */}
            <h3 className="text-base font-semibold text-gray-700 mb-2">Applicant Details</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm border rounded-xl overflow-hidden shadow-sm mb-6">
                <tbody className="divide-y">
                  <tr className="bg-gray-50">
                    <td className="font-medium text-gray-600 px-4 py-3">Applicant Name</td>
                    <td className="px-4 py-3">{selectedCase.applicantName}</td>
                    <td className="font-medium text-gray-600 px-4 py-3">Date of Application</td>
                    <td className="px-4 py-3">{selectedCase.dateOfApplication}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-600 px-4 py-3">Mobile No.</td>
                    <td className="px-4 py-3">{selectedCase.mobileNumber}</td>
                    <td className="font-medium text-gray-600 px-4 py-3">Email</td>
                    <td className="px-4 py-3">{selectedCase.email}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="font-medium text-gray-600 px-4 py-3">Title</td>
                    <td className="px-4 py-3" colSpan={3}>{selectedCase.title}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-600 px-4 py-3">Description</td>
                    <td className="px-4 py-3" colSpan={3}>{selectedCase.description}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="font-medium text-gray-600 px-4 py-3">Status</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {selectedCase.status}
                      </span>
                    </td>
                    <td className="font-medium text-gray-600 px-4 py-3">Last Action</td>
                    <td className="px-4 py-3">{selectedCase.lastActionDate || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-600 px-4 py-3">Table At</td>
                    <td className="px-4 py-3" colSpan={3}>
                      Mukesh Kumar (Clerk){' '}
                      {selectedCase.departmentInOut === 'OUT' && (
                        <span className="text-gray-500 text-sm ml-2">
                          → {selectedCase.departmentSendTo}
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* View PDF */}
            {selectedCase.pdfLink && (
              <a
                href={selectedCase.pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#ff5010] hover:text-[#e0480f] font-medium underline mb-6 inline-block"
              >
                📄 View Attached PDF
              </a>
            )}

            <hr className="my-6" />

            {/* Timeline */}
            <h3 className="text-base font-semibold text-gray-700 mb-3">Application Timeline</h3>
            {selectedCase.timeline?.length > 0 ? (
              <div className="relative space-y-8 mb-6">
                {selectedCase.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-start pl-10 before:absolute before:top-3 before:bottom-0 before:left-5 before:w-0.5 before:bg-[#ff5010]/30"
                  >
                    {/* Dot */}
                    <div className="absolute left-4 top-2 w-3 h-3 rounded-full bg-[#ff5010] ring-2 ring-white shadow-sm z-10" />

                    {/* Card */}
                    <div
                      className={`w-full p-4 rounded-xl border transition shadow-sm ${idx === selectedCase.timeline.length - 1
                          ? 'bg-green-50 border-green-300'
                          : 'bg-orange-50 border-orange-200'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#ff5010] font-semibold text-sm">{item.section}</span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>

                      <p className="text-gray-700 text-sm flex flex-wrap items-center gap-2 italic">
                        {item.comment}
                        {item.pdfLink && (
                          <a
                            href={item.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff5010] hover:text-[#e0480f]"
                            title="View PDF"
                          >
                            <FaFilePdf className="inline-block w-4 h-4" />
                          </a>
                        )}
                      </p>

                      {idx === selectedCase.timeline.length - 1 && (
                        <p className="text-green-600 text-xs font-semibold mt-2">Latest Update</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-400 mb-6">No timeline entries found.</p>
            )}

            {/* Add Comment */}
            <h3 className="text-base font-semibold text-gray-700 mb-2">Add Comment</h3>
            <form className="space-y-3 mb-6">
              <textarea
                placeholder="Enter comment"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-[#ff5010]"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                  <FaUpload />
                  Upload PDF
                  <input type="file" accept="application/pdf" className="hidden" />
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
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

            {/* Forward Section */}
            <hr className="my-6" />
            <h3 className="text-base font-semibold text-gray-700 mb-3">Forward File To</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-1">Department</label>
                <select
                  className="w-full border border-gray-300 text-sm px-3 py-2 rounded-md focus:ring-[#ff5010]"
                  onChange={() => { }}
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
                <label className="text-sm font-medium block mb-1">Stage</label>
                <select
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
            <div className="text-right">
              <button className="inline-flex items-center px-5 py-2 bg-[#10b981] text-white text-sm font-medium rounded-md hover:bg-[#0ea769] transition">
                Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <AddCaseForm isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} />
        </div>
      )}


    </div>
  );
};

export default DataTable;
