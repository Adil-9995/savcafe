const db = require('../database/db');

exports.getProducts = async (req, res) => {
  const { search, categoryId, status } = req.query;
  // Segment by tenant ID. If guest (no token), default to seed tenant 1.
  const tenantId = req.user ? req.user.tenantId : 1;

  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.tenant_id = ?
  `;
  const params = [tenantId];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.code LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (categoryId) {
    query += ' AND p.category_id = ?';
    params.push(categoryId);
  }

  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.name ASC';

  try {
    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database read error.' });
  }
};

exports.addProduct = async (req, res) => {
  const { code, name, categoryId, price, tax, gst, description, imagePath, status } = req.body;
  const tenantId = req.user ? req.user.tenantId : 1;

  if (!code || !name || price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'Product Code, Name, and Price are required.' });
  }

  const numericPrice = parseFloat(price);
  const numericTax = parseFloat(tax) || 0.0;
  const numericGst = parseFloat(gst) || 0.0;

  try {
    // Validate unique code within this tenant
    const existing = await db.get('SELECT id FROM products WHERE tenant_id = ? AND code = ?', [tenantId, code]);
    if (existing) {
      return res.status(400).json({ error: `Product code '${code}' already exists in your catalog.` });
    }

    const result = await db.run(
      `INSERT INTO products (tenant_id, code, name, category_id, price, tax, gst, description, image_path, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, code, name, categoryId || null, numericPrice, numericTax, numericGst, description || '', imagePath || '', status || 'Available']
    );

    res.status(201).json({
      id: result.lastID,
      code,
      name,
      categoryId,
      price: numericPrice,
      tax: numericTax,
      gst: numericGst,
      description,
      imagePath,
      status: status || 'Available'
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message || 'Database query execution failure.' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { code, name, categoryId, price, tax, gst, description, imagePath, status } = req.body;
  const tenantId = req.user ? req.user.tenantId : 1;

  if (!code || !name || price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'Product Code, Name, and Price are required.' });
  }

  const numericPrice = parseFloat(price);
  const numericTax = parseFloat(tax) || 0.0;
  const numericGst = parseFloat(gst) || 0.0;

  try {
    // Check if code is taken by another product in this tenant
    const existing = await db.get(
      'SELECT id FROM products WHERE tenant_id = ? AND code = ? AND id != ?',
      [tenantId, code, id]
    );
    if (existing) {
      return res.status(400).json({ error: `Product code '${code}' is already assigned to another item.` });
    }

    const result = await db.run(
      `UPDATE products 
       SET code = ?, name = ?, category_id = ?, price = ?, tax = ?, gst = ?, description = ?, image_path = ?, status = ? 
       WHERE id = ? AND tenant_id = ?`,
      [code, name, categoryId || null, numericPrice, numericTax, numericGst, description || '', imagePath || '', status, id, tenantId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found or access denied.' });
    }

    res.json({ id, code, name, categoryId, price: numericPrice, tax: numericTax, gst: numericGst, description, imagePath, status });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message || 'Database update transaction failed.' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const result = await db.run('DELETE FROM products WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found or access denied.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Database execution error during product removal.' });
  }
};

exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.user ? req.user.tenantId : 1;

  if (!['Available', 'Out of Stock', 'Disabled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const result = await db.run(
      'UPDATE products SET status = ? WHERE id = ? AND tenant_id = ?',
      [status, id, tenantId]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found or access denied.' });
    }
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'Database execution error during state toggle.' });
  }
};
