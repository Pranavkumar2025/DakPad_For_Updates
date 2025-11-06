import React, { useState, useEffect, useCallback } from "react";
import { FaFilePdf, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/applications";

const WorkAssignedApplicationTable = ({
  data = [], // optional static fallback (still allowed)
  onRowClick,
  searchQuery,
  selectedStatus,
  selectedDepartment,
  selectedBlock,
  selectedDate,
}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCardId, setOpenCardId] = useState(null);

  // --------------------------------------------------------------
  // 1. Fetch ONLY from DB
  // --------------------------------------------------------------
const fetchFromDB = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to load applications");
    const dbApps = await res.json();

    return dbApps.map((app, idx) => ({
      applicationId: app.applicantId,
      sNo: idx + 1,
      dateOfApplication: app.applicationDate.split("T")[0],
      applicantName: app.applicant,
      subject: app.subject,
      gpBlock: app.block,
      issueDate: app.applicationDate.split("T")[0],
      attachment: app.attachment ? `http://localhost:5000${app.attachment}` : null,

      // ← REAL DATA FROM DB
      concernedOfficer: app.concernedOfficer || "N/A",
      timeline: Array.isArray(app.timeline) ? app.timeline : [],

      status: null,
      pendingDays: 0,
    }));
  } catch (err) {
    setError(err.message);
    return [];
  } finally {
    setLoading(false);
  }
}, []);

  // --------------------------------------------------------------
  // 2. Combine DB + optional static `data` prop
  // --------------------------------------------------------------
  const combineAndProcess = useCallback(
    async (dbApps = []) => {
      const dbIds = new Set(dbApps.map((a) => a.applicationId));

      const staticApps = data
        .filter((item) => !dbIds.has(item.applicationId))
        .map((item, idx) => ({
          ...item,
          sNo: dbApps.length + idx + 1,
        }));

      const allApps = [...dbApps, ...staticApps];

      const processed = allApps.map((app) => {
        const status = determineStatus(app.timeline, app.concernedOfficer);
        const pendingDays = calculatePendingDays(app.issueDate, status);
        return { ...app, status, pendingDays };
      });

      const filtered = filterApplications(processed);
      setApplications(filtered);
    },
    [data, searchQuery, selectedStatus, selectedDepartment, selectedBlock, selectedDate]
  );

  // --------------------------------------------------------------
  // 3. Load on mount + filter change
  // --------------------------------------------------------------
  useEffect(() => {
    fetchFromDB().then(combineAndProcess);
  }, [fetchFromDB, combineAndProcess]);

  // --------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------
  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate)
      return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue)) return 0;
    return Math.ceil((Date.now() - issue.getTime()) / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline, concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A") return "Not Assigned Yet";
    if (!timeline || timeline.length === 0) return "In Process";

    const latest = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latest.includes("disposed")) return "Disposed";
    if (latest.includes("compliance")) return "Compliance";
    if (latest.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  const filterApplications = (apps) => {
    return apps.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        [app.applicantName, app.subject].some((f) =>
          f?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus = !selectedStatus || app.status === selectedStatus;
      const matchesDept =
        !selectedDepartment || app.concernedOfficer === selectedDepartment;
      const matchesBlock = !selectedBlock || app.gpBlock === selectedBlock;

      let matchesDate = true;
      if (selectedDate?.startDate && selectedDate?.endDate) {
        const appDate = new Date(app.dateOfApplication);
        const start = new Date(selectedDate.startDate);
        const end = new Date(selectedDate.endDate);
        matchesDate = appDate >= start && appDate <= end;
      }

      return matchesSearch && matchesStatus && matchesDept && matchesBlock && matchesDate;
    });
  };

  // --------------------------------------------------------------
  // Styling
  // --------------------------------------------------------------
  const getPendingDaysColor = (days) => {
    if (days === 0 || days <= 10) return "bg-green-500 text-white";
    if (days <= 15) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusStyle = (status) => {
    const base = "rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm whitespace-nowrap";
    const map = {
      "Not Assigned Yet": "bg-gray-500 text-white",
      "In Process": "bg-blue-500 text-white",
      "Compliance": "bg-green-600 text-white",
      "Dismissed": "bg-red-600 text-white",
      "Disposed": "bg-purple-500 text-white",
    };
    return `${base} ${map[status] || map["Not Assigned Yet"]}`;
  };

  const toggleCardDetails = (id) => {
    setOpenCardId((prev) => (prev === id ? null : id));
  };

  // --------------------------------------------------------------
  // Render
  // --------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#2810ff]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error}
        <button
          onClick={() => fetchFromDB().then(combineAndProcess)}
          className="ml-4 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="md:pl-16 lg:pl-16">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white mx-auto max-w-8xl p-6 my-6 font-['Montserrat']">
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
              ].map((h, i) => (
                <th key={i} className="px-6 py-4 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500 text-sm">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <motion.tr
                  key={app.applicationId}
                  className="text-sm hover:bg-blue-50 transition cursor-pointer even:bg-gray-50"
                  onClick={() => onRowClick(app)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <td className="px-6 py-4">{app.sNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.dateOfApplication}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{app.applicantName}</td>
                  <td className="px-6 py-4">{app.subject}</td>
                  <td className="px-6 py-4">{app.gpBlock}</td>
                  <td className="px-6 py-4">{app.issueDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPendingDaysColor(
                        app.pendingDays
                      )}`}
                    >
                      {app.pendingDays}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusStyle(app.status)}>{app.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (app.attachment) {
                          window.open(app.attachment, "_blank", "noopener,noreferrer");
                        } else {
                          alert("No PDF attached");
                        }
                      }}
                      className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaFilePdf /> PDF
                    </motion.button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3 py-3 px-2 pb-[100px] overflow-x-hidden font-['Montserrat']">
        {applications.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">No applications found.</div>
        ) : (
          applications.map((app) => (
            <motion.div
              key={app.applicationId}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-3 w-full max-w-[320px] mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onRowClick(app)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate max-w-[50%]">
                  {app.applicantName}
                </h3>
                <span className={getStatusStyle(app.status)}>{app.status}</span>
              </div>

              <div className="text-[9px] sm:text-xs text-gray-700 mb-2 truncate">
                <strong>Subject:</strong> {app.subject}
              </div>

              <motion.button
                className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardDetails(app.applicationId);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-[10px] sm:text-sm font-semibold text-gray-700">
                  Details
                </span>
                {openCardId === app.applicationId ? (
                  <FaChevronUp className="text-gray-500 text-[9px] sm:text-sm" />
                ) : (
                  <FaChevronDown className="text-gray-500 text-[9px] sm:text-sm" />
                )}
              </motion.button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={
                  openCardId === app.applicationId
                    ? { height: "auto", opacity: 1 }
                    : { height: 0, opacity: 0 }
                }
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-1 text-[9px] sm:text-xs text-gray-700 mt-2">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">
                      <strong>Sr. No:</strong> {app.sNo}
                    </span>
                    <span className="truncate">
                      <strong>Date:</strong> {app.dateOfApplication}
                    </span>
                  </div>
                  <div className="truncate">
                    <strong>GP, Block:</strong> {app.gpBlock}
                  </div>
                  <div className="truncate">
                    <strong>Officer:</strong> {app.concernedOfficer}
                  </div>
                  <div className="truncate">
                    <strong>Issue Date:</strong> {app.issueDate}
                  </div>
                  <div>
                    <strong>Pending Days:</strong>{" "}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold shadow-sm ${getPendingDaysColor(
                        app.pendingDays
                      )}`}
                    >
                      {app.pendingDays}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Fixed Bottom PDF Button (Mobile Only) */}
              <div
                className={`fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-center border-t border-gray-200 ${
                  openCardId === app.applicationId ? "block" : "hidden"
                } md:hidden z-10`}
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (app.attachment) {
                      window.open(app.attachment, "_blank", "noopener,noreferrer");
                    } else {
                      alert("No PDF attached");
                    }
                  }}
                  className="flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1 rounded-xl shadow-sm hover:bg-green-700 transition font-semibold text-[9px] sm:text-xs"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaFilePdf className="text-white text-[12px] sm:text-base" />
                  <span>PDF</span>
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
        .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
};

export default WorkAssignedApplicationTable;