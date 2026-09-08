# Backend Assignment Study Agent MVP

Phase: Build (core)

This is the FL-07 MVP for the agent designed in FL-06.

## Core Job

The agent reads an assignment/source brief, inspects a backend project folder, and produces a grounded Markdown checklist/report.

It completes the narrowest useful version of the job:

```text
source brief + project folder -> inspected facts -> build/test/submission report
```

## Platform

Chosen platform: Codex-style local agent workflow.

Implementation: a small Node.js CLI agent with live local file access.

Why this matches FL-06: the FL-06 spec chose Codex because the agent needs to work in the same local workspace as my backend assignments. This MVP uses that exact path by reading files from the repo and writing a report back into the project folder.

## Tool / Data Connection

Live connection used: local files.

The agent reads:

- `samples/week-four-auth-source.md`
- `../../../Backend_AI_Engineer/week_four`

That means it is not plain chat. It checks real files in the workspace, including `README.md`, `package.json`, `openapi.json`, `.env.example`, `.gitignore`, source files, and screenshots.

## Run

From this folder:

```bash
npm run demo
```

The demo writes:

```text
output/week-four-auth-agent-report.md
```

## Successful End-To-End Run

Recorded output:

- `output/week-four-auth-agent-report.md`
- `captures/raw-run-capture.txt`

The raw capture is an unedited terminal transcript of the agent running from request to final report.

## Build Log

See `BUILD_LOG.md`.

The biggest deviation from the FL-06 spec is that this MVP does not parse PDFs, browse docs, or run auth curl tests automatically. I cut those to keep the first checkpoint narrow and safe.

## Guardrails

- The agent does not upload or submit anything.
- The agent does not push to GitHub.
- The agent does not read or print `.env`.
- The agent marks unsupported checks as `needs verification`.
- A human still verifies endpoints, screenshots, secrets, and submission links.
