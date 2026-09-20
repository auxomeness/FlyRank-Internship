const express = require('express');
const fs = require('fs');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createReportRouter(reportRepository, reportQueue) {
  const router = express.Router();

  router.get('/tasks/summary', (req, res) => {
    res.json(reportRepository.getSummary());
  });

  router.post('/reports/task-summary', (req, res) => {
    const job = reportQueue.enqueueTaskReport();
    res.status(202).json({
      job_id: job.id,
      status: job.status,
      progress: job.progress,
      status_url: `/jobs/${job.id}`
    });
  });

  router.get('/jobs', (req, res) => {
    res.json(reportRepository.listJobs());
  });

  router.get('/jobs/:id', (req, res) => {
    const job = reportRepository.getJob(req.params.id);

    if (!job) {
      return res.status(404).json({ error: `Job ${req.params.id} not found` });
    }

    return res.json(job);
  });

  router.get('/reports', (req, res) => {
    res.json(reportRepository.listReports());
  });

  router.get('/reports/:fileName', asyncHandler(async (req, res) => {
    const report = reportRepository.getReportByFileName(req.params.fileName);

    if (!report || !fs.existsSync(report.absolute_path)) {
      return res.status(404).json({ error: `Report ${req.params.fileName} not found` });
    }

    return res.download(report.absolute_path, report.file_name);
  }));

  return router;
}

module.exports = {
  createReportRouter
};
