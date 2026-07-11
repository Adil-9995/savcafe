const supabase = require('../database/supabase');
const bcrypt = require('bcryptjs');

exports.getCashiers = async (req, res) => {
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at')
      .eq('role', 'Cashier')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(rows || []);
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
    const { data, error } = await supabase
      .from('users')
      .insert({
        tenant_id: tenantId,
        name,
        email,
        password: hashedPassword,
        role: 'Cashier',
        status: 'Active'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
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
    const { data, error } = await supabase
      .from('users')
      .update({ name, email, status })
      .eq('id', id)
      .eq('role', 'Cashier')
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
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
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'Cashier')
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
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
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id)
      .eq('role', 'Cashier')
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Cashier not found or access denied.' });
    }

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Database error resetting password.' });
  }
};
