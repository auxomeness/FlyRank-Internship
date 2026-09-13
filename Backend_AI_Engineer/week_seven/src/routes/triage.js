import express from "express";
import {
  createStubTriage,
  formatZodError,
  triageInputSchema,
  triageOutputSchema,
} from "../llm/schema.js";

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
        prompt_version: "triage-v1",
        model: "stub",
        repaired: false,
      },
    });
  }

  return res.status(501).json({
    error: "Real LLM mode is not wired yet. Set LLM_STUB=1 for the Stage 1 checkpoint.",
  });
});

export default router;
