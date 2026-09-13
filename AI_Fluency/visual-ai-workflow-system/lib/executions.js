import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const executionsFile = path.join(dataDir, "executions.json");

async function readExecutions() {
  try {
    return JSON.parse(await readFile(executionsFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeExecutions(executions) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(executionsFile, JSON.stringify(executions, null, 2));
}

export async function createExecution(execution) {
  const executions = await readExecutions();
  executions[execution.id] = execution;
  await writeExecutions(executions);
  return execution;
}

export async function getExecution(id) {
  const executions = await readExecutions();
  return executions[id] ?? null;
}

export async function patchExecution(id, patcher) {
  const executions = await readExecutions();
  const current = executions[id];
  if (!current) return null;
  executions[id] = patcher(current);
  await writeExecutions(executions);
  return executions[id];
}
