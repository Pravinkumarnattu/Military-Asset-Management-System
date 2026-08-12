import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Assignments.css";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [bases, setBases] = useState([]);

  const [assignForm, setAssignForm] = useState({ baseId: "", equipmentTypeId: "", quantity: "", assignedTo: "" });
  const [expendForm, setExpendForm] = useState({ baseId: "", equipmentTypeId: "", quantity: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = () => {
    api.get("/assignments").then((res) => setAssignments(res.data)).catch(() => {});
    api.get("/expenditures").then((res) => setExpenditures(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
    api.get("/bases").then((res) => setBases(res.data)).catch(() => {});
    api.get("/equipment-types").then((res) => setEquipmentTypes(res.data)).catch(() => {});
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/assignments", {
        baseId: Number(assignForm.baseId),
        equipmentTypeId: Number(assignForm.equipmentTypeId),
        quantity: Number(assignForm.quantity),
        assignedTo: assignForm.assignedTo,
      });
      setSuccess("Assignment recorded");
      setAssignForm({ baseId: "", equipmentTypeId: "", quantity: "", assignedTo: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record assignment");
    }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/expenditures", {
        baseId: Number(expendForm.baseId),
        equipmentTypeId: Number(expendForm.equipmentTypeId),
        quantity: Number(expendForm.quantity),
        reason: expendForm.reason,
      });
      setSuccess("Expenditure recorded");
      setExpendForm({ baseId: "", equipmentTypeId: "", quantity: "", reason: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record expenditure");
    }
  };

  return (
    <div>
      <h1 className="page-title">Assignments & Expenditures</h1>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="assignments-columns">
        {/* Assignments column */}
        <div>
          <h2 className="column-title">Assign Equipment to Personnel</h2>
          <form onSubmit={handleAssignSubmit} className="stacked-form">
            <select
              value={assignForm.baseId}
              onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })}
              required
            >
              <option value="">Select base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={assignForm.equipmentTypeId}
              onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })}
              required
            >
              <option value="">Select equipment</option>
              {equipmentTypes.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Assigned to (name)"
              value={assignForm.assignedTo}
              onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={assignForm.quantity}
              onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
              required
            />
            <button type="submit" className="primary-button primary-button--full">
              Record Assignment
            </button>
          </form>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.equipment_name}</td>
                    <td>{a.quantity}</td>
                    <td>{a.assigned_to}</td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan="3" className="empty-row">No assignments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenditures column */}
        <div>
          <h2 className="column-title">Record Expended Equipment</h2>
          <form onSubmit={handleExpendSubmit} className="stacked-form">
            <select
              value={expendForm.baseId}
              onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })}
              required
            >
              <option value="">Select base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={expendForm.equipmentTypeId}
              onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })}
              required
            >
              <option value="">Select equipment</option>
              {equipmentTypes.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={expendForm.reason}
              onChange={(e) => setExpendForm({ ...expendForm, reason: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={expendForm.quantity}
              onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })}
              required
            />
            <button type="submit" className="primary-button primary-button--full">
              Record Expenditure
            </button>
          </form>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.map((ex) => (
                  <tr key={ex.id}>
                    <td>{ex.equipment_name}</td>
                    <td>{ex.quantity}</td>
                    <td>{ex.reason || "-"}</td>
                  </tr>
                ))}
                {expenditures.length === 0 && (
                  <tr><td colSpan="3" className="empty-row">No expenditures yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
