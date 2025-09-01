import React, { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import PerformanceJson from "../JsonData/PerformanceData.json";
import {
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  BadgeCheck,
  Clock,
  Users,
  CalendarDays,
  Ticket,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Search,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-600 p-6">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p>Error: {this.state.error.message}</p>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const ApplicationDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [pendingDaysData, setPendingDaysData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [applicationData, setApplicationData] = useState([]);
  const [filteredApplicationData, setFilteredApplicationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState("total"); // 'total', 'pending', 'resolved'
  const [timeFilter, setTimeFilter] = useState("all"); // 'all', 'month', 'custom'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCustomMonth, setSelectedCustomMonth] = useState("2025-08"); // Default to August 2025
  const [showCustomMonthSelector, setShowCustomMonthSelector] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for auto-scrolling
  const tableRef = useRef(null);

  useEffect(() => {
    const { metrics, charts, applicationData } = PerformanceJson.dashboard;
    setMetrics(metrics);
    setPendingDaysData(charts[0].data);
    setStatusData(charts[1].data);
    setApplicationData(applicationData);
    setFilteredApplicationData(applicationData); // Initialize with all data
    setLoading(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".relative")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Filter data based on time filter
  useEffect(() => {
    if (timeFilter === "all") {
      setFilteredApplicationData(applicationData);
      // Restore original metrics and charts
      const { metrics, charts } = PerformanceJson.dashboard;
      setMetrics(metrics);
      setPendingDaysData(charts[0].data);
      setStatusData(charts[1].data);
    } else if (timeFilter === "month") {
      // Filter data for current month (August 2025)
      const filtered = applicationData.filter((app) => {
        // Handle the date format "DD-MMM-YYYY" (e.g., "27-May-2025")
        if (app.Date) {
          const dateParts = app.Date.split("-");
          if (dateParts.length === 3) {
            const month = dateParts[1].toLowerCase();
            const year = dateParts[2];
            // Check if it's August 2025
            return month === "aug" && year === "2025";
          }
        }
        return false;
      });

      console.log("Filtered data for August 2025:", filtered); // Debug log
      setFilteredApplicationData(filtered);

      // Update metrics based on filtered data
      updateMetricsForFilteredData(filtered);

      // Update charts based on filtered data
      updateChartsForFilteredData(filtered);
    } else if (timeFilter === "custom") {
      // Filter data for custom selected month
      const [selectedYear, selectedMonth] = selectedCustomMonth.split("-");
      const monthNames = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];
      const selectedMonthName = monthNames[parseInt(selectedMonth) - 1];

      const filtered = applicationData.filter((app) => {
        // Handle the date format "DD-MMM-YYYY" (e.g., "27-May-2025")
        if (app.Date) {
          const dateParts = app.Date.split("-");
          if (dateParts.length === 3) {
            const month = dateParts[1].toLowerCase();
            const year = dateParts[2];
            // Check if it matches the selected custom month/year
            return month === selectedMonthName && year === selectedYear;
          }
        }
        return false;
      });

      console.log(
        `Filtered data for ${selectedMonthName} ${selectedYear}:`,
        filtered
      ); // Debug log
      setFilteredApplicationData(filtered);

      // Update metrics based on filtered data
      updateMetricsForFilteredData(filtered);

      // Update charts based on filtered data
      updateChartsForFilteredData(filtered);
    }
  }, [timeFilter, applicationData, selectedCustomMonth]);

  // Reset pagination when active table changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTable]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Function to update metrics based on filtered data
  const updateMetricsForFilteredData = (filteredData) => {
    if (timeFilter === "month" || timeFilter === "custom") {
      const totalApplications = filteredData.length;
      const pendingApplications = filteredData.filter(
        (app) => app.Status === "Pending"
      ).length;
      const resolvedApplications = filteredData.filter(
        (app) => app.Status === "Compliance" || app.Status === "Resolved"
      ).length;

      // Calculate average processing time for resolved applications
      const resolvedApps = filteredData.filter(
        (app) => app.Status === "Compliance" || app.Status === "Resolved"
      );
      const avgProcessingTime =
        resolvedApps.length > 0
          ? Math.round(
              resolvedApps.reduce(
                (sum, app) => sum + (app["Pending Days"] || 0),
                0
              ) / resolvedApps.length
            )
          : 0;

      const updatedMetrics = [
        {
          name: "Total Applications",
          value: `${totalApplications}`,
          icon: "📋",
          trend: "↑ 5%",
          trendDetails: `${totalApplications} applications this month`,
          description: "Applications processed this month",
        },
        {
          name: "Pending Applications",
          value: `${pendingApplications}`,
          icon: "⏳",
          trend: "↑ 3%",
          trendDetails: `${pendingApplications} applications awaiting`,
          description: "Applications awaiting approval or review",
        },
        {
          name: "Resolved Applications",
          value: `${resolvedApplications}`,
          icon: "✅",
          trend: "↑ 8%",
          trendDetails: `${resolvedApplications} applications completed`,
          description: "Applications successfully processed and approved",
        },
        {
          name: "Processing Time",
          value: `${avgProcessingTime} Days`,
          icon: "⏱️",
          trend: "↓ 2 Days",
          trendDetails: `Average ${avgProcessingTime} days this month`,
          description: "Average time to complete an application",
        },
      ];

      setMetrics(updatedMetrics);
    }
  };

  // Function to update charts based on filtered data
  const updateChartsForFilteredData = (filteredData) => {
    if (timeFilter === "month" || timeFilter === "custom") {
      // Update pending days distribution
      const pendingDaysRanges = [
        { label: "0-5 Days", min: 0, max: 5 },
        { label: "6-10 Days", min: 6, max: 10 },
        { label: "11-15 Days", min: 11, max: 15 },
        { label: "16-20 Days", min: 16, max: 20 },
        { label: "21+ Days", min: 21, max: Infinity },
      ];

      const pendingDaysData = pendingDaysRanges.map((range) => ({
        label: range.label,
        value: filteredData.filter(
          (app) =>
            app["Pending Days"] >= range.min && app["Pending Days"] <= range.max
        ).length,
      }));

      setPendingDaysData(pendingDaysData);

      // Update status distribution
      const statusCounts = {};
      filteredData.forEach((app) => {
        statusCounts[app.Status] = (statusCounts[app.Status] || 0) + 1;
      });

      const statusData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          label: status,
          value: count,
        })
      );

      setStatusData(statusData);
    }
  };

  // Function to handle time filter change
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  // Customize pending days ranges and calculate additional metrics
  const processPendingDaysData = () => {
    const customRanges = [
      { range: "0-15 Days", min: 0, max: 15 },
      { range: "15-30 Days", min: 15, max: 30 },
      { range: "30-45 Days", min: 30, max: 45 },
      { range: "45-60 Days", min: 45, max: 60 },
      { range: "60+ Days", min: 60, max: Infinity },
    ];

    const counts = customRanges.map((range) => ({
      range: range.range,
      value: filteredApplicationData.filter((app) => {
        const days = Number(app["Pending Days"]) || 0;
        return days >= range.min && days < range.max;
      }).length,
    }));

    // Calculate average pending days
    const totalDays = filteredApplicationData.reduce(
      (sum, app) => sum + (Number(app["Pending Days"]) || 0),
      0
    );
    const averageDays =
      filteredApplicationData.length > 0
        ? (totalDays / filteredApplicationData.length).toFixed(2)
        : 0;

    return { counts, averageDays };
  };

  const { counts, averageDays } = processPendingDaysData();

  // Function to handle metric card clicks
  const handleMetricClick = (metricName) => {
    let tableType = "total";
    if (metricName.toLowerCase().includes("pending")) {
      tableType = "pending";
    } else if (metricName.toLowerCase().includes("resolved")) {
      tableType = "resolved";
    } else if (metricName.toLowerCase().includes("blocks involved")) {
      tableType = "blocks";
    }
    setActiveTable(tableType);

    // Auto-scroll to table
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Function to filter applications based on active table and search term
  const getFilteredApplications = () => {
    let filtered;
    switch (activeTable) {
      case "pending":
        filtered = filteredApplicationData.filter(
          (app) => app.Status === "Pending"
        );
        break;
      case "resolved":
        filtered = filteredApplicationData.filter(
          (app) => app.Status === "Compliance"
        );
        break;
      default:
        filtered = filteredApplicationData;
    }

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((app) => {
        return (
          (app["Name of the complainant"] &&
            app["Name of the complainant"]
              .toLowerCase()
              .includes(searchLower)) ||
          (app["GP, Block"] &&
            app["GP, Block"].toLowerCase().includes(searchLower)) ||
          (app["Concerned Officer"] &&
            app["Concerned Officer"].toLowerCase().includes(searchLower)) ||
          (app.Status && app.Status.toLowerCase().includes(searchLower)) ||
          (app["Issue Letter No"] &&
            app["Issue Letter No"].toLowerCase().includes(searchLower))
        );
      });
    }

    return filtered;
  };

  // Function to get unique blocks for display
  const getUniqueBlocks = () => {
    const { blocks } = PerformanceJson.dashboard;

    let blocksData = blocks.map((block, index) => {
      const blockApplications = filteredApplicationData.filter(
        (app) =>
          app["GP, Block"] &&
          app["GP, Block"].toLowerCase().includes(block.name.toLowerCase())
      );
      const totalApps = blockApplications.length;
      const pendingApps = blockApplications.filter(
        (app) => app.Status === "Pending"
      ).length;
      const resolvedApps = blockApplications.filter(
        (app) => app.Status === "Compliance"
      ).length;
      const rejectedApps = blockApplications.filter(
        (app) => app.Status === "Not Accepted"
      ).length;

      return {
        id: index + 1,
        blockName: block.name,
        division: block.division,
        totalApplications: totalApps,
        pendingApplications: pendingApps,
        resolvedApplications: resolvedApps,
        rejectedApplications: rejectedApps,
        resolvedPercentage:
          totalApps > 0 ? Math.round((resolvedApps / totalApps) * 100) : 0,
      };
    });

    // Apply search filter if search term exists and we're in blocks view
    if (searchTerm.trim() && activeTable === "blocks") {
      const searchLower = searchTerm.toLowerCase();
      blocksData = blocksData.filter((block) => {
        return (
          (block.blockName &&
            block.blockName.toLowerCase().includes(searchLower)) ||
          (block.division && block.division.toLowerCase().includes(searchLower))
        );
      });
    }

    return blocksData;
  };

  // Pagination helper functions
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getPageNumbers = (totalPages) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Function to get paginated applications
  const getPaginatedApplications = () => {
    const allData = getFilteredApplications();
    return getPaginatedData(allData);
  };

  // Function to get paginated blocks
  const getPaginatedBlocks = () => {
    const allBlocks = getUniqueBlocks();
    return getPaginatedData(allBlocks);
  };

  // Function to get table title
  const getTableTitle = () => {
    switch (activeTable) {
      case "pending":
        return "Pending Applications";
      case "resolved":
        return "Resolved Applications";
      case "blocks":
        return "All Blocks Involved";
      default:
        return "All Applications";
    }
  };

  // Function to process block performance data
  const getBlockPerformanceData = () => {
    const blockStats = {};

    // Process each application to calculate block statistics
    filteredApplicationData.forEach((app) => {
      const block = app["GP, Block"];
      if (!blockStats[block]) {
        blockStats[block] = {
          blockName: block,
          totalApplications: 0,
          complianceApplications: 0,
          pendingApplications: 0,
          resolvedPercentage: 0,
        };
      }

      blockStats[block].totalApplications++;

      if (app.Status === "Compliance") {
        blockStats[block].complianceApplications++;
      } else if (app.Status === "Pending") {
        blockStats[block].pendingApplications++;
      }
    });

    // Calculate resolved percentage for each block
    Object.keys(blockStats).forEach((block) => {
      const stats = blockStats[block];
      stats.resolvedPercentage =
        stats.totalApplications > 0
          ? Math.round(
              (stats.complianceApplications / stats.totalApplications) * 100
            )
          : 0;
    });

    // Convert to array and sort by resolved percentage
    const blockArray = Object.values(blockStats);
    blockArray.sort((a, b) => b.resolvedPercentage - a.resolvedPercentage);

    return {
      topPerforming: blockArray.slice(0, 5), // Top 5 performers
      worstPerforming: blockArray.slice(-5).reverse(), // Bottom 5 performers
    };
  };
  const { topPerforming, worstPerforming } = getBlockPerformanceData();

  // Bar chart data for Pending Days Distribution with modern colors
  const barData = {
    labels: counts.map((item) => item.range),
    datasets: [
      {
        label: "Number of Applications",
        data: counts.map((item) => item.value),
        backgroundColor: [
          "#8b5cf6",
          "#3b82f6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
        ],
        borderColor: ["#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706"],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Pie chart data for Application Status with percentages
  const pieData = {
    labels: statusData.map((item) => {
      const percentage = item.percentage || "";
      return `${item.category}${percentage ? ` (${percentage})` : ""}`;
    }),
    datasets: [
      {
        data: statusData.map((item) => item.value),
        backgroundColor: statusData.map((item) => item.color),
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  // Enhanced chart options for Pending Days Distribution
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#4b5563",
          font: { size: 10 },
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} applications`;
          },
        },
        backgroundColor: "#1f2937",
        titleColor: "#facc15",
        bodyColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280", font: { size: 12 } },
        title: {
          display: true,
          text: "Number of Applications",
          color: "#6b7280",
          font: { size: 12 },
        },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
    },
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 10,
          color: "#4b5563",
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
        backgroundColor: "#1f2937",
        titleColor: "#facc15",
        bodyColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      },
    },
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Block/District-wise data with divisions (copied from DashboardPage)
  const blockData = {
    labels: [
      "Patna",
      "Nalanda",
      "Bhojpur",
      "Rohtas",
      "Buxar",
      "Kaimur",
      "Muzaffarpur",
      "West Champaran",
      "East Champaran",
      "Sitamarhi",
      "Sheohar",
      "Vaishali",
      "Gaya",
      "Nawada",
      "Jehanabad",
      "Aurangabad",
      "Arwal",
      "Purnia",
      "Katihar",
      "Kishanganj",
      "Araria",
      "Saharsa",
      "Madhepura",
      "Supaul",
      "Darbhanga",
      "Madhubani",
      "Samastipur",
      "Saran",
      "Siwan",
      "Gopalganj",
      "Bhagalpur",
      "Banka",
      "Munger",
      "Jamui",
      "Khagaria",
      "Lakhisarai",
      "Begusarai",
      "Sheikhpura",
      "Other",
    ],
    datasets: [
      {
        label: "Patna Division",
        backgroundColor: "#6366f1",
        data: [120, 26, 25, 26, 13, 2, ...Array(35).fill(0)],
      },
      {
        label: "Tirhut Division",
        backgroundColor: "#3b82f6",
        data: [
          ...Array(6).fill(0),
          69,
          33,
          64,
          20,
          5,
          50,
          ...Array(27).fill(0),
        ],
      },
      {
        label: "Magadh Division",
        backgroundColor: "#06b6d4",
        data: [...Array(12).fill(0), 34, 11, 13, 28, 11, ...Array(23).fill(0)],
      },
      {
        label: "Purnia Division",
        backgroundColor: "#10b981",
        data: [...Array(17).fill(0), 19, 20, 7, 8, ...Array(19).fill(0)],
      },
      {
        label: "Kosi Division",
        backgroundColor: "#84cc16",
        data: [...Array(21).fill(0), 16, 12, 11, ...Array(17).fill(0)],
      },
      {
        label: "Darbhanga Division",
        backgroundColor: "#f59e0b",
        data: [...Array(24).fill(0), 48, 26, 25, ...Array(15).fill(0)],
      },
      {
        label: "Saran Division",
        backgroundColor: "#f97316",
        data: [...Array(27).fill(0), 39, 9, 12, ...Array(12).fill(0)],
      },
      {
        label: "Bhagalpur Division",
        backgroundColor: "#ef4444",
        data: [...Array(30).fill(0), 32, 8, ...Array(9).fill(0)],
      },
      {
        label: "Munger Division",
        backgroundColor: "#a855f7",
        data: [...Array(32).fill(0), 15, 9, 6, 12, 38, 4, 0],
      },
      {
        label: "Other(Uncategorized)",
        backgroundColor: "#9ca3af",
        data: [...Array(38).fill(0), 65],
      },
    ],
  };

  // Enhanced chart options for Block-wise Applications
  const blockBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 10,
          color: "#4b5563",
          usePointStyle: true,
          font: {
            size: 10,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "nearest",
        intersect: true,
        callbacks: {
          title: function (tooltipItems) {
            const item = tooltipItems[0];
            return item.dataset.label; // Division as the title
          },
          label: function (tooltipItem) {
            if (
              tooltipItem.dataIndex === 0 &&
              tooltipItem.dataset.label === "Patna Division"
            ) {
              return `${tooltipItem.label}: 320`; // show adjusted value for Patna
            }
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
        backgroundColor: "#1f2937",
        titleColor: "#facc15",
        bodyColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "#6b7280",
          autoSkip: false,
          maxRotation: 90,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "Districts/Blocks",
        },
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "No. of Pending Applications",
        },
        ticks: {
          color: "#6b7280",
        },
        grid: {
          color: "#e5e7eb",
        },
      },
    },
  };

  // Top Performing Blocks Chart Data
  const topPerformingChartData = {
    labels: topPerforming.map((block) => block.blockName),
    datasets: [
      {
        label: "Resolved Percentage",
        data: topPerforming.map((block) =>
          Math.max(block.resolvedPercentage, 1)
        ), // Minimum 1% for visibility
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Top Performing Blocks Chart Options
  const topPerformingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function (context) {
            const blockIndex = context.dataIndex;
            const block = topPerforming[blockIndex];
            return [
              `Resolved: ${block.resolvedPercentage}%`, // Show actual percentage, not the inflated one
              `Total: ${block.totalApplications}`,
              `Compliance: ${block.complianceApplications}`,
              `Pending: ${block.pendingApplications}`,
            ];
          },
        },
        backgroundColor: "#1f2937",
        titleColor: "#facc15",
        bodyColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#6b7280",
          font: { size: 10 },
          callback: function (value) {
            return value + "%";
          },
        },
        title: {
          display: true,
          text: "Resolved Percentage",
          color: "#6b7280",
          font: { size: 11 },
        },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: {
          color: "#6b7280",
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { display: false },
      },
    },
  };

  // Worst Performing Blocks Chart Data
  const worstPerformingChartData = {
    labels: worstPerforming.map((block) => block.blockName),
    datasets: [
      {
        label: "Resolved Percentage",
        data: worstPerforming.map((block) =>
          Math.max(block.resolvedPercentage, 1)
        ), // Minimum 1% for visibility
        backgroundColor: "#ef4444",
        borderColor: "#dc2626",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Worst Performing Blocks Chart Options
  const worstPerformingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function (context) {
            const blockIndex = context.dataIndex;
            const block = worstPerforming[blockIndex];
            return [
              `Resolved: ${block.resolvedPercentage}%`, // Show actual percentage, not the inflated one
              `Total: ${block.totalApplications}`,
              `Compliance: ${block.complianceApplications}`,
              `Pending: ${block.pendingApplications}`,
            ];
          },
        },
        backgroundColor: "#1f2937",
        titleColor: "#facc15",
        bodyColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#6b7280",
          font: { size: 10 },
          callback: function (value) {
            return value + "%";
          },
        },
        title: {
          display: true,
          text: "Resolved Percentage",
          color: "#6b7280",
          font: { size: 11 },
        },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: {
          color: "#6b7280",
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { display: false },
      },
    },
  };

  // Helper function to get icon for metrics
  const getMetricIcon = (metricName, index) => {
    const icons = [
      <FileText size={24} />,
      <CheckCircle2 size={24} />,
      <Clock size={24} />,
      <AlertCircle size={24} />,
      <TrendingUp size={24} />,
      <BarChart3 size={24} />,
    ];
    return icons[index % icons.length];
  };

  // Helper function to get icon color for metrics
  const getMetricIconColor = (index) => {
    const colors = [
      "text-purple-500",
      "text-green-500",
      "text-yellow-500",
      "text-red-500",
      "text-blue-500",
      "text-indigo-500",
    ];
    return colors[index % colors.length];
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#e0f2f1] to-[#fce4ec] flex items-center justify-center">
        <div className="text-center text-gray-700 text-2xl">Loading...</div>
      </div>
    );

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 overflow-x-hidden">
        <div className="md:px-4 pt-12  bg-gradient-to-br from-[#f3e8ff] via-[#e0f2f1] to-[#fce4ec] min-h-screen">
          <div className="mx-auto max-w-7xl">
            {/* Header with Filter */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start pt-10 sm:pt-4 mb-8">
              <div className="text-center lg:text-left">
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {PerformanceJson.dashboard.title}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Last updated: {PerformanceJson.dashboard.lastUpdated}
                </p>
              </div>

              {/* Time Filter Dropdown */}
              <div className="mt-4 lg:mt-0 flex justify-center lg:justify-end">
                <div className="relative">
                  <div
                    className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-2xl p-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="text-gray-500" size={16} />
                      <span className="text-gray-700 text-sm font-medium pr-2 min-w-20">
                        {timeFilter === "all"
                          ? "All Time"
                          : timeFilter === "month"
                          ? "This Month"
                          : `Custom (${new Date(
                              selectedCustomMonth + "-01"
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })})`}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-md border border-gray-100/90 rounded-2xl overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-50">
                      <div
                        className="px-4 py-2 hover:bg-gray-50/70 cursor-pointer text-sm text-gray-700 transition-colors"
                        onClick={() => {
                          handleTimeFilterChange("all");
                          setIsDropdownOpen(false);
                        }}
                      >
                        All Time
                      </div>
                      <div
                        className="px-4 py-2 hover:bg-gray-50/70 cursor-pointer text-sm text-gray-700 transition-colors"
                        onClick={() => {
                          handleTimeFilterChange("month");
                          setIsDropdownOpen(false);
                        }}
                      >
                        This Month
                      </div>
                      <div
                        className="px-4 py-2 hover:bg-gray-50/70 cursor-pointer text-sm text-gray-700 transition-colors"
                        onClick={() => {
                          setShowCustomMonthSelector(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Custom Month
                      </div>
                    </div>
                  )}

                  {/* Custom Month Selector Modal */}
                  {showCustomMonthSelector && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl p-6 max-w-sm w-full mx-4 drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Select Custom Month
                        </h3>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month & Year
                          </label>
                          <input
                            type="month"
                            value={selectedCustomMonth}
                            onChange={(e) =>
                              setSelectedCustomMonth(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
                            min="2024-01"
                            max="2025-12"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowCustomMonthSelector(false);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              handleTimeFilterChange("custom");
                              setShowCustomMonthSelector(false);
                            }}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="scale-100 px-20 pb-10">
            {/* Top Metrics Cards */}
            <div className="gap-4 flex flex-col">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => {
                  // Determine if this card should be highlighted
                  const isActive =
                    (activeTable === "total" &&
                      metric.name.toLowerCase().includes("total")) ||
                    (activeTable === "pending" &&
                      metric.name.toLowerCase().includes("pending")) ||
                    (activeTable === "resolved" &&
                      metric.name.toLowerCase().includes("resolved")) ||
                    (activeTable === "blocks" &&
                      metric.name.toLowerCase().includes("blocks"));

                  return (
                    <div
                      key={index}
                      onClick={() => handleMetricClick(metric.name)}
                      className={`${
                        isActive
                          ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-300 ring-2 ring-purple-200"
                          : "bg-white/70 border-gray-100/90"
                      } backdrop-blur-md border rounded-3xl p-5 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg`}
                    >
                      <div
                        className={`absolute top-4 right-4 ${getMetricIconColor(
                          index
                        )}`}
                      >
                        {getMetricIcon(metric.name, index)}
                      </div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {metric.name}
                      </h3>
                      <p
                        className={`text-3xl font-bold mb-2 ${
                          isActive ? "text-purple-800" : "text-purple-700"
                        }`}
                      >
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <ArrowUpRight size={16} />
                        <span className="text-xs">{metric.trend}</span>
                      </div>
                      {metric.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {metric.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-4">
                {/* Pending Days Distribution Chart */}
                <div className="md:w-3/5 bg-white/70 backdrop-blur-md border-gray-100/90 border rounded-3xl p-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <span className="text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                        {PerformanceJson.dashboard.charts[0].title}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-64">
                    <Bar data={barData} options={barChartOptions} />
                  </div>
                  {averageDays && (
                    <p className="text-xs italic text-gray-500 mt-2">
                      Average pending days: {averageDays} days
                    </p>
                  )}
                </div>

                {/* Application Status Pie Chart */}
                <div className="md:w-2/5 bg-white/70 backdrop-blur-md border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <span className="text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                      {PerformanceJson.dashboard.charts[1].title}
                    </span>
                  </div>
                  <div className="w-full mt-5" style={{ height: "320px" }}>
                    <Pie data={pieData} options={pieChartOptions} />
                  </div>
                </div>
              </div>

              {/* Block Performance Charts */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Top Performing Blocks Chart */}
                <div className="md:w-1/2 bg-white/70 backdrop-blur-md border-gray-100/90 border rounded-3xl p-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-green-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-700">
                      Top Performing Blocks
                    </h3>
                  </div>
                  <div className="w-full h-80">
                    <Bar
                      data={topPerformingChartData}
                      options={topPerformingChartOptions}
                    />
                  </div>
                  <p className="text-xs italic text-gray-500 mt-2">
                    Hover over bars to see detailed statistics
                  </p>
                </div>

                {/* Worst Performing Blocks Chart */}
                <div className="md:w-1/2 bg-white/70 backdrop-blur-md border-gray-100/90 border rounded-3xl p-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="text-red-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-700">
                      Worst Performing Blocks
                    </h3>
                  </div>
                  <div className="w-full h-80">
                    <Bar
                      data={worstPerformingChartData}
                      options={worstPerformingChartOptions}
                    />
                  </div>
                  <p className="text-xs italic text-gray-500 mt-2">
                    Hover over bars to see detailed statistics
                  </p>
                </div>
              </div>

              {/* Block-wise Applications */}
              <div className="text-lg font-semibold bg-white/70 backdrop-blur-md border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    Block-wise Pending Applications Grouped by Division
                  </span>
                </div>
                <div className="w-full h-96">
                  <Bar data={blockData} options={blockBarChartOptions} />
                </div>
                <p className="text-xs italic text-gray-500 mt-2">
                  Distribution of pending applications across blocks/districts
                  grouped by division.
                </p>
              </div>

              {/* Conditional Applications Table */}
              <div
                ref={tableRef}
                className="bg-white/70 backdrop-blur-md border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    {getTableTitle()}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {activeTable === "blocks" ? (
                        <>
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            currentPage * itemsPerPage,
                            getUniqueBlocks().length
                          )}{" "}
                          of {getUniqueBlocks().length} blocks
                        </>
                      ) : (
                        <>
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            currentPage * itemsPerPage,
                            getFilteredApplications().length
                          )}{" "}
                          of {getFilteredApplications().length} applications
                        </>
                      )}
                    </span>
                    <AlertCircle
                      className="text-gray-400 cursor-pointer hover:text-gray-600"
                      size={20}
                    />
                  </div>
                </div>

                {/* Search Bar - For Applications and Blocks */}
                <div className="mb-4">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={
                        activeTable === "blocks"
                          ? "Search blocks by name or division..."
                          : "Search applications by name, block, officer, status..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <span className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                          ✕
                        </span>
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 mt-1">
                      {activeTable === "blocks" ? (
                        <>
                          Found {getUniqueBlocks().length} blocks matching "
                          {searchTerm}"
                        </>
                      ) : (
                        <>
                          Found {getFilteredApplications().length} applications
                          matching "{searchTerm}"
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Table Navigation Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTable("total")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTable === "total"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All Applications ({filteredApplicationData.length})
                  </button>
                  <button
                    onClick={() => setActiveTable("pending")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTable === "pending"
                        ? "bg-yellow-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Pending (
                    {
                      filteredApplicationData.filter(
                        (app) => app.Status === "Pending"
                      ).length
                    }
                    )
                  </button>
                  <button
                    onClick={() => setActiveTable("resolved")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTable === "resolved"
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Resolved (
                    {
                      filteredApplicationData.filter(
                        (app) => app.Status === "Compliance"
                      ).length
                    }
                    )
                  </button>
                  <button
                    onClick={() => setActiveTable("blocks")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTable === "blocks"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Blocks ({getUniqueBlocks().length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/50">
                        {activeTable === "blocks" ? (
                          <>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              S.No.
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Block Name
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Division
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Total Applications
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Pending
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Resolved
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Rejected
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Resolution Rate
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              S.No.
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Date
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Complainant
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              GP, Block
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Concerned Officer
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Pending Days
                            </th>
                            <th className="p-3 text-gray-700 font-medium text-sm">
                              Status
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTable === "blocks" ? (
                        getPaginatedBlocks().length > 0 ? (
                          getPaginatedBlocks().map((block, index) => (
                            <tr
                              key={`block-${block.id}`}
                              className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="p-3 text-gray-600 text-sm">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td className="p-3 text-gray-600 text-sm font-medium">
                                {block.blockName}
                              </td>
                              <td className="p-3 text-blue-600 text-sm">
                                {block.division}
                              </td>
                              <td className="p-3 text-gray-600 text-sm">
                                {block.totalApplications}
                              </td>
                              <td className="p-3 text-yellow-600 text-sm font-medium">
                                {block.pendingApplications}
                              </td>
                              <td className="p-3 text-green-600 text-sm font-medium">
                                {block.resolvedApplications}
                              </td>
                              <td className="p-3 text-red-600 text-sm font-medium">
                                {block.rejectedApplications}
                              </td>
                              <td className="p-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-medium ${
                                      block.resolvedPercentage >= 70
                                        ? "text-green-600"
                                        : block.resolvedPercentage >= 40
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {block.resolvedPercentage}%
                                  </span>
                                  <div className="w-12 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        block.resolvedPercentage >= 70
                                          ? "bg-green-500"
                                          : block.resolvedPercentage >= 40
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${Math.max(
                                          block.resolvedPercentage,
                                          2
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="8"
                              className="p-3 text-center text-gray-500 text-sm"
                            >
                              No blocks available.
                            </td>
                          </tr>
                        )
                      ) : getPaginatedApplications().length > 0 ? (
                        getPaginatedApplications().map((app, index) => {
                          const avgDays = Number(app["Pending Days"]) || 0;
                          let colorClass = "";
                          if (avgDays <= 30) colorClass = "text-green-600";
                          else if (avgDays <= 60)
                            colorClass = "text-yellow-600";
                          else colorClass = "text-red-600";

                          // Handle inconsistent S.No field names in the data
                          const serialNo =
                            app["S.No."] ||
                            app["S.No"] ||
                            (currentPage - 1) * itemsPerPage + index + 1;

                          return (
                            <tr
                              key={`app-${serialNo}-${index}`}
                              className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="p-3 text-gray-600 text-sm">
                                {serialNo}
                              </td>
                              <td className="p-3 text-gray-600 text-sm">
                                {formatDate(app.Date)}
                              </td>
                              <td className="p-3 text-gray-600 text-sm">
                                {app["Name of the complainant"]}
                              </td>
                              <td className="p-3 text-gray-600 text-sm">
                                {app["GP, Block"]}
                              </td>
                              <td className="p-3 text-gray-600 text-sm">
                                {app["Concerned Officer"]}
                              </td>
                              <td
                                className={`p-3 font-medium text-sm ${colorClass}`}
                              >
                                {app["Pending Days"]}
                              </td>
                              <td className="p-3 text-gray-600 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    app.Status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : app.Status === "Compliance"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {app.Status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-3 text-center text-gray-500 text-sm"
                          >
                            No {activeTable === "total" ? "" : activeTable}{" "}
                            applications available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {((activeTable === "blocks" && getUniqueBlocks().length > 0) ||
                  (activeTable !== "blocks" &&
                    getFilteredApplications().length > 0)) && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {activeTable === "blocks" ? (
                        <>
                          Page {currentPage} of{" "}
                          {Math.max(1, getTotalPages(getUniqueBlocks()))}(
                          {getUniqueBlocks().length} total blocks)
                        </>
                      ) : (
                        <>
                          Page {currentPage} of{" "}
                          {Math.max(
                            1,
                            getTotalPages(getFilteredApplications())
                          )}
                          ({getFilteredApplications().length} total
                          applications)
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers(
                          activeTable === "blocks"
                            ? Math.max(1, getTotalPages(getUniqueBlocks()))
                            : Math.max(
                                1,
                                getTotalPages(getFilteredApplications())
                              )
                        ).map((pageNumber) => (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === pageNumber
                                ? "bg-purple-600 text-white shadow-lg"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              activeTable === "blocks"
                                ? Math.max(1, getTotalPages(getUniqueBlocks()))
                                : Math.max(
                                    1,
                                    getTotalPages(getFilteredApplications())
                                  )
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          (activeTable === "blocks"
                            ? Math.max(1, getTotalPages(getUniqueBlocks()))
                            : Math.max(
                                1,
                                getTotalPages(getFilteredApplications())
                              ))
                        }
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage ===
                          (activeTable === "blocks"
                            ? Math.max(1, getTotalPages(getUniqueBlocks()))
                            : Math.max(
                                1,
                                getTotalPages(getFilteredApplications())
                              ))
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Table Summary */}
                <div className="mt-4 p-3 bg-gray-50/50 rounded-lg">
                  {activeTable === "blocks" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <span className="text-gray-500">Total Blocks</span>
                        <p className="text-lg font-semibold text-gray-700">
                          {getUniqueBlocks().length}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500">
                          Average Resolution Rate
                        </span>
                        <p className="text-lg font-semibold text-blue-600">
                          {getUniqueBlocks().length > 0
                            ? Math.round(
                                getUniqueBlocks().reduce(
                                  (sum, block) =>
                                    sum + block.resolvedPercentage,
                                  0
                                ) / getUniqueBlocks().length
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500">
                          Best Performing Block
                        </span>
                        <p className="text-lg font-semibold text-green-600">
                          {getUniqueBlocks().length > 0
                            ? getUniqueBlocks().reduce((best, current) =>
                                current.resolvedPercentage >
                                best.resolvedPercentage
                                  ? current
                                  : best
                              ).blockName
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <span className="text-gray-500">
                          Total Applications
                        </span>
                        <p className="text-lg font-semibold text-gray-700">
                          {filteredApplicationData.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500">
                          Average Pending Days
                        </span>
                        <p className="text-lg font-semibold text-yellow-600">
                          {averageDays} days
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500">Resolution Rate</span>
                        <p className="text-lg font-semibold text-green-600">
                          {Math.round(
                            (filteredApplicationData.filter(
                              (app) => app.Status === "Compliance"
                            ).length /
                              filteredApplicationData.length) *
                              100
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ApplicationDashboard;
