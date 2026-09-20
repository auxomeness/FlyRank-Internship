# Job Card

## Job

Support message triage.

## Why It Is A Background Job

The slow operation is the AI model call. The request should not wait for the model to finish. The API accepts the work with `202`, then a worker performs the triage and stores the result.

## Input

```json
{
  "message": "string, 1-2000 characters"
}
```

## Output

```json
{
  "category": "billing | bug | feature | other",
  "urgency": "low | normal | high",
  "suggested_team": "billing | engineering | product | support",
  "confidence": "number from 0.0 to 1.0",
  "reason": "one short sentence",
  "meta": {
    "mode": "stub | llm",
    "prompt_version": "triage-v1",
    "model": "model name",
    "repaired": false,
    "worker_attempts": 1
  }
}
```

## Idempotency Rule

If a client sends the same `Idempotency-Key`, the API returns the original job instead of creating another job.

## Retry Rule

Retry provider timeouts, `429`, and provider `5xx`. Do not retry validation errors, bad requests, or auth/config errors.

## Alert Rule

When all attempts fail, write the failure to `logs/failed-<job-id>.json` and expose an alert at `GET /alerts`.
