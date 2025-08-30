import React, { useState, useEffect } from "react";
import { FileText, User, Calendar, Search, Plus, X, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddCaseForm from "../components/AddCaseForm";

const ApplicationReceive = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("applicationDate");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Load applications from localStorage
  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const uniqueApplications = Array.from(
      new Map(storedApplications.map((app) => [app.ApplicantId, app])).values()
    );
    setApplications(uniqueApplications);
    setFilteredApplications(uniqueApplications);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Real-time localStorage updates
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
        const uniqueApplications = Array.from(
          new Map(storedApplications.map((app) => [app.ApplicantId, app])).values()
        );
        setApplications(uniqueApplications);
        setFilteredApplications(uniqueApplications);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Filter and sort applications
  useEffect(() => {
    let filtered = [...applications];
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.ApplicantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      if (sortBy === "applicationDate") {
        return new Date(b.applicationDate) - new Date(a.applicationDate);
      } else if (sortBy === "applicant") {
        return a.applicant.localeCompare(b.applicant);
      } else if (sortBy === "status") {
        return (a.status || "Pending").localeCompare(b.status || "Pending");
      }
      return 0;
    });
    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [searchQuery, sortBy, applications]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredApplications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredApplications.length / recordsPerPage);

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-500/20", text: "text-amber-400", badge: "bg-amber-500 text-white", icon: <Clock size={16} /> };
      case "Compliance":
        return { bg: "bg-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500 text-white", icon: <CheckCircle size={16} /> };
      case "Dismissed":
        return { bg: "bg-red-500/20", text: "text-red-400", badge: "bg-red-500 text-white", icon: <X size={16} /> };
      default:
        return { bg: "bg-gray-500/20", text: "text-gray-400", badge: "bg-gray-500 text-white", icon: <FileText size={16} /> };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-amber-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Applications Dashboard
        </motion.h1>
        <motion.button
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Add new application"
        >
          <Plus className="w-5 h-5" /> Add Application
        </motion.button>
      </div>

      {/* Search and Sort */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-300" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-300 transition-all"
            placeholder="Search by ID, applicant, or subject"
            aria-label="Search applications"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-300 transition-all"
          aria-label="Sort applications"
        >
          <option value="applicationDate">Date (Newest)</option>
          <option value="applicant">Applicant Name</option>
          <option value="status">Status</option>
        </select>
      </motion.div>

      {/* Add Application Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AddCaseForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {isLoading ? (
          <div className="col-span-full grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-6 bg-gray-500/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-500/20 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-500/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-500/20 rounded w-2/3"></div>
              </motion.div>
            ))}
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            No applications found.
          </div>
        ) : (
          currentRecords.map((app, index) => (
            <motion.div
              key={app.ApplicantId}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:shadow-2xl hover:bg-white/20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, rotate: 0.5 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{app.applicant}</h3>
                  <p className="text-sm text-gray-300">ID: {app.ApplicantId}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status || "Pending").badge}`}
                >
                  {app.status || "Pending"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Subject:</strong> {app.subject}</p>
                <p><strong>Date:</strong> {app.applicationDate}</p>
                <p><strong>Source:</strong> {app.sourceAt}</p>
                <p><strong>Phone:</strong> {app.phoneNumber}</p>
                <p><strong>Email:</strong> {app.emailId}</p>
                <p>
                  <a
                    href={app.attachment}
                    className="text-gold-300 hover:text-gold-400 hover:underline flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={16} /> Attachment
                  </a>
                </p>
              </div>
              <motion.button
                className="mt-4 w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
                onClick={() =>
                  setSelectedApplication({
                    applicationId: app.ApplicantId,
                    applicantName: app.applicant,
                    dateOfApplication: app.applicationDate,
                    subject: app.subject,
                    description: app.subject,
                    status: app.status || "Pending",
                    timeline: app.timeline || [
                      {
                        section: "Application Received",
                        comment: `Application received at ${app.sourceAt || "N/A"} on ${app.applicationDate}`,
                        date: app.applicationDate,
                        pdfLink: app.attachment || null,
                      },
                    ],
                    lastUpdated: app.timeline?.length > 0 ? app.timeline[app.timeline.length - 1].date : app.applicationDate,
                  })
                }
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                aria-label={`View details for ${app.ApplicantId}`}
              >
                View Details
              </motion.button>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      <motion.div
        className="flex justify-between items-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-sm text-gray-300">
          Showing {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, filteredApplications.length)} of {filteredApplications.length}
        </span>
        <div className="flex items-center gap-2">
          <motion.button
            className="px-4 py-2 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50 transition-all"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous page"
          >
            Previous
          </motion.button>
          {[...Array(totalPages)].map((_, i) => (
            <motion.button
              key={i}
              className={`px-4 py-2 rounded-full ${
                currentPage === i + 1
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              } transition-all`}
              onClick={() => setCurrentPage(i + 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Page ${i + 1}`}
            >
              {i + 1}
            </motion.button>
          ))}
          <motion.button
            className="px-4 py-2 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50 transition-all"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next page"
          >
            Next
          </motion.button>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Application ID: <span className="text-gold-300">{selectedApplication.applicationId}</span>
                </h2>
                <motion.button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Close modal"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Status Card */}
              <motion.div
                className={`p-4 rounded-lg ${getStatusStyle(selectedApplication.status).bg} flex items-center gap-4`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {getStatusStyle(selectedApplication.status).icon}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-semibold ${getStatusStyle(selectedApplication.status).text}`}>
                      Status: {selectedApplication.status}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedApplication.status).badge}`}
                    >
                      {selectedApplication.status}
                    </span>
                  </div>
                  <p className={`text-sm ${getStatusStyle(selectedApplication.status).text}`}>
                    {selectedApplication.status === "Pending" && "Your application is under review."}
                    {selectedApplication.status === "Compliance" && "Application approved and compliant."}
                    {selectedApplication.status === "Dismissed" && "Application dismissed. See details below."}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Last Updated: {selectedApplication.lastUpdated}</p>
                </div>
              </motion.div>

              {/* Application Details */}
              <motion.div
                className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Application Details</h3>
                <div className="grid grid-cols-1 gap-4 text-sm text-gray-300">
                  {[
                    { label: "ID", value: selectedApplication.applicationId, icon: <FileText size=16 className="text-gold-300" /> },
                    { label: "Name", value: selectedApplication.applicantName, icon: <User size=16 className="text-gold-300" /> },
                    { label: "Date", value: selectedApplication.dateOfApplication, icon: <Calendar size=16 className="text-gold-300" /> },
                    { label: "Subject", value: selectedApplication.subject, icon: <FileText size=16 className="text-gold-300" /> },
                    { label: "Description", value: selectedApplication.description, icon: <FileText size=16 className="text-gold-300" /> },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      {item.icon}
                      <div>
                        <span className="text-xs font-medium text-gray-400">{item.label}</span>
                        <p className="text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Timeline */}
              {selectedApplication.timeline && selectedApplication.timeline.length > 0 && (
                <motion.div
                  className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Progress Timeline</h3>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500" />
                    {selectedApplication.timeline.map((step, index) => {
                      const isCompleted = index < selectedApplication.timeline.length - 1;
                      const dotClass = isCompleted ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gray-500/50";
                      return (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 mb-4"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <div className={`w-4 h-4 rounded-full ${dotClass}`} />
                          <div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-semibold text-white">{step.section}</p>
                              <p className="text-xs text-gray-400">{step.date}</p>
                            </div>
                            <p className="text-sm text-gray-300">{step.comment}</p>
                            {step.pdfLink && (
                              <a
                                href={step.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-300 hover:text-gold-400 hover:underline text-sm"
                              >
                                View Document
                              </a>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Poppins', sans-serif;
        }
        .shadow-glow {
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        input:focus,
        button:focus,
        select:focus {
          outline: none;
        }
        .bg-gold-400 {
          background-color: #FFD700;
        }
        .text-gold-400 {
          color: #FFD700;
        }
        .bg-gold-300 {
          background-color: #FFCA28;
        }
        .text-gold-300 {
          color: #FFCA28;
        }
      `}</style>
    </div>
  );
};

export default ApplicationReceive;