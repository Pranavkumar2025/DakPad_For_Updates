// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import WorkAssignedDashboard from "./pages/WorkAssignedDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ApplicationReceive from "./pages/ApplicationRecieve";
import AdminProfilePage from "./pages/AdminProfilePage";   // <-- already imported
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import SupervisorDashboard from "./pages/SupervisorDashboard";

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<UserDashboard />} />
          <Route path="/performance" element={<PerformanceDashboard />} />
          <Route path="/supervisor" element={<SupervisorDashboard />} />

          {/* ==================== PROTECTED ADMIN ROUTES ==================== */}
          <Route
            path="/Admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/SuperAdmin"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-assigned"
            element={
              <ProtectedRoute allowedRoles={["workassigned", "superadmin"]}>
                <WorkAssignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-receive"
            element={
              <ProtectedRoute allowedRoles={["receive", "superadmin"]}>
                <ApplicationReceive />
              </ProtectedRoute>
            }
          />

          {/* ==================== ADMIN PROFILE (PROTECTED) ==================== */}
          <Route
            path="/admin-profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin", "workassigned", "receive"]}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ==================== 404 ==================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;