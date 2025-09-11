import { motion } from "framer-motion";
import { File, User, Calendar, Edit } from "lucide-react";

const ApplicationTable = ({ currentRecords, indexOfFirstRecord, handleEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table Layout for Medium and Larger Screens */}
      <div className="hidden md:block overflow-x-auto">
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
              <th className="px-4 py-3 font-medium w-12">Actions</th>
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
                    {app.attachment && app.attachment !== "No file" ? (
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
                      onClick={() => handleEdit(app)}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                      aria-label={`Edit application ${app.ApplicantId}`}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile Screens */}
      <div className="md:hidden p-4 space-y-4">
        {currentRecords.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No applications found.
          </div>
        ) : (
          currentRecords.map((app, index) => (
            <motion.div
              key={app.ApplicantId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium truncate">{app.applicant}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleEdit(app)}
                  className="text-red-500 hover:text-red-600"
                  aria-label={`Edit application ${app.ApplicantId}`}
                >
                  <Edit className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Calendar className="w-3 h-3" />
                  {app.applicationDate}
                </div>
                <div>
                  <span className="font-medium">ID:</span> {app.ApplicantId}
                </div>
                <div>
                  <span className="font-medium">Block:</span> {app.block || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Source:</span> {app.sourceAt}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {app.phoneNumber}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {app.emailId}
                </div>
                <div>
                  <span className="font-medium">Subject:</span> {app.subject}
                </div>
                <div>
                  <span className="font-medium">Attachment:</span>{" "}
                  {app.attachment && app.attachment !== "No file" ? (
                    <a
                      href={app.attachment}
                      className="text-[#103cff] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View attachment for ${app.applicant}`}
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationTable;