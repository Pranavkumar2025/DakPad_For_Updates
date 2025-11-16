// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [auth, setAuth] = useState({ loading: true, user: null });
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/api/admin/auth-check");
        setAuth({ loading: false, user: res.data.user });
      } catch {
        setAuth({ loading: false, user: null });
      }
    };
    check();
  }, []);

  // Skip loading screen on back/forward
  if (auth.loading) {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    if (navigationEntry && navigationEntry.type === "back_forward") {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600 animate-pulse font-medium">Loading...</div>
      </div>
    );
  }
  
  if (!auth.user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/admin-login" replace />;
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