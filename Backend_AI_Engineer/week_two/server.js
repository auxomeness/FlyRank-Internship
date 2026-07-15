const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

const tasks = [
  { id: 1, title: 'Learn Express basics', done: true },
  { id: 2, title: 'Build a CRUD API', done: false },
  { id: 3, title: 'Test endpoints with curl', done: false }
];
let nextTaskId = 4;

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

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${req.params.id} not found`
    });
  }

  res.json(task);
});

app.post('/tasks', (req, res) => {
  const title = req.body.title;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required and must not be empty'
    });
  }

  const task = {
    id: nextTaskId,
    title: title.trim(),
    done: false
  };

  nextTaskId += 1;
  tasks.push(task);

  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${req.params.id} not found`
    });
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(req.body, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(req.body, 'done');

  if (!hasTitle && !hasDone) {
    return res.status(400).json({
      error: 'Request body must include title and/or done'
    });
  }

  if (hasTitle && (typeof req.body.title !== 'string' || req.body.title.trim() === '')) {
    return res.status(400).json({
      error: 'Title must not be empty'
    });
  }

  if (hasDone && typeof req.body.done !== 'boolean') {
    return res.status(400).json({
      error: 'Done must be true or false'
    });
  }

  if (hasTitle) {
    task.title = req.body.title.trim();
  }

  if (hasDone) {
    task.done = req.body.done;
  }

  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: `Task ${req.params.id} not found`
    });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Task API is running on http://localhost:${PORT}`);
});
