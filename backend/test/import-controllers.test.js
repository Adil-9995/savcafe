const test = require('node:test');
const assert = require('node:assert/strict');

test('all converted controllers can be imported without syntax errors', () => {
  // Mock environment variables to avoid crash on createClient
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'mock-secret-key';

  const authController = require('../controllers/authController');
  const cashierController = require('../controllers/cashierController');
  const categoryController = require('../controllers/categoryController');
  const productController = require('../controllers/productController');
  const billController = require('../controllers/billController');
  const backupController = require('../controllers/backupController');

  assert.ok(authController.login);
  assert.ok(cashierController.getCashiers);
  assert.ok(categoryController.getCategories);
  assert.ok(productController.getProducts);
  assert.ok(billController.createBill);
  assert.ok(backupController.createBackup);
  
  console.log('✅ Converted controllers successfully imported and validated!');
});
