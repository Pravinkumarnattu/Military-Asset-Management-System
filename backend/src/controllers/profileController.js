const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role, base_id FROM users WHERE id = $1",
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No user found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = getProfile;
