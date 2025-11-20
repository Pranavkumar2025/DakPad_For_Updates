// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [auth, setAuth] = useState({ loading: true, user: null });
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try Admin auth-check
        let res = await api.get("/api/admin/auth-check").catch(() => null);

        // If Admin fails → try Supervisor
        if (!res?.data?.user) {
          res = await api.get("/api/supervisor/auth-check").catch(() => null);
        }

        if (res?.data?.user) {
          setAuth({ loading: false, user: res.data.user });
        } else {
          setAuth({ loading: false, user: null });
        }
      } catch (err) {
        setAuth({ loading: false, user: null });
      }
    };

    checkAuth();
  }, []);

  // Prevent flash on back/forward navigation
  if (auth.loading) {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    if (navigationEntry?.type === "back_forward") {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600 animate-pulse font-medium">Loading...</div>
      </div>
    );
  }

  // Not logged in → redirect to correct login
  if (!auth.user) {
    // Smart redirect: go to Supervisor login if URL contains "supervisor"
    const redirectTo =
      location.pathname.includes("supervisor") ||
      location.pathname.includes("Supervisor")
        ? "/supervisor-login"
        : "/admin-login";

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" replace />;
    // Or redirect to their dashboard:
    // return <Navigate to={auth.user.role === "Supervisor" ? "/supervisor-dashboard" : "/Admin"} replace />;
  }

  return children;
};

export default ProtectedRoute;


// // src/components/ProtectedRoute.jsx
// import React, { useEffect, useState } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import api from "../utils/api";

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const [auth, setAuth] = useState({ loading: true, user: null });
//   const location = useLocation();

//   useEffect(() => {
//     // Detect if this is a back/forward navigation
//     const navigationEntry = performance.getEntriesByType("navigation")[0];
//     const isBackNavigation = navigationEntry && navigationEntry.type === "back_forward";

//     const check = async () => {
//       try {
//         const res = await api.get("/api/admin/auth-check");
//         setAuth({ loading: false, user: res.data.user });
//       } catch (err) {
//         // If back navigation → skip loading, go straight to /
//         if (isBackNavigation) {
//           setAuth({ loading: false, user: null });
//         } else {
//           setAuth({ loading: false, user: null });
//         }
//       }
//     };

//     check();
//   }, []);

//   // Skip loading screen on back/forward
//   if (auth.loading) {
//     const navigationEntry = performance.getEntriesByType("navigation")[0];
//     if (navigationEntry && navigationEntry.type === "back_forward") {
//       return <Navigate to="/" replace />;
//     }

//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <div className="text-gray-600 animate-pulse font-medium">Loading...</div>
//       </div>
//     );
//   }

//   // Not authenticated → go to public dashboard
//   if (!auth.user) {
//     return <Navigate to="/" replace />;
//   }

//   // Wrong role
//   if (allowedRoles.length && !allowedRoles.includes(auth.user.role)) {
//     return <Navigate to="/admin-login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;