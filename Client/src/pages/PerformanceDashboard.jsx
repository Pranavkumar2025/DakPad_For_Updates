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
import { FaInfoCircle, FaFilter } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ApplicationDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [pendingDaysData, setPendingDaysData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [applicationData, setApplicationData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-08-26');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [departments, setDepartments] = useState(['All']);
  const [statuses, setStatuses] = useState(['All']);

  useEffect(() => {
    const { metrics, charts, table, applicationData } = PerformanceJson.dashboard;
    setMetrics(metrics);
    setPendingDaysData(charts[0].data);
    setStatusData(charts[1].data);
    setDistrictData(table.data);
    setApplicationData(applicationData);

    // Extract unique filters
    const uniqueDepts = ['All', ...new Set(applicationData.map((app) => app['Concerned Officer']?.trim()))].filter(Boolean);
    const uniqueStatuses = ['All', ...new Set(applicationData.map((app) => app['Status']))].filter(Boolean);
    setDepartments(uniqueDepts);
    setStatuses(uniqueStatuses);

    // Apply initial filter
    applyFilters();
    setLoading(false);
  }, []);

  const applyFilters = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = applicationData.filter((app) => {
      const appDate = new Date(app.Date);
      const deptMatch = selectedDept === 'All' || app['Concerned Officer']?.trim() === selectedDept;
      const statusMatch = selectedStatus === 'All' || app['Status'] === selectedStatus;
      return !isNaN(appDate) && appDate >= start && appDate <= end && deptMatch && statusMatch;
    });
    setFilteredData(filtered);
  };

  // Bar chart data for Pending Days Distribution
  const barData = {
    labels: pendingDaysData.map((item) => item.range),
    datasets: [
      {
        label: 'Number of Applications',
        data: pendingDaysData.map((item) => item.value),
        backgroundColor: pendingDaysData.map((item) => item.color),
        borderColor: pendingDaysData.map((item) => item.color),
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data for Application Status
  const pieData = {
    labels: statusData.map((item) => item.category),
    datasets: [
      {
        data: statusData.map((item) => item.value),
        backgroundColor: statusData.map((item) => item.color),
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#1F2937', font: { size: 14 } } },
      title: { display: true, text: '', color: '#1F2937', font: { size: 16 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#4B5563', font: { size: 12 } },
        title: { display: true, text: '', color: '#4B5563', font: { size: 14 } },
      },
      x: {
        ticks: { color: '#4B5563', font: { size: 12 }, maxRotation: 45, minRotation: 45 },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, title: { text: 'Pending Days Distribution' } },
    scales: { y: { title: { text: 'Number of Applications' } } },
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, title: { text: 'Application Status' } },
  };

  if (loading) return <div className="text-center text-gray-700 text-2xl mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 shadow-md py-2 bg-white rounded-lg inline-block">
          Application Tracking Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Updated as of 04:15 PM IST, August 26, 2025</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center">
          <FaFilter className="text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); applyFilters(); }}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); applyFilters(); }}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedDept}
          onChange={(e) => { setSelectedDept(e.target.value); applyFilters(); }}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); applyFilters(); }}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{metric.name}</p>
              <p className="text-xl font-semibold text-gray-800">{metric.value}</p>
            </div>
            <div className="text-2xl">{metric.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending Days Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Pending Days Distribution</h2>
          <div className="h-64">
            <Bar data={barData} options={barChartOptions} />
          </div>
          <p className="text-gray-500 text-sm mt-2">{PerformanceJson.dashboard.charts[0].note}</p>
        </div>

        {/* Application Status */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Application Status</h2>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={pieChartOptions} />
          </div>
          <p className="text-gray-500 text-sm mt-2">{PerformanceJson.dashboard.charts[1].note}</p>
        </div>
      </div>

      {/* District-wise Applications */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Block-wise Applications Grouped by Division</h2>
        <div className="h-64">
          <Bar
            data={{
              labels: districtData.flatMap((div) => div.districts.map((dist) => dist.name)),
              datasets: districtData.map((div, index) => ({
                label: div.division,
                data: div.districts.map((dist) => dist.value),
                backgroundColor: `rgba(59, 130, 246, ${0.8 - index * 0.1})`,
                borderColor: `rgba(59, 130, 246, 1)`,
                borderWidth: 1,
              })),
            }}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, title: { text: 'District-wise Applications' } },
              scales: { y: { title: { text: 'Number of Applications' } } },
            }}
          />
        </div>
        <p className="text-gray-500 text-sm mt-2">{PerformanceJson.dashboard.table.note}</p>
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
                <th className="p-3 text-gray-700 font-medium">Department</th>
                <th className="p-3 text-gray-700 font-medium">Avg. Pending Days</th>
                <th className="p-3 text-gray-700 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((app) => {
                const avgDays = Number(app['Pending Days']) || 0;
                let colorClass = '';
                if (avgDays <= 30) colorClass = 'text-green-600';
                else if (avgDays <= 60) colorClass = 'text-yellow-600';
                else colorClass = 'text-red-600';
                return (
                  <tr key={app['S.No.']} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-600">{app['Concerned Officer']}</td>
                    <td className={`p-3 font-medium ${colorClass}`}>{app['Pending Days']}</td>
                    <td className="p-3 text-gray-600">{app['Status']}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDashboard;