import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  createStubTriage,
  PROMPT_VERSION,
  triageOutputSchema,
} from "../llm/schema.js";
import { generateTriage } from "../llm/triage.js";
import { isRetryableModelError } from "../llm/client.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logsDir = path.resolve("logs");

const runTriage = async (message) => {
  if (process.env.LLM_ENABLED === "false") {
    const error = new Error("LLM triage is disabled");
    error.retryable = false;
    throw error;
  }

  if (process.env.LLM_STUB === "1") {
    const output = triageOutputSchema.parse(createStubTriage(message));
    return {
      output,
      meta: {
        mode: "stub",
        prompt_version: PROMPT_VERSION,
        model: "stub",
        repaired: false,
      },
    };
  }

  return generateTriage(message);
};

const writeFailureLog = async (job) => {
  await mkdir(logsDir, { recursive: true });
  await writeFile(
    path.join(logsDir, `failed-${job.id}.json`),
    `${JSON.stringify(
      {
        id: job.id,
        input: job.input,
        attempts: job.attempts,
        error: job.error,
        failed_at: job.finished_at,
      },
      null,
      2
    )}\n`
  );
};

const shouldRetry = (error) => {
  if (typeof error.retryable === "boolean") return error.retryable;
  if (error.statusCode === 422) return false;
  if ([400, 401, 403].includes(error.status)) return false;
  return isRetryableModelError(error);
};

export const createTriageWorker = (jobStore) => {
  const queue = [];
  let working = false;

  const enqueue = (jobId) => {
    queue.push(jobId);
    setImmediate(drain);
  };

  const drain = async () => {
    if (working) return;
    working = true;

    while (queue.length > 0) {
      const jobId = queue.shift();
      await processJob(jobId);
    }

    working = false;
  };

  const processJob = async (jobId) => {
    const delayMs = Number(process.env.JOB_DELAY_MS ?? 300);
    const job = jobStore.getInternal(jobId);
    if (!job || job.status === "succeeded") return;

    while (job.attempts < job.max_attempts) {
      jobStore.patch(jobId, {
        status: "running",
        progress: 25,
        attempts: job.attempts + 1,
        started_at: job.started_at ?? new Date().toISOString(),
      });

      try {
        await sleep(delayMs);
        const result = await runTriage(job.input.message);

        jobStore.patch(jobId, {
          status: "succeeded",
          progress: 100,
          result: {
            ...result.output,
            meta: {
              ...result.meta,
              worker_attempts: job.attempts,
            },
          },
          error: null,
          finished_at: new Date().toISOString(),
        });
        return;
      } catch (error) {
        const retryable = shouldRetry(error);
        const canRetry = retryable && job.attempts < job.max_attempts;

        jobStore.patch(jobId, {
          status: canRetry ? "queued" : "failed",
          progress: canRetry ? 50 : 100,
          error: {
            message: error.message,
            retryable,
            last_attempt: job.attempts,
          },
          finished_at: canRetry ? null : new Date().toISOString(),
        });

        if (!canRetry) {
          const failedJob = jobStore.getInternal(jobId);
          await writeFailureLog(failedJob);
          jobStore.recordAlert({
            job_id: jobId,
            type: "job_failed",
            message: `Triage job ${jobId} failed after ${failedJob.attempts} attempt(s).`,
            error: failedJob.error,
          });
          return;
        }

        await sleep(250 * job.attempts);
      }
    }
  };

  return {
    enqueue,
  };
};
