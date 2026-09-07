require('dotenv').config();

const { createApp } = require('./app');
const { createSupabaseClient } = require('./lib/supabaseClient');

const PORT = process.env.PORT || 3000;

const supabase = createSupabaseClient();

const app = createApp(supabase);

app.listen(PORT, () => {
  console.log(`Auth API is running on http://localhost:${PORT}`);
  console.log('Supabase client initialized');
});
