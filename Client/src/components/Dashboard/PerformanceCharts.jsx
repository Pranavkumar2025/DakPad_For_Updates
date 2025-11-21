// components/Dashboard/PerformanceCharts.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import { TrendingUp, AlertCircle } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PerformanceCharts = ({
  topBlocks = [],
  worstBlocks = [],
  topDepts = [],
  worstDepts = [],
}) => {
  // Shared horizontal bar options
  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.raw}% resolution rate`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
          color: "#6b7280",
        },
        grid: { color: "#e5e7eb" },
      },
      y: {
        ticks: { color: "#374151" },
        grid: { display: false },
      },
    },
  };

  const createDataset = (data, color) => ({
    data: data.map((item) => item.percentage ?? item.resolvedPercentage ?? 0),
    backgroundColor: color,
    borderRadius: 6,
    barThickness: 18,
  });

  const createChartData = (items, color) => ({
    labels: items.map((i) => (i.name || i.blockName || i.departmentName || "—").split(" ")[0]),
    datasets: [createDataset(items, color)],
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Top Performing Blocks */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-6 drop-shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp className="text-green-600" size={22} />
          <h3 className="text-lg font-semibold text-gray-800">Top Performing Blocks</h3>
        </div>

        {topBlocks.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No data available</p>
        ) : (
          <div className="h-80">
            <Bar
              data={createChartData(topBlocks, "#10b981")}
              options={{
                ...barOptions,
                plugins: {
                  ...barOptions.plugins,
                  tooltip: {
                    ...barOptions.plugins.tooltip,
                    callbacks: {
                      label: (ctx) => {
                        const item = topBlocks[ctx.dataIndex];
                        return `${item.resolved || 0} / ${item.total || 0} resolved (${ctx.raw}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Worst Performing Blocks */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-6 drop-shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <AlertCircle className="text-red-600" size={22} />
          <h3 className="text-lg font-semibold text-gray-800">Worst Performing Blocks</h3>
        </div>

        {worstBlocks.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No data available</p>
        ) : (
          <div className="h-80">
            <Bar
              data={createChartData(worstBlocks, "#ef4444")}
              options={{
                ...barOptions,
                plugins: {
                  ...barOptions.plugins,
                  tooltip: {
                    ...barOptions.plugins.tooltip,
                    callbacks: {
                      label: (ctx) => {
                        const item = worstBlocks[ctx.dataIndex];
                        return `${item.resolved || 0} / ${item.total || 0} resolved (${ctx.raw}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Top Performing Departments (optional – you can pass real data later) */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-6 drop-shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp className="text-emerald-600" size={22} />
          <h3 className="text-lg font-semibold text-gray-800">Top Performing Departments</h3>
        </div>
        {topDepts.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No department data</p>
        ) : (
          <div className="h-80">
            <Bar data={createChartData(topDepts, "#059669")} options={barOptions} />
          </div>
        )}
      </div>

      {/* Worst Performing Departments */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-6 drop-shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <AlertCircle className="text-rose-600" size={22} />
          <h3 className="text-lg font-semibold text-gray-800">Worst Performing Departments</h3>
        </div>
        {worstDepts.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No department data</p>
        ) : (
          <div className="h-80">
            <Bar data={createChartData(worstDepts, "#dc2626")} options={barOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceCharts;