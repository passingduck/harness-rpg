import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  assignSkillToAgent,
  startTutorialSession,
  forkSession,
  approveDestructiveNode,
  setLocale,
  updateAgentProfile,
  getGraphProgress,
  exportWorkspaceFiles,
  runGraphUntilBlocked,
  getWikiSkillPack,
  deserializeState,
  addWarPlanNode,
  removeWarPlanNode,
  assignAgentToNode,
  applyWarPlanSpec,
  updateNodeText,
  canRemoveWarPlanNode,
  moveWarPlanNode,
  swapWarPlanNodes,
  buildNodeWorkMarkdown,
  updateNodeWorkSection,
  addNodeWorkSection,
  removeNodeWorkSection,
  addPoolSkill,
  addPoolSkillTree,
  addPoolAgent,
  addPoolNode,
  addPoolGraph,
  assignPoolAgentToNode,
  togglePoolSkillForAgent,
  applyPoolSkillTreeToAgent,
  instantiatePoolNode,
  applyPoolGraph,
  removePoolSkill,
  buildGraphMarkdown,
  buildGraphNodeMarkdown,
  buildSkillUsageSummary,
} from '../app/app-model.mjs';

test('initial state exposes tutorial graph with wiki-make assigned to wiki-maker agent', () => {
  const state = createInitialState();
  const startNode = state.graph.nodes.find((node) => node.id === 'start');
  const wikiNode = state.graph.nodes.find((node) => node.id === 'wiki-make');

  assert.equal(state.locale, 'ko');
  assert.equal(state.project.path, '/home/sungjin/workspace/harness-rpg');
  assert.equal(startNode.agentId, 'planner-agent');
  assert.deepEqual(startNode.skills, ['ouroboros-plan']);
  assert.equal(wikiNode.agentId, 'wiki-maker');
  assert.deepEqual(wikiNode.skills, ['wiki-ingest-source', 'wiki-build-graph']);
});

test('setLocale toggles the human UI language without translating agent markdown', () => {
  const state = createInitialState();
  const english = setLocale(state, 'en');

  assert.equal(english.locale, 'en');
  assert.match(english.agents.find((agent) => agent.id === 'wiki-maker').agentMd, /^# Wiki Maker Agent/);
});

test('assignSkillToAgent toggles OpenCode skill markdown selections', () => {
  const state = createInitialState();
  const selected = assignSkillToAgent(state, 'wiki-maker', 'wiki-lint');
  const deselected = assignSkillToAgent(selected, 'wiki-maker', 'wiki-lint');

  assert.equal(selected.agents.find((agent) => agent.id === 'wiki-maker').selectedSkills.includes('wiki-lint'), true);
  assert.equal(deselected.agents.find((agent) => agent.id === 'wiki-maker').selectedSkills.includes('wiki-lint'), false);
});

test('initial state includes Karpathy and game UI reviewer agents with actionable feedback', () => {
  const state = createInitialState();
  const karpathy = state.agents.find((agent) => agent.id === 'karpathy-reviewer');
  const gameUx = state.agents.find((agent) => agent.id === 'game-ux-reviewer');

  assert.equal(karpathy.name, 'Andrej Karpathy Agent');
  assert.equal(gameUx.name, 'Game UI/UX Master Agent');
  assert.match(karpathy.agentMd, /^# Andrej Karpathy Agent/);
  assert.match(gameUx.agentMd, /^# Game UI\/UX Master Agent/);
  assert.ok(karpathy.feedback.some((item) => item.includes('persistent wiki')));
  assert.ok(gameUx.feedback.some((item) => item.includes('moment-to-moment')));
});

test('initial state includes a rigorous adversarial QA agent with precise critique', () => {
  const state = createInitialState();
  const adversary = state.agents.find((agent) => agent.id === 'adversarial-qa');

  assert.equal(adversary.name, 'Adversarial QA Agent');
  assert.equal(adversary.className, 'Hostile Precision Reviewer');
  assert.match(adversary.agentMd, /^# Adversarial QA Agent/);
  assert.ok(adversary.feedback.some((item) => item.includes('focus')));
  assert.ok(adversary.feedback.some((item) => item.includes('node add')));
});

test('initial state includes a responsive UI UX expert agent for breakpoint review', () => {
  const state = createInitialState();
  const responsive = state.agents.find((agent) => agent.id === 'responsive-ui-ux');

  assert.equal(responsive.name, 'Responsive UI/UX Expert Agent');
  assert.equal(responsive.className, 'Breakpoint Experience Specialist');
  assert.match(responsive.agentMd, /^# Responsive UI\/UX Expert Agent/);
  assert.ok(responsive.feedback.some((item) => item.includes('mobile')));
  assert.ok(responsive.feedback.some((item) => item.includes('breakpoint')));
});

test('initial state includes an optional Ouroboros planner agent and skill', () => {
  const state = createInitialState();
  const planner = state.agents.find((agent) => agent.id === 'planner-agent');
  const skill = state.skills.find((skill) => skill.id === 'ouroboros-plan');

  assert.equal(planner.name, 'Ouroboros Planner Agent');
  assert.deepEqual(planner.selectedSkills, ['ouroboros-plan']);
  assert.match(planner.agentMd, /^# Ouroboros Planner Agent/);
  assert.equal(skill.name, 'Ouroboros Plan');
  assert.match(skill.markdown, /^# ouroboros-plan/);
});

test('addWarPlanNode appends an editable node owned by the active agent', () => {
  const state = createInitialState();
  const updated = addWarPlanNode(state);
  const added = updated.graph.nodes.at(-1);

  assert.equal(updated.graph.nodes.length, state.graph.nodes.length + 1);
  assert.equal(added.title, 'Custom Node 1');
  assert.equal(added.agentId, 'wiki-maker');
  assert.equal(added.status, 'idle');
  assert.deepEqual(updated.graph.edges.at(-1), ['session-plan', added.id]);
  assert.equal(updated.selectedNodeId, added.id);
});

test('removeWarPlanNode removes selected editable nodes and their edges', () => {
  const state = addWarPlanNode(createInitialState());
  const addedId = state.selectedNodeId;
  const removed = removeWarPlanNode(state, addedId);

  assert.equal(removed.graph.nodes.some((node) => node.id === addedId), false);
  assert.equal(removed.graph.edges.some((edge) => edge.includes(addedId)), false);
  assert.equal(removed.selectedNodeId, 'session-plan');
});

test('removeWarPlanNode keeps the protected start node', () => {
  const state = createInitialState();
  const removed = removeWarPlanNode(state, 'start');

  assert.equal(removed.graph.nodes.length, state.graph.nodes.length);
  assert.equal(removed.graph.nodes.some((node) => node.id === 'start'), true);
});

test('startTutorialSession completes automatic nodes and blocks destructive command for approval', () => {
  const state = createInitialState();
  const running = startTutorialSession(state);
  const wikiMaker = running.agents.find((agent) => agent.id === 'wiki-maker');
  const planner = running.agents.find((agent) => agent.id === 'planner-agent');

  assert.equal(running.graph.nodes.find((node) => node.id === 'start').status, 'completed');
  assert.equal(running.graph.nodes.find((node) => node.id === 'wiki-make').status, 'completed');
  assert.equal(running.graph.nodes.find((node) => node.id === 'destructive-check').status, 'approval_required');
  assert.equal(running.selectedNodeId, 'destructive-check');
  assert.match(running.graph.nodes.find((node) => node.id === 'start').logs.friendly, /planner-agent agent/);
  assert.match(running.graph.nodes.find((node) => node.id === 'wiki-make').logs.friendly, /wiki-maker agent/);
  assert.equal(planner.xp, 1);
  assert.equal(wikiMaker.xp, 2);
  assert.equal(wikiMaker.level, 1);
});

test('planner start node still auto-plans when the planner agent is missing', () => {
  const state = createInitialState();
  const withoutPlanner = {
    ...state,
    agents: state.agents.filter((agent) => agent.id !== 'planner-agent'),
  };
  const running = runGraphUntilBlocked(withoutPlanner);

  assert.equal(running.graph.nodes.find((node) => node.id === 'start').status, 'completed');
  assert.deepEqual(running.bridgeEvents[0], {
    type: 'node.completed',
    nodeId: 'start',
    agentId: 'auto-planner',
    skills: ['ouroboros-plan'],
  });
  assert.match(running.graph.nodes.find((node) => node.id === 'start').logs.friendly, /auto-planner agent/);
});

test('addWarPlanNode uses the next unused custom node id after removals', () => {
  let state = addWarPlanNode(createInitialState());
  state = addWarPlanNode(state);
  state = removeWarPlanNode(state, 'custom-node-1');
  state = addWarPlanNode(state);

  assert.deepEqual(state.graph.nodes.filter((node) => node.id.startsWith('custom-node-')).map((node) => node.id), [
    'custom-node-2',
    'custom-node-3',
  ]);
});

test('removeWarPlanNode keeps built-in tutorial nodes protected', () => {
  const state = addWarPlanNode(createInitialState());
  const removed = removeWarPlanNode(state, 'wiki-make');

  assert.equal(removed.graph.nodes.length, state.graph.nodes.length);
  assert.equal(removed.graph.nodes.some((node) => node.id === 'wiki-make'), true);
});

test('moveWarPlanNode stores graph coordinates for dragged nodes', () => {
  const moved = moveWarPlanNode(createInitialState(), 'wiki-make', { x: 222, y: 111 });
  const node = moved.graph.nodes.find((item) => item.id === 'wiki-make');

  assert.deepEqual(node.position, { x: 222, y: 111 });
  assert.equal(moved.selectedNodeId, 'wiki-make');
});

test('swapWarPlanNodes exchanges graph order and positions on hover drop', () => {
  const positioned = moveWarPlanNode(moveWarPlanNode(createInitialState(), 'wiki-make', { x: 10, y: 20 }), 'session-plan', { x: 600, y: 200 });
  const swapped = swapWarPlanNodes(positioned, 'wiki-make', 'session-plan');

  assert.deepEqual(swapped.graph.nodes.map((node) => node.id), ['start', 'session-plan', 'skill-attune', 'destructive-check', 'wiki-make']);
  assert.deepEqual(swapped.graph.nodes.find((node) => node.id === 'wiki-make').position, { x: 600, y: 200 });
  assert.deepEqual(swapped.graph.nodes.find((node) => node.id === 'session-plan').position, { x: 10, y: 20 });
  assert.equal(swapped.selectedNodeId, 'wiki-make');
});

test('assignAgentToNode changes a node owner and refreshes its review spec', () => {
  const state = createInitialState();
  const updated = assignAgentToNode(state, 'wiki-make', 'adversarial-qa');
  const node = updated.graph.nodes.find((item) => item.id === 'wiki-make');

  assert.equal(node.agentId, 'adversarial-qa');
  assert.match(node.review.spec, /Agent adversarial-qa owns this graph node/);
});

test('assignAgentToNode ignores unknown agent ids', () => {
  const state = createInitialState();
  const changedMissing = assignAgentToNode(state, 'wiki-make', 'missing-agent');

  assert.equal(changedMissing.graph.nodes.find((node) => node.id === 'wiki-make').agentId, 'wiki-maker');
});

test('node work sections are customizable and pack into AI-ready markdown', () => {
  const state = createInitialState();
  const node = state.graph.nodes.find((item) => item.id === 'wiki-make');

  assert.deepEqual(node.workSections.map((section) => section.label), ['Goal', 'Purpose', 'Deliverable', 'Verification']);

  const withGoal = updateNodeWorkSection(state, 'wiki-make', 'goal', { body: 'Build the repo knowledge map.' });
  const withCustom = addNodeWorkSection(withGoal, 'wiki-make');
  const customSection = withCustom.graph.nodes.find((item) => item.id === 'wiki-make').workSections.at(-1);
  const renamed = updateNodeWorkSection(withCustom, 'wiki-make', customSection.id, { label: 'Risks', body: 'Watch for stale wiki claims.' });
  const removed = removeNodeWorkSection(renamed, 'wiki-make', 'purpose');
  const markdown = buildNodeWorkMarkdown(removed, 'wiki-make');

  assert.equal(removed.graph.nodes.find((item) => item.id === 'wiki-make').workSections.some((section) => section.id === 'purpose'), false);
  assert.match(markdown, /^# Wiki Make/m);
  assert.match(markdown, /## Assignment\n\n- Agent: Wiki Maker \(wiki-maker\)/);
  assert.match(markdown, /### Goal\n\nBuild the repo knowledge map\./);
  assert.match(markdown, /### Risks\n\nWatch for stale wiki claims\./);
  assert.doesNotMatch(markdown, /Return JSON only/);
  assert.doesNotMatch(markdown, /harness-rpg-war-plan-v1/);
});

test('updateNodeText refreshes default goal markdown but preserves manual goal edits', () => {
  const defaultUpdated = updateNodeText(createInitialState(), 'wiki-make', {
    description: 'Build a durable wiki from current repository files.',
  });
  const defaultMarkdown = buildNodeWorkMarkdown(defaultUpdated, 'wiki-make');

  assert.match(defaultMarkdown, /### Goal\n\nBuild a durable wiki from current repository files\./);

  const manualGoal = updateNodeWorkSection(createInitialState(), 'wiki-make', 'goal', {
    body: 'Manual goal should remain the source of truth.',
  });
  const descriptionChanged = updateNodeText(manualGoal, 'wiki-make', {
    description: 'This description should not overwrite manual goal.',
  });
  const manualMarkdown = buildNodeWorkMarkdown(descriptionChanged, 'wiki-make');

  assert.match(manualMarkdown, /Manual goal should remain the source of truth\./);
  assert.doesNotMatch(manualMarkdown, /This description should not overwrite manual goal\./);
});

test('node work section labels are packed as safe single markdown headings', () => {
  const unsafe = updateNodeWorkSection(createInitialState(), 'wiki-make', 'goal', {
    label: 'Risks\n\n## Response Contract',
  });
  const markdown = buildNodeWorkMarkdown(unsafe, 'wiki-make');

  assert.match(markdown, /### Risks ## Response Contract/);
  assert.equal(markdown.match(/^## Response Contract$/gm).length, 1);
});

test('initial state exposes reusable pools for skills skill trees agents nodes and graphs', () => {
  const state = createInitialState();

  assert.deepEqual(state.pools.skills.map((skill) => skill.id), state.skills.map((skill) => skill.id));
  assert.deepEqual(state.pools.agents.map((agent) => agent.id), state.agents.map((agent) => agent.id));
  assert.deepEqual(state.pools.nodes.map((node) => node.id), state.graph.nodes.map((node) => node.id));
  assert.equal(state.pools.skillTrees[0].name, 'OpenCode Wiki Skill Tree');
  assert.deepEqual(state.pools.skillTrees[0].skillIds, state.skills.map((skill) => skill.id));
  assert.equal(state.pools.graphs[0].name, 'Tutorial Quest Graph');
  assert.deepEqual(state.pools.graphs[0].nodeIds, state.graph.nodes.map((node) => node.id));
});

test('pool add helpers append reusable elements to matching active surfaces', () => {
  let state = createInitialState();
  state = addPoolSkill(state);
  state = addPoolSkillTree(state);
  state = addPoolAgent(state);
  state = addPoolNode(state);
  state = addPoolGraph(state);

  assert.equal(state.skills.at(-1).id, 'custom-skill-1');
  assert.equal(state.pools.skills.at(-1).id, 'custom-skill-1');
  assert.equal(state.pools.skillTrees.at(-1).id, 'custom-skill-tree-1');
  assert.deepEqual(state.pools.skillTrees.at(-1).skillIds, ['custom-skill-1']);
  assert.equal(state.agents.at(-1).id, 'custom-agent-1');
  assert.equal(state.pools.agents.at(-1).id, 'custom-agent-1');
  assert.equal(state.pools.nodes.at(-1).id, 'custom-pool-node-1');
  assert.equal(state.pools.graphs.at(-1).id, 'custom-graph-1');
  assert.deepEqual(state.pools.graphs.at(-1).nodeIds, state.graph.nodes.map((node) => node.id));
});

test('marketplace pool actions apply agents skills node templates and graph templates', () => {
  let state = createInitialState();
  state = assignPoolAgentToNode(state, 'wiki-make', 'forge-master');
  state = togglePoolSkillForAgent(state, 'forge-master', 'wiki-lint', 'wiki-make');
  state = applyPoolSkillTreeToAgent(state, 'forge-master', 'opencode-wiki-skill-tree', 'wiki-make');
  state = addPoolNode(state);
  const nodeTemplateId = state.pools.nodes.at(-1).id;
  state = instantiatePoolNode(state, nodeTemplateId);
  state = addPoolGraph(state);
  const graphTemplateId = state.pools.graphs.at(-1).id;
  state = applyPoolGraph(state, graphTemplateId);

  assert.equal(state.graph.nodes.find((node) => node.id === 'wiki-make').agentId, 'forge-master');
  assert.equal(state.graph.nodes.find((node) => node.id === 'wiki-make').skills.includes('wiki-lint'), true);
  assert.equal(state.agents.find((agent) => agent.id === 'forge-master').selectedSkills.includes('wiki-lint'), true);
  assert.equal(state.agents.find((agent) => agent.id === 'forge-master').selectedSkills.includes('wiki-detect-gaps'), true);
  assert.equal(state.graph.nodes.find((node) => node.id === 'wiki-make').skills.includes('wiki-detect-gaps'), true);
  assert.equal(state.graph.nodes.some((node) => node.id === nodeTemplateId), true);
  assert.equal(state.selectedNodeId, nodeTemplateId);
  assert.deepEqual(state.graph.edges, state.pools.graphs.find((graph) => graph.id === graphTemplateId).edges);
});

test('removePoolSkill deletes the skill from pool active surfaces assignments and exports', () => {
  let state = createInitialState();
  state = addPoolSkill(state);
  const skillId = state.skills.at(-1).id;
  state = togglePoolSkillForAgent(state, 'wiki-maker', skillId);
  state = applyWarPlanSpec(state, {
    nodes: [{ id: 'skill-delete-check', title: 'Skill Delete Check', description: 'Uses removable skill.', agentId: 'wiki-maker', skills: [skillId] }],
    edges: [['session-plan', 'skill-delete-check']],
  });

  const removed = removePoolSkill(state, skillId);
  const files = exportWorkspaceFiles(removed);

  assert.equal(removed.skills.some((skill) => skill.id === skillId), false);
  assert.equal(removed.pools.skills.some((skill) => skill.id === skillId), false);
  assert.equal(removed.agents.some((agent) => agent.selectedSkills.includes(skillId)), false);
  assert.equal(removed.graph.nodes.some((node) => node.skills.includes(skillId)), false);
  assert.equal(removed.pools.skillTrees.some((tree) => tree.skillIds.includes(skillId)), false);
  assert.equal(files[`.harness-rpg/skills/${skillId}.md`], undefined);
});

test('graph markdown exports the visible front-end graph and node files for agents', () => {
  const state = createInitialState();
  const graphMarkdown = buildGraphMarkdown(state);
  const startMarkdown = buildGraphNodeMarkdown(state, 'start', 0);
  const files = exportWorkspaceFiles(state);

  assert.match(graphMarkdown, /^# Harness RPG Visible Graph/m);
  assert.match(graphMarkdown, /start --> wiki-make/);
  assert.match(graphMarkdown, /## Nodes/);
  assert.match(startMarkdown, /^# Start/m);
  assert.match(startMarkdown, /> Front-end graph node: 01_START_NODE/m);
  assert.match(startMarkdown, /## Work Brief/);
  assert.equal(files['.harness-rpg/graphs/current/GRAPH.md'], `${graphMarkdown}\n`);
  assert.equal(files['.harness-rpg/graphs/current/01_START_NODE.md'], `${startMarkdown}\n`);
});

test('skill usage summary explains which skills an agent used and why', () => {
  const running = startTutorialSession(createInitialState());
  const wikiUsage = buildSkillUsageSummary(running, 'wiki-make');
  const plannerUsage = buildSkillUsageSummary(running, 'start');

  assert.deepEqual(wikiUsage.map((entry) => entry.skillId), ['wiki-ingest-source', 'wiki-build-graph']);
  assert.equal(wikiUsage[0].agentName, 'Wiki Maker');
  assert.match(wikiUsage[0].reason, /project files/i);
  assert.match(wikiUsage[1].reason, /graph/i);
  assert.equal(plannerUsage[0].skillName, 'Ouroboros Plan');
  assert.match(plannerUsage[0].reason, /execution-ready plan/i);
});

test('applyWarPlanSpec updates graph nodes and preserves protected system nodes', () => {
  const state = createInitialState();
  const updated = applyWarPlanSpec(state, {
    protocol: 'harness-rpg-war-plan-v1',
    nodes: [
      { id: 'start', title: 'Rewritten Start', description: 'Should stay protected.', agentId: 'adversarial-qa' },
      { id: 'wiki-make', title: 'Map Product Lore', description: 'Ask Ouroboros for repo-aware wiki tasks.', agentId: 'responsive-ui-ux', skills: ['wiki-query'] },
      { id: 'responsive-review', title: 'Responsive Review', description: 'Check every breakpoint.', agentId: 'responsive-ui-ux', skills: ['wiki-review-actions'] },
    ],
    edges: [
      ['start', 'wiki-make'],
      ['wiki-make', 'responsive-review'],
    ],
  });

  assert.equal(updated.graph.nodes.find((node) => node.id === 'start').title, 'Start');
  assert.equal(updated.graph.nodes.find((node) => node.id === 'start').agentId, 'planner-agent');
  assert.equal(updated.graph.nodes.find((node) => node.id === 'wiki-make').title, 'Map Product Lore');
  assert.equal(updated.graph.nodes.find((node) => node.id === 'wiki-make').agentId, 'responsive-ui-ux');
  assert.equal(updated.graph.nodes.find((node) => node.id === 'responsive-review').description, 'Check every breakpoint.');
  assert.deepEqual(updated.graph.edges.at(-1), ['wiki-make', 'responsive-review']);
  assert.equal(updated.selectedNodeId, 'responsive-review');
});

test('applyWarPlanSpec normalizes object edges and rejects malformed nodes', () => {
  const updated = applyWarPlanSpec(createInitialState(), {
    protocol: 'harness-rpg-war-plan-v1',
    nodes: [
      { id: 'valid-import', title: 'Valid Import', description: 'Allowed node.', agentId: 'forge-master', skills: ['wiki-query', 'missing-skill'] },
      { id: 'valid-import', title: 'Duplicate Import', description: 'Should be ignored.', agentId: 'forge-master' },
      { id: '../bad', title: 'Bad Import', description: 'Should be rejected.', agentId: 'forge-master' },
    ],
    edges: [
      { fromNodeId: 'wiki-make', toNodeId: 'valid-import' },
      ['valid-import', 'missing-node'],
    ],
  });

  const imported = updated.graph.nodes.find((node) => node.id === 'valid-import');
  assert.equal(imported.title, 'Valid Import');
  assert.deepEqual(imported.skills, ['wiki-query']);
  assert.equal(updated.graph.nodes.filter((node) => node.id === 'valid-import').length, 1);
  assert.equal(updated.graph.nodes.some((node) => node.id === '../bad'), false);
  assert.deepEqual(updated.graph.edges, [['wiki-make', 'valid-import']]);
});

test('removeWarPlanNode removes imported nodes but keeps built-in tutorial nodes', () => {
  const imported = applyWarPlanSpec(createInitialState(), {
    nodes: [{ id: 'imported-node', title: 'Imported Node', description: 'Can be removed.', agentId: 'forge-master' }],
    edges: [['session-plan', 'imported-node']],
  });

  assert.equal(canRemoveWarPlanNode(imported, 'wiki-make'), false);
  assert.equal(canRemoveWarPlanNode(imported, 'imported-node'), true);
  const removed = removeWarPlanNode(imported, 'imported-node');
  assert.equal(removed.graph.nodes.some((node) => node.id === 'imported-node'), false);
  assert.equal(removed.graph.edges.some((edge) => edge.includes('imported-node')), false);
});

test('updateNodeText changes title and description while keeping node ownership and review data', () => {
  const state = createInitialState();
  const updated = updateNodeText(state, 'wiki-make', {
    title: 'Repo Wiki Plan',
    description: 'Turn the current repo into graph-shaped wiki work.',
  });
  const node = updated.graph.nodes.find((item) => item.id === 'wiki-make');

  assert.equal(node.title, 'Repo Wiki Plan');
  assert.equal(node.description, 'Turn the current repo into graph-shaped wiki work.');
  assert.equal(node.agentId, 'wiki-maker');
  assert.deepEqual(node.skills, ['wiki-ingest-source', 'wiki-build-graph']);
  assert.match(node.review.plan, /Turn the current repo into graph-shaped wiki work/);
  assert.match(node.review.spec, /Agent wiki-maker owns this graph node/);
});

test('getGraphProgress reports total graph completion percent', () => {
  const initial = getGraphProgress(createInitialState());
  const running = getGraphProgress(startTutorialSession(createInitialState()));
  const approved = getGraphProgress(approveDestructiveNode(startTutorialSession(createInitialState()), 'destructive-check'));

  assert.deepEqual(initial, { completed: 0, total: 5, percent: 0 });
  assert.deepEqual(running, { completed: 3, total: 5, percent: 60 });
  assert.deepEqual(approved, { completed: 5, total: 5, percent: 100 });
});

test('initial state declares the local-first Tauri backend contract', () => {
  const state = createInitialState();

  assert.equal(state.backend.shell, 'Tauri Rust command bridge');
  assert.equal(state.backend.database, '.harness-rpg/harness.sqlite');
  assert.equal(state.backend.fileState, '.harness-rpg/state.json');
  assert.equal(state.backend.bridge.mode, 'OpenCode MCP/API');
});

test('deserializeState migrates older saved browser state with backend defaults', () => {
  const legacy = createInitialState();
  delete legacy.backend;
  delete legacy.bridgeEvents;

  const migrated = deserializeState(JSON.stringify(legacy));

  assert.equal(migrated.backend.fileState, '.harness-rpg/state.json');
  assert.deepEqual(migrated.bridgeEvents, []);
});

test('deserializeState preserves a deliberately removed planner agent for auto-planner fallback', () => {
  const saved = createInitialState();
  saved.agents = saved.agents.filter((agent) => agent.id !== 'planner-agent');

  const migrated = deserializeState(JSON.stringify(saved));
  const running = runGraphUntilBlocked(migrated);

  assert.equal(migrated.agents.some((agent) => agent.id === 'planner-agent'), false);
  assert.equal(running.bridgeEvents[0].agentId, 'auto-planner');
});

test('exportWorkspaceFiles emits file-backed Agent.md, skills, and state paths', () => {
  const files = exportWorkspaceFiles(createInitialState());

  assert.match(files['.harness-rpg/agents/planner-agent/AGENT.md'], /^# Ouroboros Planner Agent/);
  assert.match(files['.harness-rpg/agents/wiki-maker/AGENT.md'], /^# Wiki Maker Agent/);
  assert.match(files['.harness-rpg/skills/ouroboros-plan.md'], /^# ouroboros-plan/);
  assert.match(files['.harness-rpg/skills/wiki-ingest-source.md'], /^# wiki-ingest-source/);
  assert.match(files['.harness-rpg/nodes/wiki-make/work.md'], /^# Wiki Make/);
  assert.equal(files['.harness-rpg/specs/ouroboros-war-plan-protocol.json'], undefined);
  assert.match(files['.harness-rpg/state.json'], /"activeSessionId": "session-001"/);
});

test('runGraphUntilBlocked executes nodes through the OpenCode bridge until approval is required', () => {
  const running = runGraphUntilBlocked(createInitialState());

  assert.match(running.graph.nodes.find((node) => node.id === 'start').logs.why, /execution-ready plan/);
  assert.equal(running.graph.nodes.find((node) => node.id === 'wiki-make').status, 'completed');
  assert.equal(running.graph.nodes.find((node) => node.id === 'destructive-check').status, 'approval_required');
  assert.equal(running.bridgeEvents.length, 4);
  assert.deepEqual(running.bridgeEvents.at(-1), {
    type: 'approval.required',
    nodeId: 'destructive-check',
    agentId: 'gate-warden',
    skills: ['wiki-lint'],
  });
});

test('approving the destructive node continues the graph executor to completion', () => {
  const approved = approveDestructiveNode(runGraphUntilBlocked(createInitialState()), 'destructive-check');

  assert.equal(approved.graph.nodes.find((node) => node.id === 'session-plan').status, 'completed');
  assert.equal(approved.bridgeEvents.at(-1).nodeId, 'session-plan');
  assert.equal(getGraphProgress(approved).percent, 100);
});

test('approveDestructiveNode pauses again at the next destructive imported node', () => {
  const imported = applyWarPlanSpec(createInitialState(), {
    nodes: [{ id: 'second-gate', title: 'Second Gate', description: 'Needs its own approval.', agentId: 'gate-warden', skills: ['wiki-lint'], destructive: true }],
    edges: [['session-plan', 'second-gate']],
  });
  const running = startTutorialSession(imported);
  const approved = approveDestructiveNode(running, 'destructive-check');

  assert.equal(approved.graph.nodes.find((node) => node.id === 'second-gate').status, 'approval_required');
  assert.equal(approved.selectedNodeId, 'second-gate');
});

test('getWikiSkillPack exposes llm_wiki concepts as host-agent skills', () => {
  const pack = getWikiSkillPack(createInitialState());

  assert.deepEqual(pack.map((skill) => skill.id), [
    'ouroboros-plan',
    'wiki-ingest-source',
    'wiki-query',
    'wiki-lint',
    'wiki-build-graph',
    'wiki-detect-gaps',
    'wiki-deep-research',
    'wiki-review-actions',
    'wiki-enrich-wikilinks',
  ]);
  assert.ok(pack.every((skill) => skill.markdown.startsWith('# ')));
});

test('initial graph nodes expose separated review artifacts for human inspection', () => {
  const state = createInitialState();
  const wikiNode = state.graph.nodes.find((node) => node.id === 'wiki-make');

  assert.deepEqual(Object.keys(wikiNode.review), ['plan', 'spec', 'log', 'diff', 'result']);
  assert.match(wikiNode.review.plan, /Plan:/);
  assert.match(wikiNode.review.spec, /Spec:/);
  assert.match(wikiNode.review.log, /Log:/);
  assert.match(wikiNode.review.diff, /Diff:/);
  assert.match(wikiNode.review.result, /Result:/);
});

test('completed nodes expose a human-friendly review summary', () => {
  const state = startTutorialSession(createInitialState());
  const wikiNode = state.graph.nodes.find((node) => node.id === 'wiki-make');

  assert.match(wikiNode.review.summary, /Wiki Make completed/);
  assert.match(wikiNode.review.result, /completed by wiki-maker agent/);
  assert.match(wikiNode.review.diff, /wiki\/index\.md/);
});

test('review artifacts stay scoped to the selected graph node', () => {
  const state = startTutorialSession(createInitialState());
  const wikiNode = state.graph.nodes.find((node) => node.id === 'wiki-make');
  const skillNode = state.graph.nodes.find((node) => node.id === 'skill-attune');

  assert.match(wikiNode.review.plan, /Create the first project knowledge map/);
  assert.match(skillNode.review.plan, /Bind OpenCode skills to the agent party/);
  assert.notEqual(wikiNode.review.plan, skillNode.review.plan);
  assert.notEqual(wikiNode.review.result, skillNode.review.result);
});

test('approveDestructiveNode completes the gated destructive command node', () => {
  const state = startTutorialSession(createInitialState());
  const approved = approveDestructiveNode(state, 'destructive-check');
  const gateWarden = approved.agents.find((agent) => agent.id === 'gate-warden');

  assert.equal(approved.graph.nodes.find((node) => node.id === 'destructive-check').status, 'completed');
  assert.equal(gateWarden.xp, 1);
});

test('agent levels up for every 10 cleared nodes and keeps excess experience progress', () => {
  let state = createInitialState();
  for (let i = 0; i < 10; i++) {
    state = approveDestructiveNode(state, 'destructive-check');
  }

  const gateWarden = state.agents.find((agent) => agent.id === 'gate-warden');
  assert.equal(gateWarden.level, 2);
  assert.equal(gateWarden.xp, 0);
});

test('updateAgentProfile changes visible name and profile image while leaving Agent.md English', () => {
  const state = createInitialState();
  const updated = updateAgentProfile(state, 'wiki-maker', {
    name: '문서마법사',
    profileImage: 'https://example.test/wiki-maker.png',
  });
  const agent = updated.agents.find((item) => item.id === 'wiki-maker');

  assert.equal(agent.name, '문서마법사');
  assert.equal(agent.profileImage, 'https://example.test/wiki-maker.png');
  assert.match(agent.agentMd, /^# Wiki Maker Agent/);
});

test('forkSession creates an independent fork with source lineage', () => {
  const state = startTutorialSession(createInitialState());
  const forked = forkSession(state, 'session-001');
  const fork = forked.sessions.find((session) => session.parentId === 'session-001');

  assert.ok(fork.id.startsWith('session-001-fork-'));
  assert.equal(fork.status, 'forked');
});
