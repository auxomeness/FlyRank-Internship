export const extractJsonObject = (raw) => {
  const text = String(raw ?? "").trim();
  const unfenced = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }

  return JSON.parse(unfenced.slice(start, end + 1));
};
