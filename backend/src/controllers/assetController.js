const pool = require("../config/db");

// Computes the dashboard numbers:
//   Net Movement = Purchases + Transfers In - Transfers Out
//   Closing Balance = Opening Balance + Net Movement - Assigned - Expended
//
// "Opening Balance" here means everything that happened before startDate.
// "Net Movement" (and Assigned/Expended) covers activity from startDate onward.
// If no startDate is given, Opening Balance is 0 and everything counts as movement.
const getDashboardMetrics = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate } = req.query;

    // Note: these use "$3::timestamp IS NOT NULL AND created_at < $3" (not IS NULL OR ...).
    // That's deliberate - if no startDate is given, opening balance must be 0,
    // not "everything", otherwise the same records get counted here AND in
    // movement below, doubling every total.
    const openingQuery = `
      SELECT
        COALESCE((SELECT SUM(quantity) FROM purchases
          WHERE ($1::int IS NULL OR base_id = $1)
            AND ($2::int IS NULL OR equipment_type_id = $2)
            AND ($3::timestamp IS NOT NULL AND created_at < $3)), 0)
        +
        COALESCE((SELECT SUM(quantity) FROM transfers
          WHERE ($1::int IS NULL OR destination_base_id = $1)
            AND ($2::int IS NULL OR equipment_type_id = $2)
            AND ($3::timestamp IS NOT NULL AND created_at < $3)), 0)
        -
        COALESCE((SELECT SUM(quantity) FROM transfers
          WHERE ($1::int IS NULL OR source_base_id = $1)
            AND ($2::int IS NULL OR equipment_type_id = $2)
            AND ($3::timestamp IS NOT NULL AND created_at < $3)), 0)
        -
        COALESCE((SELECT SUM(quantity) FROM assignments
          WHERE ($1::int IS NULL OR base_id = $1)
            AND ($2::int IS NULL OR equipment_type_id = $2)
            AND ($3::timestamp IS NOT NULL AND created_at < $3)), 0)
        -
        COALESCE((SELECT SUM(quantity) FROM expenditures
          WHERE ($1::int IS NULL OR base_id = $1)
            AND ($2::int IS NULL OR equipment_type_id = $2)
            AND ($3::timestamp IS NOT NULL AND created_at < $3)), 0)
        AS opening_balance
    `;

    const movementQuery = `
      WITH purchase_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_purchases
        FROM purchases
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3)
      ),
      transfer_in_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfer_in
        FROM transfers
        WHERE ($1::int IS NULL OR destination_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3)
      ),
      transfer_out_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfer_out
        FROM transfers
        WHERE ($1::int IS NULL OR source_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3)
      ),
      assigned_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_assigned
        FROM assignments
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3)
      ),
      expended_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_expended
        FROM expenditures
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3)
      )
      SELECT
        p.total_purchases,
        ti.total_transfer_in,
        tout.total_transfer_out,
        a.total_assigned,
        ex.total_expended,
        (p.total_purchases + ti.total_transfer_in - tout.total_transfer_out) AS net_movement
      FROM purchase_summary p, transfer_in_summary ti, transfer_out_summary tout,
           assigned_summary a, expended_summary ex
    `;

    const params = [baseId || null, equipmentTypeId || null, startDate || null];

    const [openingResult, movementResult] = await Promise.all([
      pool.query(openingQuery, params),
      pool.query(movementQuery, params),
    ]);

    const openingBalance = Number(openingResult.rows[0].opening_balance);
    const movement = movementResult.rows[0];
    const netMovement = Number(movement.net_movement);
    const assigned = Number(movement.total_assigned);
    const expended = Number(movement.total_expended);
    const closingBalance = openingBalance + netMovement - assigned - expended;

    return res.status(200).json({
      openingBalance,
      purchases: Number(movement.total_purchases),
      transfersIn: Number(movement.total_transfer_in),
      transfersOut: Number(movement.total_transfer_out),
      netMovement,
      assigned,
      expended,
      closingBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to compute dashboard metrics" });
  }
};

// Simple lookups the frontend needs for dropdowns.
const getBases = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bases ORDER BY name");
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch bases" });
  }
};

const getEquipmentTypes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM equipment_types ORDER BY name");
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch equipment types" });
  }
};

module.exports = { getDashboardMetrics, getBases, getEquipmentTypes };
