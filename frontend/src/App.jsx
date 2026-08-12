import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Transfers from "./pages/Transfers";
import Assignments from "./pages/Assignments";
import AuditLog from "./pages/AuditLog";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <Layout>
                  <Purchases />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transfers />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "BASE_COMMANDER"]}>
                <Layout>
                  <Assignments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-log"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <AuditLog />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
