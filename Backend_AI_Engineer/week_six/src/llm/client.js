import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { logCost } from "./logging.js";
import { PROMPT_VERSION } from "./schema.js";

const promptPath = path.resolve("prompts", `${PROMPT_VERSION}.md`);

export const loadSystemPrompt = async () => readFile(promptPath, "utf8");

export const createClient = () =>
  new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: Number(process.env.LLM_TIMEOUT_MS ?? 30000),
    maxRetries: 0,
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStatus = (error) => error?.status ?? error?.response?.status;

const getRetryAfterMs = (error) => {
  const header = error?.headers?.["retry-after"] ?? error?.response?.headers?.["retry-after"];
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
};

const isTimeout = (error) =>
  error?.name === "APIConnectionTimeoutError" ||
  error?.code === "ETIMEDOUT" ||
  /timeout/i.test(error?.message ?? "");

export const isRetryableModelError = (error) => {
  const status = getStatus(error);
  if (isTimeout(error)) return true;
  if (status === 429) return true;
  if (status >= 500 && status <= 599) return true;
  return false;
};

export const isModelTimeout = isTimeout;

const waitBeforeRetry = async (error, attempt) => {
  const retryAfter = getRetryAfterMs(error);
  if (retryAfter) {
    await sleep(retryAfter);
    return;
  }

  const base = 1000 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  await sleep(base + jitter);
};

export const completeTriageRaw = async (message, repair = null) => {
  const client = createClient();
  const systemPrompt = await loadSystemPrompt();
  const started = Date.now();
  const maxRetries = Number(process.env.LLM_MAX_RETRIES ?? 3);
  const userPayload = repair
    ? {
        message,
        rejected_output: repair.rejectedOutput,
        repair_instruction: repair.repairInstruction,
      }
    : { message };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.LLM_MODEL,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
      });

      const durationMs = Date.now() - started;
      const result = {
        raw: response.choices[0]?.message?.content ?? "",
        usage: response.usage ?? {},
        duration_ms: durationMs,
        model: process.env.LLM_MODEL,
        prompt_version: PROMPT_VERSION,
        repair: Boolean(repair),
        attempts: attempt + 1,
      };

      await logCost({
        prompt_version: PROMPT_VERSION,
        model: process.env.LLM_MODEL,
        input_tokens: result.usage.prompt_tokens ?? null,
        output_tokens: result.usage.completion_tokens ?? null,
        total_tokens: result.usage.total_tokens ?? null,
        duration_ms: durationMs,
        repair: Boolean(repair),
        attempts: attempt + 1,
        ok: true,
      });

      return result;
    } catch (error) {
      const status = getStatus(error);
      const retryable = isRetryableModelError(error);
      const finalAttempt = attempt >= maxRetries || !retryable;

      await logCost({
        prompt_version: PROMPT_VERSION,
        model: process.env.LLM_MODEL,
        input_tokens: null,
        output_tokens: null,
        total_tokens: null,
        duration_ms: Date.now() - started,
        repair: Boolean(repair),
        attempts: attempt + 1,
        ok: false,
        status: status ?? null,
        retryable,
        error: error.message,
      });

      if (finalAttempt) {
        error.status = status;
        throw error;
      }

      await waitBeforeRetry(error, attempt);
    }
  }
};
