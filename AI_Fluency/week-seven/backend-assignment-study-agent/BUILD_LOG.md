# Build Log

## Iteration 1: Started Too Broad

Original idea: build the full agent from the FL-06 spec, including PDF reading, repo inspection, command execution, and submission checks.

What broke: that was too much for the first MVP. It would take longer than the checkpoint needs and make the first run harder to verify.

Change made: cut the first version down to one core loop: read source text, inspect a project folder, and write a report.

## Iteration 2: Chose File Access As The First Live Connection

Original idea: connect web lookup, Git checks, and file reading at once.

What broke: too many tools would make it unclear which connection proves the agent works.

Change made: used local files as the real data connection. The agent reads a source brief and inspects an actual backend project folder.

## Iteration 3: Avoided External Dependencies

Original idea: use a package for argument parsing or Markdown formatting.

What broke: dependencies would add install risk and distract from the agent loop.

Change made: wrote the MVP in plain Node.js with built-in modules only.

## Iteration 4: Made Output Auditable

Original idea: print a short answer to the terminal.

What broke: a short answer is hard to submit and hard to compare later.

Change made: the agent writes a Markdown report to `output/` and also prints the same report to the terminal for the raw run capture.

## Iteration 5: Fixed The Demo Project Path

Original idea: run the demo against `../../Backend_AI_Engineer/week_four`.

What broke: from the agent folder, that path pointed to the wrong location, so the first run inspected zero project files and falsely reported every project artifact as missing.

Change made: updated the demo path to `../../../Backend_AI_Engineer/week_four` and reran the agent until it inspected the real Week 4 project folder.

## Cut From FL-06 Spec

- PDF parsing: cut because the MVP uses a Markdown source file.
- Web lookup: cut because the first run should stay source-grounded.
- Automatic curl testing: cut because token-based auth testing can expose sensitive data and should stay human-reviewed for now.
- Git commit/push automation: cut because pushing is an irreversible external action and must remain user-controlled.
