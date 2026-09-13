import { readFile } from "node:fs/promises";

const endpoint = process.env.EVAL_ENDPOINT ?? "http://localhost:3000/triage";
const cases = JSON.parse(await readFile("evals/cases.json", "utf8"));
const failures = [];

for (const testCase of cases) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: testCase.message }),
  });

  const body = await response.json();
  const passed = response.ok && body.category === testCase.expected_category;

  if (!passed) {
    failures.push({
      name: testCase.name,
      expected: testCase.expected_category,
      actual: body.category ?? body.error,
      status: response.status,
    });
  }

  console.log(
    `${passed ? "PASS" : "FAIL"} ${testCase.name}: expected ${testCase.expected_category}, got ${body.category ?? body.error}`,
  );
}

const passedCount = cases.length - failures.length;
const percent = Math.round((passedCount / cases.length) * 100);

console.log("");
console.log(`Score: ${passedCount}/${cases.length} (${percent}%) on category`);

if (failures.length > 0) {
  console.log("Failures:");
  console.log(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
