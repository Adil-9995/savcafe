const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, normalizeRole } = require('../middleware/auth');

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ error: 'This account has been disabled. Please contact Admin.' });
    }

    const normalizedRequestedRole = normalizeRole(role);
    const normalizedUserRole = normalizeRole(user.role);

    const allowedRoles = ['Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff'];
    if (!normalizedRequestedRole || !allowedRoles.includes(normalizedRequestedRole)) {
      return res.status(400).json({ error: `Unsupported role '${role}'.` });
    }

    if (normalizedUserRole !== normalizedRequestedRole && normalizedUserRole !== 'Super Admin') {
      return res.status(400).json({ error: `User is not registered under the '${role}' role.` });
    }

    if (normalizedUserRole && user.role !== normalizedUserRole) {
      await db.run('UPDATE users SET role = ? WHERE id = ?', [normalizedUserRole, user.id]);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // Resolve tenant primary branch
    let branchId = null;
    if (user.tenant_id) {
      const branch = await db.get('SELECT id FROM branches WHERE tenant_id = ? LIMIT 1', [user.tenant_id]);
      branchId = branch ? branch.id : null;
    }

    // Generate Token with tenant and branch IDs
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: normalizedUserRole || user.role,
        tenantId: user.tenant_id,
        branchId: branchId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedUserRole || user.role,
        tenantId: user.tenant_id,
        branchId: branchId
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login validation.' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await db.get('SELECT id, tenant_id, name, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Database read failure.' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      await db.run(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
        [name, email, hashedPassword, userId]
      );
    } else {
      await db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId]
      );
    }
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or database execution error.' });
  }
};
