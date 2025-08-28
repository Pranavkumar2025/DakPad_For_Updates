import React from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

const WorkAssignedApplicationTable = ({ data, onRowClick }) => {
  const getPendingDaysColor = (days) => {
    if (days <= 10) return "bg-green-500 text-white";
    if (days <= 15) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Process":
        return "bg-blue-500 text-white whitespace-nowrap";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="md:pl-20 lg:pl-20">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white mx-auto max-w-8xl p-6 my-6">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr className="text-xs uppercase tracking-wider text-gray-700 font-semibold">
              {[
                "Sr. No",
                "Date",
                "Applicant",
                "Subject",
                "GP, Block",
                "Issue Date",
                "Pending Days",
                "Status",
                "Attachment",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((caseDetail) => (
              <tr
                key={caseDetail.applicationId}
                className="text-sm hover:bg-blue-50 transition cursor-pointer even:bg-gray-50"
                onClick={() => onRowClick(caseDetail)}
              >
                <td className="px-6 py-4">{caseDetail.sNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{caseDetail.dateOfApplication}</td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {caseDetail.applicantName}
                </td>
                <td className="px-6 py-4">{caseDetail.subject}</td>
                <td className="px-6 py-4">{caseDetail.gpBlock}</td>
        
                <td className="px-6 py-4">{caseDetail.issueDate}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(
                      caseDetail.pendingDays
                    )}`}
                  >
                    {caseDetail.pendingDays}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                      caseDetail.status
                    )}`}
                  >
                    {caseDetail.status === "In Process" && (
                      <FaSpinner className="animate-spin-slow" />
                    )}
                    {caseDetail.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(caseDetail);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                  >
                    <FaFilePdf /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4 py-4 px-4">
        {data.map((caseDetail) => (
          <div
            key={caseDetail.applicationId}
            className="bg-white border border-gray-200 rounded-xl shadow-md p-5 hover:shadow-lg transition mx-auto max-w-md"
            onClick={() => onRowClick(caseDetail)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {caseDetail.applicantName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                  caseDetail.status
                )}`}
              >
                {caseDetail.status === "In Process" && (
                  <FaSpinner className="animate-spin-slow" />
                )}
                {caseDetail.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>
                  <strong>Sr. No:</strong> {caseDetail.sNo}
                </span>
                <span>
                  <strong>Date:</strong> {caseDetail.dateOfApplication}
                </span>
              </div>
              <div>
                <strong>Subject:</strong> {caseDetail.subject}
              </div>
              <div>
                <strong>GP, Block:</strong> {caseDetail.gpBlock}
              </div>
              <div>
                <strong>Officer:</strong> {caseDetail.concernedOfficer}
              </div>
              <div>
                <strong>Issue Date:</strong> {caseDetail.issueDate}
              </div>
              <div>
                <strong>Pending Days:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(
                    caseDetail.pendingDays
                  )}`}
                >
                  {caseDetail.pendingDays}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRowClick(caseDetail);
              }}
              className="inline-flex items-center gap-1 px-4 py-1.5 mt-3 text-xs rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        ))}
      </div>

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
  );
};

export default WorkAssignedApplicationTable;