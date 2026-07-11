const supabase = require('../database/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, normalizeRole } = require('../middleware/auth');

exports.login = async (req, res) => {
  console.log(req.method, req.originalUrl);
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
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
      await supabase
        .from('users')
        .update({ role: normalizedUserRole })
        .eq('id', user.id);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // Resolve tenant primary branch
    let branchId = null;
    if (user.tenant_id) {
      const { data: branches } = await supabase
        .from('branches')
        .select('id')
        .eq('tenant_id', user.tenant_id)
        .limit(1);
      
      const branch = branches && branches[0];
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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, tenant_id, name, email, role, status, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (userError || !user) {
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
      const { error: updateError } = await supabase
        .from('users')
        .update({ name, email, password: hashedPassword })
        .eq('id', userId);
      if (updateError) throw updateError;
    } else {
      const { error: updateError } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', userId);
      if (updateError) throw updateError;
    }
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or database execution error.' });
  }
};
