import React from "react";
import { FaFilePdf, FaRegClock } from "react-icons/fa";
import { GrCompliance } from "react-icons/gr";
import { RiCloseCircleLine } from "react-icons/ri";

const ApplicationTable = ({ data, onRowClick }) => {
  return (
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
          {data.map((caseDetail, index) => {
            const lastUpdated = caseDetail.timeline?.length
              ? caseDetail.timeline[caseDetail.timeline.length - 1].date
              : '—';

            return (
              <tr
                key={caseDetail.caseId || index}
                className="border-t text-xs border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick(caseDetail)}
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
                      onRowClick(caseDetail);
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
  );
};

export default ApplicationTable;
