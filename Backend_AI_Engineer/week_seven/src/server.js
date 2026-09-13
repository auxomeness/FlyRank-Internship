import express from "express";
import triageRouter from "./routes/triage.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.json({
    name: "Week 7 LLM API",
    version: "1.0.0",
    endpoints: ["/health", "/triage"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(triageRouter);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Week 7 LLM API listening on http://localhost:${port}`);
});
