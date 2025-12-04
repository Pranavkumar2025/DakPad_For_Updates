import { motion } from "framer-motion";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
  Download,
  Edit3,
} from "lucide-react";

const ApplicationTable = ({ currentRecords, indexOfFirstRecord, handleEdit }) => {
  const getSourceBadge = (source) => {
    const styles = {
      online: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      offline: "bg-amber-100 text-amber-800 border border-amber-200",
      referral: "bg-purple-100 text-purple-800 border border-purple-200",
      walkin: "bg-blue-100 text-blue-800 border border-blue-200",
      default: "bg-gray-100 text-gray-800 border border-gray-300",
    };
    return styles[source?.toLowerCase()] || styles.default;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/60">
      {/* ==================== DESKTOP: Modern Table ==================== */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider">No.</th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider">Applicant ID</th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider">Location</th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider">Source</th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider flex-1">Subject</th>
              <th className="px-6 py-5 text-center text-xs font-semibold uppercase tracking-wider">File</th>
            </tr>
          </thead>
          <tbody className="bg-white/80 backdrop-blur-xl divide-y divide-gray-200/60">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-24 text-center">
                  <div className="flex flex-col items-center text-gray-400">
                    <div className="p-6 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-16 h-16" />
                    </div>
                    <p className="text-xl font-medium text-gray-600">No applications found</p>
                    <p className="text-sm mt-2">Try adjusting your filters or check back later.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentRecords.map((app, index) => (
                <motion.tr
                  key={app.ApplicantId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70 transition-all duration-300 group"
                >
                  <td className="px-6 py-5 font-semibold text-gray-800">
                    {indexOfFirstRecord + index + 1}
                  </td>
                  <td className="px-6 py-5">
                    <code className="font-mono text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300">
                      {app.ApplicantId || "—"}
                    </code>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {app.applicant.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{app.applicant}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {app.applicationDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {app.block || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getSourceBadge(app.sourceAt)}`}>
                      {app.sourceAt}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <a href={`tel:${app.phoneNumber}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        <Phone className="w-4 h-4" />
                        {app.phoneNumber}
                      </a>
                      <a href={`mailto:${app.emailId}`} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm block truncate max-w-[180px]">
                        <Mail className="w-4 h-4" />
                        {app.emailId}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-800 font-medium pr-10" title={app.subject}>
                    {app.subject}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {app.attachment && app.attachment !== "No file" ? (
                      <a
                        href={app.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-md"
                      >
                        <Download className="w-4 h-4" />
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

      {/* ==================== MOBILE: Premium Cards ==================== */}
      <div className="lg:hidden p-5 space-y-5">
        {currentRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-8 bg-gray-100 rounded-3xl mb-6">
              <FileText className="w-20 h-20 text-gray-300" />
            </div>
            <p className="text-xl font-semibold text-gray-700">No applications yet</p>
            <p className="text-gray-500 mt-2">Applications will appear here when submitted.</p>
          </div>
        ) : (
          currentRecords.map((app, index) => (
            <motion.div
              key={app.ApplicantId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold">
                      {app.applicant.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{app.applicant}</h3>
                      <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {app.applicationDate}
                      </p>
                    </div>
                  </div>
                  {/* Uncomment if you want edit button back */}
                  {/* <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(app)}
                    className="bg-white/20 backdrop-blur p-3 rounded-xl hover:bg-white/30 transition"
                  >
                    <Edit3 className="w-5 h-5" />
                  </motion.button> */}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">ID</p>
                    <code className="mt-1 font-mono text-xs bg-slate-100 px-3 py-1.5 rounded-lg">
                      {app.ApplicantId}
                    </code>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Block</p>
                    <p className="mt-1 flex items-center gap-2 text-gray-800">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {app.block || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Source</p>
                    <span className={`mt-1 inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getSourceBadge(app.sourceAt)}`}>
                      {app.sourceAt}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Contact</p>
                    <div className="mt-1 space-y-1">
                      <a href={`tel:${app.phoneNumber}`} className="flex items-center gap-2 text-blue-600 text-sm">
                        <Phone className="w-4 h-4" /> {app.phoneNumber}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 font-medium mb-2">Subject</p>
                  <p className="text-gray-800 leading-relaxed">{app.subject}</p>
                </div>

                {app.attachment && app.attachment !== "No file" && (
                  <a
                    href={app.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:shadow-lg transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    Open Attachment
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationTable;