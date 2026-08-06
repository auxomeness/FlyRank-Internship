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

function update(id, changes) {
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(changes, 'title')) {
    fields.push('title = ?');
    values.push(changes.title);
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'done')) {
    fields.push('done = ?');
    values.push(changes.done ? 1 : 0);
  }

  values.push(id);

  const result = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return result.changes > 0 ? findById(id) : null;
}

function remove(id) {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove
};
