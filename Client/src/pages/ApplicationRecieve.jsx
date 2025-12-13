// src/pages/ApplicationReceive.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, FileText } from "lucide-react";

import AddCaseForm from "../components/AddCaseForm";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ApplicationTable from "../components/ApplicationRecieveComponents/ApplicationTable";
import Pagination from "../components/ApplicationRecieveComponents/Pagination";
import AdminProfilePage from "./AdminProfilePage";
import api from "../utils/api";

const ApplicationReceive = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Admin profile state
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const recordsPerPage = 10;

  // --------------------------------------------------------------
  // 1. Fetch Admin Profile
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setAdmin({
          name: data.name || "Receiver",
          position: data.position || "Application Receiver",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setAdmin({ name: "Receiver", position: "Application Receiver" });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // --------------------------------------------------------------
  // 2. Fetch Applications
  // --------------------------------------------------------------
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/applications");
      const data = Array.isArray(res.data) ? res.data : [];

      const normalized = data.map((app) => ({
        ...app,
        ApplicantId: app.applicantId || "N/A",
        applicant: app.applicant || app.name || "Unknown Applicant",
        applicationDate: app.applicationDate
          ? new Date(app.applicationDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        block: app.block || "—",
        sourceAt: app.sourceAt || app.source || "unknown",
        phoneNumber: app.phoneNumber || app.phone || "—",
        emailId: app.emailId || app.email || "—",
        subject: app.subject || "No subject provided",
        attachment: app.attachment || null,
      }));

      setApplications(normalized);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // --------------------------------------------------------------
  // 3. Real-time updates
  // --------------------------------------------------------------
  useEffect(() => {
    const handleUpdate = () => fetchApplications();
    window.addEventListener("applicationUpdated", handleUpdate);
    return () => window.removeEventListener("applicationUpdated", handleUpdate);
  }, [fetchApplications]);

  // --------------------------------------------------------------
  // 4. Redirect base path
  // --------------------------------------------------------------
  useEffect(() => {
    if (location.pathname === "/application-receive" || location.pathname === "/application-receive/") {
      navigate("/application-receive/applications", { replace: true });
    }
  }, [location.pathname, navigate]);

  // --------------------------------------------------------------
  // 5. Handlers
  // --------------------------------------------------------------
  const handleAddClose = () => {
    setShowAddForm(false);
    fetchApplications();
  };

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  // --------------------------------------------------------------
  // 6. Pagination
  // --------------------------------------------------------------
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / recordsPerPage);

  // --------------------------------------------------------------
  // 7. Loading profile
  // --------------------------------------------------------------
  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600 animate-pulse text-xl">Loading profile…</div>
      </div>
    );
  }

  // --------------------------------------------------------------
  // 8. Main Layout - Fully Responsive
  // --------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, shown as overlay when menu open */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={admin.name}
        userPosition={admin.position}
        isSuperAdmin={false}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar
          userName={admin.name}
          userPosition={admin.position}
          logoLink="/application-receive/applications"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1370px] mx-auto">
            <Routes>
              {/* Applications List Route */}
              <Route
                path="applications"
                element={
                  <div className="bg-white shadow-sm border sm:ml-11 border-gray-200 rounded-lg">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Applications List
                      </h1>

                      {/* Add Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Application</span>
                      </motion.button>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 sm:p-6">
                      {/* Loading */}
                      {loading && (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                      )}

                      {/* Error */}
                      {error && (
                        <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-md">
                          <p>Error: {error}</p>
                          <button onClick={fetchApplications} className="mt-2 underline hover:text-red-800">
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Table & Pagination */}
                      {!loading && !error && (
                        <>
                          {/* Horizontal scroll hint for mobile */}
                          <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                              <ApplicationTable
                                currentRecords={currentRecords}
                                indexOfFirstRecord={indexOfFirstRecord}
                              />
                            </div>
                          </div>

                          {/* Optional mobile scroll hint */}
                          <p className="text-sm text-gray-500 text-center mt-3 block sm:hidden">
                            ← Scroll horizontally to view more →
                          </p>

                          {applications.length > 0 && (
                            <div className="mt-8">
                              <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                setCurrentPage={setCurrentPage}
                                applications={applications}
                                indexOfFirstRecord={indexOfFirstRecord}
                                indexOfLastRecord={indexOfLastRecord}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                }
              />

              {/* Profile Route */}
              <Route path="profile" element={<AdminProfilePage />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Add Form Modal - Mobile Optimized */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
            >
              <AddCaseForm isOpen={showAddForm} onClose={handleAddClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationReceive;