# Agent Design Doc: Backend Assignment Study Agent

Phase: Build (core)

## Job To Be Done

The agent helps me turn backend assignment material into a checked implementation plan before I start coding. Its job is narrow: read an assignment source, inspect my current repo when relevant, produce source-grounded study notes, create a build/test/submission checklist, and flag missing proof before I submit.

It should not write the whole project for me by default. It helps me understand the work, plan it, and catch gaps.

## User And Frequency

User: me, Karl Austin Pavia, a backend-focused full-stack student and FlyRank intern.

Frequency: once or twice per week during internship assignment work, plus occasional reuse when reviewing personal backend projects.

Main use cases:

- Understand a new backend assignment.
- Turn a PDF, portal brief, or README into practical notes.
- Compare my repo against the assignment checklist.
- Find missing deliverables before submission.

## Tools And Data Needed

| Tool / Data | Why It Is Needed | Access Plan |
| --- | --- | --- |
| Assignment PDF or pasted brief | Main source of requirements | User uploads PDF or pastes source text into Codex. |
| Local repo file reader | Check README, package scripts, source files, screenshots, and output files | Use Codex local filesystem tools with user-controlled workspace access. |
| Terminal commands | Verify scripts, tests, curl examples, git status, and generated files | Use shell commands only inside the project folder. Ask before risky or external actions. |
| Web lookup | Read official docs or current assignment/resource pages when needed | Browse only when the user asks or the source requires current documentation. Prefer official docs. |
| Git status/log | Check what changed and whether deliverables are committed | Read-only by default. Ask before commit or push unless the user explicitly requests it. |
| Markdown writer | Save final study notes/checklists into the repo | Write only assignment deliverables, not secrets or unrelated files. |

No database, email, calendar, or social connector is needed for version 1.

## Draft Agent Instructions

```text
You are my Backend Assignment Study Agent.

Goal:
Help me understand and prepare backend assignment work before implementation and submission.

Working style:
- Be direct, plain, specific, calm, technical, no buzzwords.
- Use the assignment source as the highest-priority evidence.
- Separate source facts from your interpretation.
- If something is not in the source, mark it as "needs verification."
- Inspect the repo before judging whether work is complete.
- Prefer concrete checklists, commands, endpoint tables, file paths, and failure cases.

Process:
1. Read the assignment source.
2. Extract requirements, deliverables, tools, commands, status codes, and success criteria.
3. Inspect the project folder and identify what already exists.
4. Produce a build plan and test checklist.
5. Compare current repo state against the checklist.
6. Flag missing files, screenshots, docs, tests, links, or commits.
7. Stop with a human review checklist.

Boundaries:
- Do not invent requirements.
- Do not submit assignments.
- Do not upload files.
- Do not expose or commit secrets.
- Do not push to GitHub without explicit user instruction.
- Ask before destructive commands or account actions.
```

## Five Eval Cases

### Eval 1: Week 2 CRUD API Brief

Input: Week 2 CRUD assignment brief.

Expected behavior: extracts required Express endpoints, in-memory storage, validation rules, Swagger UI, README, screenshot, and stage commits. It should flag missing `400`, `404`, or `204` behavior if absent.

Pass condition: output includes endpoint table, curl tests, and submission checklist.

### Eval 2: Week 3 Database Assignment

Input: Week 3 database assignment brief and existing Week 2 repo.

Expected behavior: identifies persistence requirement, `.env.example`, gitignored env/database files, repository layer, and proof of restart persistence.

Pass condition: it distinguishes storage changes from route/service changes and flags missing persistence proof.

### Eval 3: Week 4 Auth Assignment

Input: auth assignment brief plus Week 4 folder.

Expected behavior: identifies signup, login, logout, protected routes, bearer token middleware, `401` cases, and secret-handling risks.

Pass condition: it warns not to commit service-role keys or access tokens.

### Eval 4: Week 5 Scraper Assignment

Input: scraper assignment PDF and scraper folder.

Expected behavior: extracts politeness rules, target classification, cache, timeout, delay, validation, error log, and output files.

Pass condition: it flags whether robots/terms were checked and whether failed pages are handled without crashing.

### Eval 5: Incomplete Submission Folder

Input: a partially built assignment folder with missing README screenshot and no ZIP.

Expected behavior: does not say "done." It lists missing deliverables and gives the next commands or manual checks.

Pass condition: it clearly marks the assignment as incomplete and names the missing proof.

## Risks And Guardrails

Risks:

- Hallucinating requirements not in the assignment source.
- Treating optional stretch work as required.
- Missing hidden deliverables such as screenshots, public links, or notes.
- Accidentally exposing `.env`, tokens, or private account data.
- Running a destructive command in the wrong folder.
- Pushing or uploading before I review the result.

Guardrails:

- Source-grounded mode by default: unsupported claims are labeled `needs verification`.
- Read `git status` before any commit or push.
- Never commit `.env`, tokens, database files, cache folders, or unrelated `.DS_Store` changes.
- Never run destructive commands unless I explicitly approve the exact action.
- Never submit, upload, or send anything to a third-party portal automatically.
- Stop and ask if assignment text conflicts with repo reality.
- End every run with "human checks before submission."

## Platform Choice

Chosen platform: Codex with local tools and MCP-style app/file access.

Why: this agent needs to read local assignment folders, inspect code, run commands, check generated files, and prepare Markdown deliverables. Codex already has the right environment for that. It can operate in the same workspace where my backend assignments live, which makes it more useful than a plain chat assistant.

Alternative considered: Claude Project with connectors.

Why I did not choose it for version 1: it would work well for reading and writing guidance, but my current workflow and repo are already in Codex. I would have to move files or reconnect the same context elsewhere. Codex is more maintainable for me because the build, test, docs, and Git steps are already in one place.

Alternative considered: n8n workflow.

Why I did not choose it for version 1: n8n is better when the same process must run automatically on a schedule. My assignment work still needs judgment and repo inspection, so automation is less important than controlled tool use and review.

## Scope Check

Achievable in roughly 10 build hours: yes. Version 1 can be a single-agent Codex workflow with instructions, repo-reading tools, shell verification, and Markdown output. It does not need multiple agents, external accounts, email, or calendar integration.

Backend needed: not for the first version. It can run inside Codex as an agentic workflow using local tools. A backend would only be useful later if I wanted a standalone web app with saved runs and dashboards.

## First Build Milestone

Build the agent as a reusable Codex instruction/workflow:

1. Create the system instructions.
2. Give it access to one assignment source and one project folder.
3. Run the five eval cases above.
4. Record misses.
5. Tighten the instructions and guardrails.

Done means it can take a new assignment source and produce a grounded build/test/submission checklist without inventing requirements.
