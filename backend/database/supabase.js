const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

const createFallbackClient = () => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    update: () => chain,
    insert: () => chain,
    delete: () => chain,
    limit: () => chain,
    maybeSingle: async () => ({ data: null, error: { message: 'Supabase credentials are not configured.' } })
  };

  return {
    from: () => chain
  };
};

module.exports = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createFallbackClient();
