const pool = require('../db');

function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    done: row.done
  };
}

async function list() {
  const result = await pool.query('SELECT id, title, done FROM tasks ORDER BY id');
  return result.rows.map(toTask);
}

async function findById(id) {
  const result = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id]);
  return result.rows[0] ? toTask(result.rows[0]) : null;
}

async function create(title) {
  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING id, title, done',
    [title]
  );

  return toTask(result.rows[0]);
}

async function update(id, changes) {
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(changes, 'title')) {
    values.push(changes.title);
    fields.push(`title = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'done')) {
    values.push(changes.done);
    fields.push(`done = $${values.length}`);
  }

  values.push(id);
  const idPlaceholder = `$${values.length}`;

  const result = await pool.query(
    `UPDATE tasks
     SET ${fields.join(', ')}, updated_at = now()
     WHERE id = ${idPlaceholder}
     RETURNING id, title, done`,
    values
  );

  return result.rows[0] ? toTask(result.rows[0]) : null;
}

async function remove(id) {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove
};
