import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import NetMoveModal from "../components/NetMoveModal";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({ baseId: "", equipmentTypeId: "", startDate: "" });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  // Load the dropdown options once.
  useEffect(() => {
    api.get("/bases").then((res) => setBases(res.data)).catch(() => {});
    api.get("/equipment-types").then((res) => setEquipmentTypes(res.data)).catch(() => {});
  }, []);

  // Reload the numbers whenever filters change.
  useEffect(() => {
    const params = {};
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    if (filters.startDate) params.startDate = filters.startDate;

    api
      .get("/dashboard/metrics", { params })
      .then((res) => setMetrics(res.data))
      .catch(() => setError("Could not load dashboard metrics"));
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const isBaseCommander = user?.role === "BASE_COMMANDER";

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Filters. Base Commanders don't get a base dropdown - they're locked to their own base already. */}
      <div className="dashboard-filters">
        {!isBaseCommander && (
          <select
            value={filters.baseId}
            onChange={(e) => handleFilterChange("baseId", e.target.value)}
            className="filter-select"
          >
            <option value="">All Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.equipmentTypeId}
          onChange={(e) => handleFilterChange("equipmentTypeId", e.target.value)}
          className="filter-select"
        >
          <option value="">All Equipment Types</option>
          {equipmentTypes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
          className="filter-select"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      {metrics && (
        <div className="stat-grid">
          <StatCard label="Opening Balance" value={metrics.openingBalance} accent="blue" />
          <StatCard
            label="Net Movement (click for detail)"
            value={metrics.netMovement}
            accent="emerald"
            onClick={() => setShowModal(true)}
          />
          <StatCard label="Assigned" value={metrics.assigned} accent="amber" />
          <StatCard label="Closing Balance" value={metrics.closingBalance} accent="slate" />
        </div>
      )}

      {showModal && metrics && (
        <NetMoveModal metrics={metrics} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
