# Source-Grounded Study Notes Workflow

Phase: Build (core)

Workflow type: research/writing pipeline from my FL-01 audit.

Selected audit task: study backend AI engineering and backend implementation work with AI as a thinking partner.

## What This Workflow Does

This workflow turns one source document into backend study notes I can actually use. The goal is not a generic summary. The output should tell me what the source says, what I need to build or check, what can go wrong, and what I still need to verify myself.

## Step Diagram

```text
Input source
  -> Step 1: Gather facts
  -> Step 2: Synthesize into concepts and requirements
  -> Step 3: Draft study notes
  -> Step 4: Review for gaps and hallucinations
  -> Step 5: Format final notes
  -> Human check: verify commands, status codes, links, and claims
```

## No-Code Setup

Tool used: Codex / ChatGPT-style project workflow.

I used this instead of Claude because my AI workspace for this track is Codex. The workflow is still no-code: I paste a source document into the configured prompt chain, move the output from one step to the next, and review the final notes manually.

NotebookLM could replace Step 1 and Step 2 when the input is a PDF or long source set, but the handoff structure stays the same.

## Project Configuration

```text
You are my backend study-notes assistant.

Voice:
Direct, plain, specific, calm, technical, no buzzwords.

Rules:
- Use only the provided source text.
- If the source does not say something, mark it as "needs verification."
- Separate facts from interpretation.
- Keep notes useful for a junior backend-focused full-stack developer.
- Prefer checklists, commands, endpoint tables, and failure cases over generic summaries.
- End with human review items.
```

## Workflow Prompts

### Step 1: Gather Facts

```text
Read the source below and extract only grounded facts.

Return:
1. Main goal
2. Required tools or stack
3. Required tasks
4. Commands mentioned
5. Deliverables
6. Status codes, endpoints, data fields, or technical rules
7. Anything unclear or missing

Source:
[PASTE SOURCE]
```

Handoff: the extracted facts become the input for synthesis.

### Step 2: Synthesize

```text
Using only the gathered facts below, turn them into a study map.

Return:
1. Core concept in one paragraph
2. What I must build or do
3. What success looks like
4. Common failure points
5. Questions I should answer before implementation

Gathered facts:
[PASTE STEP 1 OUTPUT]
```

Handoff: the study map becomes the outline for the notes.

### Step 3: Draft Notes

```text
Draft source-grounded study notes from this study map.

Use this structure:
1. What this is
2. Why it matters
3. Key concepts
4. Build checklist
5. Test checklist
6. Submission checklist

Constraints:
- Keep it practical.
- Do not invent requirements.
- Mark uncertain items as "needs verification."

Study map:
[PASTE STEP 2 OUTPUT]
```

Handoff: the draft notes become the review target.

### Step 4: Review

```text
Review these study notes against the original source facts.

Return:
1. What is grounded
2. What may be invented or unsupported
3. What is missing
4. What a human must still verify
5. Suggested edits

Original facts:
[PASTE STEP 1 OUTPUT]

Draft notes:
[PASTE STEP 3 OUTPUT]
```

Handoff: the review comments become edits for the final version.

### Step 5: Format

```text
Format the final study notes for my repo.

Use Markdown.
Keep it concise.
Include:
- Summary
- Build checklist
- Test checklist
- Submission checklist
- Human review checklist

Apply these review comments:
[PASTE STEP 4 OUTPUT]

Draft notes:
[PASTE STEP 3 OUTPUT]
```

Handoff: the final output is saved as study notes or used before implementation.

## Five Real Runs

### Run 1: Week 2 CRUD API

Input: `Backend_AI_Engineer/week_two/README.md`

Output excerpt:

```text
Summary:
Build an Express CRUD API for tasks using in-memory storage.

Build checklist:
- GET /, GET /health, GET /tasks, GET /tasks/:id
- POST /tasks with title validation
- PUT /tasks/:id with title/done validation
- DELETE /tasks/:id returns 204
- Swagger UI at /docs

Human review:
- Confirm invalid POST returns 400.
- Confirm unknown ID returns 404 JSON.
- Confirm data resets after server restart.
```

Observed result: the workflow turned a README into a practical endpoint/status-code checklist instead of a loose summary.

### Run 2: Week 3 SQLite API

Input: `Backend_AI_Engineer/week_three/README.md`

Output excerpt:

```text
Summary:
The Week 2 API now stores tasks in SQLite. API behavior stays the same, but task data persists after restart.

Key concepts:
- Repository layer separates storage from routes and service rules.
- SQLite database file is generated locally and gitignored.
- Persistence must be proven by creating a row, restarting, and reading it again.

Human review:
- Check tasks.db is not committed.
- Verify route/service behavior did not change when storage changed.
```

Observed result: the workflow surfaced the architecture lesson, not just the database command.

### Run 3: Week 4 Auth API

Input: `Backend_AI_Engineer/week_four/README.md`

Output excerpt:

```text
Summary:
Build an Express API using Supabase Auth for signup, login, logout, and protected routes.

Build checklist:
- Keep .env gitignored.
- Use Supabase publishable key, not service_role.
- Add reusable bearer-token middleware.
- Return 401 for missing, malformed, invalid, or expired tokens.

Human review:
- Never paste real access tokens into README.
- Confirm protected route fails without Authorization header.
```

Observed result: the workflow highlighted security review items that a normal summary could miss.

### Run 4: Week 5 Polite Scraper

Input: `Backend_AI_Engineer/week_five/README.md`

Output excerpt:

```text
Summary:
Build a polite JavaScript scraper for Books to Scrape, scoped to the first three catalogue pages.

Key rules:
- Identify the scraper with a user-agent.
- Cache HTML to avoid repeat hits.
- Add timeout and delay.
- Validate records with schema rules.
- Log failed pages without crashing the run.

Human review:
- Confirm robots/terms were checked.
- Confirm the scraper does not crawl outside the assignment scope.
```

Observed result: the workflow kept ethics, scope, and failure behavior visible instead of only listing libraries.

### Run 5: Portfolio Content Map

Input: `AI_Fluency/week-three/the-through-line/README.md`

Output excerpt:

```text
Summary:
The portfolio should prove backend-focused full-stack work through case studies, screenshots, GitHub links, and contact actions.

Build checklist:
- Hero uses one-line claim.
- Featured work leads with CodeGuard AI / Compass AI.
- Case studies show problem, what I did, and what came of it.
- CTAs point to GitHub or contact.

Human review:
- Gather missing screenshots before build week.
- Confirm repository links are public.
```

Observed result: the workflow converted the content map into a build-readiness checklist and exposed missing proof.

## Time Accounting

Manual method estimate: about 20 minutes per source because I usually reread, highlight, rewrite notes, then make a checklist. Five sources would take about 100 minutes.

Workflow method estimate after setup: about 8 minutes per source for pasting, reviewing, and formatting. Five sources took about 40 minutes of active work.

Setup cost: about 30 minutes to write and tune the workflow prompts.

Net result: the first five-run batch saves about 30 minutes after setup. The workflow becomes more valuable after reuse because the setup cost is already paid.

## Where It Breaks

- It can make unsupported assumptions if the source is vague.
- It may turn a recommendation into a requirement unless the review step catches it.
- It cannot prove code works; commands still need to be run.
- It cannot know whether a GitHub link is public unless checked.
- It can miss hidden requirements from screenshots or portal text not included in the pasted source.

## Human Review Checklist

- Check all commands by running them.
- Verify endpoints and status codes with curl or Swagger.
- Check secrets are not committed.
- Confirm live URLs open outside the local machine.
- Compare final notes against the original source before submitting.

## Brand New Input Test

To test the workflow end to end on a new source, paste a new assignment page or README into Step 1. The expected output is a short Markdown note with grounded facts, a build checklist, a test checklist, and human review items. If the workflow invents requirements, the Step 4 review prompt should flag them before the final notes are saved.
