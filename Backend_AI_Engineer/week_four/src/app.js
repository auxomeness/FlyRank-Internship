const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('../openapi.json');
const { createAuthRouter } = require('./routes/authRoutes');
const { createProtectedRouter } = require('./routes/protectedRoutes');
const { createPublicRouter } = require('./routes/publicRoutes');
const { requireAuth } = require('./middleware/requireAuth');

function createApp(supabase) {
  const app = express();
  const authMiddleware = requireAuth(supabase);

  app.use(express.json());
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

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

  app.use(createAuthRouter(supabase, authMiddleware));
  app.use(createPublicRouter());
  app.use(createProtectedRouter(authMiddleware));

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
