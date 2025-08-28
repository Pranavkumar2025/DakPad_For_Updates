import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { metrics, charts, applicationData } = PerformanceJson.dashboard;
    setMetrics(metrics);
    setPendingDaysData(charts[0].data);
    setStatusData(charts[1].data);
    setApplicationData(applicationData);
    setLoading(false);
  }, []);

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
      value: applicationData.filter((app) => {
        const days = Number(app["Pending Days"]) || 0;
        return days >= range.min && days < range.max;
      }).length,
    }));

    // Calculate average pending days
    const totalDays = applicationData.reduce(
      (sum, app) => sum + (Number(app["Pending Days"]) || 0),
      0
    );
    const averageDays =
      applicationData.length > 0
        ? (totalDays / applicationData.length).toFixed(2)
        : 0;

    return { counts, averageDays };
  };

  const { counts, averageDays } = processPendingDaysData();

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

  // Process department-wise data with truncated labels
  const processDepartmentData = () => {
    const departmentCounts = applicationData.reduce((acc, app) => {
      const dept = app["Concerned Officer"] || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(departmentCounts).map((dept) =>
      dept.length > 15 ? `${dept.substring(0, 15)}...` : dept
    );
    const fullLabels = Object.keys(departmentCounts); // For tooltips
    const data = Object.values(departmentCounts);

    return {
      labels,
      fullLabels,
      data,
    };
  };

  const { labels, fullLabels, data } = processDepartmentData();

  // Bar chart data for Department-wise Applications with modern colors
  const deptBarData = {
    labels: labels,
    datasets: [
      {
        label: "Number of Pending Applications",
        data: data,
        backgroundColor: "#8b5cf6",
        borderColor: "#7c3aed",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Enhanced chart options for Department-wise Applications
  const deptBarChartOptions = {
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
            const index = context.dataIndex;
            const fullLabel = fullLabels[index] || labels[index];
            const value = context.raw || 0;
            return `${fullLabel}: ${value} applications`;
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
          <div className="mx-auto max-w-3xl text-center mt-10 sm:mt-4">
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {PerformanceJson.dashboard.title}
            </p>
            <p className="text-gray-600 mt-2">
              {PerformanceJson.dashboard.subtitle}
            </p>
            <p className="text-gray-500 text-sm">
              Last updated: {PerformanceJson.dashboard.lastUpdated}
            </p>
          </div>

          <div className="scale-90">
            {/* Top Metrics Cards */}
            <div className="gap-4 flex flex-col">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
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
                    <p className="text-3xl font-bold text-purple-700 mb-2">
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
                ))}
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

              {/* Department-wise Applications */}
              <div className="text-lg font-semibold bg-white/70 backdrop-blur-md border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    Department-wise Pending Applications
                  </span>
                </div>
                <div className="w-full h-96">
                  <Bar data={deptBarData} options={deptBarChartOptions} />
                </div>
                <p className="text-xs italic text-gray-500 mt-2">
                  Distribution of pending applications across departments. Total
                  departments: {labels.length}.
                </p>
              </div>

              {/* Applications Table */}
              <div className="bg-white/70 backdrop-blur-md border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    Average Pending Days
                  </h2>
                  <AlertCircle
                    className="text-gray-400 ml-auto cursor-pointer hover:text-gray-600"
                    size={20}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/50">
                        <th className="p-3 text-gray-700 font-medium text-sm">
                          S.No.
                        </th>
                        <th className="p-3 text-gray-700 font-medium text-sm">
                         Issue Date
                        </th>
                        <th className="p-3 text-gray-700 font-medium text-sm">
                          Complainant
                        </th>
                        <th className="p-3 text-gray-700 font-medium text-sm">
                          GP, Block
                        </th>
                        <th className="p-3 text-gray-700 font-medium text-sm">
                          Department
                        </th>
                        <th className="p-3 text-gray-700 font-medium text-sm">
                          Pending Days
                        </th>
                        <th className="p-3 text-gray-700 font-medium text-sm">
                          Status
                        </th>
                        {/* <th className="p-3 text-gray-700 font-medium text-sm">
                          Priority
                        </th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {applicationData.length > 0 ? (
                        applicationData.map((app) => {
                          const avgDays = Number(app["Pending Days"]) || 0;
                          let colorClass = "";
                          if (avgDays <= 30) colorClass = "text-green-600";
                          else if (avgDays <= 60)
                            colorClass = "text-yellow-600";
                          else colorClass = "text-red-600";
                          // let priorityColor = "";
                          // if (app.Priority === "High")
                          //   priorityColor = "text-red-600";
                          // else if (app.Priority === "Medium")
                          //   priorityColor = "text-yellow-600";
                          // else priorityColor = "text-green-600";
                          return (
                            <tr
                              key={app["S.No."]}
                              className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="p-3 text-gray-600 text-sm">
                                {app["S.No."]}
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
                                {app["Status"]}
                              </td>
                              {/* <td
                                className={`p-3 font-medium text-sm ${priorityColor}`}
                              >
                                {app.Priority}
                              </td> */}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="p-3 text-center text-gray-500 text-sm"
                          >
                            No data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
