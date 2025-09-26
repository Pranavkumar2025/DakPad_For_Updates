// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources for English and Hindi
const resources = {
  en: {
    translation: {
      // UserNavbar
      portalName: "Jan Samadhan",
      servingCitizens: "Serving Citizens of Bhojpur",
      publicUserAccess: "Public User Access",
      admin: "Admin",
      logout: "Logout",

      // UserDashboard
      trackYourApplication: "Track Your Application",
      enterApplicationId: "Enter Application ID",
      trackNow: "Track Now",
      noApplicationFound: "No application found with this ID. Please check and try again.",
      realTimeUpdates: "Real-time Updates",
      realTimeUpdatesDesc: "Get instant status updates",
      qrCodeAccess: "QR Code Access",
      qrCodeAccessDesc: "Quick access via QR code",
      downloadReports: "Download Reports",
      downloadReportsDesc: "Get detailed timeline PDFs",
      secureTracking: "Secure Tracking",
      secureTrackingDesc: "Safe and encrypted data",
      applicationId: "Application ID",
      status: "Status",
      pendingMessage: "Your application is under review. Check the timeline for updates.",
      complianceMessage: "Your application has been approved and is compliant.",
      dismissedMessage: "Your application has been dismissed. See details below.",
      lastUpdated: "Last Updated",
      applicationDetails: "Application Details",
      id: "ID",
      name: "Name",
      date: "Date",
      subject: "Subject",
      description: "Description",
      applicationQrCode: "Application QR Code",
      qrCodeInstruction: "Scan this QR code for quick access to your application details",
      downloadQrCode: "Download QR Code",
      progressTimeline: "Progress Timeline",
      viewDocument: "View Document",
      openPdf: "Open PDF",
      downloadTimeline: "Download Timeline",
      close: "Close",
      searching: "Searching...",
    },
  },
  hi: {
    translation: {
      // UserNavbar
      portalName: "जन समाधान",
      servingCitizens: "भोजपुर के नागरिकों की सेवा",
      publicUserAccess: "सार्वजनिक उपयोगकर्ता पहुँच",
      admin: "प्रशासक",
      logout: "लॉगआउट",

      // UserDashboard
      trackYourApplication: "अपने आवेदन को ट्रैक करें",
      enterApplicationId: "आवेदन आईडी दर्ज करें",
      trackNow: "अब ट्रैक करें",
      noApplicationFound: "इस आईडी के साथ कोई आवेदन नहीं मिला। कृपया जाँच करें और फिर से प्रयास करें।",
      realTimeUpdates: "वास्तविक समय अपडेट",
      realTimeUpdatesDesc: "तत्काल स्थिति अपडेट प्राप्त करें",
      qrCodeAccess: "क्यूआर कोड पहुँच",
      qrCodeAccessDesc: "क्यूआर कोड के माध्यम से त्वरित पहुँच",
      downloadReports: "रिपोर्ट डाउनलोड करें",
      downloadReportsDesc: "विस्तृत समयरेखा पीडीएफ प्राप्त करें",
      secureTracking: "सुरक्षित ट्रैकिंग",
      secureTrackingDesc: "सुरक्षित और एन्क्रिप्टेड डेटा",
      applicationId: "आवेदन आईडी",
      status: "स्थिति",
      pendingMessage: "आपका आवेदन समीक्षा के अधीन है। अपडेट के लिए समयरेखा जाँच करें।",
      complianceMessage: "आपका आवेदन स्वीकृत और अनुपालित है।",
      dismissedMessage: "आपका आवेदन खारिज कर दिया गया है। नीचे विवरण देखें।",
      lastUpdated: "अंतिम अपडेट",
      applicationDetails: "आवेदन विवरण",
      id: "आईडी",
      name: "नाम",
      date: "तारीख",
      subject: "विषय",
      description: "विवरण",
      applicationQrCode: "आवेदन क्यूआर कोड",
      qrCodeInstruction: "आवेदन विवरण तक त्वरित पहुँच के लिए इस क्यूआर कोड को स्कैन करें",
      downloadQrCode: "क्यूआर कोड डाउनलोड करें",
      progressTimeline: "प्रगति समयरेखा",
      viewDocument: "दस्तावेज़ देखें",
      openPdf: "पीडीएफ खोलें",
      downloadTimeline: "समयरेखा डाउनलोड करें",
      close: "बंद करें",
      searching: "खोज रहा है...",
    },
  },
};

i18n
  .use(LanguageDetector) // Detects browser language
  .use(initReactI18next) // Passes i18n to react-i18next
  .init({
    resources,
    fallbackLng: "en", // Default language
    detection: {
      order: ["localStorage", "navigator"], // Check localStorage first, then browser language
      caches: ["localStorage"], // Store language preference in localStorage
    },
    interpolation: {
      escapeValue: false, // React handles XSS
    },
  });

export default i18n;