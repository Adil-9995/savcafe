const db = require('../database/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Create a new bill/order
exports.createBill = async (req, res) => {
  const { cashierName, items, discount, paymentType } = req.body;
  const tenantId = req.user ? req.user.tenantId : 1;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cannot save an empty bill.' });
  }

  // Calculate prices
  let subtotal = 0;
  items.forEach((item) => {
    subtotal += item.quantity * item.price;
  });

  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const disc = parseFloat(discount || 0);
  const totalBeforeRound = subtotal - disc + tax;
  const grandTotal = Math.round(totalBeforeRound);
  const roundOff = parseFloat((grandTotal - totalBeforeRound).toFixed(2));

  // Generate unique bill number: SAV-YYYYMMDD-Random
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const billNumber = `SAV-${dateString}-${randomNum}`;

  try {
    // Start transaction queries dynamically
    await db.run('BEGIN TRANSACTION');

    const billResult = await db.run(
      `INSERT INTO bills (tenant_id, bill_number, cashier_name, subtotal, discount, tax, round_off, grand_total, payment_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid')`,
      [tenantId, billNumber, cashierName, subtotal, disc, tax, roundOff, grandTotal, paymentType]
    );

    const billId = billResult.lastID;

    // Loop and insert items sequentially to preserve transaction boundaries
    for (const item of items) {
      await db.run(
        `INSERT INTO bill_items (bill_id, product_code, product_name, quantity, rate, amount) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [billId, item.code, item.name, item.quantity, item.price, item.quantity * item.price]
      );
    }

    await db.run('COMMIT');

    res.status(201).json({
      id: billId,
      billNumber,
      date: new Date(),
      cashier_name: cashierName,
      subtotal,
      discount: disc,
      tax,
      round_off: roundOff,
      grand_total: grandTotal,
      payment_type: paymentType,
      status: 'Paid',
      items
    });
  } catch (err) {
    console.error('Create bill transaction failed:', err);
    try {
      await db.run('ROLLBACK');
    } catch (rollbackErr) {
      // Ignore fallback rollback issues if database was not locked
    }
    res.status(500).json({ error: 'Failed to complete billing transaction.' });
  }
};

// Fetch sales list
exports.getBills = async (req, res) => {
  const { filter } = req.query; // today, week, month, all
  const tenantId = req.user ? req.user.tenantId : 1;
  const isMySQL = db.type === 'mysql';

  let query = 'SELECT * FROM bills WHERE tenant_id = ?';
  const params = [tenantId];

  if (filter === 'today') {
    query += isMySQL
      ? ' AND DATE(date) = CURDATE()'
      : " AND date(date) = date('now', 'localtime')";
  } else if (filter === 'week') {
    query += isMySQL
      ? ' AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      : " AND date >= date('now', '-7 days')";
  } else if (filter === 'month') {
    query += isMySQL
      ? ' AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      : " AND date >= date('now', '-30 days')";
  }

  query += ' ORDER BY date DESC';

  try {
    const bills = await db.query(query, params);
    res.json(bills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ error: 'Error fetching bills.' });
  }
};

// Fetch specific bill detail
exports.getBillDetails = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    const bill = await db.get('SELECT * FROM bills WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    const items = await db.query('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
    res.json({ ...bill, items });
  } catch (err) {
    console.error('Error fetching bill details:', err);
    res.status(500).json({ error: 'Error fetching bill details.' });
  }
};

// Fetch Dashboard & Report stats
exports.getStats = async (req, res) => {
  const tenantId = req.user ? req.user.tenantId : 1;
  const isMySQL = db.type === 'mysql';

  const stats = {
    todaySales: 0,
    todayBills: 0,
    cashCollection: 0,
    onlineCollection: 0,
    productsCount: 0,
    customersCount: 0,
    databaseSize: '0 KB',
    storageUsed: '0 KB',
    availableStorage: '2.00 GB',
    capacity: '2.00 GB'
  };

  try {
    const prodCountRow = await db.get('SELECT COUNT(*) as cnt FROM products WHERE tenant_id = ?', [tenantId]);
    if (prodCountRow) {
      stats.productsCount = prodCountRow.cnt;
    }

    // Dynamic date filter query selection
    const todayQuery = isMySQL
      ? 'SELECT COALESCE(SUM(grand_total), 0) as sales, COUNT(*) as bills, COALESCE(SUM(CASE WHEN payment_type = "Cash" THEN grand_total ELSE 0 END), 0) as cash, COALESCE(SUM(CASE WHEN payment_type = "Online" THEN grand_total ELSE 0 END), 0) as online FROM bills WHERE tenant_id = ? AND DATE(date) = CURDATE()'
      : 'SELECT COALESCE(SUM(grand_total), 0) as sales, COUNT(*) as bills, COALESCE(SUM(CASE WHEN payment_type = "Cash" THEN grand_total ELSE 0 END), 0) as cash, COALESCE(SUM(CASE WHEN payment_type = "Online" THEN grand_total ELSE 0 END), 0) as online FROM bills WHERE tenant_id = ? AND date(date) = date(\'now\', \'localtime\')';

    const billRow = await db.get(todayQuery, [tenantId]);
    if (billRow) {
      stats.todaySales = billRow.sales;
      stats.todayBills = billRow.bills;
      stats.cashCollection = billRow.cash;
      stats.onlineCollection = billRow.online;
    }

    const custRow = await db.get('SELECT COUNT(DISTINCT bill_number) as custs FROM bills WHERE tenant_id = ?', [tenantId]);
    if (custRow) {
      stats.customersCount = custRow.custs;
    }

    // Database size checking on disk (applies in SQLite fallbacks)
    const dbFilePath = 'C:\\SAVORA\\Database\\savora_pos.db';
    try {
      if (fs.existsSync(dbFilePath)) {
        const fileStats = fs.statSync(dbFilePath);
        const kbSize = (fileStats.size / 1024).toFixed(2);
        stats.databaseSize = `${kbSize} KB`;
        stats.storageUsed = `${kbSize} KB`;
      }
    } catch (e) {
      // Ignore reading disk errors on cloud MySQL clusters
    }

    res.json(stats);
  } catch (err) {
    console.error('Stats generation failed:', err);
    res.status(500).json({ error: 'Failed to calculate stats aggregation.' });
  }
};

// Clear Database utility (Admin only)
exports.clearData = async (req, res) => {
  const { target, password } = req.body;
  const adminId = req.user.id;
  const tenantId = req.user.tenantId || 1;

  if (!password || !target) {
    return res.status(400).json({ error: 'Target and administrative password are required.' });
  }

  try {
    const adminUser = await db.get('SELECT password FROM users WHERE id = ?', [adminId]);
    if (!adminUser) {
      return res.status(404).json({ error: 'Administrator user not found.' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect administrator password.' });
    }

    await db.run('BEGIN TRANSACTION');

    if (target === 'bills') {
      await db.run('DELETE FROM bill_items WHERE bill_id IN (SELECT id FROM bills WHERE tenant_id = ?)', [tenantId]);
      await db.run('DELETE FROM bills WHERE tenant_id = ?', [tenantId]);
    } else if (target === 'products') {
      await db.run('DELETE FROM products WHERE tenant_id = ?', [tenantId]);
    } else if (target === 'categories') {
      await db.run('DELETE FROM products WHERE tenant_id = ?', [tenantId]);
      await db.run('DELETE FROM categories WHERE tenant_id = ?', [tenantId]);
    } else if (target === 'cashiers') {
      await db.run('DELETE FROM users WHERE role = "Cashier" AND tenant_id = ?', [tenantId]);
    } else if (target === 'all') {
      await db.run('DELETE FROM bill_items WHERE bill_id IN (SELECT id FROM bills WHERE tenant_id = ?)', [tenantId]);
      await db.run('DELETE FROM bills WHERE tenant_id = ?', [tenantId]);
      await db.run('DELETE FROM products WHERE tenant_id = ?', [tenantId]);
      await db.run('DELETE FROM categories WHERE tenant_id = ?', [tenantId]);
      await db.run('DELETE FROM users WHERE role = "Cashier" AND tenant_id = ?', [tenantId]);
    } else {
      await db.run('ROLLBACK');
      return res.status(400).json({ error: 'Invalid clear target.' });
    }

    await db.run('COMMIT');
    res.json({ success: true, message: `Successfully cleared target data: ${target}` });
  } catch (err) {
    console.error('Failed to clear database target:', err);
    try {
      await db.run('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: 'Failed to delete records.' });
  }
};
