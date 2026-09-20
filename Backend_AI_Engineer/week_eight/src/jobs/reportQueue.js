const crypto = require('crypto');
const path = require('path');
const { writeTaskReportPdf } = require('../pdf/simplePdf');

function createReportQueue(reportRepository) {
  const reportsDir = path.join(__dirname, '..', '..', 'reports');

  function enqueueTaskReport() {
    const id = `job_${crypto.randomUUID()}`;

    reportRepository.createJob({
      id,
      report_type: 'task-summary'
    });

    setImmediate(() => runTaskReportJob(id));

    return reportRepository.getJob(id);
  }

  function runTaskReportJob(id) {
    try {
      reportRepository.updateJob(id, {
        status: 'running',
        progress: 20,
        started_at: new Date().toISOString()
      });

      const report = reportRepository.getSummary();

      reportRepository.updateJob(id, { progress: 60 });

      const fileName = `task-summary-${id}.pdf`;
      const filePath = path.join(reportsDir, fileName);
      const byteSize = writeTaskReportPdf(report, filePath);

      reportRepository.saveReport({
        job_id: id,
        report_type: 'task-summary',
        file_name: fileName,
        file_path: filePath,
        byte_size: byteSize
      });

      reportRepository.updateJob(id, {
        status: 'succeeded',
        progress: 100,
        report_path: filePath,
        download_url: `/reports/${fileName}`,
        finished_at: new Date().toISOString()
      });
    } catch (error) {
      reportRepository.updateJob(id, {
        status: 'failed',
        progress: 100,
        error: error.message,
        finished_at: new Date().toISOString()
      });
    }
  }

  return {
    enqueueTaskReport
  };
}

module.exports = {
  createReportQueue
};
