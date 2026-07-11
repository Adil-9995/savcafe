const supabase = require('../database/supabase');
const bcrypt = require('bcryptjs');

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
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .insert({
        tenant_id: tenantId,
        bill_number: billNumber,
        cashier_name: cashierName,
        subtotal,
        discount: disc,
        tax,
        round_off: roundOff,
        grand_total: grandTotal,
        payment_type: paymentType,
        status: 'Paid'
      })
      .select()
      .single();

    if (billError) throw billError;

    const billId = billData.id;

    // Loop and insert items sequentially or as a single insert to preserve transaction boundaries
    const itemsToInsert = items.map((item) => ({
      bill_id: billId,
      product_code: item.code,
      product_name: item.name,
      quantity: item.quantity,
      rate: item.price,
      amount: item.quantity * item.price
    }));

    const { error: itemsError } = await supabase
      .from('bill_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback the created bill since items failed
      await supabase.from('bills').delete().eq('id', billId);
      throw itemsError;
    }

    res.status(201).json({
      id: billId,
      billNumber,
      date: billData.date || new Date(),
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
    res.status(500).json({ error: 'Failed to complete billing transaction.' });
  }
};

// Fetch sales list
exports.getBills = async (req, res) => {
  const { filter } = req.query; // today, week, month, all
  const tenantId = req.user ? req.user.tenantId : 1;

  let builder = supabase
    .from('bills')
    .select('*')
    .eq('tenant_id', tenantId);

  if (filter === 'today') {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    builder = builder.gte('date', todayStart.toISOString());
  } else if (filter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    builder = builder.gte('date', weekAgo.toISOString());
  } else if (filter === 'month') {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    builder = builder.gte('date', monthAgo.toISOString());
  }

  builder = builder.order('date', { ascending: false });

  try {
    const { data: bills, error } = await builder;
    if (error) throw error;
    res.json(bills || []);
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
    const { data: bill, error } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error || !bill) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    const { bill_items, ...billData } = bill;
    res.json({
      ...billData,
      items: bill_items || []
    });
  } catch (err) {
    console.error('Error fetching bill details:', err);
    res.status(500).json({ error: 'Error fetching bill details.' });
  }
};

// Fetch Dashboard & Report stats
exports.getStats = async (req, res) => {
  const tenantId = req.user ? req.user.tenantId : 1;

  try {
    // Fetch tables in parallel
    const [
      { data: products, error: prodErr },
      { data: categories, error: catErr },
      { data: bills, error: billErr },
      { data: billItems, error: itemsErr }
    ] = await Promise.all([
      supabase.from('products').select('id, name, code, status, category_id, price').eq('tenant_id', tenantId),
      supabase.from('categories').select('id, name').eq('tenant_id', tenantId),
      supabase.from('bills').select('id, date, grand_total, payment_type, discount, tax, cashier_name, bill_number, status').eq('tenant_id', tenantId),
      supabase.from('bill_items').select('id, bill_id, product_code, product_name, quantity, rate, amount')
    ]);

    if (prodErr) throw prodErr;
    if (catErr) throw catErr;
    if (billErr) throw billErr;
    if (itemsErr) throw itemsErr;

    const safeProducts = products || [];
    const safeCategories = categories || [];
    const safeBills = bills || [];
    const safeBillItems = billItems || [];

    // Filter bill items to only include those belonging to the tenant's bills
    const billIdSet = new Set(safeBills.map(b => b.id));
    const tenantBillItems = safeBillItems.filter(item => billIdSet.has(item.bill_id));

    // Time calculations
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(now.getDate() - 30);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfYear = new Date();
    startOfYear.setDate(now.getDate() - 365);
    startOfYear.setHours(0, 0, 0, 0);

    // Today's Bills and Sales Metrics
    const todayBills = safeBills.filter(b => new Date(b.date) >= startOfToday);
    
    let todayRevenue = 0;
    let cashCollection = 0;
    let onlineCollection = 0;
    let upiCollection = 0;
    let cardCollection = 0;
    let mixedCollection = 0;
    let totalDiscount = 0;
    let totalGstCollected = 0;

    todayBills.forEach(b => {
      const gTotal = parseFloat(b.grand_total) || 0;
      todayRevenue += gTotal;
      totalDiscount += parseFloat(b.discount) || 0;
      totalGstCollected += parseFloat(b.tax) || 0;

      const pType = (b.payment_type || '').toLowerCase();
      if (pType === 'cash') {
        cashCollection += gTotal;
      } else if (pType === 'online') {
        onlineCollection += gTotal;
      } else if (pType === 'upi') {
        upiCollection += gTotal;
      } else if (pType === 'card') {
        cardCollection += gTotal;
      } else if (pType === 'mixed') {
        mixedCollection += gTotal;
      }
    });

    const todayBillsCount = todayBills.length;
    const averageBillValue = todayBillsCount > 0 ? todayRevenue / todayBillsCount : 0;

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    const yesterdayBills = safeBills.filter(b => {
      const d = new Date(b.date);
      return d >= startOfYesterday && d <= endOfYesterday;
    });

    let yesterdayRevenue = 0;
    let yesterdayCashCollection = 0;
    let yesterdayOnlineCollection = 0;
    let yesterdayBillsCount = yesterdayBills.length;
    yesterdayBills.forEach(b => {
      const gTotal = parseFloat(b.grand_total) || 0;
      yesterdayRevenue += gTotal;
      const type = (b.payment_type || '').toLowerCase();
      if (type === 'cash') yesterdayCashCollection += gTotal;
      else if (type === 'online' || type === 'upi' || type === 'card' || type === 'mixed') yesterdayOnlineCollection += gTotal;
    });

    const calculateTrend = (todayVal, yesterdayVal) => {
      if (yesterdayVal === 0) {
        return todayVal > 0 ? '+100%' : '0%';
      }
      const diff = ((todayVal - yesterdayVal) / yesterdayVal) * 100;
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const salesTrend = calculateTrend(todayRevenue, yesterdayRevenue);
    const billsTrend = calculateTrend(todayBillsCount, yesterdayBillsCount);
    const cashTrend = calculateTrend(cashCollection, yesterdayCashCollection);
    const onlineTrend = calculateTrend(onlineCollection + upiCollection + cardCollection + mixedCollection, yesterdayOnlineCollection);
    const customersTrend = calculateTrend(todayBillsCount, yesterdayBillsCount);

    // Products metrics
    const totalProducts = safeProducts.length;
    const availableProducts = safeProducts.filter(p => p.status === 'Available').length;
    const outOfStockProducts = safeProducts.filter(p => p.status === 'Out of Stock').length;
    const disabledProducts = safeProducts.filter(p => p.status === 'Disabled').length;

    // Categories metrics
    const totalCategories = safeCategories.length;

    // Customers (Unique footfall - count of unique bills)
    const customersCount = safeBills.length;

    // Sales Overview Chart Data
    // Today Chart (grouped by Hour of today - 24 points)
    const todayChart = Array.from({ length: 24 }, (_, i) => ({ label: `${i.toString().padStart(2, '0')}:00`, value: 0 }));
    todayBills.forEach(b => {
      const hr = new Date(b.date).getHours();
      if (hr >= 0 && hr < 24) {
        todayChart[hr].value += parseFloat(b.grand_total) || 0;
      }
    });

    // Week Chart (last 7 days grouped by Day Name)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekBills = safeBills.filter(b => new Date(b.date) >= startOfWeek);
    const weekChartMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      weekChartMap[dayName] = { label: dayName, sublabel: dateStr, value: 0, order: 6 - i };
    }
    weekBills.forEach(b => {
      const dayName = daysOfWeek[new Date(b.date).getDay()];
      if (weekChartMap[dayName]) {
        weekChartMap[dayName].value += parseFloat(b.grand_total) || 0;
      }
    });
    const weekChart = Object.values(weekChartMap).sort((a, b) => a.order - b.order);

    // Month Chart (last 30 days grouped by Day of Month)
    const monthChartMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const key = d.toISOString().slice(0, 10);
      monthChartMap[key] = { label: dateStr, value: 0, order: 29 - i };
    }
    const monthBills = safeBills.filter(b => new Date(b.date) >= startOfMonth);
    monthBills.forEach(b => {
      const key = new Date(b.date).toISOString().slice(0, 10);
      if (monthChartMap[key]) {
        monthChartMap[key].value += parseFloat(b.grand_total) || 0;
      }
    });
    const monthChart = Object.values(monthChartMap).sort((a, b) => a.order - b.order);

    // Year Chart (last 12 months grouped by Month Name)
    const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearChartMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const mName = monthsOfYear[d.getMonth()];
      const yearStr = d.getFullYear();
      yearChartMap[`${yearStr}-${mName}`] = { label: mName, year: yearStr, value: 0, order: 11 - i };
    }
    const yearBills = safeBills.filter(b => new Date(b.date) >= startOfYear);
    yearBills.forEach(b => {
      const d = new Date(b.date);
      const mName = monthsOfYear[d.getMonth()];
      const yearStr = d.getFullYear();
      const key = `${yearStr}-${mName}`;
      if (yearChartMap[key]) {
        yearChartMap[key].value += parseFloat(b.grand_total) || 0;
      }
    });
    const yearChart = Object.values(yearChartMap).sort((a, b) => a.order - b.order);

    // Top Products (calculated from bill_items)
    const productSalesMap = {};
    tenantBillItems.forEach(item => {
      const name = item.product_name || 'Unknown Item';
      const qty = parseInt(item.quantity) || 0;
      const amt = parseFloat(item.amount) || 0;
      if (!productSalesMap[name]) {
        productSalesMap[name] = { name, quantitySold: 0, revenue: 0 };
      }
      productSalesMap[name].quantitySold += qty;
      productSalesMap[name].revenue += amt;
    });
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Payment Distribution
    let totalAllBillsRevenue = 0;
    const paymentSums = { cash: 0, upi: 0, card: 0, online: 0, mixed: 0 };
    safeBills.forEach(b => {
      const gTotal = parseFloat(b.grand_total) || 0;
      totalAllBillsRevenue += gTotal;
      const type = (b.payment_type || '').toLowerCase();
      if (paymentSums[type] !== undefined) {
        paymentSums[type] += gTotal;
      } else {
        paymentSums.cash += gTotal; // Fallback
      }
    });

    const paymentDistribution = {
      cash: totalAllBillsRevenue > 0 ? (paymentSums.cash / totalAllBillsRevenue) * 100 : 0,
      upi: totalAllBillsRevenue > 0 ? (paymentSums.upi / totalAllBillsRevenue) * 100 : 0,
      card: totalAllBillsRevenue > 0 ? (paymentSums.card / totalAllBillsRevenue) * 100 : 0,
      online: totalAllBillsRevenue > 0 ? (paymentSums.online / totalAllBillsRevenue) * 100 : 0,
      mixed: totalAllBillsRevenue > 0 ? (paymentSums.mixed / totalAllBillsRevenue) * 100 : 0
    };

    // Recent Sales Table
    const recentBillsRaw = [...safeBills]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
      
    const recentSales = recentBillsRaw.map(b => {
      const items = tenantBillItems
        .filter(item => item.bill_id === b.id)
        .map(item => `${item.product_name} x${item.quantity}`)
        .join(', ');

      return {
        id: b.id,
        billNo: b.bill_number,
        time: b.date,
        customer: 'Walk-in Customer',
        items: items || 'No items',
        paymentMode: b.payment_type,
        total: parseFloat(b.grand_total) || 0,
        status: b.status || 'Paid'
      };
    });

    // Low Stock Widget (Current stock = 50 - total quantity sold)
    const productSoldQtyMap = {};
    tenantBillItems.forEach(item => {
      const code = item.product_code;
      const qty = parseInt(item.quantity) || 0;
      productSoldQtyMap[code] = (productSoldQtyMap[code] || 0) + qty;
    });

    const lowStock = safeProducts
      .map(p => {
        const sold = productSoldQtyMap[p.code] || 0;
        const currentStock = Math.max(0, 50 - sold);
        const minStock = 15;
        return {
          name: p.name,
          currentStock,
          minimumStock: minStock
        };
      })
      .filter(p => p.currentStock < p.minimumStock)
      .sort((a, b) => a.currentStock - b.currentStock);

    // Best Category
    const categorySalesMap = {};
    const catIdToName = {};
    safeCategories.forEach(c => { catIdToName[c.id] = c.name; });

    const productCodeToCatId = {};
    safeProducts.forEach(p => { productCodeToCatId[p.code] = p.category_id; });

    tenantBillItems.forEach(item => {
      const catId = productCodeToCatId[item.product_code];
      const catName = catIdToName[catId] || 'Uncategorized';
      const qty = parseInt(item.quantity) || 0;
      const amt = parseFloat(item.amount) || 0;

      if (!categorySalesMap[catName]) {
        categorySalesMap[catName] = { name: catName, revenue: 0, unitsSold: 0 };
      }
      categorySalesMap[catName].revenue += amt;
      categorySalesMap[catName].unitsSold += qty;
    });

    const categoriesSorted = Object.values(categorySalesMap).sort((a, b) => b.revenue - a.revenue);
    const bestCategory = categoriesSorted[0] || { name: 'None', revenue: 0, unitsSold: 0 };

    // Fast Selling Product
    const todayProductSales = {};
    const todayBillIds = new Set(todayBills.map(b => b.id));
    tenantBillItems.forEach(item => {
      if (todayBillIds.has(item.bill_id)) {
        const name = item.product_name;
        const qty = parseInt(item.quantity) || 0;
        todayProductSales[name] = (todayProductSales[name] || 0) + qty;
      }
    });
    const fastSellingSorted = Object.entries(todayProductSales).sort((a, b) => b[1] - a[1]);
    const fastSellingProduct = fastSellingSorted[0] ? { name: fastSellingSorted[0][0], quantity: fastSellingSorted[0][1] } : { name: 'None', quantity: 0 };

    // Slow Moving Products (Products with no sales in last 30 days)
    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(now.getDate() - 30);
    
    const billsLast30Days = safeBills.filter(b => new Date(b.date) >= startOf30DaysAgo);
    const billIdsLast30Days = new Set(billsLast30Days.map(b => b.id));
    const soldProductCodes30Days = new Set();
    tenantBillItems.forEach(item => {
      if (billIdsLast30Days.has(item.bill_id)) {
        soldProductCodes30Days.add(item.product_code);
      }
    });
    const slowMovingProducts = safeProducts
      .filter(p => !soldProductCodes30Days.has(p.code))
      .map(p => p.name);

    // Hourly Sales Chart (using today's bill timestamps)
    const hourlySales = todayChart;

    // Peak Sales Hour
    let peakHour = 0;
    let peakRevenue = 0;
    todayChart.forEach((pt, hr) => {
      if (pt.value > peakRevenue) {
        peakRevenue = pt.value;
        peakHour = hr;
      }
    });
    const peakSalesHour = todayBills.length > 0 ? `${peakHour.toString().padStart(2, '0')}:00` : 'None';

    res.json({
      todaySales: todayRevenue,
      todayBills: todayBillsCount,
      cashCollection,
      onlineCollection,
      upiCollection,
      cardCollection,
      mixedCollection,
      averageBillValue,
      totalDiscount,
      totalGstCollected,
      
      salesTrend,
      billsTrend,
      cashTrend,
      onlineTrend,
      customersTrend,

      productsCount: totalProducts,
      availableProducts,
      outOfStock: outOfStockProducts,
      disabledProducts,

      categoriesCount: totalCategories,
      customersCount,

      salesOverview: {
        today: todayChart,
        week: weekChart,
        month: monthChart,
        year: yearChart
      },
      topProducts,
      paymentDistribution,
      recentSales,
      lowStock,
      bestCategory,
      fastSellingProduct,
      slowMovingProducts,
      hourlySales,
      peakSalesHour,

      databaseStatus: 'Connected',
      serverTime: new Date()
    });

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
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('password')
      .eq('id', adminId)
      .maybeSingle();

    if (adminErr || !adminUser) {
      return res.status(404).json({ error: 'Administrator user not found.' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect administrator password.' });
    }

    if (target === 'bills') {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('tenant_id', tenantId);
      if (error) throw error;
    } else if (target === 'products') {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('tenant_id', tenantId);
      if (error) throw error;
    } else if (target === 'categories') {
      // Deleting products first, then categories due to FK references
      await supabase
        .from('products')
        .delete()
        .eq('tenant_id', tenantId);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('tenant_id', tenantId);
      if (error) throw error;
    } else if (target === 'cashiers') {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('role', 'Cashier')
        .eq('tenant_id', tenantId);
      if (error) throw error;
    } else if (target === 'all') {
      await supabase
        .from('bills')
        .delete()
        .eq('tenant_id', tenantId);
      await supabase
        .from('products')
        .delete()
        .eq('tenant_id', tenantId);
      await supabase
        .from('categories')
        .delete()
        .eq('tenant_id', tenantId);
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('role', 'Cashier')
        .eq('tenant_id', tenantId);
      if (error) throw error;
    } else {
      return res.status(400).json({ error: 'Invalid clear target.' });
    }

    res.json({ success: true, message: `Successfully cleared target data: ${target}` });
  } catch (err) {
    console.error('Failed to clear database target:', err);
    res.status(500).json({ error: 'Failed to delete records.' });
  }
};
