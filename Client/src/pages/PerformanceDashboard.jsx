import React, { useEffect, useRef, useState } from 'react';
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
import {
  FaChartBar,
  FaChartPie,
  FaClock,
  FaFilter,
  FaInfoCircle,
} from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PerformanceDashboard = () => {
  const [departmentWorkload, setDepartmentWorkload] = useState({});
  const [statusDistribution, setStatusDistribution] = useState({});
  const [avgProcessingTime, setAvgProcessingTime] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-08-18');
  const [selectedDept, setSelectedDept] = useState('All');
  const [departments, setDepartments] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hypothetical completion data
  const completedTasks = {
    'BDO, Barhara': 5,
    'Director Accounts ,DRDA': 2,
  };

  // Refs for chart instances
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const heatmapChartRef = useRef(null);

  // Function to shorten department names for display
  const shortenDeptName = (name) => {
    if (!name) return '';
    const words = name.split(/[\s,]+/);
    if (words.length > 2) {
      return words.map((word) => word[0]).join('').toUpperCase(); // e.g., "Director Accounts, DRDA" -> "DAD"
    }
    return name.length > 15 ? name.substring(0, 12) + '...' : name; // Truncate if still too long
  };

  // Define pending day ranges for heatmap
  const pendingDayRanges = [
    { label: '0-5 Days', min: 0, max: 5 },
    { label: '6-10 Days', min: 6, max: 10 },
    { label: '11-15 Days', min: 11, max: 15 },
    { label: '16-20 Days', min: 16, max: 20 },
    { label: '>20 Days', min: 21, max: Infinity },
  ];

  // Process heatmap data
  const getHeatmapData = () => {
    const heatmap = {};
    departments.filter((dept) => dept !== 'All').forEach((dept) => {
      heatmap[dept] = pendingDayRanges.map(() => 0);
    });

    filteredData.forEach((app) => {
      const dept = app['Concerned Officer']?.trim();
      const pendingDays = Number(app['Pending Days']) || 0;
      if (!dept) return;

      const rangeIndex = pendingDayRanges.findIndex(
        (range) => pendingDays >= range.min && pendingDays <= range.max
      );
      if (rangeIndex !== -1) {
        heatmap[dept][rangeIndex] = (heatmap[dept][rangeIndex] || 0) + 1;
      }
    });

    return heatmap;
  };

  // Color gradient for heatmap (light to dark red)
  const getHeatmapColor = (count, maxCount) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.1)'; // Nearly transparent for zero
    const intensity = Math.min(count / maxCount, 1); // Normalize to 0-1
    const r = Math.round(255 * intensity);
    const g = Math.round(255 * (1 - intensity));
    return `rgba(${r}, ${g}, 0, 0.8)`; // Red to yellow gradient
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const dataTable = PerformanceJson;

    // Filter data based on date range and department
    const filterData = () => {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filtered = dataTable.filter((app) => {
        const appDate = new Date(app.Date);
        if (isNaN(appDate)) {
          console.warn(`Invalid date for application: ${app.Date}`);
          return false;
        }
        const dept = app['Concerned Officer']?.trim();
        const deptMatch = selectedDept === 'All' || dept === selectedDept?.trim();
        return appDate >= start && appDate <= end && deptMatch;
      });

      console.log('Filtered Data:', filtered);
      setFilteredData(filtered);

      // Update unique departments
      const uniqueDepts = ['All', ...new Set(dataTable.map((app) => app['Concerned Officer']?.trim()))].filter(Boolean);
      setDepartments(uniqueDepts);

      // Process filtered data for charts
      const workload = {};
      const statusCount = { Pending: 0, Completed: 0 };
      const processingTimes = {};

      filtered.forEach((app) => {
        const dept = app['Concerned Officer']?.trim();
        if (!dept) {
          console.warn('Missing or undefined Concerned Officer:', app);
          return;
        }

        workload[dept] = (workload[dept] || 0) + 1;

        // Check for valid S.No. and completion
        const sNo = Number(app['S.No.']);
        const isCompleted = dept && completedTasks[dept] && !isNaN(sNo) && sNo <= completedTasks[dept];
        statusCount[isCompleted ? 'Completed' : 'Pending'] = (statusCount[isCompleted ? 'Completed' : 'Pending'] || 0) + 1;

        if (app['Pending Days']) {
          if (!processingTimes[dept]) processingTimes[dept] = { totalDays: 0, count: 0 };
          processingTimes[dept].totalDays += Number(app['Pending Days']) || 0;
          processingTimes[dept].count += 1;
        }
      });

      const avgTimes = {};
      for (const dept in processingTimes) {
        avgTimes[dept] = processingTimes[dept].count
          ? (processingTimes[dept].totalDays / processingTimes[dept].count).toFixed(1)
          : '0.0';
      }

      setDepartmentWorkload(workload);
      setStatusDistribution(statusCount);
      setAvgProcessingTime(avgTimes);
      setLoading(false);
    };

    try {
      filterData();
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Failed to process data. Please check the console for details.');
      setLoading(false);
    }

    // Cleanup chart instances
    return () => {
      [barChartRef, pieChartRef, performanceChartRef, heatmapChartRef].forEach((ref) => {
        if (ref.current?.chart) {
          ref.current.chart.destroy();
        }
      });
    };
  }, [startDate, endDate, selectedDept]);

  // Bar chart data (Workload by Department)
  const barData = {
    labels: Object.keys(departmentWorkload).map((dept) => shortenDeptName(dept)),
    datasets: [
      {
        label: 'Number of Complaints',
        data: Object.values(departmentWorkload),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  // Pie chart data (Status Distribution)
  const pieData = {
    labels: Object.keys(statusDistribution),
    datasets: [
      {
        data: Object.values(statusDistribution),
        backgroundColor: ['#EF4444', '#3B82F6'],
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  // Performance Evaluation
  const evaluatePerformance = () => {
    const performance = {};
    filteredData.forEach((app) => {
      const dept = app['Concerned Officer']?.trim();
      if (!dept) return;

      if (!performance[dept]) {
        performance[dept] = { total: 0, completed: 0, avgTime: 0 };
      }
      performance[dept].total += 1;

      const sNo = Number(app['S.No.']);
      if (dept && completedTasks[dept] && !isNaN(sNo) && sNo <= completedTasks[dept]) {
        performance[dept].completed += 1;
      }
      performance[dept].avgTime =
        (performance[dept].avgTime * (performance[dept].total - 1) + (Number(app['Pending Days']) || 0)) /
        performance[dept].total || 0;
    });

    const performanceData = Object.entries(performance)
      .map(([dept, data]) => ({
        department: dept,
        score: ((data.completed / data.total) * 100 - data.avgTime * 2) || 0,
        avgTime: data.avgTime.toFixed(1),
        completionRate: ((data.completed / data.total) * 100).toFixed(1) || '0.0',
      }))
      .sort((a, b) => b.score - a.score);

    return performanceData;
  };
  const performanceData = evaluatePerformance();

  // Function to determine bar color based on average pending days
  const getBarColor = (avgTime) => {
    const avg = parseFloat(avgTime);
    if (avg <= 10) return '#10B981'; // Green
    if (avg <= 15) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Performance chart data with dynamic colors based on avgTime
  const performanceChartData = {
    labels: performanceData.map((p) => shortenDeptName(p.department)),
    datasets: [
      {
        label: 'Performance Score',
        data: performanceData.map((p) => p.score),
        backgroundColor: performanceData.map((p) => getBarColor(p.avgTime)),
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  // Heatmap chart data
  const heatmapData = getHeatmapData();
  const maxCount = Math.max(...Object.values(heatmapData).flat()); // Find max count for normalization
  const heatmapChartData = {
    labels: pendingDayRanges.map((range) => range.label),
    datasets: Object.keys(heatmapData).map((dept) => ({
      label: shortenDeptName(dept),
      data: heatmapData[dept],
      backgroundColor: heatmapData[dept].map((count) => getHeatmapColor(count, maxCount)),
      borderColor: '#fff',
      borderWidth: 1,
      barThickness: 30,
    })),
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#1F2937', font: { size: 14 } } },
      title: { display: true, text: '', color: '#1F2937', font: { size: 16 } },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return performanceData[index]?.department || tooltipItems[0].label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#4B5563', font: { size: 12 } },
        title: { display: true, text: 'Number of Complaints', color: '#4B5563', font: { size: 14 } },
      },
      x: {
        ticks: {
          color: '#4B5563',
          font: { size: 12 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
        },
      },
    },
  };

  // Specific options for Workload by Department chart
  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: { text: 'Complaints per Department' },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return Object.keys(departmentWorkload)[index] || tooltipItems[0].label;
          },
        },
      },
    },
    layout: {
      padding: {
        bottom: 20,
      },
    },
  };

  // Specific options for Heatmap chart
  const heatmapChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: { text: 'Heatmap of Complaints by Pending Days' },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const datasetIndex = tooltipItems[0].datasetIndex;
            const dept = Object.keys(heatmapData)[datasetIndex];
            return dept || tooltipItems[0].dataset.label;
          },
          label: (tooltipItem) => {
            const count = tooltipItem.raw;
            const range = pendingDayRanges[tooltipItem.dataIndex].label;
            return `Complaints: ${count} (${range})`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#4B5563',
          font: { size: 12 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
        },
        title: { display: true, text: 'Pending Days Range', color: '#4B5563', font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#4B5563', font: { size: 12 } },
        title: { display: true, text: 'Departments', color: '#4B5563', font: { size: 14 } },
      },
    },
  };

  if (loading) {
    return <div className="text-center text-gray-700 text-2xl mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-10">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 shadow-md py-2 bg-white rounded-lg inline-block">
          Department Performance Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Updated as of 04:04 PM IST, August 18, 2025</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center">
          <FaFilter className="text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload by Department */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-700">Workload by Department</h2>
          </div>
          <div className="h-96">
            <Bar
              ref={barChartRef}
              data={barData}
              options={barChartOptions}
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-700">Complaint Status Distribution</h2>
          </div>
          <div className="h-96">
            <Pie
              ref={pieChartRef}
              data={pieData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { text: 'Status Breakdown' } },
              }}
            />
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-700">Department Performance</h2>
          </div>
          <div className="h-96">
            <Bar
              ref={performanceChartRef}
              data={performanceChartData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { text: 'Performance Score (Higher is Better)' } },
                scales: {
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Score', color: '#4B5563', font: { size: 14 } },
                  },
                  x: {
                    ticks: {
                      ...chartOptions.scales.x.ticks,
                      maxRotation: 45,
                      minRotation: 45,
                      autoSkip: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Heatmap of Complaints by Pending Days */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-700">Heatmap of Complaints by Pending Days</h2>
          </div>
          <div className="h-96">
            <Bar
              ref={heatmapChartRef}
              data={heatmapChartData}
              options={{
                ...heatmapChartOptions,
                scales: {
                  ...heatmapChartOptions.scales,
                  y: { stacked: true },
                  x: { stacked: true },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Average Processing Time Table */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <FaClock className="text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-700">Average Pending Days</h2>
          <FaInfoCircle className="text-gray-400 ml-auto cursor-pointer hover:text-gray-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-gray-700 font-medium">Department</th>
                <th className="p-3 text-gray-700 font-medium">Avg. Pending Days</th>
                <th className="p-3 text-gray-700 font-medium">Completion Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((data) => {
                const avg = parseFloat(data.avgTime);
                let colorClass = '';
                if (avg <= 10) {
                  colorClass = 'text-green-600';
                } else if (avg <= 15) {
                  colorClass = 'text-yellow-600';
                } else {
                  colorClass = 'text-red-600';
                }
                return (
                  <tr key={data.department} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-600">{data.department}</td>
                    <td className={`p-3 font-medium ${colorClass}`}>{data.avgTime}</td>
                    <td className="p-3 text-gray-600 font-medium">{data.completionRate}</td>
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

export default PerformanceDashboard;