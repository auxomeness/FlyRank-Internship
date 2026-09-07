require('dotenv').config();

const { createApp } = require('./app');
const { createSupabaseClient } = require('./lib/supabaseClient');

const PORT = process.env.PORT || 3000;

createSupabaseClient();

const app = createApp();

app.listen(PORT, () => {
  console.log(`Auth API is running on http://localhost:${PORT}`);
  console.log('Supabase client initialized');
});
