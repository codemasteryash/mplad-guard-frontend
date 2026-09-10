import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles, unauthorizedPath = "/dashboard" }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={unauthorizedPath === "/login" ? "/login" : unauthorizedPath} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return children;
}
