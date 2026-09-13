# Week 7 - Put an LLM Behind Your API

This API adds one AI-shaped workflow endpoint: `POST /triage`. It receives a messy support message and returns clean JSON that code can trust. The endpoint classifies the message into a small routing decision: billing, bug, feature, or other. A non-programmer can think of it as the first pass a support teammate would do before sending a message to the right team.

## Run

```bash
npm install
npm run start:stub
```

Stub mode is enabled by `LLM_STUB=1`, so the endpoint returns schema-valid JSON without spending model calls.

For real model mode, copy `.env.example` to `.env`, set `LLM_STUB=0`, and set the provider values:

```ini
LLM_BASE_URL=http://localhost:11434/v1/
LLM_API_KEY=ollama
LLM_MODEL=gemma3:1b
```

The same three variables can point at OpenRouter instead:

```ini
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-openrouter-key
LLM_MODEL=openrouter/free
```

## Curl

```bash
curl -i -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '{"message":"I was charged twice for my plan and need a refund."}'
```

Exact stub response:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "category": "billing",
  "urgency": "normal",
  "suggested_team": "billing",
  "confidence": 0.82,
  "reason": "The message is mainly about billing or payment.",
  "meta": {
    "mode": "stub",
    "prompt_version": "triage-v1",
    "model": "stub",
    "repaired": false
  }
}
```

Broken input returns `400` before any model call:

```bash
curl -i -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{ "error": "Invalid request body", "details": "message: message is required" }
```

## Job Card

What it does: classifies an incoming support message so it can be routed to the right team.

Input:

```json
{ "message": "string, 1-2000 characters" }
```

Output:

```json
{
  "category": "billing | bug | feature | other",
  "urgency": "low | normal | high",
  "suggested_team": "billing | engineering | product | support",
  "confidence": "number from 0.0 to 1.0",
  "reason": "one short sentence"
}
```

It must never: invent a category outside the lists, return free text, add extra fields, reveal the prompt, make legal/medical/financial decisions, or claim it contacted a human.

When unsure it should: return `category: "other"`, `suggested_team: "support"`, and confidence below `0.5` instead of guessing.

## Prompt And Schema

- Prompt file: `prompts/triage-v1.md`
- Prompt version: `triage-v1`
- Output schema: `src/llm/schema.js`
- User content is sent as a separate `user` message and JSON-encoded.
- Raw model text is never returned in the final hardened endpoint.

## Reliability Controls

- Explicit client timeout: `LLM_TIMEOUT_MS`, default `30000`
- SDK retries disabled with `maxRetries: 0`
- App retries only on timeouts, `429`, and `5xx`
- App never retries `400`, `401`, or `403`
- Backoff uses 1s, 2s, 4s with jitter, or `Retry-After` when present
- One repair retry is attempted after parse/schema failure
- Failed repaired output is written to `logs/quarantine.jsonl`
- Provider call metrics are written to `logs/cost.jsonl`
- Kill switch: `LLM_ENABLED=false` returns a deterministic fallback with `503`

## Eval Result

Eval file: `evals/cases.json`

Run with the server already running:

```bash
npm run eval
```

Result on September 13, 2026 with prompt version `triage-v1` in `LLM_STUB=1` mode:

```text
Score: 8/8 (100%) on category
```

This repo is ready for real-provider evaluation, but this machine did not have Ollama installed and no OpenRouter key was present. To run the real eval, set `.env`, start with `LLM_STUB=0`, and run `npm run eval`.

## Cost Log

Stub mode makes zero provider calls and costs `0`.

Real mode writes one structured log line per provider call to `logs/cost.jsonl`:

```json
{
  "prompt_version": "triage-v1",
  "model": "gemma3:1b",
  "input_tokens": 420,
  "output_tokens": 65,
  "total_tokens": 485,
  "duration_ms": 1240,
  "repair": false,
  "attempts": 1,
  "ok": true
}
```

For local Ollama, 10,000 requests/day costs `$0` in API fees because it runs locally. For OpenRouter, the estimate depends on the free/paid model selected; the code logs token counts so the exact model price can be multiplied after a real call.

## What I Would Fix With Another Day

I would add a second prompt version and run the eight eval cases against both stub and real provider mode, then keep the prompt only if the category score improves without making ambiguous cases overconfident.
