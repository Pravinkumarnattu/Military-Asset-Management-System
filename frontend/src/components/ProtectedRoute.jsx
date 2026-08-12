import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any page that needs a logged-in user with this.
// Optionally pass allowedRoles to also restrict which roles can see it.
// Usage: <ProtectedRoute allowedRoles={["ADMIN"]}><UsersPage /></ProtectedRoute>
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
