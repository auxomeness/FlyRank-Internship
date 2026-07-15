# Week 3 - Task API with Postgres

This is the Week 2 CRUD Task API connected to Postgres instead of an in-memory array. The app and database run together with Docker Compose.

## Run

From this folder:

```bash
docker compose up --build
```

The API runs at `http://localhost:3000`.

Swagger UI runs at `http://localhost:3000/docs`.

## Environment

`.env` is gitignored. Copy the committed example if you need to recreate it:

```bash
cp .env.example .env
```

The compose stack uses:

```text
DATABASE_URL=postgres://tasks_user:tasks_password@db:5432/tasks_db
```

## Endpoints

| Method | Path | What it does | Success |
| --- | --- | --- | --- |
| GET | `/` | Shows API name, version, and endpoints | `200` |
| GET | `/health` | Shows server health | `200` |
| GET | `/tasks` | Lists all tasks from Postgres | `200` |
| GET | `/tasks/:id` | Gets one task by ID | `200` |
| POST | `/tasks` | Creates a task from `{ "title": "..." }` | `201` |
| PUT | `/tasks/:id` | Updates `title` and/or `done` | `200` |
| DELETE | `/tasks/:id` | Deletes one task | `204` |

Invalid bodies return `400`. Unknown task IDs return `404`. Error responses use JSON, for example `{ "error": "Task 9999 not found" }`.

## Architecture Note

Storage is behind a repository layer:

- `src/routes/taskRoutes.js` handles HTTP requests and responses.
- `src/services/taskService.js` owns validation and task rules.
- `src/repositories/postgresTaskRepository.js` owns all SQL queries.

The Postgres repository replaced the in-memory store. The routes and service use the same repository interface, so the API behavior did not need to change when storage moved to Postgres.

## Database

Postgres runs in Docker with a named volume:

```yaml
volumes:
  task_postgres_data:
```

The table is created by `sql/init.sql` when the database volume is first initialized.

## Persistence Proof

I created a row through the API:

```text
created 201 {"id":4,"title":"Persistent Docker task","done":false}
updated 200 {"id":4,"title":"Persistent Docker task","done":true}
```

Then I restarted both containers:

```bash
docker compose restart
```

After restart, the same row was still present:

```text
persisted 200 {"id":4,"title":"Persistent Docker task","done":true}
```

That proves the data is stored in Postgres on the Docker volume, not in app memory.
