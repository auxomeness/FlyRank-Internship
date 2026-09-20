import express from "express";
import { formatZodError, triageInputSchema } from "../llm/schema.js";

export const createJobRouter = (jobStore, worker) => {
  const router = express.Router();

  router.post("/triage-jobs", (req, res) => {
    const input = triageInputSchema.safeParse(req.body);

    if (!input.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: formatZodError(input.error),
      });
    }

    const idempotencyKey = req.header("Idempotency-Key")?.trim() || null;
    const { job, reused } = jobStore.create({
      message: input.data.message,
      idempotencyKey,
    });

    if (!reused) {
      worker.enqueue(job.id);
    }

    return res.status(202).json({
      job_id: job.id,
      status: job.status,
      status_url: job.status_url,
      idempotency_key: job.idempotency_key,
      reused,
    });
  });

  router.get("/jobs", (req, res) => {
    res.json(jobStore.list());
  });

  router.get("/jobs/:id", (req, res) => {
    const job = jobStore.get(req.params.id);

    if (!job) {
      return res.status(404).json({
        error: `Job ${req.params.id} not found`,
      });
    }

    return res.json(job);
  });

  router.get("/alerts", (req, res) => {
    res.json(jobStore.listAlerts());
  });

  return router;
};
