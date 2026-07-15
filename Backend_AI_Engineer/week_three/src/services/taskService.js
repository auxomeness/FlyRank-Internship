const { AppError } = require('../errors');

function normalizeId(idValue) {
  const id = Number(idValue);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(404, `Task ${idValue} not found`);
  }

  return id;
}

function validateTitle(title, message) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError(400, message);
  }

  return title.trim();
}

function createTaskService(taskRepository) {
  return {
    async listTasks() {
      return taskRepository.list();
    },

    async getTask(idValue) {
      const id = normalizeId(idValue);
      const task = await taskRepository.findById(id);

      if (!task) {
        throw new AppError(404, `Task ${idValue} not found`);
      }

      return task;
    },

    async createTask(body) {
      const title = validateTitle(body.title, 'Title is required and must not be empty');
      return taskRepository.create(title);
    },

    async updateTask(idValue, body) {
      const id = normalizeId(idValue);
      const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
      const hasDone = Object.prototype.hasOwnProperty.call(body, 'done');

      if (!hasTitle && !hasDone) {
        throw new AppError(400, 'Request body must include title and/or done');
      }

      const changes = {};

      if (hasTitle) {
        changes.title = validateTitle(body.title, 'Title must not be empty');
      }

      if (hasDone) {
        if (typeof body.done !== 'boolean') {
          throw new AppError(400, 'Done must be true or false');
        }

        changes.done = body.done;
      }

      const task = await taskRepository.update(id, changes);

      if (!task) {
        throw new AppError(404, `Task ${idValue} not found`);
      }

      return task;
    },

    async deleteTask(idValue) {
      const id = normalizeId(idValue);
      const deleted = await taskRepository.remove(id);

      if (!deleted) {
        throw new AppError(404, `Task ${idValue} not found`);
      }
    }
  };
}

module.exports = {
  createTaskService
};
