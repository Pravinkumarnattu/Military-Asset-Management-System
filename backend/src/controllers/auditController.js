const pool = require("../config/db");

// Admin-only: view the full audit trail.
const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.username
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT 200`,
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

module.exports = { getAuditLogs };
