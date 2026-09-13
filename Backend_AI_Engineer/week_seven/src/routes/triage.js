import express from "express";
import {
  createStubTriage,
  formatZodError,
  PROMPT_VERSION,
  triageInputSchema,
  triageOutputSchema,
} from "../llm/schema.js";
import { completeTriageRaw } from "../llm/client.js";

const router = express.Router();

router.post("/triage", async (req, res) => {
  const input = triageInputSchema.safeParse(req.body);

  if (!input.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: formatZodError(input.error),
    });
  }

  if (process.env.LLM_ENABLED === "false") {
    return res.status(503).json({
      error: "LLM triage is disabled",
      fallback: createStubTriage(input.data.message),
    });
  }

  if (process.env.LLM_STUB === "1") {
    const output = triageOutputSchema.parse(createStubTriage(input.data.message));
    return res.json({
      ...output,
      meta: {
        mode: "stub",
        prompt_version: PROMPT_VERSION,
        model: "stub",
        repaired: false,
      },
    });
  }

  const result = await completeTriageRaw(input.data.message);

  return res.json({
    raw_model_output: result.raw,
    meta: {
      mode: "raw",
      prompt_version: result.prompt_version,
      model: result.model,
      duration_ms: result.duration_ms,
    },
  });
});

export default router;
