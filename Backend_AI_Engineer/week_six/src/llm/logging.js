import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

const logsDir = path.resolve("logs");

const appendJsonl = async (fileName, payload) => {
  await mkdir(logsDir, { recursive: true });
  await appendFile(path.join(logsDir, fileName), `${JSON.stringify(payload)}\n`);
};

export const logQuarantine = async (payload) => {
  await appendJsonl("quarantine.jsonl", {
    at: new Date().toISOString(),
    ...payload,
  });
};

export const logCost = async (payload) => {
  await appendJsonl("cost.jsonl", {
    at: new Date().toISOString(),
    ...payload,
  });
};
