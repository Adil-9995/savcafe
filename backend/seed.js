const bcrypt = require('bcryptjs');
const supabase = require('./database/supabase');

(async () => {
  const adminPassword = await bcrypt.hash('savcafe@123', 10);
  const cashierPassword = await bcrypt.hash('Savora@123', 10);

  const { error } = await supabase.from('users').insert([
    {
      tenant_id: 1,
      name: 'SAVORA Admin',
      email: 'savoracafeandice@gmail.com',
      password: adminPassword,
      role: 'Shop Owner',
      status: 'Active'
    },
    {
      tenant_id: 1,
      name: 'SAVORA Cashier',
      email: 'cashier@savora.in',
      password: cashierPassword,
      role: 'Cashier',
      status: 'Active'
    }
  ]);

  if (error) {
    console.error(error);
  } else {
    console.log('Users created successfully.');
  }

  process.exit();
})();
