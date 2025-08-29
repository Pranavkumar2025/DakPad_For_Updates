import React, { useState, useEffect } from "react";
import { User, Calendar, File, PlusCircle, LayoutDashboard, Settings, BarChart2, Trash2 } from "lucide-react";
import { FaBell } from "react-icons/fa";
import { motion } from "framer-motion";
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
    <div className="h-16 ml-16 p-6 bg-white border border-gray-200 flex items-center justify-between px-6 rounded-full fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <img
          src="/logo.svg"
          alt="Jan Samadhan Logo"
          className="w-8 h-8"
        />
        <span
          className="text-xl font-bold text-transparent uppercase bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c] tracking-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Jan Samadhan
        </span>
      </motion.div>

      <div className="flex items-center space-x-6">
        <span className="text-sm text-gray-500">{today}</span>
        <div className="flex items-center gap-3 border border-gray-200 py-1 px-3 rounded-full">
          <img
            src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flzat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
            alt="user"
            className="w-10 h-10 rounded-full shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Pranav Kumar</span>
            <p className="text-xs text-[#ff5010] -mt-1">Admin</p>
          </div>
        </div>
        <button
          className="group flex items-center justify-start w-11 h-11 bg-[#ff5010] rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-full active:translate-x-1 active:translate-y-1"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64-0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
          </div>
          <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Logout
          </div>
        </button>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');
      `}</style>
    </div>
  );
};

// Sidebar Component
const Sidebar = () => {
  const menuItems = [
    { icon: <File className="w-6 h-6" />, label: "Applications", link: "/applications" },
    { icon: <BarChart2 className="w-6 h-6" />, label: "Performance", link: "/performance" },
    
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 bg-gray-900 text-white flex flex-col items-center py-6 shadow-lg z-50 md:block hidden">
      <div className="mb-12">
        <img
          src="/logo.svg"
          alt="Jan Samadhan Logo"
          className="w-10 h-10 border border-gray-700 rounded-lg p-1"
        />
      </div>
      <nav className="flex flex-col gap-6">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className={`group relative flex items-center justify-center p-2 rounded-full hover:bg-[#ff5010] transition ${
              item.link === "/applications" ? "bg-[#ff5010]" : ""
            }`}
          >
            {item.icon}
            <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

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
      
      // Adjust pagination if the current page is empty
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-16 pt-20 pb-6 px-6">
        {/* Navbar */}
        <Navbar />

        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-5 h-5 text-[#ff5010]" />
              Applications Received
            </h1>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-[#ff5010] text-white rounded-full font-semibold hover:bg-[#e6490f] transition-colors duration-200"
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle className="w-5 h-5" />
              Add Application
            </motion.button>
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <AddCaseForm
                isOpen={showAddForm}
                onClose={() => {
                  setShowAddForm(false);
                  const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
                  setApplications(storedApplications);
                }}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Sr. No</th>
                  <th className="px-4 py-3 font-medium">Application ID</th>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Block</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Attachment</th>
                  <th className="px-4 py-3 font-medium">Remove</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((app, index) => (
                    <tr
                      key={app.ApplicantId}
                      className={`border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      }`}
                    >
                      <td className="px-4 py-3">{indexOfFirstRecord + index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs">{app.ApplicantId}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[150px]">{app.applicant}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                            <Calendar className="w-3 h-3" />
                            {app.applicationDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px]">{app.block || "N/A"}</td>
                      <td className="px-4 py-3 capitalize">{app.sourceAt}</td>
                      <td className="px-4 py-3">{app.phoneNumber}</td>
                      <td className="px-4 py-3 truncate max-w-[200px]">{app.emailId}</td>
                      <td className="px-4 py-3 truncate max-w-[200px]">{app.subject}</td>
                      <td className="px-4 py-3">
                        <a
                          href={app.attachment}
                          className="flex items-center gap-1 text-[#ff5010] hover:underline text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <File className="w-4 h-4" />
                          {app.attachment.split("/").pop() || "View"}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemove(app.ApplicantId)}
                          className="flex items-center gap-1 text-red-500 hover:underline text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {applications.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-600">
                Showing {indexOfFirstRecord + 1}–
                {Math.min(indexOfLastRecord, applications.length)} of {applications.length}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                >
                  Previous
                </motion.button>
                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      currentPage === i + 1
                        ? "bg-[#ff5010] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: currentPage === i + 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === i + 1 ? 1 : 0.95 }}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReceive;