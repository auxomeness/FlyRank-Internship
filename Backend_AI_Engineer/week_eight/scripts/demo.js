const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function waitForJob(jobId) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${baseUrl}/jobs/${jobId}`);
    const job = await response.json();

    if (job.status === 'succeeded' || job.status === 'failed') {
      return job;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${jobId}`);
}

async function run() {
  const createResponse = await fetch(`${baseUrl}/reports/task-summary`, {
    method: 'POST'
  });

  const created = await createResponse.json();
  console.log('Created job:', created);

  const job = await waitForJob(created.job_id);
  console.log('Final job:', job);

  if (job.status !== 'succeeded') {
    process.exitCode = 1;
    return;
  }

  console.log(`Download URL: ${baseUrl}${job.download_url}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
