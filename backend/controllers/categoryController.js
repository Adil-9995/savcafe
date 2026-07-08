const db = require('../database/db');

exports.getCategories = async (req, res) => {
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const rows = await db.query('SELECT id, tenant_id, name, icon, created_at FROM categories WHERE tenant_id = ? ORDER BY name ASC', [tenantId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Database query error.' });
  }
};

exports.addCategory = async (req, res) => {
  const { name, icon } = req.body;
  const tenantId = req.user ? req.user.tenantId : 1;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const result = await db.run(
      'INSERT INTO categories (tenant_id, name, icon) VALUES (?, ?, ?)',
      [tenantId, name, icon || 'Utensils']
    );
    res.status(201).json({
      id: result.lastID,
      name,
      icon: icon || 'Utensils'
    });
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(400).json({ error: 'Category name already exists or database execution error.' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  const tenantId = req.user ? req.user.tenantId : 1;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const result = await db.run(
      'UPDATE categories SET name = ?, icon = ? WHERE id = ? AND tenant_id = ?',
      [name, icon, id, tenantId]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found or access denied.' });
    }
    res.json({ id, name, icon });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(400).json({ error: 'Category name already exists or database error.' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const result = await db.run('DELETE FROM categories WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found or access denied.' });
    }
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Database error while deleting category.' });
  }
};
