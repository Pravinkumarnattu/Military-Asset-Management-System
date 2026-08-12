import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Transfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [form, setForm] = useState({
    sourceBaseId: "",
    destinationBaseId: "",
    equipmentTypeId: "",
    quantity: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canCreate = ["ADMIN", "LOGISTICS_OFFICER"].includes(user?.role);

  const loadTransfers = () => {
    api.get("/transfers").then((res) => setTransfers(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadTransfers();
    api.get("/bases").then((res) => setBases(res.data)).catch(() => {});
    api.get("/equipment-types").then((res) => setEquipmentTypes(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.sourceBaseId === form.destinationBaseId) {
      setError("Source and destination base cannot be the same");
      return;
    }

    try {
      await api.post("/transfers", {
        sourceBaseId: Number(form.sourceBaseId),
        destinationBaseId: Number(form.destinationBaseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
      });
      setSuccess("Transfer completed");
      setForm({ sourceBaseId: "", destinationBaseId: "", equipmentTypeId: "", quantity: "" });
      loadTransfers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record transfer");
    }
  };

  return (
    <div>
      <h1 className="page-title">Transfers</h1>

      {canCreate && (
        <form onSubmit={handleSubmit} className="record-form">
          <div className="form-field">
            <label>From Base</label>
            <select
              value={form.sourceBaseId}
              onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
              required
            >
              <option value="">Select base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>To Base</label>
            <select
              value={form.destinationBaseId}
              onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
              required
            >
              <option value="">Select base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Equipment Type</label>
            <select
              value={form.equipmentTypeId}
              onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
              required
            >
              <option value="">Select equipment</option>
              {equipmentTypes.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field form-field--narrow">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="primary-button">
            Initiate Transfer
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Equipment</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.source_base_name}</td>
                <td>{t.destination_base_name}</td>
                <td>{t.equipment_name}</td>
                <td>{t.quantity}</td>
                <td>{t.status}</td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">No transfers yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transfers;
