const db = require('../database/db');
const bcrypt = require('bcryptjs');

exports.getCashiers = async (req, res) => {
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const rows = await db.query(
      "SELECT id, name, email, role, status, created_at FROM users WHERE role = 'Cashier' AND tenant_id = ? ORDER BY name ASC",
      [tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cashiers:', err);
    res.status(500).json({ error: 'Database query error.' });
  }
};

exports.addCashier = async (req, res) => {
  const { name, email, password } = req.body;
  const tenantId = req.user.tenantId || 1;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.run(
      "INSERT INTO users (tenant_id, name, email, password, role, status) VALUES (?, ?, ?, ?, 'Cashier', 'Active')",
      [tenantId, name, email, hashedPassword]
    );
    res.status(201).json({
      id: result.lastID,
      name,
      email,
      role: 'Cashier',
      status: 'Active'
    });
  } catch (err) {
    console.error('Error adding cashier:', err);
    res.status(400).json({ error: 'Email already exists or database execution error.' });
  }
};

exports.updateCashier = async (req, res) => {
  const { id } = req.params;
  const { name, email, status } = req.body;
  const tenantId = req.user.tenantId || 1;

  if (!name || !email || !status) {
    return res.status(400).json({ error: 'Name, email, and status are required.' });
  }

  try {
    const result = await db.run(
      "UPDATE users SET name = ?, email = ?, status = ? WHERE id = ? AND role = 'Cashier' AND tenant_id = ?",
      [name, email, status, id, tenantId]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cashier not found or access denied.' });
    }
    res.json({ id, name, email, status, role: 'Cashier' });
  } catch (err) {
    console.error('Error updating cashier:', err);
    res.status(400).json({ error: 'Email already exists or database error.' });
  }
};

exports.deleteCashier = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId || 1;

  try {
    const result = await db.run("DELETE FROM users WHERE id = ? AND role = 'Cashier' AND tenant_id = ?", [id, tenantId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cashier not found or access denied.' });
    }
    res.json({ success: true, message: 'Cashier deleted successfully.' });
  } catch (err) {
    console.error('Error deleting cashier:', err);
    res.status(500).json({ error: 'Database error while deleting cashier.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const tenantId = req.user.tenantId || 1;

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.run(
      "UPDATE users SET password = ? WHERE id = ? AND role = 'Cashier' AND tenant_id = ?",
      [hashedPassword, id, tenantId]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cashier not found or access denied.' });
    }
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Database error resetting password.' });
  }
};
