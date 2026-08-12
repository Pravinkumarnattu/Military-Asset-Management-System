const jwt = require("jsonwebtoken");

// Checks that a valid JWT was sent with the request.
// If valid, attaches the decoded user info (id, role, baseId) to req.user.
const authenticateToken = (req, res, next) => {
  let token;
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    token = authHeader.split(" ")[1]; // "Bearer <token>"
  }
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
