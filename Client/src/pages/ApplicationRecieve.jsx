import React, { useState, useEffect } from "react";
import { FileText, User, Calendar, Search, PlusCircle, Eye, Loader2 } from "lucide-react";
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
    // Remove duplicates by ApplicantId
    const uniqueApplications = Array.from(
      new Map(storedApplications.map((app) => [app.ApplicantId, app])).values()
    );
    setApplications(uniqueApplications);
    setFilteredApplications(uniqueApplications);
    setTimeout(() => setIsLoading(false), 500); // Simulate data fetch
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

  // Status styling for modal
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-100", text: "text-amber-700", badge: "bg-amber-500 text-white", icon: <Clock size={20} /> };
      case "Compliance":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600 text-white", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600 text-white", icon: <XCircle size={20} /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500 text-white", icon: <FileText size={20} /> };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-3xl font-bold text-gray-900 font-['Montserrat']"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Applications Received
        </motion.h1>
        <motion.button
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full font-semibold text-sm hover:bg-green-700 transition-colors font-['Montserrat'] shadow-md"
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Add new application"
        >
          <PlusCircle className="w-5 h-5" /> Add Application
        </motion.button>
      </div>

      {/* Search and Sort */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center shadow-md rounded-xl border border-gray-200 bg-white flex-1">
          <Search className="ml-4 text-gray-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-gray-900 rounded-xl focus:outline-none text-sm font-['Montserrat']"
            placeholder="Search by ID, applicant, or subject"
            aria-label="Search applications"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-['Montserrat'] focus:outline-none shadow-md"
          aria-label="Sort applications"
        >
          <option value="applicationDate">Sort by Date (Newest)</option>
          <option value="applicant">Sort by Applicant Name</option>
          <option value="status">Sort by Status</option>
        </select>
      </motion.div>

      {/* Add Application Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AddCaseForm
              isOpen={showAddForm}
              onClose={() => setShowAddForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-green-600" size={40} />
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-['Montserrat']">
              <tr>
                <th className="px-6 py-4 font-semibold">Sr. No</th>
                <th className="px-6 py-4 font-semibold">Application ID</th>
                <th className="px-6 py-4 font-semibold">Applicant</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">Email ID</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Attachment</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500 font-['Montserrat']">
                    No applications found.
                  </td>
                </tr>
              ) : (
                currentRecords.map((app, index) => (
                  <motion.tr
                    key={app.ApplicantId}
                    className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"} hover:bg-gray-100 transition-colors`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 font-['Montserrat']">{indexOfFirstRecord + index + 1}</td>
                    <td className="px-6 py-4 font-['Montserrat']">{app.ApplicantId}</td>
                    <td className="px-6 py-4 font-['Montserrat']">
                      <div className="flex flex-col text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-600" />
                          {app.applicant}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <Calendar className="w-3 h-3" />
                          {app.applicationDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-['Montserrat']">{app.sourceAt}</td>
                    <td className="px-6 py-4 font-['Montserrat']">{app.phoneNumber}</td>
                    <td className="px-6 py-4 font-['Montserrat']">{app.emailId}</td>
                    <td className="px-6 py-4 font-['Montserrat']">{app.subject}</td>
                    <td className="px-6 py-4 font-['Montserrat']">
                      <a
                        href={app.attachment}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View attachment for ${app.ApplicantId}`}
                      >
                        <FileText className="w-4 h-4" /> {app.attachment}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 font-['Montserrat'] text-sm"
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`View details for ${app.ApplicantId}`}
                      >
                        <Eye className="w-4 h-4" /> View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Pagination */}
      <motion.div
        className="flex justify-between items-center mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-sm text-gray-600 font-['Montserrat']">
          Showing {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, filteredApplications.length)} of {filteredApplications.length}
        </span>
        <div className="flex items-center gap-2">
          <motion.button
            className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 font-['Montserrat']"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous page"
          >
            Previous
          </motion.button>
          {[...Array(totalPages)].map((_, i) => (
            <motion.button
              key={i}
              className={`px-3 py-1 rounded-full text-sm ${
                currentPage === i + 1 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } font-['Montserrat']`}
              onClick={() => setCurrentPage(i + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Page ${i + 1}`}
            >
              {i + 1}
            </motion.button>
          ))}
          <motion.button
            className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 font-['Montserrat']"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            whileHover={{ scale: 1.05 }}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-semibold text-gray-900 font-['Montserrat']">
                  Application ID: <span className="text-green-700">{selectedApplication.applicationId}</span>
                </h2>
                <motion.button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Close modal"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={28} />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="space-y-8">
                {/* Status Card */}
                <motion.div
                  className={`p-6 rounded-xl shadow-md ${getStatusStyle(selectedApplication.status).bg} flex items-center gap-5`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {getStatusStyle(selectedApplication.status).icon}
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-xl font-semibold ${getStatusStyle(selectedApplication.status).text} font-['Montserrat']`}>
                        Status: {selectedApplication.status}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(selectedApplication.status).badge}`}
                      >
                        {selectedApplication.status}
                      </span>
                    </div>
                    <p className={`text-sm ${getStatusStyle(selectedApplication.status).text} mt-1 font-['Montserrat']`}>
                      {selectedApplication.status === "Pending" &&
                        "Your application is under review. Check the timeline for updates."}
                      {selectedApplication.status === "Compliance" &&
                        "Your application has been approved and is compliant."}
                      {selectedApplication.status === "Dismissed" &&
                        "Your application has been dismissed. See details below."}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-['Montserrat']">
                      Last Updated: {selectedApplication.lastUpdated}
                    </p>
                  </div>
                </motion.div>

                {/* Application Details Card */}
                <motion.div
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat']">
                    Application Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
                    {[
                      {
                        label: "ID",
                        value: selectedApplication.applicationId,
                        icon: <FileText size={18} className="text-green-600 mt-0.5" />,
                      },
                      {
                        label: "Name",
                        value: selectedApplication.applicantName,
                        icon: <User size={18} className="text-green-600 mt-0.5" />,
                      },
                      {
                        label: "Date",
                        value: selectedApplication.dateOfApplication,
                        icon: <Calendar size={18} className="text-green-600 mt-0.5" />,
                      },
                      {
                        label: "Subject",
                        value: selectedApplication.subject,
                        icon: <FileText size={18} className="text-green-600 mt-0.5" />,
                      },
                      {
                        label: "Description",
                        value: selectedApplication.description,
                        icon: <FileText size={18} className="text-green-600 mt-0.5" />,
                        colSpan: true,
                      },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        className={`flex items-start gap-3 ${item.colSpan ? "sm:col-span-2" : ""}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.06 }}
                      >
                        {item.icon}
                        <div>
                          <span className="text-xs font-medium text-gray-500 font-['Montserrat']">{item.label}</span>
                          <p className="text-base font-medium text-gray-900 font-['Montserrat']">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Timeline Card */}
                {selectedApplication.timeline && selectedApplication.timeline.length > 0 && (
                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat']">
                      Progress Timeline
                    </h3>
                    <div className="relative pl-8">
                      <div className="absolute left-3.5 top-0 bottom-0 w-1 bg-green-200" />
                      {selectedApplication.timeline.map((step, index) => {
                        const isCompleted =
                          index < selectedApplication.timeline.length - 1 || step.section === "Compliance Completed";
                        const isPending = step.section === "Application Received" || step.section.includes("Assigned");
                        const isRejected = step.section === "Dismissed";
                        const dotClass = isCompleted
                          ? "bg-green-600 border-2 border-white"
                          : isPending
                          ? "bg-orange-500"
                          : isRejected
                          ? "bg-red-600"
                          : "bg-gray-300";
                        const icon = isCompleted ? (
                          <CheckCircle size={18} className="text-white" />
                        ) : null;

                        return (
                          <motion.div
                            key={index}
                            className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 relative hover:bg-gray-100 transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                          >
                            <div className="relative">
                              <div
                                className={`w-6 h-6 rounded-full ${dotClass} flex items-center justify-center shadow-md`}
                                style={{ zIndex: 1 }}
                              >
                                {icon}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">
                                  {step.section}
                                </p>
                                <p className="text-xs text-gray-400 font-['Montserrat']">{step.date}</p>
                              </div>
                              <p className="text-sm text-gray-600 font-['Montserrat']">{step.comment}</p>
                              {step.pdfLink && (
                                <motion.a
                                  href={step.pdfLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative inline-block text-sm text-green-600 hover:text-green-800 hover:underline transition-colors font-['Montserrat'] mt-1 group"
                                  whileHover={{ scale: 1.05 }}
                                  aria-label="View timeline document"
                                >
                                  View Document
                                  <span className="absolute hidden group-hover:block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2 font-['Montserrat']">
                                    Open PDF
                                  </span>
                                </motion.a>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        input:focus,
        button:focus,
        select:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default ApplicationReceive;