const pool = require("../config/db");
const logAudit = require("../config/auditLogger");

// Moves assets from one base to another. Everything happens inside
// BEGIN...COMMIT so if anything fails partway through, nothing is saved -
// you never end up with a transfer recorded but no audit log, or similar.
const createTransfer = async (req, res) => {
  const client = await pool.connect();
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "sourceBaseId, destinationBaseId, equipmentTypeId, and a positive quantity are required" });
    }

    if (sourceBaseId === destinationBaseId) {
      return res.status(400).json({ message: "Source and destination base cannot be the same" });
    }

    await client.query("BEGIN");

    const transferResult = await client.query(
      `INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sourceBaseId, destinationBaseId, equipmentTypeId, quantity, userId],
    );

    await logAudit(
      client,
      userId,
      "TRANSFER",
      `Transferred ${quantity} units (Equipment Type #${equipmentTypeId}) from Base #${sourceBaseId} to Base #${destinationBaseId}`,
    );

    await client.query("COMMIT");
    return res.status(201).json({ message: "Transfer completed successfully", transfer: transferResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Transfer failed: " + err.message });
  } finally {
    client.release();
  }
};

// List transfers involving a base, either as source or destination.
const getTransfers = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;

    const result = await pool.query(
      `SELECT t.*, sb.name AS source_base_name, db.name AS destination_base_name, e.name AS equipment_name
       FROM transfers t
       JOIN bases sb ON sb.id = t.source_base_id
       JOIN bases db ON db.id = t.destination_base_id
       JOIN equipment_types e ON e.id = t.equipment_type_id
       WHERE ($1::int IS NULL OR t.source_base_id = $1 OR t.destination_base_id = $1)
         AND ($2::int IS NULL OR t.equipment_type_id = $2)
       ORDER BY t.created_at DESC`,
      [baseId || null, equipmentTypeId || null],
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch transfers" });
  }
};

module.exports = { createTransfer, getTransfers };
