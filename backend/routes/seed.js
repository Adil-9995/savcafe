const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const supabase = require('../database/supabase');

router.get('/', async (req, res) => {
  try {
    // Business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (!business) {
      await supabase.from('businesses').insert({
        id: 1,
        name: 'SAVORA Bakery & Ice Bay',
        subdomain: 'savora',
        plan: 'Starter',
        status: 'Active'
      });
    }

    // Branch
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (!branch) {
      await supabase.from('branches').insert({
        id: 1,
        tenant_id: 1,
        name: 'Savora Cafe & Bakers',
        address: 'Savora Cafe & Bakers, Asramam, Kollam, Near Younis Convention Centre, Kerala - 691002',
        phone: '+91 9876543210'
      });
    }

    // Admin
    const { data: admin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'savoracafeandice@gmail.com')
      .maybeSingle();

    if (!admin) {
      const hash = await bcrypt.hash('savcafe@123', 10);

      await supabase.from('users').insert({
        tenant_id: 1,
        name: 'SAVORA Admin',
        email: 'savoracafeandice@gmail.com',
        password: hash,
        role: 'Shop Owner',
        status: 'Active'
      });
    }

    // Cashier
    const { data: cashier } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'cashier@savora.in')
      .maybeSingle();

    if (!cashier) {
      const hash = await bcrypt.hash('Savora@123', 10);

      await supabase.from('users').insert({
        tenant_id: 1,
        name: 'SAVORA Cashier',
        email: 'cashier@savora.in',
        password: hash,
        role: 'Cashier',
        status: 'Active'
      });
    }

    return res.json({
      success: true,
      message: 'Database seeded successfully.'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
