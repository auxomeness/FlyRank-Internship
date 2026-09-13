import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
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

export const completeTriageRaw = async (message) => {
  const client = createClient();
  const systemPrompt = await loadSystemPrompt();
  const started = Date.now();

  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify({ message }) },
    ],
  });

  return {
    raw: response.choices[0]?.message?.content ?? "",
    usage: response.usage ?? {},
    duration_ms: Date.now() - started,
    model: process.env.LLM_MODEL,
    prompt_version: PROMPT_VERSION,
  };
};
