const express = require('express');
const { createAuthRouter } = require('./routes/authRoutes');

function createApp(supabase) {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      name: 'Auth API',
      version: '1.0',
      endpoints: ['/auth/signup', '/auth/login', '/auth/logout', '/public/info', '/protected/profile']
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok'
    });
  });

  app.use(createAuthRouter(supabase));

  app.use((err, req, res, next) => {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: err.message
      });
    }

    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    });
  });

  return app;
}

module.exports = {
  createApp
};
