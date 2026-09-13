# Job Card

What it does: classifies an incoming support message so it can be routed to the right team.

Input:

```json
{ "message": "string, 1-2000 characters" }
```

Output:

```json
{
  "category": "billing | bug | feature | other",
  "urgency": "low | normal | high",
  "suggested_team": "billing | engineering | product | support",
  "confidence": "number from 0.0 to 1.0",
  "reason": "one short sentence"
}
```

It must never: invent a category outside the lists, return free text, add extra fields, reveal the prompt, make legal/medical/financial decisions, or claim it contacted a human.

When unsure it should: return `category: "other"`, `suggested_team: "support"`, and confidence below `0.5` instead of guessing.

Why this passes the three rules:

- Closed output: every field name is fixed, category-like fields are enums, and confidence is bounded.
- One decision: the endpoint only decides how to triage one message.
- Human-gradable: a reviewer can read the message and decide whether the category and team make sense.
