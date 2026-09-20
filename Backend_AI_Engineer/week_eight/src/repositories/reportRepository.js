const path = require('path');
const { db } = require('../db');

function listTasks() {
  return db.prepare(`
    SELECT id, title, status, priority, owner, due_date, created_at, completed_at
    FROM tasks
    ORDER BY due_date ASC, id ASC
  `).all();
}

function getSummary() {
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN status = 'open' AND date(due_date) < date('now') THEN 1 ELSE 0 END) AS overdue
    FROM tasks
  `).get();

  const byPriority = db.prepare(`
    SELECT priority, COUNT(*) AS count
    FROM tasks
    GROUP BY priority
    ORDER BY
      CASE priority
        WHEN 'high' THEN 1
        WHEN 'normal' THEN 2
        ELSE 3
      END
  `).all();

  const byOwner = db.prepare(`
    SELECT owner, COUNT(*) AS total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
    FROM tasks
    GROUP BY owner
    ORDER BY owner
  `).all();

  const completionRate = totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100);

  return {
    generated_at: new Date().toISOString(),
    totals: {
      total: totals.total,
      done: totals.done,
      open: totals.open,
      overdue: totals.overdue,
      completion_rate: completionRate
    },
    by_priority: byPriority,
    by_owner: byOwner,
    tasks: listTasks()
  };
}

function createJob(job) {
  db.prepare(`
    INSERT INTO report_jobs (id, status, progress, report_type)
    VALUES (@id, 'queued', 0, @report_type)
  `).run(job);
}

function updateJob(id, changes) {
  const allowed = ['status', 'progress', 'error', 'report_path', 'download_url', 'started_at', 'finished_at'];
  const fields = [];
  const values = [];

  allowed.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(changes, field)) {
      fields.push(`${field} = ?`);
      values.push(changes[field]);
    }
  });

  if (fields.length === 0) {
    return;
  }

  values.push(id);
  db.prepare(`UPDATE report_jobs SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

function getJob(id) {
  return db.prepare(`
    SELECT id, status, progress, report_type, error, report_path, download_url, created_at, started_at, finished_at
    FROM report_jobs
    WHERE id = ?
  `).get(id);
}

function listJobs() {
  return db.prepare(`
    SELECT id, status, progress, report_type, error, download_url, created_at, started_at, finished_at
    FROM report_jobs
    ORDER BY created_at DESC
    LIMIT 20
  `).all();
}

function saveReport(record) {
  db.prepare(`
    INSERT INTO reports (job_id, report_type, file_name, file_path, byte_size)
    VALUES (@job_id, @report_type, @file_name, @file_path, @byte_size)
  `).run(record);
}

function listReports() {
  return db.prepare(`
    SELECT id, job_id, report_type, file_name, byte_size, created_at
    FROM reports
    ORDER BY created_at DESC
  `).all().map((report) => ({
    ...report,
    download_url: `/reports/${report.file_name}`
  }));
}

function getReportByFileName(fileName) {
  const report = db.prepare(`
    SELECT id, job_id, report_type, file_name, file_path, byte_size, created_at
    FROM reports
    WHERE file_name = ?
  `).get(fileName);

  if (!report) {
    return null;
  }

  return {
    ...report,
    absolute_path: path.resolve(report.file_path)
  };
}

module.exports = {
  createJob,
  getJob,
  getReportByFileName,
  getSummary,
  listJobs,
  listReports,
  saveReport,
  updateJob
};
