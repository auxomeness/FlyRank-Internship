# Week 8 - PDF Report Generator

This project builds a classic backend report pipeline: query data with SQL, render a PDF artifact, and generate it through a background job. The job endpoint returns a status link first. When the job finishes, the API gives back a download URL for the stored PDF instead of passing the whole file through the job response.

## Run

```bash
npm install
npm start
```

The server runs at:

```text
http://localhost:3000
```

## What It Does

The app seeds a small task dataset into SQLite on first run. A report job then runs SQL aggregations over that data:

- total tasks
- done tasks
- open tasks
- overdue open tasks
- completion rate
- task counts by priority
- task details ordered by due date

Then it writes a PDF into `reports/` and stores the artifact metadata in the database.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Check the server is alive |
| `GET` | `/tasks/summary` | Preview the SQL aggregation as JSON |
| `POST` | `/reports/task-summary` | Queue a background PDF report job |
| `GET` | `/jobs` | List recent report jobs |
| `GET` | `/jobs/:id` | Poll one job until it succeeds or fails |
| `GET` | `/reports` | List generated PDF artifacts |
| `GET` | `/reports/:fileName` | Download a generated PDF |

## Demo Commands

Start the server in one terminal:

```bash
npm start
```

Create a report job:

```bash
curl -i -X POST http://localhost:3000/reports/task-summary
```

Example response:

```http
HTTP/1.1 202 Accepted
Content-Type: application/json; charset=utf-8

{
  "job_id": "job_00000000-0000-0000-0000-000000000000",
  "status": "queued",
  "progress": 0,
  "status_url": "/jobs/job_00000000-0000-0000-0000-000000000000"
}
```

Poll the job:

```bash
curl -i http://localhost:3000/jobs/job_00000000-0000-0000-0000-000000000000
```

When complete, the response includes:

```json
{
  "status": "succeeded",
  "progress": 100,
  "download_url": "/reports/task-summary-job_00000000-0000-0000-0000-000000000000.pdf"
}
```

Download the PDF:

```bash
curl -L -o task-summary.pdf http://localhost:3000/reports/task-summary-job_00000000-0000-0000-0000-000000000000.pdf
```

Or run the helper script while the server is running:

```bash
npm run demo
```

## Background Job Pattern

The report job follows the same pattern used in production SaaS apps:

1. Client asks for a report.
2. API creates a `queued` job and immediately returns `202 Accepted`.
3. Worker code runs in the background.
4. Worker queries the database, renders the PDF, and stores the file.
5. Client polls `/jobs/:id` and receives a stable download URL when the job is done.

This avoids holding the HTTP request open while the report is generated.

## Artifact Handling

The PDF file is stored in `reports/`, and the database stores its path, byte size, job id, and creation time. The API returns a link to the artifact. It does not put the PDF bytes inside the job JSON response.

## Schedule Stretch

The assignment stretch asks for scheduled reports. I did not add a real scheduler because the required on-demand background job is the main deliverable. The next clean step would be a cron process that calls the same `enqueueTaskReport()` function once per day or week, so the report logic stays in one place.

## Reset Local Demo Data

```bash
npm run clean
```

The next `npm start` recreates the SQLite database and seed data.
