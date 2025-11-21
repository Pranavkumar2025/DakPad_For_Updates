// components/Dashboard/MetricsGrid.jsx
import React from "react";
import { FileText, CheckCircle2, Clock, AlertCircle, TrendingUp, BarChart3 } from "lucide-react";

const MetricsGrid = ({ metrics, activeTable, handleMetricClick }) => {
  const getMetricIcon = (index) => {
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const isActive =
          (activeTable === "pending" && metric.name.toLowerCase().includes("pending")) ||
          (activeTable === "resolved" && metric.name.toLowerCase().includes("resolved")) ||
          (activeTable === "blocks" && metric.name.toLowerCase().includes("blocks"));

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
            <div className={`absolute top-4 right-4 ${getMetricIconColor(index)}`}>
              {getMetricIcon(index)}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{metric.name}</h3>
            <p className={`text-3xl font-bold mb-2 ${isActive ? "text-purple-800" : "text-purple-700"}`}>
              {metric.value}
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-xs">{metric.trend}</span>
            </div>
            {metric.description && <p className="text-xs text-gray-500 mt-1">{metric.description}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;