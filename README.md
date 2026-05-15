# Harness RPG

Retro pixel RPG prototype for an OpenCode-powered AI agent development workbench.

![Harness RPG home screen](docs/home.png)

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
- The graph runs `Start` and `wiki-make` with the default `wiki-maker` agent.
- Node details show friendly logs, raw OpenCode bridge events, artifacts, used skills, and why-used explanations.
- Destructive command nodes pause behind an approval gate.
- Sessions can be created and forked.
- The LLM Wiki surface visualizes `llm_wiki` concepts as a local-first RPG world map.

This first pass models OpenCode MCP/API bridge events locally. It does not call a foundation LLM or require provider keys.
