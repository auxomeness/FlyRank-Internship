const { db } = require('../db');

function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done)
  };
}

function list() {
  return db.prepare('SELECT id, title, done FROM tasks ORDER BY id').all().map(toTask);
}

function findById(id) {
  const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id);
  return row ? toTask(row) : null;
}

function create(title) {
  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(title);
  return findById(result.lastInsertRowid);
}

module.exports = {
  list,
  findById,
  create
};
