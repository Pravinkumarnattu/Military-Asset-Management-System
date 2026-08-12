const bcrypt = require("bcrypt");
const pool = require("../config/db");

// Only an Admin can create new accounts (soldiers don't self-register
// into a military asset system). This route sits behind
// authenticateToken + authorizeRoles("ADMIN") in the routes file.
const register = async (req, res) => {
  try {
    const { username, password, role, baseId } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "username, password, and role are required" });
    }

    const allowedRoles = ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role, base_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role, base_id`,
      [username, hashedPassword, role, baseId || null],
    );

    return res.status(201).json({ message: "User created successfully", user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation - username already taken
      return res.status(409).json({ message: "Username already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = register;
