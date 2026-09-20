import crypto from "node:crypto";

const now = () => new Date().toISOString();

const publicJob = (job) => ({
  id: job.id,
  status: job.status,
  progress: job.progress,
  attempts: job.attempts,
  max_attempts: job.max_attempts,
  idempotency_key: job.idempotency_key,
  status_url: `/jobs/${job.id}`,
  result: job.result,
  error: job.error,
  created_at: job.created_at,
  started_at: job.started_at,
  finished_at: job.finished_at,
  updated_at: job.updated_at,
});

export const createJobStore = () => {
  const jobs = new Map();
  const idempotencyIndex = new Map();
  const alerts = [];

  const create = ({ message, idempotencyKey = null }) => {
    if (idempotencyKey && idempotencyIndex.has(idempotencyKey)) {
      const existing = jobs.get(idempotencyIndex.get(idempotencyKey));
      return { job: publicJob(existing), reused: true };
    }

    const id = `job_${crypto.randomUUID()}`;
    const job = {
      id,
      status: "queued",
      progress: 0,
      attempts: 0,
      max_attempts: Number(process.env.JOB_MAX_ATTEMPTS ?? 3),
      idempotency_key: idempotencyKey,
      input: { message },
      result: null,
      error: null,
      created_at: now(),
      started_at: null,
      finished_at: null,
      updated_at: now(),
    };

    jobs.set(id, job);

    if (idempotencyKey) {
      idempotencyIndex.set(idempotencyKey, id);
    }

    return { job: publicJob(job), reused: false };
  };

  const get = (id) => {
    const job = jobs.get(id);
    return job ? publicJob(job) : null;
  };

  const getInternal = (id) => jobs.get(id) ?? null;

  const list = () =>
    [...jobs.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(publicJob);

  const patch = (id, changes) => {
    const job = jobs.get(id);
    if (!job) return null;
    Object.assign(job, changes, { updated_at: now() });
    return publicJob(job);
  };

  const recordAlert = (payload) => {
    const alert = {
      id: `alert_${crypto.randomUUID()}`,
      at: now(),
      ...payload,
    };
    alerts.unshift(alert);
    return alert;
  };

  const listAlerts = () => alerts.slice(0, 20);

  return {
    create,
    get,
    getInternal,
    list,
    listAlerts,
    patch,
    recordAlert,
  };
};
