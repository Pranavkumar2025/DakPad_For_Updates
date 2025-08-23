import React from "react";
import { FaFilePdf, FaUpload, FaSpinner, FaPaperPlane } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const CaseDialog = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto py-8 px-10 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Application ID: <span className="text-green-800">{data.applicationId}</span>
          </h2>
          <button
            className="text-gray-500 hover:text-red-600 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            <IoClose />
          </button>
        </div>

        {/* Applicant Details */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicant Details</h3>
        <div className="bg-gray-50 rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Sr. No</span>
                <p className="text-gray-900">{data.sNo}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Applicant Name</span>
                <p className="text-gray-900">{data.applicantName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Mobile No.</span>
                <p className="text-gray-900">{data.mobileNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">GP, Block</span>
                <p className="text-gray-900">{data.gpBlock}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Date of Application</span>
                <p className="text-gray-900">{data.dateOfApplication}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email</span>
                <p className="text-gray-900">{data.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Issue Letter No</span>
                <p className="text-gray-900">{data.issueLetterNo}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Issue Date</span>
                <p className="text-gray-900">{data.issueDate}</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Description</span>
              <p className="text-gray-900">{data.description}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <p>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                  <FaSpinner className="animate-spin-slow" /> In Progress
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Concerned Officer</span>
              <p className="text-gray-900">{data.concernedOfficer}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Pending Days</span>
              <p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    data.pendingDays <= 10
                      ? "bg-green-500 text-white"
                      : data.pendingDays <= 15
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {data.pendingDays}
                </span>
              </p>
            </div>
          </div>
          {data.pdfLink && (
            <a
              href={data.pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mt-4"
            >
              <FaFilePdf /> View Attached PDF
            </a>
          )}
        </div>

        {/* Application Timeline */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h3>
        {data.timeline?.length > 0 ? (
          <div className="relative space-y-4 mb-8">
            {data.timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start pl-10">
                {/* Timeline Indicator */}
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-600 border-2 border-white shadow-md z-10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
                {/* Timeline Connector Line */}
                <div
                  className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${
                    idx === data.timeline.length - 1 ? "bg-transparent" : "bg-green-300"
                  }`}
                />
                {/* Timeline Content */}
                <div
                  className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                    idx === data.timeline.length - 1
                      ? "bg-green-50 border-green-300 shadow-lg"
                      : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-semibold text-blue-700">{item.section}</h4>
                    <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    {item.comment}
                    {item.pdfLink && (
                      <a
                        href={item.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="View PDF"
                      >
                        
                      </a>
                    )}
                  </p>
                  {idx === data.timeline.length - 1 && (
                    <p className="text-blue-600 text-xs font-semibold mt-1.5">Latest Update</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500 mb-8">No timeline entries available.</p>
        )}

        {/* Add Comment */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Comment</h3>
        <form className="space-y-4 mb-8">
          <textarea
            placeholder="Enter your comment"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm cursor-pointer hover:bg-gray-50 transition">
                <FaUpload /> Upload PDF
                <input type="file" accept="application/pdf" className="hidden" />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm cursor-pointer hover:bg-gray-50 transition">
                <FaUpload /> Upload Image
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <button
              type="button"
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition"
            >
              <FaPaperPlane /> Send
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-shadow shadow-md hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Compliance
          </button>
        </form>

        {/* Custom CSS for slow spin animation */}
        <style jsx>{`
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CaseDialog;