import { z } from "zod";

export const PROMPT_VERSION = "triage-v1";

export const triageInputSchema = z.object({
  message: z
    .string({
      required_error: "message is required",
      invalid_type_error: "message must be a string",
    })
    .trim()
    .min(1, "message must not be empty")
    .max(2000, "message must be 2000 characters or fewer"),
});

export const triageOutputSchema = z
  .object({
    category: z.enum(["billing", "bug", "feature", "other"]),
    urgency: z.enum(["low", "normal", "high"]),
    suggested_team: z.enum(["billing", "engineering", "product", "support"]),
    confidence: z.number().min(0).max(1),
    reason: z.string().trim().min(1).max(160),
  })
  .strict();

export const createStubTriage = (message) => {
  const text = message.toLowerCase();

  if (text.includes("invoice") || text.includes("refund") || text.includes("charged")) {
    return {
      category: "billing",
      urgency: text.includes("urgent") ? "high" : "normal",
      suggested_team: "billing",
      confidence: 0.82,
      reason: "The message is mainly about billing or payment.",
    };
  }

  if (text.includes("crash") || text.includes("error") || text.includes("bug")) {
    return {
      category: "bug",
      urgency: text.includes("down") || text.includes("cannot log in") ? "high" : "normal",
      suggested_team: "engineering",
      confidence: 0.84,
      reason: "The message describes broken product behavior.",
    };
  }

  if (text.includes("feature") || text.includes("can you add") || text.includes("request")) {
    return {
      category: "feature",
      urgency: "low",
      suggested_team: "product",
      confidence: 0.8,
      reason: "The message asks for a product improvement.",
    };
  }

  return {
    category: "other",
    urgency: "normal",
    suggested_team: "support",
    confidence: 0.42,
    reason: "The message does not clearly match a specific triage category.",
  };
};

export const formatZodError = (error) =>
  error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
