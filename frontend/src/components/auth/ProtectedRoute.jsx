import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../common/Loader";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader label="Checking session…" /></div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Logged in but this specific page isn't for their role — send them
    // somewhere they CAN access instead of bouncing them back to /login.
    if (role === "candidate") return <Navigate to="/portal/jobs" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}