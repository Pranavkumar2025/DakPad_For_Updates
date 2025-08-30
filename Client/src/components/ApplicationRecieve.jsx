import React, { useState, useEffect } from "react";
import { File, PlusCircle, Trash2, User, Calendar, BarChart2 } from "lucide-react";
// import { FaBell } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AddCaseForm from "../components/AddCaseForm";

// Navbar Component
const Navbar = () => {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4 flex items-center justify-between md:ml-48"
    >
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Jan Samadhan Logo" className="w-10 h-10" />
        <h1 className="text-xl font-semibold text-gray-800">Jan Samadhan</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{today}</span>
        <div className="flex items-center gap-2">
          <img
            src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flzat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
            alt="User profile"
            className="w-9 h-9 rounded-full"
          />
          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-800">Pranav Kumar</span>
            <p className="text-xs text-[#3B82F6]">Admin</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-md text-sm font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
          Logout
        </motion.button>
      </div>
    </motion.header>
  );
};

// Sidebar Component
const Sidebar = () => {
  const menuItems = [
    { icon: <File className="w-5 h-5" />, label: "Applications", link: "/applications" },
    { icon: <BarChart2 className="w-6 h-6" />, label: "Dashboard", link: "/performance" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-48 bg-[#3B82F6] text-white flex flex-col py-6 z-50 hidden md:block">
      <div className="flex items-center gap-3 px-4 mb-8">
        <img src="/logo.svg" alt="Jan Samadhan Logo" className="w-8 h-8" />
        <span className="text-base font-semibold">Jan Samadhan</span>
      </div>
      <nav className="flex flex-col gap-2 px-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 transition-colors ${
              item.link === "/applications" ? "bg-blue-600" : ""
            }`}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

// ApplicationReceive Component
const ApplicationReceive = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    setApplications(storedApplications);
  }, []);

  const handleRemove = (applicantId) => {
    if (window.confirm("Are you sure you want to remove this application?")) {
      const updatedApplications = applications.filter((app) => app.ApplicantId !== applicantId);
      setApplications(updatedApplications);
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      const totalPages = Math.ceil(updatedApplications.length / recordsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (totalPages === 0) {
        setCurrentPage(1);
      }
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Sidebar />
      <main className="flex-1 md:ml-48 pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        <Navbar />
        <div className="max-w-full mx-auto mt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-6 h-6 text-[#3B82F6]" />
              Applications
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-md text-sm font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              Add Application
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <AddCaseForm
                  isOpen={showAddForm}
                  onClose={() => {
                    setShowAddForm(false);
                    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
                    setApplications(storedApplications);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-xl shadow-sm">
            <table className="w-full text-sm text-gray-700 table-fixed">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium w-[5%]">No.</th>
                  <th className="px-6 py-3 font-medium w-[10%]">ID</th>
                  <th className="px-6 py-3 font-medium w-[15%]">Applicant</th>
                  <th className="px-6 py-3 font-medium w-[10%]">Block</th>
                  <th className="px-6 py-3 font-medium w-[10%]">Source</th>
                  <th className="px-6 py-3 font-medium w-[12%]">Phone</th>
                  <th className="px-6 py-3 font-medium w-[15%]">Email</th>
                  <th className="px-6 py-3 font-medium w-[20%]">Subject</th>
                  <th className="px-6 py-3 font-medium w-[8%]">Attachment</th>
                  <th className="px-6 py-3 font-medium w-[5%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((app, index) => (
                    <motion.tr
                      key={app.ApplicantId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{indexOfFirstRecord + index + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs truncate">{app.ApplicantId}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{app.applicant}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                            <Calendar className="w-3 h-3" />
                            {app.applicationDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 truncate">{app.block || "N/A"}</td>
                      <td className="px-6 py-4 capitalize truncate">{app.sourceAt}</td>
                      <td className="px-6 py-4 truncate">{app.phoneNumber}</td>
                      <td className="px-6 py-4 truncate">{app.emailId}</td>
                      <td className="px-6 py-4 truncate">{app.subject}</td>
                      <td className="px-6 py-4">
                        <a
                          href={app.attachment}
                          className="flex items-center gap-1 text-[#3B82F6] hover:underline text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <File className="w-4 h-4" />
                          View
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleRemove(app.ApplicantId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {applications.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, applications.length)} of {applications.length}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md text-sm ${
                    currentPage === 1 ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                >
                  Previous
                </motion.button>
                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-md text-sm ${
                      currentPage === i + 1 ? "bg-[#3B82F6] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: currentPage === i + 1 ? 1 : 1.05 }}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md text-sm ${
                    currentPage === totalPages ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApplicationReceive;