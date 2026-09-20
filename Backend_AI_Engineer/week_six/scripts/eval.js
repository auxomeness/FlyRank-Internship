import { readFile } from "node:fs/promises";

const endpoint = process.env.EVAL_ENDPOINT ?? "http://localhost:3000";
const cases = JSON.parse(await readFile("evals/cases.json", "utf8"));
const failures = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createJob = async (testCase) => {
  const response = await fetch(`${endpoint}/triage-jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `eval-${testCase.name}`,
    },
    body: JSON.stringify({ message: testCase.message }),
  });

  const body = await response.json();

  if (response.status !== 202) {
    throw new Error(`Expected 202 but got ${response.status}: ${JSON.stringify(body)}`);
  }

  return body.job_id;
};

const pollJob = async (jobId) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${endpoint}/jobs/${jobId}`);
    const body = await response.json();

    if (body.status === "succeeded" || body.status === "failed") {
      return body;
    }

    await sleep(150);
  }

  throw new Error(`Timed out waiting for ${jobId}`);
};

for (const testCase of cases) {
  const jobId = await createJob(testCase);
  const job = await pollJob(jobId);
  const actual = job.result?.category ?? job.error?.message ?? job.status;
  const passed = job.status === "succeeded" && actual === testCase.expected_category;

  if (!passed) {
    failures.push({
      name: testCase.name,
      expected: testCase.expected_category,
      actual,
      status: job.status,
    });
  }

  console.log(
    `${passed ? "PASS" : "FAIL"} ${testCase.name}: expected ${testCase.expected_category}, got ${actual}`,
  );
}

const passedCount = cases.length - failures.length;
const percent = Math.round((passedCount / cases.length) * 100);

console.log("");
console.log(`Score: ${passedCount}/${cases.length} (${percent}%) on final background job category`);

if (failures.length > 0) {
  console.log("Failures:");
  console.log(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
