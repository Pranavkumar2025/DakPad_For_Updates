import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { File, PlusCircle } from "lucide-react";
import AddCaseForm from "../components/AddCaseForm";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ApplicationTable from "../components/ApplicationRecieveComponents/ApplicationTable";
import EditCaseForm from "../components/ApplicationRecieveComponents/EditCaseForm";
import Pagination from "../components/ApplicationRecieveComponents/Pagination";

const ApplicationReceive = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editApplication, setEditApplication] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    setApplications(storedApplications);
  }, []);

  const handleEdit = (app) => {
    setEditApplication(app);
    setShowEditForm(true);
  };

  const handleEditClose = (updatedData) => {
    if (updatedData) {
      setApplications((prev) =>
        prev.map((app) => (app.ApplicantId === updatedData.ApplicantId ? updatedData : app))
      );
    }
    setShowEditForm(false);
    setEditApplication(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="flex-1 md:ml-16 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto md:mr-20">
          <Navbar
            userName="Siddharth Singh"
            userPosition="Application Receiver"
            logoLink="/application-receive"
            isMenuOpen={isMenuOpen}
            toggleMenu={toggleMenu}
          />
        </div>
        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
            <h1 className="text-base sm:text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-4 h-4 sm:w-5 sm:h-5 text-[#2810ff]" />
              Applications
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-6 sm:py-2 bg-green-600 text-white rounded-md text-xs sm:text-md font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600"
              aria-label="Add Application"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="inline sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Application</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
            {showEditForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <EditCaseForm
                  isOpen={showEditForm}
                  onClose={handleEditClose}
                  editApplication={editApplication}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <ApplicationTable
            currentRecords={currentRecords}
            indexOfFirstRecord={indexOfFirstRecord}
            handleEdit={handleEdit}
          />

          {applications.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              applications={applications}
              indexOfFirstRecord={indexOfFirstRecord}
              indexOfLastRecord={indexOfLastRecord}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ApplicationReceive;