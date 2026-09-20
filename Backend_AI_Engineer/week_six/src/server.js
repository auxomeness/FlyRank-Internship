import express from "express";
import { createJobStore } from "./jobs/jobStore.js";
import { createTriageWorker } from "./jobs/triageWorker.js";
import { createJobRouter } from "./routes/jobs.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const jobStore = createJobStore();
const worker = createTriageWorker(jobStore);

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.json({
    name: "Week 6 Background Job API",
    version: "1.0.0",
    endpoints: ["/health", "POST /triage-jobs", "/jobs", "/jobs/:id", "/alerts"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(createJobRouter(jobStore, worker));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Week 6 background job API listening on http://localhost:${port}`);
});
