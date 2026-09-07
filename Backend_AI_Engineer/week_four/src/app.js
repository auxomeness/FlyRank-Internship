const express = require('express');

function createApp() {
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

  return app;
}

module.exports = {
  createApp
};
