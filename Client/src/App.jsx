// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import WorkAssignedDashboard from "./pages/WorkAssignedDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ApplicationReceive from "./pages/ApplicationRecieve";
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

          {/* ==================== SUPERVISOR DASHBOARD ==================== */}
          <Route
            path="/supervisor-dashboard/*"  // ← Add wildcard if Supervisor uses nested routes
            element={
              <ProtectedRoute allowedRoles={["Supervisor"]}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================== ADMIN DASHBOARD ==================== */}
          <Route
            path="/Admin/*"  // ← Add wildcard for future nested routes (e.g., profile)
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================== SUPERADMIN DASHBOARD ==================== */}
          <Route
            path="/SuperAdmin/*"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================== ROLE-SPECIFIC DASHBOARDS ==================== */}
          <Route
            path="/work-assigned/*"
            element={
              <ProtectedRoute allowedRoles={["workassigned", "superadmin"]}>
                <WorkAssignedDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/application-receive/*"
            element={
              <ProtectedRoute allowedRoles={["receive", "superadmin"]}>
                <ApplicationReceive />
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