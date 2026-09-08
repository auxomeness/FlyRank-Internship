# Workflows, Agents, And MCP

Phase: Build (core)

Sources read:

- Building Effective Agents: https://www.anthropic.com/engineering/building-effective-agents
- What is MCP?: https://modelcontextprotocol.io/docs/getting-started/intro
- MCP Architecture Overview: https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture

## Connector Setup Used

MCP client: Codex desktop

MCP server / connector: Codex app MCP server

This connector let the AI inspect local Codex projects, recent tasks, and workspace runtime dependencies. Plain chat could not know these things because they come from the local app state and machine environment.

## Three Tool-Backed Tasks

| Task | MCP tool call | Why chat alone could not do it | Evidence |
| --- | --- | --- | --- |
| List local Codex projects | `mcp__codex_app.list_projects` | It read registered local projects and paths from the Codex app. | `evidence/task-1-list-projects.png` |
| List recent Codex tasks | `mcp__codex_app.list_threads` | It read live task titles, status, IDs, and working directories. | `evidence/task-2-list-threads.png` |
| Inspect workspace runtimes | `mcp__codex_app.load_workspace_dependencies` | It found exact local Node, Python, Git, and package paths. | `evidence/task-3-workspace-dependencies.png` |

## Evidence Screenshots

![Task 1 MCP evidence](/Users/austin/Documents/New project/FlyRank/AI_Fluency/week-five/workflows-agents-mcp/evidence/task-1-list-projects.png)

![Task 2 MCP evidence](/Users/austin/Documents/New project/FlyRank/AI_Fluency/week-five/workflows-agents-mcp/evidence/task-2-list-threads.png)

![Task 3 MCP evidence](/Users/austin/Documents/New project/FlyRank/AI_Fluency/week-five/workflows-agents-mcp/evidence/task-3-workspace-dependencies.png)

## Explainer

An AI workflow is a fixed process. The steps are decided ahead of time, and the model moves through them in a known order. My FL-04 pipeline is a workflow because it has a planned path: gather facts from a source, synthesize them into a study map, draft notes, review the notes against the source, and format the final version. The model helps inside each step, but it is not deciding the overall process. The handoffs are predefined, and I stay responsible for running the checks.

An agent is different because the model has more control over the path. In Anthropic's framing, both workflows and agents are "agentic systems," but the important distinction is control. A workflow uses predefined code paths or predefined human steps. An agent dynamically chooses its own process and tool use while working toward a goal. It may decide to inspect files, search documentation, run a command, revise a plan, or ask for help based on what it learns from the environment. The key loop is: decide, use a tool, read the result, update the plan, and continue until the task is done or blocked.

That distinction matters because "agent" is often used as a marketing word. A chatbot with a long prompt is not automatically an agent. A five-step prompt chain is useful, but it is still a workflow if the steps never change. A real agent needs the ability to respond to ground truth from the environment. For coding work, that means reading the repository, changing files, running tests, seeing failures, and adjusting. For a research pipeline, that means deciding which sources are missing, retrieving them, checking contradictions, and stopping when the evidence is strong enough.

MCP, or Model Context Protocol, is a standard way for AI applications to connect to outside systems. The MCP docs compare it to a universal port for AI apps. Instead of every AI client needing a custom integration for every app, MCP gives a common pattern for connecting to servers that expose useful capabilities. An MCP host is the AI application, such as Codex or Claude Desktop. The host creates MCP clients that connect to MCP servers. The servers provide context or actions from local files, databases, APIs, app state, or other services.

The three primitives I need to understand are tools, resources, and prompts. Tools are executable actions the model can call, such as reading a file, querying a database, listing projects, or calling an API. Resources are context the server can provide, such as file contents, database rows, schemas, or app records. Prompts are reusable templates that structure interactions, like a saved workflow prompt or a domain-specific review prompt. MCP also includes discovery, so the client can ask what a server supports before trying to use it.

My FL-04 pipeline is not an agent yet. It is a source-grounded study-notes workflow. I manually choose the input, paste it into Step 1, move the output to Step 2, and continue until the final notes are formatted. That is predictable and good for learning because it reduces hallucination and makes review easier. It also has clear human checkpoints: I verify commands, status codes, links, and unsupported claims.

To become an agent, the pipeline would need tool access plus decision-making authority inside safe limits. A concrete upgrade would be a "backend assignment study agent" connected to local files, web documentation, and the repo. Given a new assignment PDF or README, it would inspect the source, find related project files, read the current README, draft study notes, check whether commands exist in `package.json`, flag missing tests or screenshots, and create a submission checklist. It would not submit anything automatically. It would stop before risky actions like pushing, uploading, or changing secrets, and ask me to approve those steps.

The right upgrade is not "make it autonomous everywhere." The right upgrade is narrow: let it gather evidence and verify local project facts by itself, while I keep final judgment. That would turn the fixed FL-04 workflow into a controlled agent loop: inspect, plan, call tools, compare results, revise, and hand me a checked deliverable.

## What My FL-04 Workflow Would Need To Become An Agent

- File access to read new assignment documents and project READMEs.
- A source-reading tool for PDFs or web pages.
- Repo inspection tools to check package scripts, endpoints, screenshots, and docs.
- A verification loop that compares notes against source facts.
- Stop conditions: no uploads, no public posts, no secret changes, and no Git push without approval.
- A final human review checkpoint before submission.

## Required Human Review

- Check that tool outputs were interpreted correctly.
- Verify any command, URL, endpoint, or dependency before trusting the notes.
- Confirm screenshots and deliverables match the assignment portal requirements.
- Keep secrets and personal tokens out of any AI-readable prompt or committed file.
