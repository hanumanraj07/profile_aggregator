import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loader label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles.length && !roles.includes(user?.role)) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/student-dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
