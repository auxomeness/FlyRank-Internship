const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('../openapi.json');
const { createTaskRouter } = require('./routes/taskRoutes');
const { createTaskService } = require('./services/taskService');
const taskRepository = require('./repositories/postgresTaskRepository');

function createApp() {
  const app = express();
  const taskService = createTaskService(taskRepository);

  app.use(express.json());
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get('/', (req, res) => {
    res.json({
      name: 'Task API',
      version: '1.0',
      endpoints: ['/tasks']
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok'
    });
  });

  app.use(createTaskRouter(taskService));

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
