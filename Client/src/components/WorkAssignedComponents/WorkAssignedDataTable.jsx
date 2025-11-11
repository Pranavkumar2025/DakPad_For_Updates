// src/pages/WorkAssignedDataTable.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import WorkAssignedFilterHeader from "./WorkAssignedFilterHeader";
import WorkAssignedApplicationTable from "./WorkAssignedApplicationTable";
import AssigningWork from "./AssigningWork";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../../utils/api"; // <-- NEW: Use axios with cookies

const WorkAssignedDataTable = () => {
  // ---------- Filters ----------
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedDate, setSelectedDate] = useState({ startDate: null, endDate: null });
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Table Data ----------
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- Modal ----------
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // ---------- Helpers ----------
  const calculatePendingDays = (issueDate, status) => {
    if (["Compliance", "Disposed", "Dismissed"].includes(status) || !issueDate) return 0;
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) return 0;
    const diff = Date.now() - issue.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const determineStatus = (timeline = [], officer) => {
    if (!officer || officer === "N/A") return "Not Assigned Yet";
    if (!Array.isArray(timeline) || timeline.length === 0) return "In Process";

    const latest = timeline[timeline.length - 1]?.section?.toLowerCase() || "";
    if (latest.includes("disposed")) return "Disposed";
    if (latest.includes("compliance")) return "Compliance";
    if (latest.includes("dismissed")) return "Dismissed";
    return "In Process";
  };

  // ---------- Map DB → Table Row ----------
  const mapDbAppToTableRow = (dbApp, originalSNo = null) => {
    const status = determineStatus(dbApp.timeline, dbApp.concernedOfficer);
    const pendingDays = calculatePendingDays(dbApp.applicationDate, status);

    return {
      applicationId: dbApp.applicantId,
      sNo: originalSNo,
      dateOfApplication: dbApp.applicationDate.split("T")[0],
      applicantName: dbApp.applicant || "Unknown",
      subject: dbApp.subject || "N/A",
      gpBlock: dbApp.block || "N/A",
      issueDate: dbApp.applicationDate.split("T")[0],
      attachment: dbApp.attachment ? `http://localhost:5000${dbApp.attachment}` : null,
      concernedOfficer: dbApp.concernedOfficer || "N/A",
      timeline: Array.isArray(dbApp.timeline) ? dbApp.timeline : [],
      status,
      pendingDays,
    };
  };

  // ---------- Fetch Applications (with JWT cookie) ----------
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/applications"); // <-- Sends cookie
      const dbApps = Array.isArray(res.data) ? res.data : [];

      const mapped = dbApps.map((app, idx) => mapDbAppToTableRow(app, idx + 1));
      setApplications(mapped);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ---------- Instant Row Update ----------
  const handleRowUpdate = (updatedDbApp) => {
    const originalRow = applications.find(
      (a) => a.applicationId === updatedDbApp.applicantId
    );

    if (!originalRow) return;

    const updatedRow = mapDbAppToTableRow(updatedDbApp, originalRow.sNo);

    setApplications((prev) =>
      prev.map((app) =>
        app.applicationId === updatedRow.applicationId ? updatedRow : app
      )
    );
  };

  // ---------- Filtered Data ----------
  const filteredCases = useMemo(() => {
    return applications.filter((c) => {
      const matchStatus = !selectedStatus || c.status === selectedStatus;
      const matchDepartment =
        !selectedDepartment || c.concernedOfficer === selectedDepartment;
      const matchBlock = !selectedBlock || c.gpBlock === selectedBlock;
      const matchSearch =
        searchQuery === "" ||
        c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase());

      let matchDate = true;
      if (selectedDate.startDate && selectedDate.endDate) {
        const appDate = new Date(c.dateOfApplication);
        const startDate = new Date(selectedDate.startDate);
        const endDate = new Date(selectedDate.endDate);
        matchDate = appDate >= startDate && appDate <= endDate;
      }

      return matchStatus && matchDepartment && matchBlock && matchDate && matchSearch;
    });
  }, [
    applications,
    selectedStatus,
    selectedDepartment,
    selectedBlock,
    selectedDate,
    searchQuery,
  ]);

  // ---------- Excel Export ----------
  const handleDownloadExcel = () => {
    const exportData = filteredCases.map((c) => ({
      "Sr. No": c.sNo,
      "Application ID": c.applicationId,
      Date: c.dateOfApplication,
      Applicant: c.applicantName,
      Subject: c.subject,
      "GP, Block": c.gpBlock,
      "Issue Date": c.issueDate,
      "Pending Days": c.pendingDays,
      Status: c.status,
      "Concerned Officer": c.concernedOfficer,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "ApplicationsList.xlsx");
  };

  // ---------- Row Click ----------
  const handleRowClick = (row) => {
    setSelectedCase(row);
    setOpenDialog(true);
  };

  // ---------- Escape to close ----------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenDialog(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={fetchApplications}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      {/* Filter Header */}
      <WorkAssignedFilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredCases.length}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onExcelClick={handleDownloadExcel}
        applications={applications}
        setApplications={setApplications}
      />

      {/* Table */}
      <WorkAssignedApplicationTable
        data={filteredCases}
        onRowClick={handleRowClick}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        selectedDepartment={selectedDepartment}
        selectedBlock={selectedBlock}
        selectedDate={selectedDate}
      />

      {/* Assign Modal – instant update */}
      {openDialog && selectedCase && (
        <AssigningWork
          data={selectedCase}
          onClose={() => setOpenDialog(false)}
          onUpdate={handleRowUpdate}
        />
      )}
    </div>
  );
};

export default WorkAssignedDataTable;