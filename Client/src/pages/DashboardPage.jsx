import {
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  BadgeCheck,
  Clock,
  Users,
  CalendarDays,
  Ticket,
} from "lucide-react";



import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // ✅ required for Doughnut & Pie
  Tooltip,
  PointElement,
  LineElement,
  Title,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import NavBarNew from "../../HomePage/NavBarNew";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
);

const chartDataRevenue = {
  labels: [
    "₹50K–1L", "₹1L–3L", "₹3L–5L", "₹5L–10L", "₹10L–15L",
    "₹15L–20L", "₹20L–50L", "₹50L–1Cr", "₹1Cr–3Cr", "₹3Cr–5Cr", "5Cr+"
  ],
  datasets: [
    {
      label: "Number of Companies",
      data: [667, 152, 188, 92, 90, 98, 80, 90, 30, 15, 20],
      backgroundColor: [
        "#6366f1", // Indigo
        "#3b82f6", // Blue
        "#06b6d4", // Cyan
        "#10b981", // Emerald
        "#34d399", // Green
        "#84cc16", // Lime
        "#facc15", // Yellow
        "#f59e0b", // Amber
        "#f97316", // Orange
        "#ef4444", // Red
        "#a855f7", // Purple
      ],
      borderColor: "#fff",
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
};

const chartOptionsRevenue = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          const label = context.dataset.label || "";
          const value = context.raw || 0;
          const range = context.label || "";
          return `${value} startups in range ${range}`;
        },
      },
      backgroundColor: "#1f2937", // dark gray
      titleColor: "#facc15",       // yellow
      bodyColor: "#ffffff",        // white
      borderColor: "#e5e7eb",      // light border
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      displayColors: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Revenue wise Startups",
      },
      ticks: {
        stepSize: 50,
      },
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 30,
      },
      title: {
        display: true,
        text: "Revenue Range (INR)",
      },
    },
  },
};




const doughnutData = {
  labels: ["Occupied", "Available"],
  datasets: [
    {
      label: "Applications",
      data: [256, 32],
      backgroundColor: ["#8b5cf6", "#34d399"],
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 6,
    },
  ],
};

const doughnutOptions = {
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
        generateLabels: function (chart) {
          const data = chart.data;
          return data.labels.map((label, i) => {
            const value = data.datasets[0].data[i];
            const backgroundColor = data.datasets[0].backgroundColor[i];
            return {
              text: `${label}: ${value}`,
              fillStyle: backgroundColor,
              strokeStyle: backgroundColor,
              lineWidth: 1,
              hidden: isNaN(value),
              index: i,
              pointStyle: 'circle',
            };
          });
        },
      },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ${value}`;
        },
      },
    },
  },
  layout: {
    padding: 0,
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
    },
  },
};



const chartData = {
  labels: ["Seed Fund", "Second Tranche", "Post Seed Fund", "Matching Loan"],
  datasets: [
    {
      label: "Received",
      data: [200, 110, 60, 50],
      backgroundColor: "#8b5cf6", // purple
      borderRadius: 5,
    },

    {
      label: "Ongoing",
      data: [45, 25, 15, 13],
      backgroundColor: "#fbbf24", // yellow
      borderRadius: 5,
    },
    {
      label: "Approved",
      data: [150, 82, 39, 32],
      backgroundColor: "#34d399", // green
      borderRadius: 5,
    },
    {
      label: "Rejected",
      data: [5, 3, 4, 5],
      backgroundColor: "#f87171", // red
      borderRadius: 5,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",

      labels: {
        boxWidth: 10,
        color: "#4b5563",
        usePointStyle: true,
        pointStyle: '',
        font: {
          size: 10,
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: "false",
      },
      ticks: {
        color: "#6b7280",
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        color: "#6b7280",
      },
    },
  },
};

const chartDataEmployee = {
  labels: [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
    "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar",
    "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur",
    "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran",
    "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
  ],
  datasets: [
    {
      label: "",
      data: [
        10, 12, 18, 6, 21, 15, 19, 10, 14, 22, 25, 12, 7, 9, 5, 11,
        8, 4, 6, 7, 13, 14, 19, 20, 9, 30, 16, 17, 5, 18, 13, 15,
        3, 2, 11, 12, 6, 17, 14
      ],
      backgroundColor: "#3b82f6",
      borderRadius: 5,
    },
  ],
};

const chartOptionsEmployee = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",

      labels: {
        boxWidth: 10,
        color: "#4b5563",
        usePointStyle: true,
        pointStyle: '',
        font: {
          size: 10,
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: "false",
      },
      ticks: {
        color: "#6b7280",
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        color: "#6b7280",
      },
    },
  },
};
const chartDataDistrictWiseStartups = {
  labels: [
    "Patna", "Nalanda", "Bhojpur", "Rohtas", "Buxar", "Kaimur",
    "Muzaffarpur", "West Champaran", "East Champaran", "Sitamarhi", "Sheohar", "Vaishali",
    "Gaya", "Nawada", "Jehanabad", "Aurangabad", "Arwal",
    "Purnia", "Katihar", "Kishanganj", "Araria",
    "Saharsa", "Madhepura", "Supaul",
    "Darbhanga", "Madhubani", "Samastipur",
    "Saran", "Siwan", "Gopalganj",
    "Bhagalpur", "Banka",
    "Munger", "Jamui", "Khagaria", "Lakhisarai", "Begusarai", "Sheikhpura",
    "Other(Uncategorized)"
  ],
  datasets: [
    {
      label: "No. of Startups",
      data: [
        651, 26, 25, 26, 13, 2,            // Patna Division
        69, 33, 64, 20, 5, 50,             // Tirhut Division
        34, 11, 13, 28, 11,                // Magadh Division
        19, 20, 7, 8,                      // Purnia Division
        16, 12, 11,                        // Kosi Division
        48, 26, 25,                        // Darbhanga Division
        39, 9, 12,                         // Saran Division
        32, 8,                             // Bhagalpur Division
        15, 9, 6, 12, 38, 4,               // Munger Division
        65                                 // Other
      ],
      backgroundColor: "#8b5cf6", // purple
      borderRadius: 5,
    },
  ],
};
const chartDataDivisionGrouped = {
  labels: [
    // Keep order consistent
    "Patna", "Nalanda", "Bhojpur", "Rohtas", "Buxar", "Kaimur",
    "Muzaffarpur", "West Champaran", "East Champaran", "Sitamarhi", "Sheohar", "Vaishali",
    "Gaya", "Nawada", "Jehanabad", "Aurangabad", "Arwal",
    "Purnia", "Katihar", "Kishanganj", "Araria",
    "Saharsa", "Madhepura", "Supaul",
    "Darbhanga", "Madhubani", "Samastipur",
    "Saran", "Siwan", "Gopalganj",
    "Bhagalpur", "Banka",
    "Munger", "Jamui", "Khagaria", "Lakhisarai", "Begusarai", "Sheikhpura",
    "Other"
  ],
  datasets: [
    {
      label: "Patna Division",
      backgroundColor: "#6366f1",
      data: [150, 26, 25, 26, 13, 2, ...Array(35).fill(0)], // 👈 capped Patna at 150
      datalabels: {
        formatter: function (value, context) {
          return context.dataIndex === 0 ? '651' : value; // 👈 show actual in label
        }
      }
    },
    {
      label: "Tirhut Division",
      backgroundColor: "#3b82f6",
      data: [...Array(6).fill(0), 69, 33, 64, 20, 5, 50, ...Array(27).fill(0)],
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

const chartOptionsDivisionGrouped = {
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
    tooltip: {
      mode: "nearest",
      intersect: true,
      callbacks: {
        title: function (tooltipItems) {
          const item = tooltipItems[0];
          return item.dataset.label; // ✅ Division as the title
        },
        label: function (tooltipItem) {
          if (tooltipItem.dataIndex === 0 && tooltipItem.dataset.label === 'Patna Division') {
            return `${tooltipItem.label}: 651`; // 👈 show actual value
          }
          return `${tooltipItem.label}: ${tooltipItem.raw}`;
        }
        ,
      },
    }

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
        text: "Districts",
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: "No. of Startups",
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



const DashboardPagePublic = () => {
  return (

    <div className="grid grid-cols-1 overflow-x-hidden">
      <NavBarNew />
      <div className="md:px-4 pt-12 sm:pt-24 bg-gradient-to-br from-[#f3e8ff] via-[#e0f2f1] to-[#fce4ec] min-h-screen ">
        <div className="mx-auto max-w-3xl text-center mt-20 sm:mt-4">
         
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Startup Bihar Analytics
          </p>

        </div>
        <div className="scale-90">

          {/* Top 40% */}
          <div className="gap-4 flex flex-col">

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {/* Card 1 */}
  <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
    <div className="absolute top-4 right-4 text-purple-500">
      <Building2 size={24} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Startup</h3>
    <p className="text-3xl font-bold text-purple-700 mb-2">1500+</p>
    <div className="flex items-center gap-2 text-sm text-green-600">
      <ArrowUpRight size={16} />
    </div>
  </div>

  {/* Card 2 */}
  <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 border border-gray-200 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
    <div className="absolute top-4 right-4 text-green-500">
      <BadgeCheck size={24} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">Fund Disbursed</h3>
    <p className="text-3xl font-bold text-green-700 mb-2">₹75+ Cr</p>
    <div className="flex items-center gap-2 text-sm text-green-600">
      <ArrowUpRight size={16} />
    </div>
  </div>

  {/* Card 3 */}
  <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 border border-gray-200 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
    <div className="absolute top-4 right-4 text-yellow-500">
      <Clock size={24} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">DPIIT Registered Startups</h3>
    <p className="text-3xl font-bold text-yellow-600 mb-2">3500+</p>
    <div className="flex items-center gap-2 text-sm text-green-600">
      <ArrowUpRight size={16} />
    </div>
  </div>

  {/* Card 4 */}
  <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 border border-gray-200 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
    <div className="absolute top-4 right-4 text-blue-500">
      <Ticket size={24} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">Events Conducted</h3>
    <p className="text-3xl font-bold text-blue-700 mb-2">850+</p>
    <div className="flex items-center gap-2 text-sm text-green-600">
      <ArrowUpRight size={16} />
    </div>
  </div>

  {/* Card 5 - Startup Cells */}
  <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 border border-gray-200 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
    <div className="absolute top-4 right-4 text-indigo-500">
      <Building2 size={24} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">Startup Cells</h3>
    <p className="text-3xl font-bold text-indigo-700 mb-2">46</p>
    <div className="flex items-center gap-2 text-sm text-green-600">
      <ArrowUpRight size={16} />
    </div>
  </div>

  {/* Card 6 - Incubation Centers */}
  <div className="bg-white/70 backdrop-blur-md border border-gray-100/90 rounded-3xl p-5 border border-gray-200 relative overflow-hidden drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
    <div className="absolute top-4 right-4 text-rose-500">
      <BadgeCheck size={24} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">Incubation Centers</h3>
    <p className="text-3xl font-bold text-rose-700 mb-2">22</p>
    <div className="flex items-center gap-2 text-sm text-green-600">
      <ArrowUpRight size={16} />
    </div>
  </div>
</div>




            <div className="flex flex-col md:flex-row gap-4 mt-4">
              {/* Bottom 60% */}
              <div className="md:w-3/5 bg-white/70 backdrop-blur-md  border-gray-100/90 border rounded-3xl p-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]  flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">

                    <span className=" text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                      Revenue Analytics
                    </span>
                  </div>
                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                  </div>
                </div>
                <div className="w-full h-64"> {/* Adjust height as needed */}
                  <Bar data={chartDataRevenue} options={chartOptionsRevenue} />
                </div>
              </div>

              {/* Right 40% */}
              <div className="md:w-2/5 bg-white/70 backdrop-blur-md  border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4 ">
                <div className="flex items-center gap-2 text-lg font-semibold">

                  <span className=" text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">Co-working Seat</span>
                </div>
                <div className="w-full" style={{ height: "240px" }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <p className="text-xs italic text-gray-500 mt-2 justify-center flex-1">
                  *Includes B-HUB Maurya Lok and B-HUB BSFC Building data
                </p>

              </div>

            </div>


            <div className="text-lg font-semibold bg-white/70 backdrop-blur-md border-gray-100/90 border drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-3xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  District-wise Startups Grouped by Division
                </span>

              </div>

              <div className="w-full h-96"> {/* Adjust height as needed */}
                <Bar data={chartDataDivisionGrouped} options={chartOptionsDivisionGrouped} />
              </div>
            </div>
            <p className="text-xs italic text-gray-500 mt-2 ">
              Patna's bar height is symbolically capped for better visual comparison.
            </p>
          </div>



        </div>
      </div>
    </div>
  );
};

export default DashboardPagePublic;