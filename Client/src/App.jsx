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
import AdminProfilePage from "./pages/AdminProfilePage";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "./contexts/LanguageContext";

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<UserDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* ==================== SUPERVISOR PROTECTED ROUTE ==================== */}
          <Route
            path="/supervisor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Supervisor"]}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================== ADMIN & SUPERADMIN PROTECTED ROUTES ==================== */}
          <Route
            path="/Admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/SuperAdmin/*"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* PERFORMANCE DASHBOARD — NOW ONLY FOR SUPERADMIN */}
          <Route
            path="/performance"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <PerformanceDashboard />
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

          {/* ADMIN PROFILE — ALL AUTHORIZED ROLES */}
          <Route
            path="/admin-profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin", "workassigned", "receive", "Supervisor"]}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;