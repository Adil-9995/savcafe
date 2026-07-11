const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'savora_super_secret_session_key_987654321';
const VALID_ROLES = ['Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff'];

const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = String(role).trim();
  const mapping = {
    Administrator: 'Shop Owner',
    Admin: 'Shop Owner',
    Owner: 'Shop Owner',
    'Super Admin': 'Super Admin',
    'Shop Owner': 'Shop Owner',
    Manager: 'Manager',
    Cashier: 'Cashier',
    Staff: 'Staff'
  };
  return mapping[normalized] || (VALID_ROLES.includes(normalized) ? normalized : null);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authorization token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied: Token expired or invalid.' });
    }
    // Bind context: id, tenantId, branchId, role
    const normalizedRole = normalizeRole(decodedUser.role);
    req.user = {
      id: decodedUser.id,
      tenantId: decodedUser.tenantId,
      branchId: decodedUser.branchId,
      role: normalizedRole || decodedUser.role
    };
    next();
  });
};

const authorizeRole = (allowedRoles = []) => (req, res, next) => {
  authenticateToken(req, res, () => {
    const userRole = req.user.role;
    const canAccess = allowedRoles.some((role) => role === userRole);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied: insufficient privileges.' });
    }
    next();
  });
};

const authorizeAdmin = authorizeRole(['Super Admin', 'Shop Owner', 'Manager']);

module.exports = { authenticateToken, authorizeAdmin, authorizeRole, JWT_SECRET, VALID_ROLES, normalizeRole };
