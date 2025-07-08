import React from "react";
import { FaFilePdf, FaUpload, FaRegClock } from "react-icons/fa";
import { GrCompliance } from "react-icons/gr";
import { RiCloseCircleLine } from "react-icons/ri";

const CaseDialog = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto py-6 px-10">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Application ID: <span className="text-[#ff5010]">{data.applicationId}</span>
          </h2>
          <button
            className="text-gray-500 hover:text-red-500 text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <h3 className="text-base font-semibold text-gray-700 mb-2">Applicant Details</h3>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm border rounded-xl overflow-hidden shadow-sm mb-6">
            <tbody className="divide-y">
              <tr className="bg-gray-50">
                <td className="font-medium text-gray-600 px-4 py-3">Applicant Name</td>
                <td className="px-4 py-3">{data.applicantName}</td>
                <td className="font-medium text-gray-600 px-4 py-3">Date of Application</td>
                <td className="px-4 py-3">{data.dateOfApplication}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-600 px-4 py-3">Mobile No.</td>
                <td className="px-4 py-3">{data.mobileNumber}</td>
                <td className="font-medium text-gray-600 px-4 py-3">Email</td>
                <td className="px-4 py-3">{data.email}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="font-medium text-gray-600 px-4 py-3">Title</td>
                <td className="px-4 py-3" colSpan={3}>{data.title}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-600 px-4 py-3">Description</td>
                <td className="px-4 py-3" colSpan={3}>{data.description}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="font-medium text-gray-600 px-4 py-3">Status</td>
                <td className="px-4 py-3">
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {data.status}
                  </span>
                </td>
                <td className="font-medium text-gray-600 px-4 py-3">Last Action</td>
                <td className="px-4 py-3">{data.lastActionDate || '—'}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-600 px-4 py-3">Table At</td>
                <td className="px-4 py-3" colSpan={3}>
                  Mukesh Kumar (Clerk)
                  {data.departmentInOut === 'OUT' && (
                    <span className="text-gray-500 text-sm ml-2">
                      → {data.departmentSendTo}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {data.pdfLink && (
          <a
            href={data.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#ff5010] hover:text-[#e0480f] font-medium underline mb-6 inline-block"
          >
            📄 View Attached PDF
          </a>
        )}

        <hr className="my-6" />

        <h3 className="text-base font-semibold text-gray-700 mb-3">Application Timeline</h3>
        {data.timeline?.length > 0 ? (
          <div className="relative space-y-8 mb-6">
            {data.timeline.map((item, idx) => (
              <div
                key={idx}
                className="relative flex items-start pl-10 before:absolute before:top-3 before:bottom-0 before:left-5 before:w-0.5 before:bg-[#ff5010]/30"
              >
                <div className="absolute left-4 top-2 w-3 h-3 rounded-full bg-[#ff5010] ring-2 ring-white shadow-sm z-10" />
                <div
                  className={`w-full p-4 rounded-xl border transition shadow-sm ${idx === data.timeline.length - 1
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
                  {idx === data.timeline.length - 1 && (
                    <p className="text-green-600 text-xs font-semibold mt-2">Latest Update</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400 mb-6">No timeline entries found.</p>
        )}

        <h3 className="text-base font-semibold text-gray-700 mb-2">Add Comment</h3>
        <form className="space-y-3 mb-6">
          <textarea
            placeholder="Enter comment"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-[#ff5010]"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
              <FaUpload /> Upload PDF
              <input type="file" accept="application/pdf" className="hidden" />
            </label>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
              <FaUpload /> Upload Image
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

        <hr className="my-6" />

        <h3 className="text-base font-semibold text-gray-700 mb-3">Forward File To</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium block mb-1">Department</label>
            <select className="w-full border border-gray-300 text-sm px-3 py-2 rounded-md focus:ring-[#ff5010]">
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
            <select className="w-full border border-gray-300 text-sm px-3 py-2 rounded-md focus:ring-[#ff5010]">
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
  );
};

export default CaseDialog;
