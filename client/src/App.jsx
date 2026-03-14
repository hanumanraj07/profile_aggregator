import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import { useAuth } from "./context/AuthContext";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import DevCard from "./pages/DevCard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Student from "./pages/Student";
import StudentDashboard from "./pages/StudentDashboard";
import StudentPublicDashboard from "./pages/StudentPublicDashboard";

function App() {
  const location = useLocation();
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <Loader label="Loading app..." />
      </div>
    );
  }

  const defaultRoute = user?.role === "admin" ? "/admin" : "/student-dashboard";

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      {isAuthenticated ? <Navbar /> : null}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={`mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 ${isAuthenticated ? "pt-24" : "pt-10"}`}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to={isAuthenticated ? defaultRoute : "/login"} replace />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Login />} />

            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute roles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/:username"
              element={
                <ProtectedRoute roles={["student", "admin"]}>
                  <StudentPublicDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute roles={["student"]}>
                  <Student />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute roles={["student", "admin"]}>
                  <DevCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dev-card"
              element={<Navigate to="/leaderboard" replace />}
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute roles={["student", "admin"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? defaultRoute : "/login"} replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
