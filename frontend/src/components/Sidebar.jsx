import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const linkClass = ({ isActive }) => `sidebar-link${isActive ? " active" : ""}`;

const Sidebar = () => {
  const { user } = useAuth();

  // Which links a role can see. Matches the backend RBAC rules exactly -
  // this is just for hiding links the user can't use anyway; the real
  // enforcement happens on the server.
  const canSeePurchasesTransfers = ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"].includes(user?.role);
  const canCreatePurchasesTransfers = ["ADMIN", "LOGISTICS_OFFICER"].includes(user?.role);
  const canSeeAssignments = ["ADMIN", "BASE_COMMANDER"].includes(user?.role);
  const canSeeAuditLog = user?.role === "ADMIN";

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Kristallball</div>

      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>

      {canSeePurchasesTransfers && (
        <NavLink to="/purchases" className={linkClass}>
          Purchases
        </NavLink>
      )}

      {canSeePurchasesTransfers && (
        <NavLink to="/transfers" className={linkClass}>
          Transfers
        </NavLink>
      )}

      {canSeeAssignments && (
        <NavLink to="/assignments" className={linkClass}>
          Assignments & Expenditures
        </NavLink>
      )}

      {canSeeAuditLog && (
        <NavLink to="/audit-log" className={linkClass}>
          Audit Log
        </NavLink>
      )}

      {!canCreatePurchasesTransfers && (
        <p className="sidebar-note">
          Your role can view purchases and transfers but not create them.
        </p>
      )}
    </aside>
  );
};

export default Sidebar;
