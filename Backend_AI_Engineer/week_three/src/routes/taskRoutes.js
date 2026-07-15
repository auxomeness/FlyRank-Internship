const express = require('express');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createTaskRouter(taskService) {
  const router = express.Router();

  router.get(
    '/tasks',
    asyncHandler(async (req, res) => {
      const tasks = await taskService.listTasks();
      res.json(tasks);
    })
  );

  router.get(
    '/tasks/:id',
    asyncHandler(async (req, res) => {
      const task = await taskService.getTask(req.params.id);
      res.json(task);
    })
  );

  router.post(
    '/tasks',
    asyncHandler(async (req, res) => {
      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    })
  );

  router.put(
    '/tasks/:id',
    asyncHandler(async (req, res) => {
      const task = await taskService.updateTask(req.params.id, req.body);
      res.json(task);
    })
  );

  router.delete(
    '/tasks/:id',
    asyncHandler(async (req, res) => {
      await taskService.deleteTask(req.params.id);
      res.status(204).send();
    })
  );

  return router;
}

module.exports = {
  createTaskRouter
};
