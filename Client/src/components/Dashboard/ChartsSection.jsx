// components/Dashboard/ChartsSection.jsx
import React from "react";
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
import { TrendingUp, AlertCircle, Building2 } from "lucide-react";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ChartsSection = ({ 
  pendingDaysData = [], 
  statusData = [], 
  topBlocks = [], 
  worstBlocks = [],
  topDepartments = [], 
  worstDepartments = [] 
}) => {

  // 1. Pending Days Distribution
  const pendingDaysChart = {
    labels: pendingDaysData.map(d => d.range),
    datasets: [{
      label: "Applications",
      data: pendingDaysData.map(d => d.value),
      backgroundColor: "#8b5cf6",
      borderRadius: 8,
    }]
  };

  // 2. Application Status Pie Chart — NOW SHOWS 3 CATEGORIES
  const pieData = {
    labels: [
      `Not Assigned Yet (${statusData.find(s => s.category === "Not Assigned Yet")?.value || 0})`,
      `In Process (${statusData.find(s => s.category === "In Process")?.value || 0})`,
      `Compliance (${statusData.find(s => s.category === "Compliance")?.value || 0})`,
    ],
    datasets: [{
      data: [
        statusData.find(s => s.category === "Not Assigned Yet")?.value || 0,
        statusData.find(s => s.category === "In Process")?.value || 0,
        statusData.find(s => s.category === "Compliance")?.value || 0,
      ],
      backgroundColor: [
        "#fb923c",  // Orange for Not Assigned Yet
        "#fbbf24",  // Yellow for In Process
        "#10b981",  // Green for Compliance
      ],
      borderWidth: 5,
      borderColor: "#ffffff",
      hoverOffset: 12,
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 13, weight: "bold" },
          color: "#1f2937"
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const labels = ["Not Assigned Yet", "In Process", "Compliance"];
            return `${labels[ctx.dataIndex]}: ${ctx.raw} applications`;
          }
        }
      }
    }
  };

  // 3. Top Performing Blocks
  const topBlocksData = {
    labels: topBlocks.map(b => b.blockName?.split(" ")[0] || "Unknown"),
    datasets: [{
      label: "Compliance Rate",
      data: topBlocks.map(b => b.resolvedPercentage || 0),
      backgroundColor: "#10b981",
      borderRadius: 8,
      barThickness: 24,
    }]
  };

  // 4. Worst Performing Blocks
  const worstBlocksData = {
    labels: worstBlocks.map(b => b.blockName?.split(" ")[0] || "Unknown"),
    datasets: [{
      label: "Compliance Rate",
      data: worstBlocks.map(b => b.resolvedPercentage || 0),
      backgroundColor: "#ef4444",
      borderRadius: 8,
      barThickness: 24,
    }]
  };

  const horizontalOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { 
        beginAtZero: true, 
        max: 100, 
        ticks: { 
          callback: v => `${v}%`,
          font: { size: 12 }
        } 
      },
      y: { ticks: { font: { size: 13, weight: "medium" } } }
    }
  };

  return (
    <div className="space-y-10">

      {/* Row 1: Pending Days + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Pending Days Distribution</h3>
          <div className="h-80">
            {pendingDaysData.length > 0 ? (
              <Bar data={pendingDaysChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            ) : (
              <p className="text-center text-gray-500 py-32">No pending applications</p>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Application Status Overview</h3>
          <div className="h-80">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Block Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="text-green-600" size={28} />
            <h3 className="text-xl font-bold text-gray-800">Top Performing Blocks</h3>
          </div>
          <div className="h-72">
            {topBlocks.length > 0 ? (
              <Bar data={topBlocksData} options={horizontalOptions} />
            ) : (
              <p className="text-center text-gray-500 py-20">No data</p>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <AlertCircle className="text-red-600" size={28} />
            <h3 className="text-xl font-bold text-gray-800">Lowest Performing Blocks</h3>
          </div>
          <div className="h-72">
            {worstBlocks.length > 0 ? (
              <Bar data={worstBlocksData} options={horizontalOptions} />
            ) : (
              <p className="text-center text-gray-500 py-20">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;