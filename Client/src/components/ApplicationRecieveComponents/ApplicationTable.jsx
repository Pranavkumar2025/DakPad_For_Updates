import { motion } from "framer-motion";
import {
  File,
  User,
  Calendar,
  Edit,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
} from "lucide-react";

const ApplicationTable = ({ currentRecords, indexOfFirstRecord, handleEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* ==================== DESKTOP TABLE ==================== */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[1200px]">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white uppercase text-xs tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold w-16">No.</th>
                <th className="px-4 py-3 text-left font-semibold w-32">ID</th>
                <th className="px-4 py-3 text-left font-semibold w-48">Applicant</th>
                <th className="px-4 py-3 text-left font-semibold w-28">Block</th>
                <th className="px-4 py-3 text-left font-semibold w-28">Source</th>
                <th className="px-4 py-3 text-left font-semibold w-36">Phone</th>
                <th className="px-4 py-3 text-left font-semibold w-48">Email</th>
                <th className="px-4 py-3 text-left font-semibold flex-1 min-w-[200px]">Subject</th>
                <th className="px-4 py-3 text-center font-semibold w-32">Attachment</th>
                {/* <th className="px-4 py-3 text-center font-semibold w-20">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-500 text-base">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      No applications found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((app, index) => (
                  <motion.tr
                    key={app.ApplicantId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {indexOfFirstRecord + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {app.ApplicantId || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="truncate max-w-[170px]">{app.applicant}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {app.applicationDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {app.block || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 capitalize">
                        {app.sourceAt}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${app.phoneNumber}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                        <Phone className="w-3.5 h-3.5" />
                        {app.phoneNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${app.emailId}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm truncate max-w-[160px]">
                        <Mail className="w-3.5 h-3.5" />
                        {app.emailId}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-800 truncate" title={app.subject}>
                      {app.subject}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {app.attachment && app.attachment !== "No file" ? (
                        <a
                          href={app.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs group"
                        >
                          <File className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>View</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    {/* <td className="px-4 py-3 text-center">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(app)}
                        className="text-red-600 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-all"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </motion.button>
                    </td> */}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MOBILE CARDS (NEW DESIGN) ==================== */}
      <div className="lg:hidden p-4 space-y-4">
        {currentRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No applications found.</p>
          </div>
        ) : (
          currentRecords.map((app, index) => (
            <motion.div
              key={app.ApplicantId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow relative"
            >
              {/* Header: Applicant + Edit Button */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg truncate max-w-[200px]">
                      {app.applicant}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {app.applicationDate}
                    </p>
                  </div>
                </div>

                {/* Floating Edit Button */}
                {/* <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(app)}
                  className="bg-red-600 text-white p-2.5 rounded-full shadow-md hover:bg-red-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </motion.button> */}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">ID</span>
                  <code className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    {app.ApplicantId}
                  </code>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Block</span>
                  <span className="flex items-center gap-1 text-gray-800">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {app.block || "—"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Source</span>
                  <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 capitalize">
                    {app.sourceAt}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Phone</span>
                  <a href={`tel:${app.phoneNumber}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {app.phoneNumber}
                  </a>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Email</span>
                  <a href={`mailto:${app.emailId}`} className="text-blue-600 hover:underline truncate max-w-[180px] flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {app.emailId}
                  </a>
                </div>

                {/* Attachment */}
                {app.attachment && app.attachment !== "No file" ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Attachment</span>
                    <a
                      href={app.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <File className="w-4 h-4" />
                      View PDF
                    </a>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Attachment</span>
                    <span className="text-gray-400 text-sm">—</span>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-800 line-clamp-2" title={app.subject}>
                  <strong>Subject:</strong> {app.subject}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationTable;