const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");
const { authorizeRoles, enforceBaseScope } = require("../middleware/rbac");

const register = require("../controllers/register");
const login = require("../controllers/login");
const getProfile = require("../controllers/profileController");

const { createPurchase, getPurchases } = require("../controllers/purchaseController");
const { createTransfer, getTransfers } = require("../controllers/transferController");
const {
  createAssignment,
  createExpenditure,
  getAssignments,
  getExpenditures,
} = require("../controllers/assignmentController");
const { getDashboardMetrics, getBases, getEquipmentTypes } = require("../controllers/assetController");
const { getAuditLogs } = require("../controllers/auditController");

// --- Public routes ---
router.post("/login", login);

// --- Auth-only routes (any logged-in user) ---
router.get("/me", authenticateToken, getProfile);
router.get("/bases", authenticateToken, getBases);
router.get("/equipment-types", authenticateToken, getEquipmentTypes);

// --- Admin only ---
router.post("/register", authenticateToken, authorizeRoles("ADMIN"), register);
router.get("/audit-logs", authenticateToken, authorizeRoles("ADMIN"), getAuditLogs);

// --- Dashboard (Admin sees everything, Base Commander is scoped to their base) ---
router.get(
  "/dashboard/metrics",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  enforceBaseScope,
  getDashboardMetrics,
);

// --- Purchases (Admin + Logistics Officer can create; Admin + Base Commander can view) ---
router.post(
  "/purchases",
  authenticateToken,
  authorizeRoles("ADMIN", "LOGISTICS_OFFICER"),
  createPurchase,
);
router.get(
  "/purchases",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  enforceBaseScope,
  getPurchases,
);

// --- Transfers (Admin + Logistics Officer can create; Admin + Base Commander can view) ---
router.post(
  "/transfers",
  authenticateToken,
  authorizeRoles("ADMIN", "LOGISTICS_OFFICER"),
  createTransfer,
);
router.get(
  "/transfers",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  enforceBaseScope,
  getTransfers,
);

// --- Assignments & Expenditures (Admin + Base Commander manage their own base) ---
router.post(
  "/assignments",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  createAssignment,
);
router.get(
  "/assignments",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  enforceBaseScope,
  getAssignments,
);
router.post(
  "/expenditures",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  createExpenditure,
);
router.get(
  "/expenditures",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  enforceBaseScope,
  getExpenditures,
);

module.exports = router;
