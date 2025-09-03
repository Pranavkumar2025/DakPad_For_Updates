import React, { useState, useEffect } from "react";
import { File, PlusCircle, Trash2, User, Calendar, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddCaseForm from "../components/AddCaseForm";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-20 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <Navbar
          userName="Siddharth Singh"
          userPosition="Application Receiver"
          logoLink="/application-receive"
        />
        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-5 h-5 text-[#2810ff]" />
              Applications
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md text-md font-medium hover:bg-green-700 transition-colors"
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
                <thead className="bg-gray-200 text-gray-600 uppercase text-xs">
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
                              className="flex items-center gap-1 text-[#103cff] hover:underline text-xs"
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
                  className={`px-3 py-1.5 rounded-md text-sm ${currentPage === 1
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
                    className={`px-3 py-1.5 rounded-md text-sm ${currentPage === i + 1 ? "bg-[#ff5010] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  className={`px-3 py-1.5 rounded-md text-sm ${currentPage === totalPages
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