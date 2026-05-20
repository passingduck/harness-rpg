# Harness RPG

Retro pixel RPG prototype for an OpenCode-powered AI agent development workbench.

![Harness RPG home screen](docs/home.png)

## Product rationale

Harness RPG is built around two ideas:

1. Make logs, plans, specs, diffs, skill usage, and progress human-friendly through a Rust Tauri desktop shell and rich web UI.
2. Represent jobs as graphs so each node can have one or more assigned agents, skills, logs, artifacts, and result.

See `docs/harness-rpg-product-spec.md` for the full product spec.

## Run

```bash
npm install
npm start
```

Open <http://localhost:4173>.

## Verify

```bash
npm test
npm run build
```

## Implemented prototype flow

- Open/select the local project workspace.
- View agents as 2-head-tall RPG character cards.
- Edit `Agent.md`-style markdown in the agent inspector.
- Select existing OpenCode-style markdown skills in the RPG skill tree.
- Start the tutorial war-plan graph.
- The graph runs `Start` and `wiki-make` with default assigned agents, and nodes can be configured with multiple static agents.
- Node details show assigned agents, assigned skills, friendly logs, raw OpenCode bridge events, and artifacts while work is being configured or running.
- The Result tab stores the completed war-plan report, including which skills were actually used and why, after the graph finishes; skill usage can be filtered by node, agent, and skill.
- Destructive command nodes pause behind an approval gate.
- Sessions can be created and forked.
- The LLM Wiki surface visualizes `llm_wiki` concepts as a local-first RPG world map.

This first pass models OpenCode MCP/API bridge events locally. It does not call a foundation LLM or require provider keys.
