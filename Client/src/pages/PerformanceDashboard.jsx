import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import PerformanceJson from '../JsonData/PerformanceData.json';
import { FaInfoCircle } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
      { range: '0-15 Days', min: 0, max: 15 },
      { range: '15-30 Days', min: 15, max: 30 },
      { range: '30-45 Days', min: 30, max: 45 },
      { range: '45-60 Days', min: 45, max: 60 },
      { range: '60+ Days', min: 60, max: Infinity },
    ];

    const counts = customRanges.map((range) => ({
      range: range.range,
      value: applicationData.filter((app) => {
        const days = Number(app['Pending Days']) || 0;
        return days >= range.min && days < range.max;
      }).length,
    }));

    // Calculate average pending days
    const totalDays = applicationData.reduce((sum, app) => sum + (Number(app['Pending Days']) || 0), 0);
    const averageDays = applicationData.length > 0 ? (totalDays / applicationData.length).toFixed(2) : 0;

    return { counts, averageDays };
  };

  const { counts, averageDays } = processPendingDaysData();

  // Bar chart data for Pending Days Distribution with dynamic colors and highlights
  const barData = {
    labels: counts.map((item) => item.range),
    datasets: [
      {
        label: 'Number of Applications',
        data: counts.map((item) => item.value),
        backgroundColor: counts.map((item, index) =>
          pendingDaysData[index]?.highlight ? '#F44336' : pendingDaysData[index]?.color || ['#4B5EAA', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'][index]
        ),
        borderColor: counts.map((item, index) =>
          pendingDaysData[index]?.highlight ? '#D32F2F' : ['#3B4A9E', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'][index]
        ),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // Pie chart data for Application Status with percentages
  const pieData = {
    labels: statusData.map((item) => {
      const percentage = item.percentage || '';
      return `${item.category}${percentage ? ` (${percentage})` : ''}`;
    }),
    datasets: [
      {
        data: statusData.map((item) => item.value),
        backgroundColor: statusData.map((item) => item.color),
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  // Enhanced chart options for Pending Days Distribution
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#1F2937', font: { size: 14, weight: 'bold' } } },
      title: {
        display: true,
        text: PerformanceJson.dashboard.charts[0].title + (averageDays ? ` (Average: ${averageDays} Days)` : ''),
        color: '#1F2937',
        font: { size: 18, weight: 'bold' },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} applications`;
          },
        },
        backgroundColor: '#1F2937',
        titleColor: '#FFF',
        bodyColor: '#FFF',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#4B5563', font: { size: 12 } },
        title: { display: true, text: 'Number of Applications', color: '#4B5563', font: { size: 14 } },
      },
      x: {
        ticks: { color: '#4B5563', font: { size: 12 }, maxRotation: 0, minRotation: 0 },
      },
    },
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#1F2937', font: { size: 14 } } },
      title: {
        display: true,
        text: PerformanceJson.dashboard.charts[1].title,
        color: '#1F2937',
        font: { size: 18 },
      },
    },
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Process department-wise data with truncated labels
  const processDepartmentData = () => {
    const departmentCounts = applicationData.reduce((acc, app) => {
      const dept = app['Concerned Officer'] || 'Unknown';
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

  // Bar chart data for Department-wise Applications with attractive colors and tooltips
  const deptBarData = {
    labels: labels,
    datasets: [
      {
        label: 'Number of Pending Applications',
        data: data,
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#F7D794', '#2E86AB',
        ].slice(0, labels.length),
        borderColor: [
          '#E63946', '#2AB7CA', '#2E86AB', '#88B04B', '#F7D794', '#D4A017', '#1B4965',
        ].slice(0, labels.length),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // Enhanced chart options for Department-wise Applications with tooltips for full names
  const deptBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#1F2937', font: { size: 14, weight: 'bold' } } },
      title: {
        display: true,
        text: 'Department-wise Pending Applications',
        color: '#1F2937',
        font: { size: 18, weight: 'bold' },
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
        backgroundColor: '#1F2937',
        titleColor: '#FFF',
        bodyColor: '#FFF',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#4B5563', font: { size: 12 } },
        title: { display: true, text: 'Number of Applications', color: '#4B5563', font: { size: 14 } },
      },
      x: {
        ticks: {
          color: '#4B5563',
          font: { size: 12 },
          maxRotation: 45,
          minRotation: 45,
          callback: (value) => {
            const index = labels.indexOf(value);
            return fullLabels[index] ? `${fullLabels[index].substring(0, 15)}...` : value;
          },
        },
      },
    },
  };

  if (loading) return <div className="text-center text-gray-700 text-2xl mt-10">Loading...</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 shadow-md py-2 bg-white rounded-lg inline-block">
            {PerformanceJson.dashboard.title}
          </h1>
          <p className="text-gray-600 mt-2">{PerformanceJson.dashboard.subtitle}</p>
          <p className="text-gray-500 text-sm">Last updated: {PerformanceJson.dashboard.lastUpdated}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-gray-600 text-sm">{metric.name}</p>
                <p className="text-xl font-semibold text-gray-800">{metric.value} <span className="text-xs text-green-600">{metric.trend}</span></p>
                <p className="text-gray-500 text-xs">{metric.description}</p>
              </div>
              <div className="text-2xl">{metric.icon}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pending Days Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{PerformanceJson.dashboard.charts[0].title}</h2>
            <div className="h-64">
              <Bar data={barData} options={barChartOptions} />
            </div>
            <p className="text-gray-500 text-sm mt-2">{pendingDaysData[0]?.note || 'No note available'}</p>
          </div>

          {/* Application Status */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{PerformanceJson.dashboard.charts[1].title}</h2>
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieData} options={pieChartOptions} />
            </div>
            <p className="text-gray-500 text-sm mt-2">{statusData[0]?.note || 'No note available'}</p>
          </div>
        </div>

        {/* Department-wise Applications */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Department-wise Pending Applications</h2>
          <div className="h-96 flex items-center justify-center">
            <Bar data={deptBarData} options={deptBarChartOptions} />
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Note: Distribution of pending applications across departments. Total departments: {labels.length}.
          </p>
        </div>

        {/* Average Pending Days Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Average Pending Days</h2>
            <FaInfoCircle className="text-gray-400 ml-auto cursor-pointer hover:text-gray-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-gray-700 font-medium">S.No.</th>
                  <th className="p-3 text-gray-700 font-medium">Date</th>
                  <th className="p-3 text-gray-700 font-medium">Complainant</th>
                  <th className="p-3 text-gray-700 font-medium">GP, Block</th>
                  <th className="p-3 text-gray-700 font-medium">Department</th>
                  <th className="p-3 text-gray-700 font-medium">Pending Days</th>
                  <th className="p-3 text-gray-700 font-medium">Status</th>
                  <th className="p-3 text-gray-700 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {applicationData.length > 0 ? (
                  applicationData.map((app) => {
                    const avgDays = Number(app['Pending Days']) || 0;
                    let colorClass = '';
                    if (avgDays <= 30) colorClass = 'text-green-600';
                    else if (avgDays <= 60) colorClass = 'text-yellow-600';
                    else colorClass = 'text-red-600';
                    let priorityColor = '';
                    if (app.Priority === 'High') priorityColor = 'text-red-600';
                    else if (app.Priority === 'Medium') priorityColor = 'text-yellow-600';
                    else priorityColor = 'text-green-600';
                    return (
                      <tr key={app['S.No.']} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-600">{app['S.No.']}</td>
                        <td className="p-3 text-gray-600">{formatDate(app.Date)}</td>
                        <td className="p-3 text-gray-600">{app['Name of the complainant']}</td>
                        <td className="p-3 text-gray-600">{app['GP, Block']}</td>
                        <td className="p-3 text-gray-600">{app['Concerned Officer']}</td>
                        <td className={`p-3 font-medium ${colorClass}`}>{app['Pending Days']}</td>
                        <td className="p-3 text-gray-600">{app['Status']}</td>
                        <td className={`p-3 font-medium ${priorityColor}`}>{app.Priority}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="p-3 text-center text-gray-500">
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ApplicationDashboard;