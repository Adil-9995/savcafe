const supabase = require('../database/supabase');

exports.getProducts = async (req, res) => {
  const { search, categoryId, status } = req.query;
  const tenantId = req.user ? req.user.tenantId : 1;

  let builder = supabase
    .from('products')
    .select('*, categories(name)')
    .eq('tenant_id', tenantId);

  if (search) {
    builder = builder.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  }

  if (categoryId) {
    builder = builder.eq('category_id', categoryId);
  }

  if (status) {
    builder = builder.eq('status', status);
  }

  builder = builder.order('name', { ascending: true });

  try {
    const { data: rows, error } = await builder;
    if (error) throw error;

    const formattedRows = (rows || []).map((row) => {
      const { categories, ...rest } = row;
      return {
        ...rest,
        category_name: categories ? categories.name : null
      };
    });

    res.json(formattedRows);
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
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: `Product code '${code}' already exists in your catalog.` });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        code,
        name,
        category_id: categoryId || null,
        price: numericPrice,
        tax: numericTax,
        gst: numericGst,
        description: description || '',
        image_path: imagePath || '',
        status: status || 'Available'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
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
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', code)
      .neq('id', id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: `Product code '${code}' is already assigned to another item.` });
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        code,
        name,
        category_id: categoryId || null,
        price: numericPrice,
        tax: numericTax,
        gst: numericGst,
        description: description || '',
        image_path: imagePath || '',
        status
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
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
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
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
    const { data, error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found or access denied.' });
    }
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'Database execution error during state toggle.' });
  }
};
