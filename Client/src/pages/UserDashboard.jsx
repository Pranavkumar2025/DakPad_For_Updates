import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  Loader2,
} from "lucide-react";
import UserNavbar from "../components/UserNavbar";
import casesData from "../JsonData/DataTable.json";

const UserDashboard = () => {
  const [cases, setCases] = useState([]);
  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [foundApplication, setFoundApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCases(casesData);
  }, []);

  const handleApplicationIdSearch = () => {
    if (!applicationIdInput.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const match = cases.find((c) => c.applicationId === applicationIdInput.trim());
      setFoundApplication(match || false);
      setIsLoading(false);
    }, 500); // Simulate API delay
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleApplicationIdSearch();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-50", text: "text-amber-600", icon: <Clock size={20} /> };
      case "Compliance":
        return { bg: "bg-green-50", text: "text-green-600", icon: <CheckCircle size={20} /> };
      case "Dismissed":
        return { bg: "bg-red-50", text: "text-red-600", icon: <XCircle size={20} /> };
      default:
        return { bg: "bg-gray-50", text: "text-gray-600", icon: <FileText size={20} /> };
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UserNavbar />

      {/* Search Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          {/* Title */}
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Track Your Application
          </h1>
          <p className="text-base text-gray-500 mb-8">
            Enter your Application ID to check the latest status
          </p>

          {/* Search Input */}
          <div className="flex items-center shadow-sm rounded-md border border-gray-300 bg-white focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all max-w-xl mx-auto">
            <Search className="ml-4 text-gray-400" size={20} />
            <input
              type="text"
              value={applicationIdInput}
              onChange={(e) => setApplicationIdInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-4 py-4 text-gray-900 rounded-md focus:outline-none text-sm"
              placeholder="e.g., BP000XXX"
              aria-label="Application ID"
            />
            <button
              onClick={handleApplicationIdSearch}
              disabled={isLoading || !applicationIdInput.trim()}
              className="mr-2 px-5 py-2.5 rounded-full font-medium text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Searching...
                </div>
              ) : (
                "Check"
              )}
            </button>
          </div>

          {/* Error Message */}
          {foundApplication === false && applicationIdInput.trim() && !isLoading && (
            <p className="mt-4 text-red-500 text-sm animate-fade-in">
              No application found with this ID.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {foundApplication && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6">
            {/* Close Button */}
            <button
              onClick={() => setFoundApplication(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Status Card */}
              <div
                className={`p-5 rounded-lg ${getStatusStyle(foundApplication.status).bg} flex items-center gap-4`}
              >
                {getStatusStyle(foundApplication.status).icon}
                <div>
                  <h2 className={`text-xl font-semibold ${getStatusStyle(foundApplication.status).text}`}>
                    Application Status: {foundApplication.status}
                  </h2>
                  <p className={`text-sm ${getStatusStyle(foundApplication.status).text}`}>
                    {foundApplication.status === "Pending" &&
                      "Your application is under review. Check the timeline for updates."}
                    {foundApplication.status === "Compliance" &&
                      "Your application has been approved and is compliant."}
                    {foundApplication.status === "Dismissed" &&
                      "Your application has been dismissed. See details below."}
                  </p>
                </div>
              </div>

              {/* Application Details Card */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <span>
                      <strong>ID:</strong> {foundApplication.applicationId}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <User size={16} className="text-gray-400 mt-0.5" />
                    <span>
                      <strong>Name:</strong> {foundApplication.applicantName}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                    <span>
                      <strong>Date:</strong> {foundApplication.dateOfApplication}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <span>
                      <strong>Subject:</strong> {foundApplication.subject}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <span>
                      <strong>Description:</strong> {foundApplication.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              {foundApplication.timeline && foundApplication.timeline.length > 0 && (
                <div className="border border-gray-100 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Timeline</h3>
                  <div className="relative pl-6">
                    <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-300" />
                    {foundApplication.timeline.map((step, index) => {
                      const isCompleted =
                        index < foundApplication.timeline.length - 1 || step.status === "Compliance";
                      const isPending = step.status === "Pending";
                      const isRejected = step.status === "Rejected";
                      const dotClass = isCompleted
                        ? "bg-green-500 border-2 border-white"
                        : isPending
                        ? "bg-orange-500"
                        : isRejected
                        ? "bg-red-500"
                        : "bg-gray-300";
                      const icon = isCompleted ? (
                        <CheckCircle size={16} className="text-white" />
                      ) : null;

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2 relative"
                        >
                          <div className="relative">
                            <div
                              className={`w-5 h-5 rounded-full ${dotClass} flex items-center justify-center`}
                              style={{ zIndex: 1 }}
                            >
                              {icon}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{step.section}</p>
                            <p className="text-sm text-gray-600">{step.comment}</p>
                            <p className="text-xs text-gray-400">{step.date}</p>
                            {step.pdfLink && (
                              <a
                                href={step.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
                              >
                                View Document
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
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
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;