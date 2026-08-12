const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatched = await bcrypt.compare(password, user.password_hash);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Everything downstream (RBAC middleware, base scoping) reads
    // these three fields off the decoded token.
    const payload = {
      id: user.id,
      role: user.role,
      baseId: user.base_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      role: user.role,
      baseId: user.base_id,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = login;
