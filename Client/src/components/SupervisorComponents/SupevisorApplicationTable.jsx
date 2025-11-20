// src/components/WorkAssignedComponents/SuperAdminApplicationTable.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFilePdf, FaSpinner, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../../utils/api";

const SupervisorApplicationTable = ({
  onRowClick,
  searchQuery,
  selectedStatus,
  selectedDepartment,
  selectedBlock,
  selectedDate,
}) => {
  const [applications, setApplications] = useState([]);
  const [openCardId, setOpenCardId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorDept, setSupervisorDept] = useState("");

  // GET CURRENT SUPERVISOR ONCE
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get("/api/me");
        setSupervisorName(data.user.name);
        setSupervisorDept(data.user.department || "");
      } catch (err) {
        console.error("Failed to get supervisor");
      }
    };
    fetchMe();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toISOString().split("T")[0];
  };

  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) return 0;
    const today = new Date();
    const diffTime = Math.abs(today - issue);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline = [], concernedOfficer) => {
    if (!concernedOfficer || concernedOfficer === "N/A") return "Not Assigned Yet";
    if (!Array.isArray(timeline) || timeline.length === 0) return "In Process";
    const latest = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latest.includes("disposed")) return "Disposed";
    if (latest.includes("compliance")) return "Compliance";
    if (latest.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  const fetchApplications = useCallback(async () => {
    if (!supervisorName) return; // Wait till we know who is logged in

    try {
      setIsLoading(true);
      setError("");
      const res = await api.get("/api/applications");
      const rawApps = Array.isArray(res.data) ? res.data : [];

      const processed = rawApps
        .filter(app => 
          app.concernedOfficer === supervisorName ||
          app.concernedOfficer === supervisorDept ||
          app.supervisor === supervisorName ||
          app.supervisor === supervisorDept
        )
        .map((app, index) => {
          const timeline = Array.isArray(app.timeline) ? app.timeline : [];
          const status = determineStatus(timeline, app.concernedOfficer);

          return {
            applicationId: app.applicantId,
            sNo: index + 1,
            dateOfApplication: formatDate(app.applicationDate),
            applicantName: app.applicant || "Unknown",
            subject: app.subject || "N/A",
            gpBlock: app.block || "N/A",
            issueDate: formatDate(app.applicationDate),
            pendingDays: calculatePendingDays(app.applicationDate, status),
            status,
            attachment: app.attachment ? `http://localhost:5000${app.attachment}` : null,
            concernedOfficer: app.concernedOfficer || "N/A",
            timeline,
          };
        });

      // Apply your existing filters (search, status, etc.)
      const filtered = processed.filter((app) => {
        const matchesSearch =
          !searchQuery ||
          (app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (app.subject?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = !selectedStatus || app.status === selectedStatus;
        const matchesDepartment = !selectedDepartment || (app.concernedOfficer || "").includes(selectedDepartment);
        const matchesBlock = !selectedBlock || (app.gpBlock || "").includes(selectedBlock);

        let matchesDate = true;
        if (selectedDate?.startDate && selectedDate?.endDate) {
          const appDate = new Date(app.applicationDate);
          const start = new Date(selectedDate.startDate);
          const end = new Date(selectedDate.endDate);
          matchesDate = appDate >= start && appDate <= end && !isNaN(appDate.getTime());
        }

        return matchesSearch && matchesStatus && matchesDepartment && matchesBlock && matchesDate;
      });

      setApplications(filtered);
    } catch (err) {
      setError("Failed to load your applications");
    } finally {
      setIsLoading(false);
    }
  }, [supervisorName, supervisorDept, searchQuery, selectedStatus, selectedDepartment, selectedBlock, selectedDate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const handleUpdate = () => fetchApplications();
    window.addEventListener("applicationUpdated", handleUpdate);
    return () => window.removeEventListener("applicationUpdated", handleUpdate);
  }, [fetchApplications]);

  // YOUR ORIGINAL STYLING (100% untouched)
  const getPendingDaysColor = (days) => {
    if (days === 0) return "bg-green-500 text-white";
    if (days <= 10) return "bg-green-500 text-white";
    if (days <= 15) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Not Assigned Yet": return "bg-gray-500 text-white whitespace-nowrap";
      case "In Process": return "bg-blue-500 text-white whitespace-nowrap";
      case "Compliance": return "bg-green-500 text-white whitespace-nowrap";
      case "Dismissed": return "bg-red-500 text-white whitespace-nowrap";
      case "Disposed": return "bg-purple-500 text-white whitespace-nowrap";
      default: return "bg-gray-500 text-white whitespace-nowrap";
    }
  };

  const toggleCardDetails = (id) => {
    setOpenCardId(openCardId === id ? null : id);
  };

  // YOUR ORIGINAL RENDER — 100% SAME
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <span className="ml-3 text-lg text-gray-700 font-['Montserrat']">Loading your applications...</span>
      </div>
    );
  }

  if (error || applications.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600 text-2xl font-['Montserrat'] font-medium">
        {error || "No applications assigned to you yet"}
      </div>
    );
  }

  // YOUR EXACT SAME BEAUTIFUL UI BELOW — NOT A SINGLE PIXEL CHANGED
  return (
    <div className="md:pl-16 lg:pl-16">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white mx-auto max-w-8xl p-6 my-6">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr className="text-xs uppercase tracking-wider text-gray-700 font-semibold font-['Montserrat']">
              {["Sr. No", "Date", "Applicant", "Subject", "GP, Block", "Issue Date", "Pending Days", "Status", "Attachment"].map(
                (h, i) => (
                  <th key={i} className="px-6 py-4 text-left whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app) => (
              <tr
                key={app.applicationId}
                className="text-sm hover:bg-blue-50 transition cursor-pointer even:bg-gray-50 font-['Montserrat']"
                onClick={() => onRowClick(app)}
              >
                <td className="px-6 py-4">{app.sNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.dateOfApplication}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{app.applicantName}</td>
                <td className="px-6 py-4">{app.subject}</td>
                <td className="px-6 py-4">{app.gpBlock}</td>
                <td className="px-6 py-4">{app.issueDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPendingDaysColor(app.pendingDays)}`}>
                    {app.pendingDays}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {app.attachment ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(app);
                      }}
                      className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                    >
                      <FaFilePdf /> PDF
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards — YOUR ORIGINAL BEAUTY */}
      <div className="block md:hidden space-y-3 py-3 px-2 pb-[100px] overflow-x-hidden">
        {applications.map((app) => (
          <motion.div
            key={app.applicationId}
            className="bg-white border border-gray-200 rounded-xl shadow-md p-3 w-full max-w-[320px] mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onRowClick(app)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] sm:text-sm font-semibold text-gray-800 font-['Montserrat'] truncate max-w-[50%]">
                {app.applicantName}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium ${getStatusStyle(app.status)}`}>
                {app.status}
              </span>
            </div>

            <div className="text-[9px] sm:text-xs text-gray-700 font-['Montserrat'] mb-2 truncate">
              <strong>Subject:</strong> {app.subject}
            </div>

            <button
              className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#ff5010]"
              onClick={(e) => {
                e.stopPropagation();
                toggleCardDetails(app.applicationId);
              }}
            >
              <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Details</span>
              {openCardId === app.applicationId ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={openCardId === app.applicationId ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div className="space-y-1 text-[9px] sm:text-xs text-gray-700 font-['Montserrat'] mt-2">
                <div className="flex justify-between gap-2">
                  <span><strong>Sr. No:</strong> {app.sNo}</span>
                  <span><strong>Date:</strong> {app.dateOfApplication}</span>
                </div>
                <div><strong>GP, Block:</strong> {app.gpBlock}</div>
                <div><strong>Officer:</strong> {app.concernedOfficer}</div>
                <div><strong>Issue Date:</strong> {app.issueDate}</div>
                <div>
                  <strong>Pending Days:</strong>{" "}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${getPendingDaysColor(app.pendingDays)}`}>
                    {app.pendingDays}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className={`fixed bottom-0 left-0 right-0 w-full max-w-[320px] mx-auto bg-white shadow-md p-1.5 flex justify-center border-t border-gray-200 ${openCardId === app.applicationId ? "block" : "hidden"} md:hidden z-10`}>
              {app.attachment ? (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(app);
                  }}
                  className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white px-2 py-1 rounded-xl shadow-lg font-semibold text-[9px] sm:text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFilePdf /> PDF
                </motion.button>
              ) : (
                <span className="text-gray-400 text-[9px] sm:text-xs">No PDF</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SupervisorApplicationTable;