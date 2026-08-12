const pool = require("../config/db");
const logAudit = require("../config/auditLogger");

// Logistics Officers and Admins can log a purchase (new stock arriving at a base).
const createPurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    const { baseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "baseId, equipmentTypeId, and a positive quantity are required" });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO purchases (base_id, equipment_type_id, quantity, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [baseId, equipmentTypeId, quantity, userId],
    );

    await logAudit(
      client,
      userId,
      "PURCHASE",
      `Purchased ${quantity} units (Equipment Type #${equipmentTypeId}) for Base #${baseId}`,
    );

    await client.query("COMMIT");
    return res.status(201).json({ message: "Purchase recorded", purchase: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Failed to record purchase: " + err.message });
  } finally {
    client.release();
  }
};

// List purchases, optionally filtered by base and/or equipment type.
// If the requester is a Base Commander, enforceBaseScope middleware
// has already forced req.query.baseId to their own base.
const getPurchases = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;

    const result = await pool.query(
      `SELECT p.*, b.name AS base_name, e.name AS equipment_name
       FROM purchases p
       JOIN bases b ON b.id = p.base_id
       JOIN equipment_types e ON e.id = p.equipment_type_id
       WHERE ($1::int IS NULL OR p.base_id = $1)
         AND ($2::int IS NULL OR p.equipment_type_id = $2)
       ORDER BY p.created_at DESC`,
      [baseId || null, equipmentTypeId || null],
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch purchases" });
  }
};

module.exports = { createPurchase, getPurchases };
