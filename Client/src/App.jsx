import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import WorkAssignedDashboard from "./pages/WorkAssignedDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ApplicationReceive from "./pages/ApplicationRecieve";
import { LanguageProvider } from "./contexts/LanguageContext";

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/Admin" element={<AdminDashboard />} />
          <Route path="/SuperAdmin" element={<SuperAdminDashboard />} />

          {/* ✅ Protected Route */}
          {/* <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          /> */}

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<UserDashboard />} />
          <Route path="/performance" element={<PerformanceDashboard />} />
          <Route path="/work-assigned" element={<WorkAssignedDashboard />} />
          <Route path="/application-receive" element={<ApplicationReceive />} />

          {/* Fallback route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;
