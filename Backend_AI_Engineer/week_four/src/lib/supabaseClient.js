const { createClient } = require('@supabase/supabase-js');

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required. Copy .env.example to .env and set a real value.`);
  }

  return value;
}

function createSupabaseClient() {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseKey) {
    throw new Error('SUPABASE_KEY or SUPABASE_PUBLISHABLE_KEY is required. Copy .env.example to .env and set a real value.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

module.exports = {
  createSupabaseClient
};
