const pool = require("../config/db");
const logAudit = require("../config/auditLogger");

// Assign equipment to a person (e.g. a rifle issued to a named soldier).
const createAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !assignedTo) {
      return res.status(400).json({ message: "baseId, equipmentTypeId, quantity, and assignedTo are required" });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO assignments (base_id, equipment_type_id, quantity, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [baseId, equipmentTypeId, quantity, assignedTo, userId],
    );

    await logAudit(
      client,
      userId,
      "ASSIGNMENT",
      `Assigned ${quantity} units (Equipment Type #${equipmentTypeId}) to ${assignedTo} at Base #${baseId}`,
    );

    await client.query("COMMIT");
    return res.status(201).json({ message: "Assignment recorded", assignment: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Failed to record assignment: " + err.message });
  } finally {
    client.release();
  }
};

// Record equipment that was used up / consumed (e.g. ammunition spent in training).
const createExpenditure = async (req, res) => {
  const client = await pool.connect();
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "baseId, equipmentTypeId, and a positive quantity are required" });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [baseId, equipmentTypeId, quantity, reason || null, userId],
    );

    await logAudit(
      client,
      userId,
      "EXPENDITURE",
      `Expended ${quantity} units (Equipment Type #${equipmentTypeId}) at Base #${baseId}${reason ? " - " + reason : ""}`,
    );

    await client.query("COMMIT");
    return res.status(201).json({ message: "Expenditure recorded", expenditure: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Failed to record expenditure: " + err.message });
  } finally {
    client.release();
  }
};

// List assignments and expenditures for a base (shown together on one page in the UI).
const getAssignments = async (req, res) => {
  try {
    const { baseId } = req.query;
    const result = await pool.query(
      `SELECT a.*, e.name AS equipment_name
       FROM assignments a
       JOIN equipment_types e ON e.id = a.equipment_type_id
       WHERE ($1::int IS NULL OR a.base_id = $1)
       ORDER BY a.created_at DESC`,
      [baseId || null],
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

const getExpenditures = async (req, res) => {
  try {
    const { baseId } = req.query;
    const result = await pool.query(
      `SELECT ex.*, e.name AS equipment_name
       FROM expenditures ex
       JOIN equipment_types e ON e.id = ex.equipment_type_id
       WHERE ($1::int IS NULL OR ex.base_id = $1)
       ORDER BY ex.created_at DESC`,
      [baseId || null],
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch expenditures" });
  }
};

module.exports = { createAssignment, createExpenditure, getAssignments, getExpenditures };
