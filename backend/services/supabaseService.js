require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

let client = null;
let clientConfig = null;

const normalizeSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || '';
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return {
    url,
    publishableKey,
    secretKey,
    configured: Boolean(url && (publishableKey || secretKey))
  };
};

const getSupabaseClient = () => {
  const config = normalizeSupabaseConfig();
  if (!config.configured) {
    return null;
  }

  if (!client || clientConfig?.url !== config.url || clientConfig?.publishableKey !== config.publishableKey || clientConfig?.secretKey !== config.secretKey) {
    clientConfig = config;
    client = createClient(config.url, config.secretKey || config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return client;
};

const testSupabaseConnection = async () => {
  const config = normalizeSupabaseConfig();
  if (!config.configured) {
    return {
      configured: false,
      connected: false,
      error: 'Supabase URL and key are not configured.'
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      const tableMissing = /could not find the table|relation .* does not exist|does not exist in the schema cache/i.test(error.message);
      return {
        configured: true,
        connected: tableMissing,
        error: error.message,
        note: tableMissing ? 'Supabase is reachable, but the products table is not present in this project yet.' : undefined
      };
    }

    return { configured: true, connected: true, data: data || [] };
  } catch (error) {
    return { configured: true, connected: false, error: error.message };
  }
};

module.exports = {
  getSupabaseClient,
  normalizeSupabaseConfig,
  testSupabaseConnection
};
