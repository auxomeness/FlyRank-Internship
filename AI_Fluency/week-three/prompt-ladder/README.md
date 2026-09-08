# Prompt Ladder

Track context: backend-focused full-stack development.

Goal of this ladder: turn a weak backend-code prompt into a reusable prompt that can help a junior developer build a small API without losing the requirements.

## Run 0: Weak Baseline

### Prompt

```text
Write backend code for a todo app.
```

### Output Excerpt

```text
Here is a simple Express server:

const express = require("express");
const app = express();
app.use(express.json());

let todos = [];

app.get("/todos", (req, res) => res.json(todos));
app.post("/todos", (req, res) => {
  const todo = req.body;
  todos.push(todo);
  res.json(todo);
});

app.listen(3000);
```

### Notes

- What changed in the prompt: Nothing. This is the baseline.
- What improved in the output: It produced runnable-looking Express code.
- What still failed: It guessed route names, skipped IDs, validation, status codes, 404 handling, update/delete, Swagger, and run instructions.
- What I would try next: Add a clearer goal so the output knows the exact API shape.

## Run 1: Add A Clearer Goal

Layer added: clearer goal.

### Prompt

```text
Build a small JavaScript/Express CRUD API for a to-do list. It should let a user create, read, update, and delete tasks.
```

### Output Excerpt

```text
The API includes:
- GET /tasks
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

Tasks are stored in an array. New tasks get an id and done defaults to false.
```

### Notes

- What changed in the prompt: I named JavaScript, Express, CRUD, and tasks.
- What improved in the output: The model stopped using `/todos` and moved toward the required `/tasks` API.
- What still failed: It still did not define exact response bodies, status codes, validation rules, or documentation.
- What I would try next: Add the audience so the explanation and code fit a beginner assignment instead of a vague production build.

## Run 2: Add A Defined Audience

Layer added: defined audience.

### Prompt

```text
Build a small JavaScript/Express CRUD API for a to-do list. It should let a user create, read, update, and delete tasks.

Audience: a beginner backend student who needs to understand and test every endpoint with curl.
```

### Output Excerpt

```text
Start by installing Express, then create server.js.

Use curl to test:
curl http://localhost:3000/tasks
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'

Each route is written in one file so it is easier to follow.
```

### Notes

- What changed in the prompt: I named the reader as a beginner backend student.
- What improved in the output: The output became easier to follow and started including curl commands.
- What still failed: The code was still loose about errors and still did not prove correct `201`, `204`, `400`, and `404` behavior.
- What I would try next: Add real assignment context so the model follows the required endpoints exactly.

## Run 3: Add Real Context

Layer added: real context.

### Prompt

```text
Build a small JavaScript/Express CRUD API for a to-do list. It should let a user create, read, update, and delete tasks.

Audience: a beginner backend student who needs to understand and test every endpoint with curl.

Context: this is for a Week 2 backend assignment. The API must run on localhost:3000, use in-memory storage only, start with 3 seed tasks, and expose:
- GET /
- GET /health
- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id
```

### Output Excerpt

```text
GET / returns API metadata.
GET /health returns { status: "ok" }.
The tasks array starts with three objects:
{ id: 1, title: "Learn Express", done: false }
{ id: 2, title: "Test with curl", done: false }
{ id: 3, title: "Write README", done: true }
```

### Notes

- What changed in the prompt: I added the assignment context, port, storage rule, seed data, and exact endpoint list.
- What improved in the output: The output finally matched the assignment structure instead of inventing its own smaller version.
- What still failed: It began producing too much explanation and still missed some exact status-code behavior.
- What I would try next: Specify the output format so the answer is usable as project files, not a long tutorial.

## Run 4: Add A Specified Output Format

Layer added: specified output format.

### Prompt

```text
Build a small JavaScript/Express CRUD API for a to-do list. It should let a user create, read, update, and delete tasks.

Audience: a beginner backend student who needs to understand and test every endpoint with curl.

Context: this is for a Week 2 backend assignment. The API must run on localhost:3000, use in-memory storage only, start with 3 seed tasks, and expose:
- GET /
- GET /health
- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

Output format:
1. package.json
2. server.js
3. openapi.json
4. README.md
5. curl test checklist
```

### Output Excerpt

```text
package.json
- scripts.start = "node server.js"
- dependencies: express, swagger-ui-express

server.js
- imports openapi.json
- serves Swagger UI at /docs

README.md
- install command
- run command
- endpoint table
- curl examples
```

### Notes

- What changed in the prompt: I told the model exactly which files and sections to return.
- What improved in the output: The answer became much easier to turn into a real folder because it was organized by deliverable.
- What still failed: This made the model sound more confident, but some generated code still accepted invalid PUT bodies instead of returning `400`.
- What I would try next: Add hard constraints for status codes and validation.

## Run 5: Add Constraints

Layer added: constraints.

### Prompt

```text
Build a small JavaScript/Express CRUD API for a to-do list. It should let a user create, read, update, and delete tasks.

Audience: a beginner backend student who needs to understand and test every endpoint with curl.

Context: this is for a Week 2 backend assignment. The API must run on localhost:3000, use in-memory storage only, start with 3 seed tasks, and expose:
- GET /
- GET /health
- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

Output format:
1. package.json
2. server.js
3. openapi.json
4. README.md
5. curl test checklist

Constraints:
- Use only in-memory storage; no database and no file storage.
- POST /tasks must return 201 and reject missing or empty title with 400 JSON.
- PUT /tasks/:id must update title and/or done, reject an empty body with 400 JSON, reject empty title with 400 JSON, and reject non-boolean done with 400 JSON.
- GET /tasks/:id, PUT /tasks/:id, and DELETE /tasks/:id must return 404 JSON for unknown IDs.
- DELETE /tasks/:id must return 204 with no body.
- Swagger UI must be available at /docs.
```

### Output Excerpt

```text
if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
  return res.status(400).json({ error: "Title must be a non-empty string" });
}

if (done !== undefined && typeof done !== "boolean") {
  return res.status(400).json({ error: "Done must be a boolean" });
}

if (title === undefined && done === undefined) {
  return res.status(400).json({ error: "Request body must include title or done" });
}
```

### Notes

- What changed in the prompt: I added strict behavioral constraints.
- What improved in the output: The output started handling the exact failure cases that the assignment grades quickly.
- What still failed: The answer was better, but still did not force the model to prove the implementation with a final verification checklist.
- What I would try next: Add verification requirements so the model checks the result against the rubric before stopping.

## Honest Miss

Run 4 looked cleaner because the output was organized by file, but that change did not fix correctness. It made the response easier to read while still allowing a broken PUT route. That was the reminder that format is not the same as quality.

## Final Reusable Prompt

```text
You are helping a beginner backend student build a Week 2 assignment.

Goal:
Build a small JavaScript/Express CRUD API for a to-do list.

Audience:
Write for a beginner backend student who needs code they can run and test with curl.

Context:
The project must be self-contained and run on localhost:3000. Use in-memory storage only. Start with 3 seed tasks. Each task has:
- id: number
- title: string
- done: boolean

Required endpoints:
- GET / returns { "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] }
- GET /health returns { "status": "ok" }
- GET /tasks returns all tasks
- GET /tasks/:id returns one task or 404 JSON
- POST /tasks creates a task from { "title": "..." }
- PUT /tasks/:id updates title and/or done
- DELETE /tasks/:id deletes a task

Behavior constraints:
- Successful reads return 200.
- Successful create returns 201 and the created task.
- Successful delete returns 204 with an empty body.
- Unknown task IDs return 404 with { "error": "Task <id> not found" }.
- POST rejects missing, non-string, or empty title with 400 JSON.
- PUT rejects an empty body with 400 JSON.
- PUT rejects empty/non-string title with 400 JSON.
- PUT rejects non-boolean done with 400 JSON.
- Do not use a database or file storage.
- Serve Swagger UI at /docs using swagger-ui-express and a hand-written openapi.json.

Output format:
1. package.json
2. server.js
3. openapi.json
4. README.md
5. curl verification checklist

Before finalizing:
- Check that every required endpoint is included.
- Check that the listed status codes are represented.
- Check that Swagger documents every endpoint.
- List any assumptions you made.
```

## What This Ladder Taught Me

The biggest improvement came from constraints, not from asking for cleaner formatting. The prompt became useful when it named the exact failure cases the code had to handle.
