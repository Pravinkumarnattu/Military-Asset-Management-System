// Writes one row to audit_logs. Called from inside controllers,
// usually as part of the same DB transaction as the change itself.
// "client" is either the shared pool or a transaction client (from pool.connect()).
const logAudit = async (client, userId, action, details) => {
  await client.query(
    "INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)",
    [userId, action, details],
  );
};

module.exports = logAudit;
