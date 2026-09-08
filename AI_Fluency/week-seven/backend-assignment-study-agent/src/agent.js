import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

const getArg = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
};

const sourcePath = getArg("--source");
const projectPath = getArg("--project");
const outPath = getArg("--out", "output/agent-report.md");

if (!sourcePath || !projectPath) {
  console.error("Usage: npm start -- --source <file> --project <folder> --out <output.md>");
  process.exit(1);
}

const root = process.cwd();
const resolveFromRoot = (target) => path.resolve(root, target);
const sourceAbs = resolveFromRoot(sourcePath);
const projectAbs = resolveFromRoot(projectPath);
const outAbs = resolveFromRoot(outPath);

const readText = (file) => readFileSync(file, "utf8");

const walk = (dir, base = dir) => {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (["node_modules", ".git", "cache", "tasks.db"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full, base));
    } else {
      files.push(path.relative(base, full));
    }
  }

  return files.sort();
};

const source = readText(sourceAbs);
const projectFiles = walk(projectAbs);
const readProjectFile = (relative) => {
  const file = path.join(projectAbs, relative);
  return existsSync(file) && statSync(file).isFile() ? readText(file) : "";
};

const packageJson = readProjectFile("package.json");
const readme = readProjectFile("README.md");
const openapi = readProjectFile("openapi.json");
const gitignore = readProjectFile(".gitignore");

const endpointMatches = [...source.matchAll(/\b(GET|POST|PUT|PATCH|DELETE)\s+\/[A-Za-z0-9_/:{}.-]*/g)].map((match) => match[0]);
const statusMatches = [...new Set([...source.matchAll(/\b(200|201|204|400|401|403|404|500)\b/g)].map((match) => match[1]))];

const sourceRequirements = [
  ["Authentication", /auth|login|signup|logout|token|bearer|protected/i.test(source)],
  ["Environment variables", /\.env|environment|SUPABASE|secret|key/i.test(source)],
  ["Swagger or docs", /swagger|openapi|\/docs/i.test(source)],
  ["README or documentation", /readme|documentation|install|run/i.test(source)],
  ["Screenshot or proof", /screenshot|proof|capture/i.test(source)],
  ["Curl or API tests", /curl|postman|test/i.test(source)],
];

const projectEvidence = [
  ["README.md", projectFiles.includes("README.md")],
  ["package.json", projectFiles.includes("package.json")],
  ["openapi.json", projectFiles.includes("openapi.json")],
  [".env.example", projectFiles.includes(".env.example")],
  [".gitignore", projectFiles.includes(".gitignore")],
  ["Swagger screenshot", projectFiles.some((file) => /swagger.*\.(png|jpg|jpeg)$/i.test(file))],
  ["Source folder", projectFiles.some((file) => file.startsWith("src/"))],
];

const packageScripts = (() => {
  try {
    return Object.keys(JSON.parse(packageJson).scripts ?? {});
  } catch {
    return [];
  }
})();

const authSignals = [
  ["Supabase client mentioned", /supabase/i.test(packageJson + readme + openapi)],
  ["Bearer auth mentioned", /bearer|authorization/i.test(readme + openapi)],
  ["Protected route mentioned", /protected/i.test(readme + openapi)],
  ["401 behavior mentioned", /\b401\b|Unauthorized/i.test(readme + openapi)],
  ["Secret warning mentioned", /service_role|secret|do not commit|gitignored/i.test(readme)],
];

const missing = projectEvidence.filter(([, present]) => !present).map(([name]) => name);
const sourceNeedLines = sourceRequirements
  .map(([label, present]) => `- ${present ? "[x]" : "[ ]"} ${label}`)
  .join("\n");
const projectEvidenceLines = projectEvidence
  .map(([label, present]) => `- ${present ? "[x]" : "[ ]"} ${label}`)
  .join("\n");
const authLines = authSignals
  .map(([label, present]) => `- ${present ? "[x]" : "[ ]"} ${label}`)
  .join("\n");

const report = `# Backend Assignment Study Agent Report

Generated at: ${new Date().toISOString()}

## Inputs

- Source: \`${sourcePath}\`
- Project folder: \`${projectPath}\`

## Grounded Source Facts

Detected endpoints:

${endpointMatches.length ? endpointMatches.map((endpoint) => `- \`${endpoint}\``).join("\n") : "- needs verification: no endpoints detected"}

Detected status codes:

${statusMatches.length ? statusMatches.map((code) => `- \`${code}\``).join("\n") : "- needs verification: no status codes detected"}

Detected requirement themes:

${sourceNeedLines}

## Project Inspection

Files inspected: ${projectFiles.length}

Important project evidence:

${projectEvidenceLines}

Available npm scripts:

${packageScripts.length ? packageScripts.map((script) => `- \`npm run ${script}\``).join("\n") : "- needs verification: no npm scripts detected"}

Auth-specific checks:

${authLines}

## Build / Test Checklist

- Read the assignment source and keep source facts above as the checklist.
- Run \`npm install\` if dependencies are missing.
- Run \`npm start\` or the documented run command.
- Test public routes without a token.
- Test protected routes without a token and confirm \`401\`.
- Log in, copy a bearer token locally, and test protected routes with \`Authorization: Bearer <token>\`.
- Confirm \`.env\` is gitignored and real secrets are not committed.
- Confirm Swagger/OpenAPI docs include auth and protected routes if the assignment requires docs.
- Confirm README contains setup, run instructions, endpoint table, and one visible proof output.

## Missing Or Needs Verification

${missing.length ? missing.map((item) => `- Missing project evidence: ${item}`).join("\n") : "- No missing core project files detected by this MVP agent."}
- needs verification: this MVP inspects files but does not execute API curl tests automatically.
- needs verification: public GitHub link and assignment upload must still be checked by a human.

## Human Review Before Submission

- Run the app and verify the endpoints manually.
- Check that screenshots match the assignment requirement.
- Check \`git status\` before commit or push.
- Do not upload or submit until the report matches the assignment portal.
`;

mkdirSync(path.dirname(outAbs), { recursive: true });
writeFileSync(outAbs, report);

console.log("Backend Assignment Study Agent finished.");
console.log(`Source: ${sourcePath}`);
console.log(`Project: ${projectPath}`);
console.log(`Report: ${outPath}`);
console.log("");
console.log(report);
