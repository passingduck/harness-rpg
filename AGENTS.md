# Harness RPG Agent Instructions

## LLM Wiki knowledge discipline

When working in this repository or in a target project launched through Harness RPG, agents must treat the LLM Wiki as durable project memory, not as decorative UI.

- Use the `llm-wiki` / wiki skill family whenever work discovers project knowledge that future agents should reuse.
- Store durable facts, decisions, file locations, graph/node outcomes, safety constraints, and unresolved gaps as markdown artifacts under the active project's `.harness-rpg/` workspace.
- Prefer node-scoped wiki artifacts: each graph node should leave behind what it learned, what changed, and how the next node should use it.
- Use wiki query/review skills before answering from memory when the answer depends on project-specific context.
- Use wiki lint/gap-detection skills to catch stale claims, missing links, orphan concepts, and assumptions that need follow-up.
- Keep agent-facing wiki markdown in English even when the human UI or conversation is Korean.
- Do not treat the LLM Wiki as automatically updated by magic. If a run learns something important, explicitly write or update the relevant wiki artifact and cite it in the node result.

## Expected Harness RPG flow

1. Read the active graph node markdown and assigned skills.
2. Query existing wiki/project artifacts before making project-specific claims.
3. Execute the node task.
4. Write node-scoped artifacts, including wiki updates when new reusable knowledge was learned.
5. Report the result with evidence: files changed, commands run, artifacts produced, and follow-up gaps.
