import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
  Edit3,
  Eye,
} from "lucide-react";

const ApplicationTable = ({ currentRecords, indexOfFirstRecord, handleEdit }) => {
  const getSourceBadge = (source) => {
    const styles = {
      online: "bg-green-100 text-green-800 border border-green-300",
      offline: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      referral: "bg-purple-100 text-purple-800 border border-purple-300",
      walkin: "bg-blue-100 text-blue-800 border border-blue-300",
      default: "bg-gray-100 text-gray-800 border border-gray-300",
    };
    return styles[source?.toLowerCase()] || styles.default;
  };

  return (
    <div className="rounded-xl">
      {/* ==================== DESKTOP: Clean & Professional Table ==================== */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">No.</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Applicant ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center text-gray-500">
                    <FileText className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No applications found</p>
                    <p className="text-sm mt-2">Try adjusting your filters or check back later.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentRecords.map((app, index) => (
                <motion.tr
                  key={app.ApplicantId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">
                    {indexOfFirstRecord + index + 1}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded border border-gray-300">
                      {app.ApplicantId || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                        {app.applicant.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{app.applicant}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {app.applicationDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {app.block || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getSourceBadge(app.sourceAt)}`}>
                      {app.sourceAt || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <div className="space-y-2">
                      <a href={`tel:${app.phoneNumber}`} className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors">
                        <Phone className="w-4 h-4" />
                        {app.phoneNumber}
                      </a>
                      <a href={`mailto:${app.emailId}`} className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors block truncate max-w-[200px]">
                        <Mail className="w-4 h-4" />
                        {app.emailId}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-800 max-w-lg">
                    {app.subject}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {app.attachment && app.attachment !== "No file" ? (
                      <a
                        href={app.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No file</span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== MOBILE: Simple & Professional Cards ==================== */}
      <div className="lg:hidden space-y-4 px-4 py-6">
        {currentRecords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-5" />
            <p className="text-lg font-medium text-gray-700">No applications found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting filters or check later.</p>
          </div>
        ) : (
          currentRecords.map((app, index) => (
            <motion.div
              key={app.ApplicantId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-800 text-white rounded-lg flex items-center justify-center font-bold text-2xl">
                    {app.applicant.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{app.applicant}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {app.applicationDate}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getSourceBadge(app.sourceAt)}`}>
                  {app.sourceAt}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600 font-medium">ID</p>
                  <p className="font-mono bg-gray-100 px-3 py-1.5 rounded mt-1">{app.ApplicantId}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Block</p>
                  <p className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {app.block || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Phone</p>
                  <a href={`tel:${app.phoneNumber}`} className="text-blue-600 hover:underline mt-1 block">
                    {app.phoneNumber}
                  </a>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Email</p>
                  <a href={`mailto:${app.emailId}`} className="text-blue-600 hover:underline mt-1 block truncate">
                    {app.emailId}
                  </a>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-5">
                <p className="text-gray-600 font-medium mb-2">Subject</p>
                <p className="text-gray-900">{app.subject}</p>
              </div>

              {/* Attachment Button */}
              {app.attachment && app.attachment !== "No file" && (
                <a
                  href={app.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all font-medium"
                >
                  <FileText className="w-5 h-5" />
                  View Attachment
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationTable;