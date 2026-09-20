# Week 6 - Your First Background Job

This project moves the slow LLM triage operation out of the request path. The API accepts the request quickly, returns `202 Accepted`, and a worker processes the AI call in the background. A status endpoint reports whether the job is queued, running, succeeded, or failed.

The job uses the same support-message triage decision from the LLM assignment: classify one customer message as `billing`, `bug`, `feature`, or `other`.

## Run

```bash
npm install
npm run start:stub
```

The server runs at:

```text
http://localhost:3000
```

Stub mode is enabled by `LLM_STUB=1`, so the background worker returns schema-valid output without spending model calls.

For real model mode, copy `.env.example` to `.env`, set `LLM_STUB=0`, and configure:

```ini
LLM_BASE_URL=http://localhost:11434/v1/
LLM_API_KEY=ollama
LLM_MODEL=gemma3:1b
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Server health check |
| `POST` | `/triage-jobs` | Accept a support message and queue a background job |
| `GET` | `/jobs` | List recent jobs |
| `GET` | `/jobs/:id` | Poll one job for status/result |
| `GET` | `/alerts` | Show failed-job alerts |

## Background Job Flow

1. Client sends `POST /triage-jobs`.
2. API validates the request body.
3. API creates a queued job and returns `202 Accepted` immediately.
4. Worker runs the LLM triage in the background.
5. Client polls `GET /jobs/:id`.
6. Job eventually stores either `result` or `error`.

This is the professional pattern for slow operations: accept fast, work in the background, then report status.

## Curl Demo

Create a job:

```bash
curl -i -X POST http://localhost:3000/triage-jobs \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-billing-1" \
  -d '{"message":"I was charged twice for my plan and need a refund."}'
```

Example response:

```http
HTTP/1.1 202 Accepted
Content-Type: application/json; charset=utf-8

{
  "job_id": "job_00000000-0000-0000-0000-000000000000",
  "status": "queued",
  "status_url": "/jobs/job_00000000-0000-0000-0000-000000000000",
  "idempotency_key": "demo-billing-1",
  "reused": false
}
```

Poll it:

```bash
curl -i http://localhost:3000/jobs/job_00000000-0000-0000-0000-000000000000
```

Succeeded response shape:

```json
{
  "id": "job_00000000-0000-0000-0000-000000000000",
  "status": "succeeded",
  "progress": 100,
  "attempts": 1,
  "result": {
    "category": "billing",
    "urgency": "normal",
    "suggested_team": "billing",
    "confidence": 0.82,
    "reason": "The message is mainly about billing or payment.",
    "meta": {
      "mode": "stub",
      "prompt_version": "triage-v1",
      "model": "stub",
      "repaired": false,
      "worker_attempts": 1
    }
  }
}
```

## Idempotency

The API accepts an optional `Idempotency-Key` header. If the same key is sent twice, the API returns the same job instead of creating duplicate work.

```bash
curl -s -X POST http://localhost:3000/triage-jobs \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-billing-1" \
  -d '{"message":"I was charged twice for my plan and need a refund."}'
```

The second response includes:

```json
{ "reused": true }
```

## Retries

The worker retries retryable LLM failures:

- timeouts
- `429`
- provider `5xx`

It does not retry bad requests or auth/config failures:

- `400`
- `401`
- `403`
- schema validation failure after repair

Set retry count with:

```ini
JOB_MAX_ATTEMPTS=3
```

## Alerts

If a job fails permanently, the worker:

- marks the job as `failed`
- writes a failure file in `logs/failed-<job-id>.json`
- records an alert visible at `GET /alerts`

You can force a failure locally:

```bash
LLM_ENABLED=false npm run start:stub
```

Then create a job and poll it. It will eventually fail and appear in `/alerts`.

## Eval

Run the server first, then:

```bash
npm run eval
```

The eval creates background jobs for the eight existing triage cases, polls them, and checks the final category.

## What I Would Improve With More Time

This version uses an in-memory queue because the assignment is focused on learning the job pattern. In production, I would move the queue and job table into Redis, Postgres, BullMQ, or a managed worker system so jobs survive server restarts.
