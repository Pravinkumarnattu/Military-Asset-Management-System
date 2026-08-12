import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [form, setForm] = useState({ baseId: "", equipmentTypeId: "", quantity: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canCreate = ["ADMIN", "LOGISTICS_OFFICER"].includes(user?.role);

  const loadPurchases = () => {
    api.get("/purchases").then((res) => setPurchases(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadPurchases();
    api.get("/bases").then((res) => setBases(res.data)).catch(() => {});
    api.get("/equipment-types").then((res) => setEquipmentTypes(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/purchases", {
        baseId: Number(form.baseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
      });
      setSuccess("Purchase recorded");
      setForm({ baseId: "", equipmentTypeId: "", quantity: "" });
      loadPurchases();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record purchase");
    }
  };

  return (
    <div>
      <h1 className="page-title">Purchases</h1>

      {canCreate && (
        <form onSubmit={handleSubmit} className="record-form">
          <div className="form-field">
            <label>Base</label>
            <select
              value={form.baseId}
              onChange={(e) => setForm({ ...form, baseId: e.target.value })}
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
            Log Purchase
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
              <th>Base</th>
              <th>Equipment</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>{p.base_name}</td>
                <td>{p.equipment_name}</td>
                <td>{p.quantity}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-row">No purchases yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;
