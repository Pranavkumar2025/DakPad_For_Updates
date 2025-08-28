import React, { useState, useRef, useEffect } from "react";
import { User, Calendar, File, PlusCircle } from "lucide-react";
import AddCaseForm from "../components/AddCaseForm";
import Navbar from "./Navbar";

const ApplicationReceive = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const dropdownRef = useRef(null);

 // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [applications] = useState([
    {
      ApplicantId: "BP00001",
      applicant: "Rahul Sharma",
      applicationDate: "21/08/2025",
      phoneNumber: "+91 9876543210",
      sourceAt: "MLA",
      emailId: "example@mail.com",
      subject: "NOC Request",
      attachment: "noc.pdf",
    },
    {
      ApplicantId: "BP00002",
      applicant: "Anita Verma",
      applicationDate: "21/08/2025",
      phoneNumber: "+91 9876501234",
      sourceAt: "Collector",
      emailId: "anita@mail.com",
      subject: "Property Clearance",
      attachment: "clearance.pdf",
    },
    {
      ApplicantId: "BP00003",
      applicant: "Amit Singh",
      applicationDate: "21/08/2025",
      phoneNumber: "+91 9999999999",
      sourceAt: "Panchayat",
      emailId: "amit@mail.com",
      subject: "Land Dispute",
      attachment: "land.pdf",
    },
     {
      ApplicantId: "BP00003",
      applicant: "Amit Singh",
      applicationDate: "21/08/2025",
      phoneNumber: "+91 9999999999",
      sourceAt: "Panchayat",
      emailId: "amit@mail.com",
      subject: "Land Dispute",
      attachment: "land.pdf",
    },
     {
      ApplicantId: "BP00003",
      applicant: "Amit Singh",
      applicationDate: "21/08/2025",
      phoneNumber: "+91 9999999999",
      sourceAt: "Panchayat",
      emailId: "amit@mail.com",
      subject: "Land Dispute",
      attachment: "land.pdf",
    },
     {
      ApplicantId: "BP00003",
      applicant: "Amit Singh",
      applicationDate: "21/08/2025",
      phoneNumber: "+91 9999999999",
      sourceAt: "Panchayat",
      emailId: "amit@mail.com",
      subject: "Land Dispute",
      attachment: "land.pdf",
    },
    
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = applications.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(applications.length / recordsPerPage);

  return (
    <>
    <div className="relative top-5 right-8">
    <Navbar />
    </div>
    <div className="p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          Applications Received Today
        </h1>
         
       <div className="relative inline-block" ref={dropdownRef}>
      {/* Clickable Filter Bar */}
      <div
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md cursor-pointer text-gray-700 hover:bg-gray-50"
      >
        <span className="text-sm">Filter by Date</span>
        <span className="text-xs text-gray-500">
          {fromDate && toDate ? `${fromDate} - ${toDate}` : "Select Range"}
        </span>
      </div>

      {/* Dropdown Content */}
      {showFilter && (
        <div className="absolute left-0 mt-1 w-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
            />
          </div>
          <button
            onClick={() => setShowFilter(false)}
            className="px-3 py-1 bg-[#ff5010] text-white rounded-md hover:bg-[#e0440d] text-sm"
          >
            Apply
          </button>
        </div>
      )}
    </div>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#ff5010] text-white rounded-md hover:bg-[#ff5010] transition"
          onClick={() => setShowAddForm(true)}
        >
          <PlusCircle className="w-5 h-5" /> Add Application
        </button>
      </div>

      {/* Add Application Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <AddCaseForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
  <tr>
    <th className="px-4 py-3">Sr. No</th>
    <th className="px-4 py-3">Application ID</th>
    <th className="px-4 py-3">Applicant</th>  {/* now contains both Name + Date */}
    <th className="px-4 py-3">Source At</th>
    <th className="px-4 py-3">Phone Number</th>
    <th className="px-4 py-3">Email ID</th>
    <th className="px-4 py-3">Subject</th>
    <th className="px-4 py-3">Attachment</th>
  </tr>
</thead>

         <tbody>
  {currentRecords.map((app, index) => (
    <tr
      key={app.ApplicantId}
      className={`border-t border-gray-200 ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      {/* Sr. No */}
      <td className="px-4 py-3">{indexOfFirstRecord + index + 1}</td>

      {/* Application ID */}
      <td className="px-4 py-3">{app.ApplicantId}</td>

      {/* Applicant Name */}
      {/* Applicant Name + Date in one column */}
<td className="px-4 py-3 flex flex-col text-gray-700">
  <div className="flex items-center gap-2">
    <User className="w-4 h-4 text-gray-500" />
    {app.applicant}
  </div>
  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
    <Calendar className="w-3 h-3" />
    {app.applicationDate}
  </div>
</td>

      {/* Source At */}
      <td className="px-4 py-3">{app.sourceAt}</td>

      {/* Phone Number */}
      <td className="px-4 py-3">{app.phoneNumber}</td>

      {/* Email ID */}
      <td className="px-4 py-3">{app.emailId}</td>

      {/* Subject */}
      <td className="px-4 py-3">{app.subject}</td>

      {/* Attachment */}
      <td className="px-4 py-3">
        <a
          href={app.attachment}
          className="flex items-center gap-1 text-[#ff5010] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <File className="w-4 h-4" /> {app.attachment}
        </a>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstRecord + 1}–
          {Math.min(indexOfLastRecord, applications.length)} of{" "}
          {applications.length}
        </span>

        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === i + 1
                  ? "bg-[#ff5010] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>

  
    </>
  );
};

export default ApplicationReceive;
