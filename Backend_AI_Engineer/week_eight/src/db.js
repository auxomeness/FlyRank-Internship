const path = require('path');
const Database = require('better-sqlite3');

const databasePath = path.join(__dirname, '..', 'reports.db');
const db = new Database(databasePath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'done')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high')),
    owner TEXT NOT NULL,
    due_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS report_jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0,
    report_type TEXT NOT NULL,
    error TEXT,
    report_path TEXT,
    download_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TEXT,
    finished_at TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    report_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES report_jobs (id)
  );
`);

const taskCount = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;

if (taskCount === 0) {
  const insert = db.prepare(`
    INSERT INTO tasks (title, status, priority, owner, due_date, completed_at)
    VALUES (@title, @status, @priority, @owner, @due_date, @completed_at)
  `);

  const seed = db.transaction((tasks) => {
    tasks.forEach((task) => insert.run(task));
  });

  seed([
    { title: 'Write CRUD API README', status: 'done', priority: 'normal', owner: 'Austin', due_date: '2026-09-07', completed_at: '2026-09-06' },
    { title: 'Connect Task API to SQLite', status: 'done', priority: 'high', owner: 'Austin', due_date: '2026-09-10', completed_at: '2026-09-10' },
    { title: 'Add protected auth route', status: 'done', priority: 'high', owner: 'Austin', due_date: '2026-09-12', completed_at: '2026-09-12' },
    { title: 'Build polite scraper cache', status: 'done', priority: 'normal', owner: 'Austin', due_date: '2026-09-14', completed_at: '2026-09-14' },
    { title: 'Run LLM triage evals', status: 'done', priority: 'high', owner: 'Austin', due_date: '2026-09-16', completed_at: '2026-09-16' },
    { title: 'Document LLM timeout controls', status: 'open', priority: 'normal', owner: 'Austin', due_date: '2026-09-18', completed_at: null },
    { title: 'Record Swagger demo', status: 'open', priority: 'low', owner: 'Austin', due_date: '2026-09-22', completed_at: null },
    { title: 'Prepare PDF report submission', status: 'open', priority: 'high', owner: 'Austin', due_date: '2026-09-20', completed_at: null },
    { title: 'Push Week 8 repo update', status: 'open', priority: 'normal', owner: 'Austin', due_date: '2026-09-21', completed_at: null },
    { title: 'Clean report artifacts', status: 'open', priority: 'low', owner: 'Austin', due_date: '2026-09-25', completed_at: null }
  ]);
}

module.exports = {
  db,
  databasePath
};
