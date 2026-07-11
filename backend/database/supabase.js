const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-savora.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || 'placeholder-secret-key';

module.exports = createClient(supabaseUrl, supabaseKey);
