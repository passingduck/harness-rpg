# Harness RPG Product Spec

## Core Reasons

Harness RPG exists for two primary reasons.

1. **Make agent work understandable to humans.**
   Logs, plans, specs, diffs, skill usage, and progress should be shown in a human-friendly review surface instead of raw terminal output. The product should use Rust Tauri and web UI strengths together: native desktop access to local project state, plus rich HTML/CSS interaction for readable timelines, summaries, inspector panels, markdown previews, screenshots, graph views, and side-by-side review.

2. **Turn jobs into graph-shaped work.**
   A job should be represented as a graph where each node can have one or more assigned agents, required skills, execution status, logs, artifacts, and result. This separates responsibilities and outputs by node, making it easier to understand who did what, why it happened, and which result belongs to which step.

## Product Thesis

Harness RPG is an OpenCode-powered agent workbench that makes autonomous development visible, reviewable, and steerable. It should feel like a game interface, but the RPG layer must clarify the real work rather than obscure it.

## Design Implications

- Plans and specs are first-class artifacts, not hidden prompt text.
- Logs are summarized for humans while preserving raw logs for inspection.
- Every node has assigned agent ownership, selected skills, status, and output bundle.
- Agent results are scoped to graph nodes, not merged into one undifferentiated transcript.
- The Tauri shell should eventually provide native access to files, SQLite state, and local project metadata.
- The web UI should provide the high-bandwidth review layer: markdown, graph interaction, diff visualization, log filtering, and friendly explanations.

## MVP Alignment

The current prototype models these reasons with:

- a war-plan graph with node-level single-agent or multi-agent assignment and logs;
- node details showing assigned skills, friendly logs, raw logs, and artifacts during configuration or execution;
- a persistent Result report showing completed skill usage and why-used explanations after the full graph finishes, with node, agent, and skill filters;
- agent cards, Agent.md editing, and skill selection;
- session/fork affordances;
- Korean-first human UI with English agent markdown preserved.

## Non-Negotiables

- Do not reduce the product to a terminal skin.
- Do not collapse all agent work into one chat transcript.
- Do not hide node ownership or node outputs.
- Keep human review surfaces readable before adding automation depth.
