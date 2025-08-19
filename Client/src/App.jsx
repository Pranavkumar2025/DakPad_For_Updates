import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ApplicationForm from "./pages/ApplicationForm";
import ProtectedRoute from "./components/ProtectedRoute"; 
import NotFound from "./pages/NotFound";
import AddCaseForm from "./components/AddCaseForm";
import AdminLogin from "./pages/AdminLogin";
import PerformanceDashboard from "./pages/PerformanceDashboard";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/Admin" element={<AdminDashboard />} />

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
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/addCaseForm" element= {<AddCaseForm />} />

        <Route path="/" element= {<UserDashboard />} />
        <Route path="/performance" element={<PerformanceDashboard />} />
        
        {/* Fallback route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
