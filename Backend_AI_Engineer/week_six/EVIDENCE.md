# Week 6 Evidence - Background Job

## Requirement Mapping

| Requirement | Implementation |
|---|---|
| Endpoint answers instantly with `202` | `POST /triage-jobs` validates input, creates a queued job, and returns `202 Accepted` |
| Worker does the slow work | `src/jobs/triageWorker.js` runs the LLM triage after the request returns |
| Status endpoint reports result | `GET /jobs/:id` returns `queued`, `running`, `succeeded`, or `failed` with result/error |
| Idempotency | `Idempotency-Key` maps duplicate requests to the same job |
| Retries | Worker retries retryable failures up to `JOB_MAX_ATTEMPTS` |
| Alerts | Permanent failures write `logs/failed-<job-id>.json` and appear at `GET /alerts` |

## Expected Happy Path

```bash
curl -i -X POST http://localhost:3000/triage-jobs \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-billing-1" \
  -d '{"message":"I was charged twice for my plan and need a refund."}'
```

Expected status:

```http
HTTP/1.1 202 Accepted
```

Then:

```bash
curl -i http://localhost:3000/jobs/<job_id>
```

Expected final body:

```json
{
  "status": "succeeded",
  "progress": 100,
  "attempts": 1,
  "result": {
    "category": "billing",
    "suggested_team": "billing"
  }
}
```

## Verified Happy Path

Verified locally on September 20, 2026.

Health check:

```http
HTTP/1.1 200 OK

{"status":"ok"}
```

Created job:

```json
{
  "job_id": "job_3eb74df2-bfb3-41a8-978d-1942f5ed4f5c",
  "status": "queued",
  "status_url": "/jobs/job_3eb74df2-bfb3-41a8-978d-1942f5ed4f5c",
  "idempotency_key": "verify-billing-1",
  "reused": false
}
```

Final job:

```json
{
  "id": "job_3eb74df2-bfb3-41a8-978d-1942f5ed4f5c",
  "status": "succeeded",
  "progress": 100,
  "attempts": 1,
  "result": {
    "category": "billing",
    "urgency": "normal",
    "suggested_team": "billing",
    "confidence": 0.82,
    "reason": "The message is mainly about billing or payment."
  }
}
```

## Idempotency Check

Sending the same `Idempotency-Key` twice should return the same `job_id` and `reused: true` on the second response.

Verified response:

```json
{
  "job_id": "job_3eb74df2-bfb3-41a8-978d-1942f5ed4f5c",
  "status": "succeeded",
  "status_url": "/jobs/job_3eb74df2-bfb3-41a8-978d-1942f5ed4f5c",
  "idempotency_key": "verify-billing-1",
  "reused": true
}
```

## Failure Check

Start with `LLM_ENABLED=false`, create a job, then poll it. The job should move to `failed`, and `GET /alerts` should show a `job_failed` alert.

Verified failed job:

```json
{
  "id": "job_3409d350-27f1-4fb9-ad3b-c2c37eaef5eb",
  "status": "failed",
  "progress": 100,
  "attempts": 1,
  "error": {
    "message": "LLM triage is disabled",
    "retryable": false,
    "last_attempt": 1
  }
}
```

Verified alert:

```json
{
  "type": "job_failed",
  "message": "Triage job job_3409d350-27f1-4fb9-ad3b-c2c37eaef5eb failed after 1 attempt(s)."
}
```

## Eval Result

```text
PASS duplicate charge: expected billing, got billing
PASS invoice request: expected billing, got billing
PASS crashing export: expected bug, got bug
PASS login broken: expected bug, got bug
PASS dark mode request: expected feature, got feature
PASS integration request: expected feature, got feature
PASS ambiguous greeting: expected other, got other
PASS prompt injection attempt: expected other, got other

Score: 8/8 (100%) on final background job category
```
