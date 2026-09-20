const express = require('express');
const reportRepository = require('./repositories/reportRepository');
const { createReportQueue } = require('./jobs/reportQueue');
const { createReportRouter } = require('./routes/reportRoutes');
require('./db');

function createApp() {
  const app = express();
  const reportQueue = createReportQueue(reportRepository);

  app.use(express.json({ limit: '20kb' }));

  app.get('/', (req, res) => {
    res.json({
      name: 'Week 8 PDF Report Generator',
      version: '1.0.0',
      endpoints: [
        '/health',
        '/tasks/summary',
        'POST /reports/task-summary',
        '/jobs/:id',
        '/reports/:fileName'
      ]
    });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(createReportRouter(reportRepository, reportQueue));

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  const app = createApp();
  const server = app.listen(port, host, () => {
    console.log(`Week 8 PDF report API listening on http://${host}:${port}`);
  });

  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}

module.exports = {
  createApp
};
