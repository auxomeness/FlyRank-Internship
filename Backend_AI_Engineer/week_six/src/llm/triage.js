import { completeTriageRaw } from "./client.js";
import { extractJsonObject } from "./json.js";
import { logQuarantine } from "./logging.js";
import { formatZodError, PROMPT_VERSION, triageOutputSchema } from "./schema.js";

const parseAndValidate = (raw) => {
  const parsed = extractJsonObject(raw);
  const checked = triageOutputSchema.safeParse(parsed);

  if (!checked.success) {
    throw new Error(formatZodError(checked.error));
  }

  return checked.data;
};

export const generateTriage = async (message) => {
  const first = await completeTriageRaw(message);

  try {
    return {
      output: parseAndValidate(first.raw),
      meta: {
        mode: "llm",
        prompt_version: first.prompt_version,
        model: first.model,
        duration_ms: first.duration_ms,
        repaired: false,
      },
      call: first,
    };
  } catch (error) {
    const repairInstruction = [
      "Your previous answer was rejected.",
      `Validation error: ${error.message}`,
      "Return only corrected JSON matching the schema.",
      "Do not include markdown or extra text.",
    ].join("\n");

    const repaired = await completeTriageRaw(message, {
      repairInstruction,
      rejectedOutput: first.raw,
    });

    try {
      return {
        output: parseAndValidate(repaired.raw),
        meta: {
          mode: "llm",
          prompt_version: repaired.prompt_version,
          model: repaired.model,
          duration_ms: first.duration_ms + repaired.duration_ms,
          repaired: true,
        },
        call: repaired,
      };
    } catch (repairError) {
      await logQuarantine({
        prompt_version: PROMPT_VERSION,
        model: repaired.model,
        input: { message },
        first_error: error.message,
        repair_error: repairError.message,
        first_raw_output: first.raw,
        repair_raw_output: repaired.raw,
      });

      const failed = new Error("Model output failed validation after one repair attempt");
      failed.statusCode = 422;
      failed.details = repairError.message;
      throw failed;
    }
  }
};
