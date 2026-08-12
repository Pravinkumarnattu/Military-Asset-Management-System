// Only lets the request through if req.user.role is one of the allowed roles.
// Usage: router.post("/some-route", authorizeRoles("ADMIN", "LOGISTICS_OFFICER"), handler)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access Denied: Insufficient authorization level.",
      });
    }
    next();
  };
};

// Base Commanders should only ever see their own base's data.
// This forces req.query.baseId to their assigned base, no matter what
// they put in the request. Admins pass straight through untouched.
const enforceBaseScope = (req, res, next) => {
  if (req.user.role === "BASE_COMMANDER") {
    req.query.baseId = req.user.baseId;
  }
  next();
};

module.exports = { authorizeRoles, enforceBaseScope };
