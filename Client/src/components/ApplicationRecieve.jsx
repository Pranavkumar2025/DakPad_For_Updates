import React, { useState, useEffect } from "react";
import { File, PlusCircle, Trash2, User, Calendar, BarChart2 } from "lucide-react";
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
    // Add actual logout logic here
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 py-3 md:px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Jan Samadhan Logo"
          className="w-10 h-10 object-contain"
          onError={(e) => (e.target.src = "/fallback-logo.png")} // Fallback for broken image
        />
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">Jan Samadhan</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden md:block">{today}</span>
        <div className="flex items-center gap-2">
          <img
            src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flzat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => (e.target.src = "/fallback-avatar.png")} // Fallback for broken image
          />
          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-800">Pranav Kumar</span>
            <p className="text-xs text-blue-500">Admin</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          aria-label="Logout"
        >
          <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </motion.header>
  );
};

// Sidebar Component
const Sidebar = () => {
  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: "Users", link: "/user" },
    { icon: <BarChart2 className="w-5 h-5" />, label: "Performance", link: "/performance" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 md:w-20 bg-gray-900 text-white flex flex-col items-center py-6 shadow-lg z-40">
      <div className="mb-10">
        <img
          src="/logo.svg"
          alt="Jan Samadhan Logo"
          className="w-10 h-10 border border-gray-700 rounded-lg p-1"
          onError={(e) => (e.target.src = "/fallback-logo.png")} // Fallback for broken image
        />
      </div>
      <nav className="flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className="group relative flex items-center justify-center p-2 rounded-lg hover:bg-orange-500 transition-colors"
            aria-label={item.label}
          >
            {item.icon}
            <span className="absolute left-16 md:left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-20 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <Navbar />
        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-5 h-5 text-blue-500" />
              Applications
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
              aria-label="Add Application"
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
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
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

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium w-12">No.</th>
                    <th className="px-4 py-3 font-medium w-24">ID</th>
                    <th className="px-4 py-3 font-medium min-w-[150px]">Applicant</th>
                    <th className="px-4 py-3 font-medium w-24">Block</th>
                    <th className="px-4 py-3 font-medium w-24">Source</th>
                    <th className="px-4 py-3 font-medium w-32">Phone</th>
                    <th className="px-4 py-3 font-medium min-w-[150px]">Email</th>
                    <th className="px-4 py-3 font-medium min-w-[200px]">Subject</th>
                    <th className="px-4 py-3 font-medium w-24">Attachment</th>
                    <th className="px-4 py-3 font-medium w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-500">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((app, index) => (
                      <motion.tr
                        key={app.ApplicantId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{indexOfFirstRecord + index + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs truncate">{app.ApplicantId}</td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 truncate">{app.block || "N/A"}</td>
                        <td className="px-4 py-3 capitalize truncate">{app.sourceAt}</td>
                        <td className="px-4 py-3 truncate">{app.phoneNumber}</td>
                        <td className="px-4 py-3 truncate">{app.emailId}</td>
                        <td className="px-4 py-3 truncate">{app.subject}</td>
                        <td className="px-4 py-3">
                          {app.attachment ? (
                            <a
                              href={app.attachment}
                              className="flex items-center gap-1 text-blue-500 hover:underline text-xs"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View attachment for ${app.applicant}`}
                            >
                              <File className="w-4 h-4" />
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleRemove(app.ApplicantId)}
                            className="text-red-500 hover:text-red-600"
                            aria-label={`Remove application ${app.ApplicantId}`}
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
          </div>

          {applications.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, applications.length)} of{" "}
                {applications.length}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  aria-label="Previous page"
                >
                  Previous
                </motion.button>
                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: currentPage === i + 1 ? 1 : 1.05 }}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                  aria-label="Next page"
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