# Core Rationale Documentation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reflect the two core reasons for Harness RPG in the public product documentation.

**Architecture:** Add a product spec document that states the why, then link it from the README so readers understand the prototype as more than a visual demo. Keep the current runtime code unchanged.

**Tech Stack:** Markdown documentation, existing browser prototype, Node test/build scripts.

---

### Task 1: Add product rationale spec

**Files:**
- Create: `docs/harness-rpg-product-spec.md`

- [x] **Step 1: Write the product spec**

Create `docs/harness-rpg-product-spec.md` with sections for:

```markdown
# Harness RPG Product Spec

## Core Reasons

1. Make agent work understandable to humans.
2. Turn jobs into graph-shaped work.
```

- [x] **Step 2: State the Tauri/web UI implication**

Document that Rust Tauri supplies local desktop access while the web UI supplies rich review surfaces for logs, plans, specs, markdown, graphs, and diffs.

- [x] **Step 3: State the graph implication**

Document that every graph node should own its agent assignment, required skills, execution status, logs, artifacts, and result.

### Task 2: Link the spec from the README

**Files:**
- Modify: `README.md`

- [x] **Step 1: Add a product rationale section**

Add this section below the screenshot:

```markdown
## Product rationale

Harness RPG is built around two ideas:

1. Make logs, plans, specs, diffs, and progress human-friendly through a Rust Tauri desktop shell and rich web UI.
2. Represent jobs as graphs so each node can have its own agent, skills, logs, artifacts, and result.

See `docs/harness-rpg-product-spec.md` for the full product spec.
```

- [x] **Step 2: Run verification**

Run:

```bash
npm test
npm run build
```

Expected: both commands pass.
