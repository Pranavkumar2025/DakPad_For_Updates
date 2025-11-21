// src/pages/PerformanceDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import DashboardLayout from "../components/Dashboard/DashboardLayout";
import TimeFilterDropdown from "../components/Dashboard/TimeFilterDropdown";
import CustomMonthModal from "../components/Dashboard/CustomMonthModal";
import MetricsGrid from "../components/Dashboard/MetricsGrid";
import ChartsSection from "../components/Dashboard/ChartsSection";
import ApplicationsTable from "../components/Dashboard/ApplicationsTable";

const PerformanceDashboard = () => {
  const [rawApplications, setRawApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedCustomMonth, setSelectedCustomMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [showCustomMonthModal, setShowCustomMonthModal] = useState(false);

  const [activeTable, setActiveTable] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const tableRef = useRef(null);
  const itemsPerPage = 10;

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/dashboard/performance");
        if (res.data.success) {
          setRawApplications(res.data.data.applications || []);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // APPLY TIME FILTER
  useEffect(() => {
    let filtered = [...rawApplications];

    if (timeFilter === "month") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      filtered = filtered.filter(app => app.applicationDate?.startsWith(currentMonth));
    } else if (timeFilter === "custom" && selectedCustomMonth) {
      filtered = filtered.filter(app => app.applicationDate?.startsWith(selectedCustomMonth));
    }

    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [timeFilter, selectedCustomMonth, rawApplications]);

  // === CALCULATE EVERYTHING FROM FILTERED DATA ===

  const totalApps = filteredApplications.length;
  const pendingApps = filteredApplications.filter(a =>
    ["In Process", "Not Assigned Yet"].includes(a.status)
  ).length;
  const resolvedApps = filteredApplications.filter(a => a.status === "Compliance").length;
  const complianceRate = totalApps > 0 ? Math.round((resolvedApps / totalApps) * 100) : 0;

  const pendingDaysList = filteredApplications
    .filter(a => ["In Process", "Not Assigned Yet"].includes(a.status))
    .map(a => a.pendingDays || 0);

  const avgPendingDays = pendingDaysList.length > 0
    ? Math.round(pendingDaysList.reduce((a, b) => a + b, 0) / pendingDaysList.length)
    : 0;

  // 4 METRICS
  const metrics = [
    { name: "Total Applications", value: totalApps, trend: "↑ 12%", description: "In selected period" },
    { name: "Pending Applications", value: pendingApps, trend: pendingApps > totalApps * 0.6 ? "↑ High" : "↓ Low", description: "Awaiting action" },
    { name: "Compliance Achieved", value: resolvedApps, trend: resolvedApps > 50 ? "↑ Excellent" : "↑ Good", description: "Successfully resolved", highlight: true },
    { name: "Compliance Rate", value: `${complianceRate}%`, trend: complianceRate >= 80 ? "↑ Excellent" : "↓ Needs Work", description: "Target: ≥80%", color: complianceRate >= 80 ? "text-green-600" : "text-red-600" },
  ];

  // BLOCK PERFORMANCE
  const blockMap = {};
  filteredApplications.forEach(app => {
    const block = app.block || "Unknown";
    if (!blockMap[block]) blockMap[block] = { total: 0, resolved: 0 };
    blockMap[block].total++;
    if (app.status === "Compliance") blockMap[block].resolved++;
  });

  const blocks = Object.entries(blockMap).map(([name, stats]) => ({
    blockName: name,
    totalApplications: stats.total,
    resolvedApplications: stats.resolved,
    pendingApplications: stats.total - stats.resolved,
    resolvedPercentage: Math.round((stats.resolved / stats.total) * 100) || 0,
  })).sort((a, b) => b.resolvedPercentage - a.resolvedPercentage);

  const topBlocks = blocks.slice(0, 5);
  const worstBlocks = blocks
  .filter(b => b.totalApplications > 0)
  .sort((a, b) => a.resolvedPercentage - b.resolvedPercentage)
  .slice(0, 5);

  // PENDING DAYS DISTRIBUTION (FIXED!)
  const ranges = [
    { range: "0-15 Days", min: 0, max: 15 },
    { range: "15-30 Days", min: 15, max: 30 },
    { range: "30-45 Days", min: 30, max: 45 },
    { range: "45-60 Days", min: 45, max: 60 },
    { range: "60+ Days", min: 60, max: Infinity },
  ];

  const pendingDaysData = ranges.map(r => ({
    range: r.range,
    value: filteredApplications.filter(a => {
      if (a.status === "Compliance") return false;
      const days = a.pendingDays || 0;
      return days >= r.min && (r.max === Infinity || days < r.max);
    }).length
  }));

  // STATUS PIE CHART
  const statusData = [
    { category: "Pending", value: pendingApps, color: "#f59e0b" },
    { category: "Compliance", value: resolvedApps, color: "#10b981" },
  ];

  // TABLE FILTER
  const getFilteredApplications = () => {
    let list = [...filteredApplications];

    if (activeTable === "pending") {
      list = list.filter(a => ["In Process", "Not Assigned Yet"].includes(a.status));
    } else if (activeTable === "resolved") {
      list = list.filter(a => a.status === "Compliance");
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(a =>
        a.applicant?.toLowerCase().includes(term) ||
        a.applicantId?.toLowerCase().includes(term) ||
        a.block?.toLowerCase().includes(term) ||
        a.concernedOfficer?.toLowerCase().includes(term)
      );
    }
    return list;
  };

  return (
    <DashboardLayout
      timeFilterComponent={
        <TimeFilterDropdown
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          showCustomMonthModal={() => setShowCustomMonthModal(true)}
          selectedCustomMonth={selectedCustomMonth}
        />
      }
    >
      <div className="space-y-10">

        <MetricsGrid
          metrics={metrics}
          activeTable={activeTable}
          handleMetricClick={(name) => {
            if (name.includes("Pending")) setActiveTable("pending");
            if (name.includes("Compliance")) setActiveTable("resolved");
            tableRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* ALL CHARTS — NOW 100% WORKING WITH TIME FILTER */}
        <ChartsSection
          pendingDaysData={pendingDaysData}
          statusData={[
            { category: "Not Assigned Yet", value: filteredApplications.filter(a => a.status === "Not Assigned Yet").length, color: "#fb923c" },
            { category: "In Process", value: filteredApplications.filter(a => a.status === "In Process").length, color: "#fbbf24" },
            { category: "Compliance", value: filteredApplications.filter(a => a.status === "Compliance").length, color: "#10b981" },
          ]}
          topBlocks={topBlocks}
          worstBlocks={worstBlocks}
          topDepartments={[]}
          worstDepartments={[]}
        />

        <ApplicationsTable
          tableRef={tableRef}
          activeTable={activeTable}
          setActiveTable={setActiveTable}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredApplicationData={filteredApplications}
          getFilteredApplications={getFilteredApplications}
          getUniqueBlocks={() => blocks}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          averageDays={avgPendingDays.toString()}
        />
      </div>

      <CustomMonthModal
        isOpen={showCustomMonthModal}
        onClose={() => setShowCustomMonthModal(false)}
        selectedMonth={selectedCustomMonth}
        setSelectedMonth={setSelectedCustomMonth}
        onApply={() => {
          setTimeFilter("custom");
          setShowCustomMonthModal(false);
        }}
      />
    </DashboardLayout>
  );
};

export default PerformanceDashboard;