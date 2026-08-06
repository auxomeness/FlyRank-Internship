const path = require('path');
const Database = require('better-sqlite3');

const databasePath = path.join(__dirname, '..', 'tasks.db');
const db = new Database(databasePath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    done INTEGER NOT NULL DEFAULT 0
  )
`);

const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (count === 0) {
  const insertSeedTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');

  const insertSeedTasks = db.transaction(() => {
    insertSeedTask.run('Learn Express basics', 1);
    insertSeedTask.run('Build a CRUD API', 0);
    insertSeedTask.run('Connect CRUD to SQLite', 0);
  });

  insertSeedTasks();
}

module.exports = {
  db,
  databasePath
};
