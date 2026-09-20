# Week 8 Evidence - PDF Report Generator

## Local Verification

Verified on September 20, 2026.

## Health Check

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

## Report Job Created

Command:

```bash
curl -i -X POST http://127.0.0.1:3000/reports/task-summary
```

Response shape:

```json
{
  "job_id": "job_57364ff3-f164-40b1-b2c5-3e65a0f1b890",
  "status": "queued",
  "progress": 0,
  "status_url": "/jobs/job_57364ff3-f164-40b1-b2c5-3e65a0f1b890"
}
```

## Job Completed

Command:

```bash
curl -s http://127.0.0.1:3000/jobs/job_57364ff3-f164-40b1-b2c5-3e65a0f1b890
```

Response:

```json
{
  "id": "job_57364ff3-f164-40b1-b2c5-3e65a0f1b890",
  "status": "succeeded",
  "progress": 100,
  "report_type": "task-summary",
  "error": null,
  "report_path": "/Users/austin/Documents/New project/FlyRank/Backend_AI_Engineer/week_eight/reports/task-summary-job_57364ff3-f164-40b1-b2c5-3e65a0f1b890.pdf",
  "download_url": "/reports/task-summary-job_57364ff3-f164-40b1-b2c5-3e65a0f1b890.pdf"
}
```

## PDF Artifact Download

Command:

```bash
curl -I http://127.0.0.1:3000/reports/task-summary-job_57364ff3-f164-40b1-b2c5-3e65a0f1b890.pdf
```

Response:

```http
HTTP/1.1 200 OK
Content-Disposition: attachment; filename="task-summary-job_57364ff3-f164-40b1-b2c5-3e65a0f1b890.pdf"
Content-Type: application/pdf
Content-Length: 2299
```

## Requirement Mapping

| Requirement | Evidence |
|---|---|
| Query data | `GET /tasks/summary` runs SQL aggregation over SQLite task rows |
| Render PDF report | `src/pdf/simplePdf.js` writes a valid PDF file |
| Background job | `POST /reports/task-summary` returns `202` and a job id immediately |
| Store and link artifact | Job stores a PDF in `reports/` and returns `download_url` |
| On demand generation | `POST /reports/task-summary` creates a fresh report whenever called |
| Schedule stretch | Not implemented; README explains the next step would call the same queue function from cron |
