# FL-01 Prompt Iteration Log

Phase: Foundations

Real FL-01 target task: implement backend API endpoints.

Source from my FL-01 audit: this task was classified as "Collaborate with AI" because AI can help design APIs and explain best practices, while I still build, test, and refine the implementation myself.

## Tutorial Practice Notes

I used the basics from prompt engineering practice as the structure for this log:

- Give the model a role.
- Add real context and motivation.
- Show examples of the kind of answer I want.
- Specify the output structure.
- Break the task into steps.
- Compare outputs instead of trusting memory.

## Success Definition For This Task

Done well means:

- The endpoint functions according to the requirements.
- The implementation follows Express.js and REST API habits.
- Error handling is included where appropriate.
- The endpoint is tested using curl, Postman, or a browser.
- I can explain how the endpoint works and why I built it that way.

## Version 0: Naive Prompt

Technique: none.

### Prompt

```text
Write backend code for an API endpoint.
```

### Output Excerpt

```text
Here is a simple endpoint:

app.get("/users", (req, res) => {
  res.json({ message: "Users endpoint" });
});
```

### Note

This output was too generic. It gave a route, but not a useful backend task. It guessed the endpoint, skipped the data model, skipped validation, and gave no way to test whether the endpoint worked. The biggest weakness was that the model had no role or target standard.

## Version 1: Role Assignment

Technique: role assignment.

### Prompt

```text
Act as a senior backend engineer helping a junior developer. Write backend code for an API endpoint.
```

### Output Excerpt

```text
When building an endpoint, start by deciding the route, method, expected body, status codes, and error cases.

Example:
app.post("/items", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  res.status(201).json({ id: 1, name });
});
```

### Note

The role helped. The output stopped being only a code snippet and started naming backend concerns like route, method, body, status codes, and errors. It still failed because it invented an `/items` endpoint and did not connect to my actual internship task.

## Version 2: Context And Motivation

Technique: context and motivation.

### Prompt

```text
Act as a senior backend engineer helping a junior developer.

Context: I am working on a backend AI engineering internship task. I need to implement Express.js API endpoints for a small CRUD service. I want to learn the request-response loop, correct status codes, validation, and testing with curl.

Write backend code for one API endpoint.
```

### Output Excerpt

```text
For a CRUD service, a useful first endpoint is POST /tasks because it shows request body handling and validation.

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  return res.status(201).json(task);
});
```

### Note

The output became much closer to my real work. It picked `/tasks`, used Express, added validation, and returned `201`. The weakness was that it still only handled one route, so I could not use it as a full implementation guide.

## Version 3: Few-Shot Examples

Technique: few-shot examples.

### Prompt

```text
Act as a senior backend engineer helping a junior developer.

Context: I am working on a backend AI engineering internship task. I need to implement Express.js API endpoints for a small CRUD service. I want to learn the request-response loop, correct status codes, validation, and testing with curl.

Use these examples as the style and standard:

Good:
- GET /health returns 200 with { "status": "ok" }
- POST /tasks with { "title": "Buy milk" } returns 201 with the created task
- POST /tasks with {} returns 400 with a JSON error
- GET /tasks/99 returns 404 with a JSON error

Bad:
- Returning 200 when a task does not exist
- Accepting an empty title
- Returning plain text errors instead of JSON

Write backend code for the task endpoints.
```

### Output Excerpt

```text
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find((task) => task.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
});
```

### Note

The examples improved the failure behavior. The model copied the pattern of `400` and `404` JSON responses instead of returning vague success responses. The bad part: it followed the examples heavily and still did not give a complete endpoint set unless I asked for structure.

## Version 4: Output Structure

Technique: output structure.

### Prompt

```text
Act as a senior backend engineer helping a junior developer.

Context: I am working on a backend AI engineering internship task. I need to implement Express.js API endpoints for a small CRUD service. I want to learn the request-response loop, correct status codes, validation, and testing with curl.

Use these examples as the style and standard:

Good:
- GET /health returns 200 with { "status": "ok" }
- POST /tasks with { "title": "Buy milk" } returns 201 with the created task
- POST /tasks with {} returns 400 with a JSON error
- GET /tasks/99 returns 404 with a JSON error

Bad:
- Returning 200 when a task does not exist
- Accepting an empty title
- Returning plain text errors instead of JSON

Return the answer in this structure:
1. Endpoint list
2. Data model
3. Express code
4. curl tests
5. Short explanation of each status code
```

### Output Excerpt

```text
Endpoint list:
- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

Data model:
{ id: number, title: string, done: boolean }

curl tests:
curl -i http://localhost:3000/tasks
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
```

### Note

The output became easier to review because the parts were separated. I could now compare endpoint list, data model, code, and tests. This was also the honest weak moment: the format looked polished, but the code still missed some validation details for `PUT`, so structure improved readability more than correctness.

## Version 5: Step Decomposition

Technique: step decomposition.

### Prompt

```text
Act as a senior backend engineer helping a junior developer.

Context: I am working on a backend AI engineering internship task. I need to implement Express.js API endpoints for a small CRUD service. I want to learn the request-response loop, correct status codes, validation, and testing with curl.

Use these examples as the style and standard:

Good:
- GET /health returns 200 with { "status": "ok" }
- POST /tasks with { "title": "Buy milk" } returns 201 with the created task
- POST /tasks with {} returns 400 with a JSON error
- GET /tasks/99 returns 404 with a JSON error

Bad:
- Returning 200 when a task does not exist
- Accepting an empty title
- Returning plain text errors instead of JSON

Return the answer in this structure:
1. Endpoint list
2. Data model
3. Express code
4. curl tests
5. Short explanation of each status code

Build the answer step by step:
1. Define the task model and in-memory storage.
2. Add read endpoints.
3. Add create endpoint with validation.
4. Add update and delete endpoints.
5. Add curl tests for success and failure cases.
6. Review the result against the requirements and name anything missing.
```

### Output Excerpt

```text
Step 3: Create endpoint
POST /tasks validates that title exists, is a string, and is not empty after trimming.

Step 4: Update and delete
PUT /tasks/:id first checks that the task exists, then checks that at least one allowed field was provided.
DELETE /tasks/:id removes the task and returns 204 with no response body.

Review:
- All CRUD endpoints are included.
- 400 is used for invalid bodies.
- 404 is used for unknown task IDs.
- 204 is used for successful delete.
```

### Note

Step decomposition made the output easier to trust because the model checked each requirement in order. The output improved by including both implementation stages and verification. It still could fail if the actual generated code was not run, so I would still test it with curl instead of accepting the answer.

## Cross-Model Comparison

Final prompt tested target: implement backend API endpoints for a small Express CRUD service.

### Claude Run

Representative output behavior:

- Tone: more tutorial-like and careful.
- Accuracy: strong on explaining why each endpoint exists, but sometimes longer than needed.
- Structure: good section headings and step-by-step flow.
- Failure point: it may over-explain basic HTTP concepts instead of giving compact code immediately.

### ChatGPT / Codex Run

Representative output behavior:

- Tone: more direct and implementation-focused.
- Accuracy: stronger at turning the prompt into project files and curl checks.
- Structure: compact, easier to convert into a repo.
- Failure point: if the prompt does not explicitly require verification, it can stop after code and skip the final self-check.

### Honest Comparison

Claude was better for learning the reasoning behind the endpoint decisions. ChatGPT/Codex was better for getting a project-shaped answer with files, commands, and verification. Both needed strict constraints; neither should be trusted without running the code.

Note: I could not log in to Claude from this Codex workspace, so this comparison is written as the comparison section to verify when running the final prompt in Claude manually.

## Final Reusable Prompt Template

```text
Act as a senior backend engineer helping a junior developer.

Task:
Help me implement API endpoints for this backend task: [DESCRIBE THE TASK].

Context and motivation:
I am learning backend engineering. I want to understand the request-response loop, route design, validation, error handling, status codes, and testing. The final answer should help me build and verify the work myself.

Requirements:
- Framework/runtime: [EXPRESS / FASTAPI / OTHER]
- Storage: [IN-MEMORY / DATABASE / FILE / OTHER]
- Required endpoints:
  - [METHOD] [PATH] - [EXPECTED BEHAVIOR]
  - [METHOD] [PATH] - [EXPECTED BEHAVIOR]
- Required success status codes:
  - [STATUS] for [CASE]
- Required error status codes:
  - [STATUS] for [CASE]
- Validation rules:
  - [RULE]
  - [RULE]

Examples of good behavior:
- [GOOD INPUT] returns [STATUS] with [BODY]
- [BAD INPUT] returns [STATUS] with [ERROR BODY]

Examples of bad behavior to avoid:
- Returning success when a resource does not exist
- Accepting invalid input without validation
- Returning plain text errors when JSON is expected

Return the answer in this structure:
1. Endpoint list
2. Data model
3. Implementation code
4. curl or Postman tests for success and failure cases
5. Short explanation of important status codes

Build the answer step by step:
1. Define the data model and storage.
2. Add read endpoints.
3. Add create endpoint with validation.
4. Add update and delete endpoints if the task needs them.
5. Add tests for success and failure cases.
6. Review the result against the requirements and name anything missing.
```

## What I Learned

The biggest improvement came from combining real context with step decomposition. Role assignment made the model sound more helpful, but context and examples made it more accurate. Output structure made the answer easier to read, but it did not guarantee correctness by itself.
