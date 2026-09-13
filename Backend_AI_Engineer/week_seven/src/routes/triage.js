import express from "express";
import {
  createStubTriage,
  formatZodError,
  PROMPT_VERSION,
  triageInputSchema,
  triageOutputSchema,
} from "../llm/schema.js";
import { generateTriage } from "../llm/triage.js";
import { isModelTimeout } from "../llm/client.js";

const router = express.Router();

router.post("/triage", async (req, res, next) => {
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

  try {
    const result = await generateTriage(input.data.message);
    return res.json({
      ...result.output,
      meta: result.meta,
    });
  } catch (error) {
    if (error.statusCode === 422) {
      return res.status(422).json({
        error: "Model output did not match the required schema",
        details: error.details,
      });
    }

    if (isModelTimeout(error)) {
      return res.status(504).json({
        error: "LLM provider timed out",
        details: "The model did not answer within the configured timeout.",
      });
    }

    if ([400, 401, 403].includes(error.status)) {
      return res.status(502).json({
        error: "LLM provider rejected the request",
        details: `Provider returned ${error.status}. This is not retried.`,
      });
    }

    return next(error);
  }
});

export default router;
