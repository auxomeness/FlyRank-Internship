const endpoint = process.env.DEMO_ENDPOINT ?? "http://localhost:3000";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const response = await fetch(`${endpoint}/triage-jobs`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": "demo-billing-job",
  },
  body: JSON.stringify({
    message: "I was charged twice for my plan and need a refund.",
  }),
});

const created = await response.json();
console.log("Create response:", created);

for (let attempt = 0; attempt < 20; attempt += 1) {
  const jobResponse = await fetch(`${endpoint}${created.status_url}`);
  const job = await jobResponse.json();
  console.log("Job status:", {
    id: job.id,
    status: job.status,
    attempts: job.attempts,
    progress: job.progress,
    result: job.result,
    error: job.error,
  });

  if (job.status === "succeeded" || job.status === "failed") {
    process.exit(job.status === "succeeded" ? 0 : 1);
  }

  await sleep(150);
}

throw new Error("Timed out waiting for job");
