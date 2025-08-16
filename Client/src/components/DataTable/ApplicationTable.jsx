import React from "react";
import { FaFilePdf, FaRegClock } from "react-icons/fa";
import { GrCompliance } from "react-icons/gr";
import { RiCloseCircleLine } from "react-icons/ri";

const ApplicationTable = ({ data, onRowClick }) => {
  const calculatePendingDays = (caseDetail) => {
    if (caseDetail.status === "Compliance") return 0;
    const lastUpdated = caseDetail.timeline?.length
      ? caseDetail.timeline[caseDetail.timeline.length - 1].date
      : caseDetail.dateOfApplication;

    const referenceDate = new Date(lastUpdated);
    const today = new Date();
    const diffTime = today - referenceDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPendingDaysColor = (days) => {
    if (days === 0) return "bg-green-100 text-green-700";
    if (days <= 10) return "bg-green-500 text-white";
    if (days <= 20) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden ml-16 p-6 md:block overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr className="text-xs uppercase tracking-wider text-gray-600">
              {[
                "Sr. No",
                "Applicant",
                "Title",
                "Application Date",
                "Source At",
                "Dept IN/OUT",
                "Send To",
                "Last Action Date",
                "Pending Days",
                "Status",
                "Attachment",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((caseDetail, index) => {
              const lastUpdated = caseDetail.timeline?.length
                ? caseDetail.timeline[caseDetail.timeline.length - 1].date
                : "—";
              const pendingDays = calculatePendingDays(caseDetail);

              return (
                <tr
                  key={caseDetail.caseId || index}
                  className="border-t border-gray-200 text-sm hover:bg-gray-50 hover:shadow-sm transition cursor-pointer even:bg-gray-50"
                  onClick={() => onRowClick(caseDetail)}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {caseDetail.applicantName}
                  </td>
                  <td className="px-4 py-3">{caseDetail.title}</td>
                  <td className="px-4 py-3">{caseDetail.dateOfApplication}</td>
                  <td className="px-4 py-3">{caseDetail.addAt}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        caseDetail.departmentInOut === "IN"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {caseDetail.departmentInOut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {caseDetail.departmentInOut === "OUT"
                      ? caseDetail.departmentSendTo
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{lastUpdated}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(
                        pendingDays
                      )}`}
                    >
                      {pendingDays}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        caseDetail.status === "Pending"
                          ? "bg-blue-500"
                          : caseDetail.status === "Compliance"
                          ? "bg-green-600"
                          : caseDetail.status === "Dismissed"
                          ? "bg-red-500"
                          : "bg-indigo-600"
                      } text-white`}
                    >
                      {caseDetail.status === "Pending" && <FaRegClock />}
                      {caseDetail.status === "Compliance" && <GrCompliance />}
                      {caseDetail.status === "Dismissed" && (
                        <RiCloseCircleLine />
                      )}
                      {caseDetail.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(caseDetail);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-[#ff5010] text-[#ff5010] hover:bg-[#ff5010] hover:text-white transition"
                    >
                      <FaFilePdf /> PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {data.map((caseDetail, index) => {
          const lastUpdated = caseDetail.timeline?.length
            ? caseDetail.timeline[caseDetail.timeline.length - 1].date
            : "—";
          const pendingDays = calculatePendingDays(caseDetail);

          return (
            <div
              key={caseDetail.caseId || index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition"
              onClick={() => onRowClick(caseDetail)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {caseDetail.applicantName}
                </h3>
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    caseDetail.status === "Pending"
                      ? "bg-blue-500"
                      : caseDetail.status === "Compliance"
                      ? "bg-green-600"
                      : caseDetail.status === "Dismissed"
                      ? "bg-red-500"
                      : "bg-indigo-600"
                  } text-white`}
                >
                  {caseDetail.status === "Pending" && <FaRegClock />}
                  {caseDetail.status === "Compliance" && <GrCompliance />}
                  {caseDetail.status === "Dismissed" && <RiCloseCircleLine />}
                  {caseDetail.status}
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-2">{caseDetail.title}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-3">
                <div>
                  <strong>Applied:</strong> {caseDetail.dateOfApplication}
                </div>
                <div>
                  <strong>Source:</strong> {caseDetail.addAt}
                </div>
                <div>
                  <strong>Dept:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      caseDetail.departmentInOut === "IN"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {caseDetail.departmentInOut}
                  </span>
                </div>
                <div>
                  <strong>Send To:</strong>{" "}
                  {caseDetail.departmentInOut === "OUT"
                    ? caseDetail.departmentSendTo
                    : "—"}
                </div>
                <div>
                  <strong>Last Action:</strong> {lastUpdated}
                </div>
                <div>
                  <strong>Pending Days:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full ${getPendingDaysColor(
                      pendingDays
                    )}`}
                  >
                    {pendingDays}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(caseDetail);
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg border border-[#ff5010] text-[#ff5010] hover:bg-[#ff5010] hover:text-white transition"
              >
                <FaFilePdf /> PDF
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTable;
