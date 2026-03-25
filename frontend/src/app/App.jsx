import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import AppSidebar from "../components/layouts/sidebar";
import Dashboard from "../components/dashboard/Dashboard";
import Bill from "../pages/Bill";
import Orders from "../pages/Orders";
import Inventory from "../pages/Inventory";
import Overview from "../pages/Overview";
import Employees from "../pages/Employees";
import Customers from "../pages/Customers";
import Transportation from "../pages/Transportation";
import Settings from "../pages/Settings";
import RegisterCompany from "../pages/RegisterCompany";
import ConstructifyAnalytics from "../pages/Overview";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import { warmupBackendHealth } from "../api/health.api";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isWarmupDone, setIsWarmupDone] = useState(false);
  const [warmupError, setWarmupError] = useState("");

  const runWarmup = async () => {
    setWarmupError("");
    try {
      await warmupBackendHealth();
      setIsWarmupDone(true);
    } catch (error) {
      setWarmupError("Backend is still waking up. Please retry.");
      setIsWarmupDone(false);
    }
  };

  useEffect(() => {
    runWarmup();
  }, []);

  if (!isWarmupDone) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Starting Constructify</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Checking backend health before loading dashboard data.
          </p>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
            <div className="h-full w-2/3 bg-gradient-to-r from-cyan-500 to-indigo-500 animate-pulse" />
          </div>
          {warmupError ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">{warmupError}</p>
              <button
                type="button"
                onClick={runWarmup}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                Retry Health Check
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent collapsed={collapsed} setCollapsed={setCollapsed} />
    </Router>
  );
}

/* -------------------- PROTECTED ROUTE -------------------- */

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* -------------------- MAIN APP CONTENT -------------------- */

function AppContent({ collapsed, setCollapsed }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  const defaultRoute = role === "admin" ? "/dashboard" : "/bill";

  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/register-company";

  return (
    <>
      {isAuthRoute ? (
        /* -------------------- AUTH LAYOUT -------------------- */
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register-company" element={<RegisterCompany />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        /* -------------------- PROTECTED APP LAYOUT -------------------- */
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
          {token && (
            <AppSidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed(!collapsed)}
            />
          )}

          <div className="flex-1 p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <Routes location={location}>
                  {/* -------------------- COMMON ROUTES -------------------- */}

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/overview"
                    element={
                      <ProtectedRoute>
                        <Overview />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/bill"
                    element={
                      <ProtectedRoute>
                        <Bill />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute>
                        <Customers />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/employees/*"
                    element={
                      <ProtectedRoute>
                        <Employees />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/transportation"
                    element={
                      <ProtectedRoute>
                        <Transportation />
                      </ProtectedRoute>
                    }
                  />

                  {/* -------------------- ADMIN ONLY -------------------- */}

                  <Route
                    path="/analysis"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <ConstructifyAnalytics />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  {/* -------------------- DEFAULT REDIRECT -------------------- */}

                  <Route
                    path="*"
                    element={<Navigate to={defaultRoute} replace />}
                  />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}

export default App;