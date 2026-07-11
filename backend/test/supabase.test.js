const test = require('node:test');
const assert = require('node:assert/strict');

const { testSupabaseConnection } = require('../services/supabaseService');

test('reports disconnected state when Supabase credentials are not configured', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_PUBLISHABLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const result = await testSupabaseConnection();

  assert.equal(result.configured, false);
  assert.equal(result.connected, false);
  assert.ok(result.error);
});
