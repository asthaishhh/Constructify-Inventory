import React, { useState } from "react";
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
import Transportation from "../pages/Transportation";
import Settings from "../pages/Settings";
import RegisterCompany from "../pages/RegisterCompany";
import ConstructifyAnalytics from "../pages/Overview";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

function App() {
  const [collapsed, setCollapsed] = useState(false);

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
                    path="/employees/*"
                    element={
                      <ProtectedRoute>
                        <Employees />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/transporation"
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