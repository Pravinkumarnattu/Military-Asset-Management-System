import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./AuditLog.css";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/audit-logs").then((res) => setLogs(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title">Audit Log</h1>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="audit-date">{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.username || "unknown"}</td>
                <td>
                  <span className="audit-action-badge">{log.action}</span>
                </td>
                <td className="audit-details">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="4" className="empty-row">No activity yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
