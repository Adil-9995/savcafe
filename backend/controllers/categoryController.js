const supabase = require('../database/supabase');

exports.getCategories = async (req, res) => {
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const { data: rows, error } = await supabase
      .from('categories')
      .select('id, tenant_id, name, icon, created_at')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(rows || []);
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
    const { data, error } = await supabase
      .from('categories')
      .insert({
        tenant_id: tenantId,
        name,
        icon: icon || 'Utensils'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
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
    const { data, error } = await supabase
      .from('categories')
      .update({ name, icon })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
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
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Category not found or access denied.' });
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Database error while deleting category.' });
  }
};
