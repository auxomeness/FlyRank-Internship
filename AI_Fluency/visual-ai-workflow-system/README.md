# Visual AI Workflow System

This project is a visual AI decision workflow builder.

Each node is an AI decision step that returns exactly `YES` or `NO`. The frontend uses React Flow to edit and visualize the workflow. Execution runs through Inngest, and each node is mapped to an Inngest `step.run(...)`.

## Tech Stack

- Next.js
- React Flow (`@xyflow/react`)
- Inngest
- OpenAI SDK
- shadcn-style local UI components
- local JSON execution store for development

## Setup

```bash
npm install
cp .env.example .env.local
```

Optional real AI mode:

```ini
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is missing, the workflow still runs with a deterministic mock decision engine. This keeps the assignment reviewable without paid API usage.

## Run

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run inngest
```

Open:

```text
http://localhost:3000
```

Inngest dev server:

```text
http://localhost:8288
```

## Features

Phase 1 setup:

- Next.js app
- React Flow installed and configured
- Inngest installed and configured
- OpenAI SDK installed
- shadcn-style components and `components.json`
- environment variables via `.env.example`

Phase 2 foundations:

- React Flow canvas
- add decision nodes
- connect nodes
- edit node labels and prompts
- YES and NO edge types
- graph state saved to `localStorage`

Phase 3 core execution:

- `POST /api/run-workflow` creates an execution and sends an Inngest event
- `/api/inngest` exposes the Inngest function
- each node maps to an Inngest step
- model instruction requires exactly `YES` or `NO`
- execution follows the matching YES/NO edge
- execution order is tracked

Phase 4 polish:

- visual execution state on nodes
- execution logs panel
- save/load through `localStorage`
- JSON export/import
- better node styling
- error handling
- animated active edge styling
- execution history stored in `data/executions.json` during development

## API Notes

Trigger a run:

```http
POST /api/run-workflow
```

Payload:

```json
{
  "input": "A customer says the dashboard crashes when exporting a report.",
  "graph": {
    "nodes": [],
    "edges": []
  }
}
```

Read execution state:

```http
GET /api/executions/:id
```

## Verified

Verified locally on September 13, 2026:

- `npm run build` completes successfully
- Next app starts at `http://localhost:3000`
- Inngest dev server starts and syncs the app
- workflow trigger returns an execution id
- Inngest executes node steps
- execution logs show dynamic traversal
- browser UI shows executed node badges and logs

Sample execution result:

```json
{
  "status": "complete",
  "order": ["support-check", "bug-check"],
  "logs": [
    {
      "nodeId": "support-check",
      "decision": "YES",
      "provider": "mock"
    },
    {
      "nodeId": "bug-check",
      "decision": "YES",
      "provider": "mock"
    }
  ]
}
```
