const PROJECT_PATH = '/home/sungjin/workspace/harness-rpg';

const backendDefaults = {
  shell: 'Tauri Rust command bridge',
  database: '.harness-rpg/harness.sqlite',
  fileState: '.harness-rpg/state.json',
  agentsDir: '.harness-rpg/agents',
  skillsDir: '.harness-rpg/skills',
  bridge: {
    mode: 'OpenCode MCP/API',
    fallback: 'filesystem event log',
  },
};

const protectedWarPlanNodeIds = new Set(['start', 'wiki-make', 'skill-attune', 'destructive-check', 'session-plan']);
const nodeIdPattern = /^[a-zA-Z0-9_-]{1,64}$/;
const maxImportedNodes = 30;
const maxNodeTitleLength = 80;
const maxNodeDescriptionLength = 500;
const maxWorkSections = 12;

export const wikiSkills = [
  {
    id: 'ouroboros-plan',
    name: 'Ouroboros Plan',
    branch: 'Planning',
    markdown: '# ouroboros-plan\n\nTurn a user goal and node work sections into a concise execution plan with clear deliverables, constraints, and verification steps.',
  },
  {
    id: 'wiki-ingest-source',
    name: 'Wiki Ingest Source',
    branch: 'Lorecraft',
    markdown: '# wiki-ingest-source\n\nRead source files and update the persistent project wiki.',
  },
  {
    id: 'wiki-query',
    name: 'Wiki Query',
    branch: 'Oracle',
    markdown: '# wiki-query\n\nAnswer questions from indexed wiki context with citations.',
  },
  {
    id: 'wiki-lint',
    name: 'Wiki Lint',
    branch: 'Ward',
    markdown: '# wiki-lint\n\nDetect orphan pages, stale claims, contradictions, and missing links.',
  },
  {
    id: 'wiki-build-graph',
    name: 'Wiki Build Graph',
    branch: 'Cartography',
    markdown: '# wiki-build-graph\n\nBuild nodes, edges, communities, and relevance weights from markdown wikilinks.',
  },
  {
    id: 'wiki-detect-gaps',
    name: 'Wiki Detect Gaps',
    branch: 'Scout',
    markdown: '# wiki-detect-gaps\n\nDetect isolated nodes, sparse communities, bridge nodes, and research targets.',
  },
  {
    id: 'wiki-deep-research',
    name: 'Wiki Deep Research',
    branch: 'Quest',
    markdown: '# wiki-deep-research\n\nExpand knowledge gaps into research pages through host-agent tools.',
  },
  {
    id: 'wiki-review-actions',
    name: 'Wiki Review Actions',
    branch: 'Guild',
    markdown: '# wiki-review-actions\n\nResolve review queue items as create page, deep research, or skip.',
  },
  {
    id: 'wiki-enrich-wikilinks',
    name: 'Wiki Enrich Wikilinks',
    branch: 'Runes',
    markdown: '# wiki-enrich-wikilinks\n\nPatch markdown with stronger [[wikilink]] relationships.',
  },
];

export function createInitialState() {
  const initialState = {
    project: {
      name: 'harness-rpg',
      path: PROJECT_PATH,
      stateDir: '.harness-rpg/',
      bridge: 'OpenCode MCP/API bridge',
    },
    backend: backendDefaults,
    bridgeEvents: [],
    resultReports: [],
    locale: 'ko',
    agents: [
      {
        id: 'planner-agent',
        name: 'Ouroboros Planner Agent',
        className: 'Goal-to-Plan Weaver',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['ouroboros-plan'],
        agentMd: '# Ouroboros Planner Agent\n\nTurns user-friendly node work sections into an execution-ready plan before implementation begins.\n\n- Read the node work brief as the source of truth\n- Convert fuzzy goals into ordered steps\n- Keep verification explicit and practical',
        feedback: [
          'Planning should be a default capability, not a protocol panel the user has to understand.',
          'Each node needs a human-editable brief that can be packed into clean agent markdown.',
          'If this planner is removed, the Start node should still fall back to automatic planning behavior.',
        ],
      },
      {
        id: 'wiki-maker',
        name: 'Wiki Maker',
        className: 'Lore Cartographer',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-ingest-source', 'wiki-build-graph'],
        agentMd: '# Wiki Maker Agent\n\nMaintains project knowledge as OpenCode-compatible markdown skills.\n\n- Reads project files\n- Builds wiki graph\n- Emits host-agent bridge events',
      },
      {
        id: 'forge-master',
        name: 'Forge Master',
        className: 'Implementation Smith',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-query'],
        agentMd: '# Forge Master Agent\n\nTurns approved graph nodes into implementation patches.',
      },
      {
        id: 'gate-warden',
        name: 'Gate Warden',
        className: 'Destructive Command Guard',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-lint'],
        agentMd: '# Gate Warden Agent\n\nStops destructive command nodes until the user approves.',
      },
      {
        id: 'karpathy-reviewer',
        name: 'Andrej Karpathy Agent',
        className: 'Knowledge Systems Reviewer',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-query', 'wiki-detect-gaps'],
        agentMd: '# Andrej Karpathy Agent\n\nReviews the app through the lens of agent-native knowledge systems, durable artifacts, simple abstractions, and compounding workflows.\n\n- Keep markdown as the substrate\n- Prefer persistent wiki artifacts over ephemeral chat\n- Make agent actions inspectable and replayable',
        feedback: [
          'The strongest idea is treating the persistent wiki as a compiled artifact, not a chat transcript.',
          'Make every agent action leave a small, inspectable trail: source, diff, rationale, and next action.',
          'Avoid hiding the OpenCode bridge behind fantasy language; keep the mental model simple and agent-native.',
        ],
      },
      {
        id: 'game-ux-reviewer',
        name: 'Game UI/UX Master Agent',
        className: 'RPG Experience Director',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-review-actions', 'wiki-enrich-wikilinks'],
        agentMd: '# Game UI/UX Master Agent\n\nReviews the app as a moment-to-moment game interface: readable feedback, satisfying progression, clear states, and low-friction controls.\n\n- Reward clarity over ornament\n- Make state transitions feel tactile\n- Use RPG metaphors only when they improve comprehension',
        feedback: [
          'The moment-to-moment loop needs stronger feedback: click, glow, log, reward, next quest.',
          'Agent XP is useful because it turns repeated use into readable party history.',
          'Keep the pixel RPG theme, but prioritize fast scanning of node state, risk, and ownership.',
        ],
      },
      {
        id: 'adversarial-qa',
        name: 'Adversarial QA Agent',
        className: 'Hostile Precision Reviewer',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-lint', 'wiki-review-actions'],
        agentMd: '# Adversarial QA Agent\n\nTests the app with hostile precision: assume happy paths lie, inspect edge cases, and convert criticism into exact fixes.\n\n- Reproduce failures before judging\n- Name the root cause, not the symptom\n- Demand node add/remove, focus stability, and persistence proofs',
        feedback: [
          'focus bug was severe: typing must never re-render the active editor out from under the user.',
          'War-plan graph editing is incomplete without node add and remove controls with protected start-node behavior.',
          'Persistence claims require a visible save action and a real file written under .harness-rpg/.',
        ],
      },
      {
        id: 'responsive-ui-ux',
        name: 'Responsive UI/UX Expert Agent',
        className: 'Breakpoint Experience Specialist',
        level: 1,
        xp: 0,
        profileImage: '',
        selectedSkills: ['wiki-review-actions', 'wiki-detect-gaps'],
        agentMd: '# Responsive UI/UX Expert Agent\n\nReviews the app across mobile, tablet, and desktop breakpoints so every surface remains readable, reachable, and emotionally clear.\n\n- Start from the narrowest viewport before approving desktop polish\n- Check navigation, inspector density, graph clipping, and touch target size\n- Convert responsive problems into exact layout and interaction fixes',
        feedback: [
          'mobile first: the sidebar, graph, and inspector must collapse without hiding critical controls.',
          'Every breakpoint needs an obvious next action, readable node ownership, and no clipped graph nodes.',
          'Touch targets, form fields, and review cards should stay usable before visual ornament gets credit.',
        ],
      },
    ],
    activeAgentId: 'wiki-maker',
    skills: wikiSkills,
    graph: {
      nodes: [
        node('start', 'Start', 'planner-agent', ['ouroboros-plan'], 'ready', 'Plan the graph from the user goal before work begins.'),
        node('wiki-make', 'Wiki Make', 'wiki-maker', ['wiki-ingest-source', 'wiki-build-graph'], 'idle', 'Create the first project knowledge map.'),
        node('skill-attune', 'Skill Attune', 'wiki-maker', ['wiki-enrich-wikilinks'], 'idle', 'Bind OpenCode skills to the agent party.'),
        node('destructive-check', 'Destructive Command Check', 'gate-warden', ['wiki-lint'], 'idle', 'Approval gate example for destructive commands.', true),
        node('session-plan', 'Session Plan', 'forge-master', ['wiki-query'], 'idle', 'Compile graph results into the next session plan.'),
      ],
      edges: [
        ['start', 'wiki-make'],
        ['wiki-make', 'skill-attune'],
        ['skill-attune', 'destructive-check'],
        ['destructive-check', 'session-plan'],
      ],
    },
    sessions: [
      { id: 'session-001', name: 'Tutorial Quest', status: 'ready', parentId: null },
    ],
    activeSessionId: 'session-001',
    selectedNodeId: 'start',
    wikiMap: [
      { id: 'purpose', label: 'purpose.md', kind: 'lore-scroll', x: 18, y: 34 },
      { id: 'schema', label: 'schema.md', kind: 'rune-tablet', x: 38, y: 18 },
      { id: 'index', label: 'index.md', kind: 'world-index', x: 55, y: 45 },
      { id: 'wiki-make', label: 'wiki-make', kind: 'green-portal', x: 75, y: 28 },
      { id: 'gap', label: 'fog gap', kind: 'fog-island', x: 64, y: 70 },
    ],
  };
  return { ...initialState, pools: createPoolsFromState(initialState) };
}

function createPoolsFromState(state) {
  return {
    skills: state.skills.map((skill) => ({ ...skill })),
    skillTrees: [{
      id: 'opencode-wiki-skill-tree',
      name: 'OpenCode Wiki Skill Tree',
      description: 'Reusable tree of OpenCode-compatible planning and wiki skills.',
      skillIds: state.skills.map((skill) => skill.id),
    }],
    agents: state.agents.map((agent) => cloneAgent(agent)),
    nodes: state.graph.nodes.map((nodeItem) => poolNodeFromGraphNode(nodeItem)),
    graphs: [poolGraphFromGraph(state.graph, 'tutorial-quest-graph', 'Tutorial Quest Graph')],
  };
}

function cloneAgent(agent) {
  return {
    ...agent,
    selectedSkills: [...(agent.selectedSkills ?? [])],
    feedback: agent.feedback ? [...agent.feedback] : undefined,
  };
}

function poolNodeFromGraphNode(nodeItem) {
  return {
    id: nodeItem.id,
    title: nodeItem.title,
    description: nodeItem.description,
    agentId: nodeItem.agentId,
    agentIds: [...(nodeItem.agentIds ?? [nodeItem.agentId])],
    skills: [...(nodeItem.skills ?? [])],
    destructive: nodeItem.destructive === true,
    position: nodeItem.position ? { ...nodeItem.position } : undefined,
  };
}

function poolGraphFromGraph(graph, id, name) {
  return {
    id,
    name,
    description: 'Reusable snapshot of the front-end graph as the agent sees it.',
    nodeIds: graph.nodes.map((nodeItem) => nodeItem.id),
    edges: graph.edges.map((edge) => [...edge]),
  };
}

export function setLocale(state, locale) {
  return { ...state, locale: locale === 'en' ? 'en' : 'ko' };
}

function node(id, title, agentId, skills, status, description, destructive = false) {
  return {
    id,
    title,
    agentId,
    agentIds: agentId === 'System' ? [] : [agentId],
    skills,
    status,
    description,
    destructive,
    logs: {
      friendly: 'Waiting for the quest horn.',
      raw: 'event=node.idle',
      artifacts: [],
      why: 'No skill used yet.',
    },
    workSections: createDefaultWorkSections({ title, description, destructive }),
    review: createReviewBundle({ id, title, agentId, skills, status, description, destructive }),
  };
}

function createDefaultWorkSections({ description, destructive = false }) {
  return [
    {
      id: 'goal',
      label: 'Goal',
      body: description,
    },
    {
      id: 'purpose',
      label: 'Purpose',
      body: 'Explain why this node matters to the user and what decision it unlocks.',
    },
    {
      id: 'deliverable',
      label: 'Deliverable',
      body: 'Name the artifact, code change, plan, or answer the agent should produce.',
    },
    {
      id: 'verification',
      label: 'Verification',
      body: destructive
        ? 'Wait for explicit approval, then describe how the user can verify the destructive step was safe.'
        : 'Describe the observable proof that this node is complete.',
    },
  ];
}

function createReviewBundle(nodeItem, completed = false) {
  const skillText = nodeItem.skills.length ? nodeItem.skills.join(', ') : 'none';
  const agentIds = nodeAgentIds(nodeItem);
  const agentText = agentIds.length > 1 ? `Agents ${agentIds.join(', ')} own` : `Agent ${agentIds[0] ?? nodeItem.agentId} owns`;
  const completedAgentText = agentIds.length > 1 ? `${agentIds.join(', ')} agents` : `${agentIds[0] ?? nodeItem.agentId} agent`;
  const resultText = completed
    ? `${nodeItem.title} completed by ${completedAgentText} with ${skillText}.`
    : `${nodeItem.title} is waiting for execution.`;
  const diffText = completed && nodeItem.id === 'wiki-make'
    ? 'Diff: Added wiki/index.md, wiki/overview.md, and concepts/opencode-bridge.md to the project wiki artifact set.'
    : completed
      ? `Diff: Captured ${nodeItem.id} node event artifacts without mixing results from other nodes.`
      : `Diff: No file changes yet for ${nodeItem.id}.`;

  return {
    plan: `Plan: ${nodeItem.description}`,
    spec: `Spec: ${agentText} this graph node and may use ${skillText}.`,
    log: completed
      ? `Log: ${nodeItem.title} finished through the OpenCode MCP bridge.`
      : `Log: ${nodeItem.title} has not started yet.`,
    diff: diffText,
    result: `Result: ${resultText}`,
  };
}

export function assignSkillToAgent(state, agentId, skillId) {
  return {
    ...state,
    agents: state.agents.map((agent) => {
      if (agent.id !== agentId) return agent;
      const selected = agent.selectedSkills.includes(skillId)
        ? agent.selectedSkills.filter((id) => id !== skillId)
        : [...agent.selectedSkills, skillId];
      return { ...agent, selectedSkills: selected };
    }),
  };
}

export function updateAgentMarkdown(state, agentId, agentMd) {
  return {
    ...state,
    agents: state.agents.map((agent) => agent.id === agentId ? { ...agent, agentMd } : agent),
  };
}

export function updateAgentProfile(state, agentId, profile) {
  return {
    ...state,
    agents: state.agents.map((agent) => {
      if (agent.id !== agentId) return agent;
      return {
        ...agent,
        name: profile.name ?? agent.name,
        profileImage: profile.profileImage ?? agent.profileImage,
      };
    }),
  };
}

export function selectNode(state, nodeId) {
  return { ...state, selectedNodeId: nodeId };
}

export function selectAgent(state, agentId) {
  return { ...state, activeAgentId: agentId };
}

export function assignAgentToNode(state, nodeId, agentId) {
  if (!state.agents.some((agent) => agent.id === agentId)) return state;
  return {
    ...state,
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => {
        if (nodeItem.id !== nodeId || nodeItem.agentId === 'System') return nodeItem;
        const updatedNode = { ...nodeItem, agentId, agentIds: [agentId] };
        return {
          ...updatedNode,
          review: {
            ...createReviewBundle(updatedNode, nodeItem.status === 'completed'),
            ...(nodeItem.review?.summary ? { summary: nodeItem.review.summary } : {}),
          },
        };
      }),
    },
  };
}

export function toggleAgentForNode(state, nodeId, agentId) {
  if (!state.agents.some((agent) => agent.id === agentId)) return state;
  return updateGraphNode(state, nodeId, (nodeItem) => {
    if (nodeItem.agentId === 'System') return nodeItem;
    const currentAgentIds = nodeAgentIds(nodeItem);
    const nextAgentIds = currentAgentIds.includes(agentId)
      ? currentAgentIds.filter((id) => id !== agentId)
      : [...currentAgentIds, agentId];
    const agentIds = nextAgentIds.length ? nextAgentIds : [agentId];
    return {
      ...nodeItem,
      agentId: agentIds[0],
      agentIds,
    };
  });
}

export function updateNodeText(state, nodeId, text) {
  return updateGraphNode(state, nodeId, (nodeItem) => {
    const description = text.description ?? nodeItem.description;
    const workSections = text.description === undefined
      ? nodeItem.workSections
      : normalizeWorkSections(nodeItem.workSections, nodeItem).map((section) => section.id === 'goal' && section.body === nodeItem.description
        ? { ...section, body: description }
        : section);
    return {
      ...nodeItem,
      title: text.title ?? nodeItem.title,
      description,
      workSections,
    };
  });
}

export function updateNodeWorkSection(state, nodeId, sectionId, patch) {
  return updateGraphNode(state, nodeId, (nodeItem) => ({
    ...nodeItem,
    workSections: normalizeWorkSections(nodeItem.workSections, nodeItem).map((section) => section.id === sectionId ? {
      ...section,
      label: patch.label === undefined ? section.label : sanitizeWorkSectionLabel(patch.label, section.label),
      body: patch.body ?? section.body,
    } : section),
  }));
}

export function addNodeWorkSection(state, nodeId) {
  return updateGraphNode(state, nodeId, (nodeItem) => {
    const sections = normalizeWorkSections(nodeItem.workSections, nodeItem);
    if (sections.length >= maxWorkSections) return nodeItem;
    const nextNumber = Math.max(0, ...sections
      .filter((section) => section.id.startsWith('custom-section-'))
      .map((section) => Number(section.id.replace('custom-section-', '')))
      .filter(Number.isInteger)) + 1;
    return {
      ...nodeItem,
      workSections: [...sections, {
        id: `custom-section-${nextNumber}`,
        label: `Custom Section ${nextNumber}`,
        body: 'Add the details this agent should receive.',
      }],
    };
  });
}

export function removeNodeWorkSection(state, nodeId, sectionId) {
  return updateGraphNode(state, nodeId, (nodeItem) => ({
    ...nodeItem,
    workSections: normalizeWorkSections(nodeItem.workSections, nodeItem).filter((section) => section.id !== sectionId),
  }));
}

export function buildNodeWorkMarkdown(state, nodeId) {
  const nodeItem = state.graph.nodes.find((node) => node.id === nodeId) ?? state.graph.nodes[0];
  const agentText = nodeAgentLabels(state, nodeItem).join(', ') || 'System';
  const skillText = nodeItem.skills.length ? nodeItem.skills.join(', ') : 'none';
  const sections = normalizeWorkSections(nodeItem.workSections, nodeItem);
  const sectionText = sections.length
    ? sections.map((section) => `### ${section.label}\n\n${section.body || '_No content yet._'}`).join('\n\n')
    : '_No custom work sections yet._';

  return [
    `# ${nodeItem.title}`,
    '',
    `> Node ID: ${nodeItem.id}`,
    '',
    '## Assignment',
    '',
    `- Assigned Agents: ${agentText}`,
    `- Skills: ${skillText}`,
    `- Destructive step: ${nodeItem.destructive ? 'yes, require explicit approval' : 'no'}`,
    '',
    '## Work Brief',
    '',
    sectionText,
    '',
    '## Response Contract',
    '',
    '- State the plan or result clearly.',
    '- Name files, commands, or artifacts that changed.',
    '- Include the verification evidence a user can reproduce.',
  ].join('\n');
}

export function buildOuroborosProtocolPayload(state) {
  const graphSchema = {
    protocol: 'harness-rpg-war-plan-v1',
    nodeFields: ['id', 'title', 'description', 'agentId', 'agentIds', 'skills', 'status', 'destructive'],
    edgeShape: { type: 'tuple', items: ['fromNodeId', 'toNodeId'] },
    protectedNodes: ['start'],
  };
  return {
    protocol: 'harness-rpg-war-plan-v1',
    prompt: [
      'You are drafting a war plan for Harness RPG.',
      'Harness RPG visualizes war plans as graph nodes and edges.',
      'Match this protocol exactly so the plan can be visualized and edited in the app.',
      'Return JSON only with protocol, nodes, and edges.',
      'Do not rename or reassign the protected start node.',
    ].join('\n'),
    graphSchema,
    agents: state.agents.map(({ id, name, className, selectedSkills }) => ({ id, name, className, selectedSkills })),
    skills: state.skills.map(({ id, name, branch }) => ({ id, name, branch })),
    currentGraph: {
      nodes: state.graph.nodes.map((nodeItem) => protocolNode(nodeItem)),
      edges: state.graph.edges.map((edge) => [...edge]),
    },
  };
}

export function applyWarPlanSpec(state, spec) {
  const incomingNodes = normalizeSpecNodes(state, spec?.nodes);
  const existingIds = new Set(state.graph.nodes.map((nodeItem) => nodeItem.id));
  const agentIds = new Set(state.agents.map((agent) => agent.id));
  const updatedNodes = state.graph.nodes.map((nodeItem) => {
    if (nodeItem.agentId === 'System' || nodeItem.id === 'start') return nodeItem;
    const incoming = incomingNodes.find((candidate) => candidate.id === nodeItem.id);
    if (!incoming) return nodeItem;
    return specNode(nodeItem, incoming, agentIds);
  });
  const addedNodes = incomingNodes
    .filter((incoming) => incoming.id && !existingIds.has(incoming.id))
    .map((incoming) => specNode(node(
      incoming.id,
      incoming.title ?? incoming.id,
      agentIds.has(incoming.agentId) ? incoming.agentId : state.activeAgentId,
      Array.isArray(incoming.skills) ? incoming.skills : [],
      'idle',
      incoming.description ?? 'Imported from Ouroboros war-plan spec.',
      incoming.destructive === true,
    ), incoming, agentIds));
  const nodeIds = new Set([...updatedNodes, ...addedNodes].map((nodeItem) => nodeItem.id));
  const edges = Array.isArray(spec?.edges)
    ? spec.edges.map((edge) => normalizeSpecEdge(edge)).filter(([from, to]) => nodeIds.has(from) && nodeIds.has(to)).map(([from, to]) => [from, to])
    : state.graph.edges;
  const selectedNodeId = addedNodes.at(-1)?.id ?? incomingNodes.find((incoming) => nodeIds.has(incoming.id) && incoming.id !== 'start')?.id ?? state.selectedNodeId;

  return {
    ...state,
    selectedNodeId,
    graph: {
      ...state.graph,
      nodes: [...updatedNodes, ...addedNodes],
      edges,
    },
  };
}

export function getGraphProgress(state) {
  const total = state.graph.nodes.length;
  const completed = state.graph.nodes.filter((nodeItem) => nodeItem.status === 'completed').length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getWikiSkillPack(state) {
  return state.skills.map((skill) => ({ ...skill }));
}

export function addPoolSkill(state) {
  const pools = normalizePools(state.pools, state);
  const number = nextCustomNumber(state.skills, 'custom-skill-');
  const skill = {
    id: `custom-skill-${number}`,
    name: `Custom Skill ${number}`,
    branch: 'Custom',
    markdown: `# custom-skill-${number}\n\nDescribe when an agent should use this reusable skill and what output it should produce.`,
  };
  return {
    ...state,
    skills: [...state.skills, skill],
    pools: {
      ...pools,
      skills: [...pools.skills, { ...skill }],
    },
  };
}

export function addPoolSkillTree(state) {
  const pools = normalizePools(state.pools, state);
  const number = nextCustomNumber(pools.skillTrees, 'custom-skill-tree-');
  const preferredSkill = state.skills.find((skill) => skill.id.startsWith('custom-skill-')) ?? state.skills.at(-1);
  const skillTree = {
    id: `custom-skill-tree-${number}`,
    name: `Custom Skill Tree ${number}`,
    description: 'Group reusable skills so agents can pick a coherent capability path.',
    skillIds: preferredSkill ? [preferredSkill.id] : [],
  };
  return {
    ...state,
    pools: {
      ...pools,
      skillTrees: [...pools.skillTrees, skillTree],
    },
  };
}

export function addPoolAgent(state) {
  const pools = normalizePools(state.pools, state);
  const number = nextCustomNumber(state.agents, 'custom-agent-');
  const agent = {
    id: `custom-agent-${number}`,
    name: `Custom Agent ${number}`,
    className: 'Pool-Born Specialist',
    level: 1,
    xp: 0,
    profileImage: '',
    selectedSkills: [],
    agentMd: `# Custom Agent ${number}\n\nDescribe this reusable agent's role, constraints, and verification habits.`,
  };
  return {
    ...state,
    agents: [...state.agents, agent],
    pools: {
      ...pools,
      agents: [...pools.agents, cloneAgent(agent)],
    },
  };
}

export function addPoolNode(state) {
  const pools = normalizePools(state.pools, state);
  const number = nextCustomNumber(pools.nodes, 'custom-pool-node-');
  const nodeTemplate = {
    id: `custom-pool-node-${number}`,
    title: `Custom Pool Node ${number}`,
    description: 'Reusable node template for future graph work.',
    agentId: state.activeAgentId,
    skills: [],
    destructive: false,
  };
  return {
    ...state,
    pools: {
      ...pools,
      nodes: [...pools.nodes, nodeTemplate],
    },
  };
}

export function addPoolGraph(state) {
  const pools = normalizePools(state.pools, state);
  const number = nextCustomNumber(pools.graphs, 'custom-graph-');
  const graph = poolGraphFromGraph(state.graph, `custom-graph-${number}`, `Custom Graph ${number}`);
  return {
    ...state,
    pools: {
      ...pools,
      graphs: [...pools.graphs, graph],
    },
  };
}

export function assignPoolAgentToNode(state, nodeId, agentId) {
  const pools = normalizePools(state.pools, state);
  const poolAgent = pools.agents.find((agent) => agent.id === agentId);
  if (!poolAgent) return state;
  const stateWithAgent = state.agents.some((agent) => agent.id === agentId)
    ? { ...state, pools }
    : { ...state, agents: [...state.agents, cloneAgent(poolAgent)], pools };
  return {
    ...assignAgentToNode(stateWithAgent, nodeId, agentId),
    activeAgentId: agentId,
  };
}

export function togglePoolSkillForAgent(state, agentId, skillId, nodeId = '') {
  const pools = normalizePools(state.pools, state);
  const poolSkill = pools.skills.find((skill) => skill.id === skillId);
  if (!poolSkill || !state.agents.some((agent) => agent.id === agentId)) return state;
  const stateWithSkill = state.skills.some((skill) => skill.id === skillId)
    ? { ...state, pools }
    : { ...state, skills: [...state.skills, { ...poolSkill }], pools };
  const toggled = assignSkillToAgent(stateWithSkill, agentId, skillId);
  const updatedAgent = toggled.agents.find((agent) => agent.id === agentId);
  const hasSkill = updatedAgent?.selectedSkills.includes(skillId) === true;
  const graph = nodeId ? {
    ...toggled.graph,
    nodes: toggled.graph.nodes.map((nodeItem) => {
      if (nodeItem.id !== nodeId || !nodeAgentIds(nodeItem).includes(agentId)) return nodeItem;
      const skills = hasSkill
        ? Array.from(new Set([...nodeItem.skills, skillId]))
        : nodeItem.skills.filter((id) => id !== skillId);
      return refreshNodeReview({ ...nodeItem, skills }, nodeItem.review?.summary);
    }),
  } : toggled.graph;
  return {
    ...toggled,
    graph,
    activeAgentId: agentId,
    pools: {
      ...pools,
      agents: pools.agents.map((agent) => agent.id === agentId && updatedAgent ? cloneAgent(updatedAgent) : agent),
    },
  };
}

export function applyPoolSkillTreeToAgent(state, agentId, skillTreeId, nodeId = '') {
  const pools = normalizePools(state.pools, state);
  const skillTree = pools.skillTrees.find((tree) => tree.id === skillTreeId);
  const agent = state.agents.find((item) => item.id === agentId);
  if (!skillTree || !agent) return state;
  const poolSkillsById = new Map(pools.skills.map((skill) => [skill.id, skill]));
  const skillIds = skillTree.skillIds.filter((skillId) => poolSkillsById.has(skillId));
  const activeSkillIds = new Set(state.skills.map((skill) => skill.id));
  const missingSkills = skillIds.flatMap((skillId) => activeSkillIds.has(skillId) ? [] : [{ ...poolSkillsById.get(skillId) }]);
  const updatedAgents = state.agents.map((item) => item.id === agentId ? {
    ...item,
    selectedSkills: Array.from(new Set([...item.selectedSkills, ...skillIds])),
  } : item);
  const updatedAgent = updatedAgents.find((item) => item.id === agentId);
  return {
    ...state,
    activeAgentId: agentId,
    skills: [...state.skills, ...missingSkills],
    agents: updatedAgents,
    graph: nodeId ? {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => {
        if (nodeItem.id !== nodeId || !nodeAgentIds(nodeItem).includes(agentId)) return nodeItem;
        return refreshNodeReview({
          ...nodeItem,
          skills: Array.from(new Set([...nodeItem.skills, ...skillIds])),
        }, nodeItem.review?.summary);
      }),
    } : state.graph,
    pools: {
      ...pools,
      agents: pools.agents.map((item) => item.id === agentId && updatedAgent ? cloneAgent(updatedAgent) : item),
    },
  };
}

export function instantiatePoolNode(state, poolNodeId) {
  const pools = normalizePools(state.pools, state);
  const template = pools.nodes.find((poolNode) => poolNode.id === poolNodeId);
  if (!template) return state;
  const id = uniqueNodeId(state.graph.nodes, template.id);
  const previousNode = state.graph.nodes.at(-1);
  const graphNode = node(
    id,
    template.title,
    state.agents.some((agent) => agent.id === template.agentId) ? template.agentId : state.activeAgentId,
    (template.skills ?? []).filter((skillId) => state.skills.some((skill) => skill.id === skillId)),
    'idle',
    template.description,
    template.destructive === true,
  );
  const templateAgentIds = Array.isArray(template.agentIds) ? template.agentIds.filter((agentId) => state.agents.some((agent) => agent.id === agentId)) : [];
  const assignedNode = templateAgentIds.length ? { ...graphNode, agentId: templateAgentIds[0], agentIds: templateAgentIds } : graphNode;
  const positionedNode = template.position ? { ...assignedNode, position: { ...template.position } } : assignedNode;
  return {
    ...state,
    selectedNodeId: id,
    pools,
    graph: {
      ...state.graph,
      nodes: [...state.graph.nodes, positionedNode],
      edges: previousNode ? [...state.graph.edges, [previousNode.id, id]] : state.graph.edges,
    },
  };
}

export function applyPoolGraph(state, graphId) {
  const pools = normalizePools(state.pools, state);
  const graphTemplate = pools.graphs.find((graph) => graph.id === graphId);
  if (!graphTemplate) return state;
  const currentNodes = new Map(state.graph.nodes.map((nodeItem) => [nodeItem.id, nodeItem]));
  const orderedNodes = [
    ...graphTemplate.nodeIds.flatMap((nodeId) => currentNodes.has(nodeId) ? [currentNodes.get(nodeId)] : []),
    ...state.graph.nodes.filter((nodeItem) => !graphTemplate.nodeIds.includes(nodeItem.id)),
  ];
  const nodeIds = new Set(orderedNodes.map((nodeItem) => nodeItem.id));
  const edges = graphTemplate.edges.filter(([from, to]) => nodeIds.has(from) && nodeIds.has(to)).map(([from, to]) => [from, to]);
  return {
    ...state,
    selectedNodeId: nodeIds.has(state.selectedNodeId) ? state.selectedNodeId : graphTemplate.nodeIds.find((nodeId) => nodeIds.has(nodeId)) ?? state.selectedNodeId,
    pools,
    graph: {
      ...state.graph,
      nodes: orderedNodes,
      edges,
    },
  };
}

export function removePoolSkill(state, skillId) {
  const pools = normalizePools(state.pools, state);
  const updatedAgents = state.agents.map((agent) => ({
    ...agent,
    selectedSkills: agent.selectedSkills.filter((id) => id !== skillId),
  }));
  const updatedNodes = state.graph.nodes.map((nodeItem) => refreshNodeReview({
    ...nodeItem,
    skills: nodeItem.skills.filter((id) => id !== skillId),
  }, nodeItem.review?.summary));
  return {
    ...state,
    agents: updatedAgents,
    skills: state.skills.filter((skill) => skill.id !== skillId),
    graph: {
      ...state.graph,
      nodes: updatedNodes,
    },
    pools: {
      ...pools,
      skills: pools.skills.filter((skill) => skill.id !== skillId),
      skillTrees: pools.skillTrees.map((tree) => ({ ...tree, skillIds: tree.skillIds.filter((id) => id !== skillId) })),
      agents: pools.agents.map((agent) => ({ ...agent, selectedSkills: (agent.selectedSkills ?? []).filter((id) => id !== skillId) })),
      nodes: pools.nodes.map((poolNode) => ({ ...poolNode, skills: (poolNode.skills ?? []).filter((id) => id !== skillId) })),
    },
  };
}

export function buildGraphMarkdown(state) {
  const nodeRows = state.graph.nodes.map((nodeItem, index) => `${index + 1}. [${nodeItem.id}](./${graphNodeFileName(nodeItem, index)})`);
  const edgeRows = state.graph.edges.map(([from, to]) => `- ${from} --> ${to}`);
  const adjacencyRows = state.graph.nodes.map((nodeItem) => {
    const outgoing = state.graph.edges.filter(([from]) => from === nodeItem.id).map(([, to]) => to);
    return `- ${nodeItem.id}: ${outgoing.join(', ') || 'none'}`;
  });
  return [
    '# Harness RPG Static Connectivity',
    '',
    '> Generated deterministically from the front-end graph state. This file contains connectivity only; node details live in the linked NODE files.',
    '',
    '## Summary',
    '',
    `- Node count: ${state.graph.nodes.length}`,
    `- Edge count: ${state.graph.edges.length}`,
    '',
    '## Nodes',
    '',
    ...nodeRows,
    '',
    '## Edges',
    '',
    ...(edgeRows.length ? edgeRows : ['_No edges yet._']),
    '',
    '## Connectivity',
    '',
    ...adjacencyRows,
  ].join('\n');
}

export function buildGraphNodeMarkdown(state, nodeId, index = state.graph.nodes.findIndex((nodeItem) => nodeItem.id === nodeId)) {
  const nodeItem = state.graph.nodes.find((node) => node.id === nodeId) ?? state.graph.nodes[0];
  const safeIndex = index >= 0 ? index : state.graph.nodes.findIndex((node) => node.id === nodeItem.id);
  const incoming = state.graph.edges.filter(([, to]) => to === nodeItem.id).map(([from]) => from);
  const outgoing = state.graph.edges.filter(([from]) => from === nodeItem.id).map(([, to]) => to);
  const workMarkdown = buildNodeWorkMarkdown(state, nodeItem.id).replace(/^# .+\n\n/, '');
  return [
    `# ${nodeItem.title}`,
    '',
    `> Front-end graph node: ${graphNodeFileLabel(nodeItem, safeIndex)}`,
    '',
    '## Graph Position',
    '',
    `- Node ID: ${nodeItem.id}`,
    `- Status: ${nodeItem.status}`,
    `- Assigned Agents: ${nodeAgentLabels(state, nodeItem).join(', ') || 'System'}`,
    `- Incoming: ${incoming.join(', ') || 'none'}`,
    `- Outgoing: ${outgoing.join(', ') || 'none'}`,
    '',
    workMarkdown,
  ].join('\n');
}

export function buildSkillUsageSummary(state, nodeId) {
  const nodeItem = state.graph.nodes.find((node) => node.id === nodeId) ?? state.graph.nodes[0];
  const resolvedAgentIds = resolveNodeAgentIds(state, nodeItem);
  return nodeItem.skills.flatMap((skillId) => resolvedAgentIds.map((resolvedAgentId) => {
    const agent = state.agents.find((item) => item.id === resolvedAgentId) ?? state.agents.find((item) => item.id === nodeItem.agentId);
    const skill = state.skills.find((item) => item.id === skillId);
    return {
      skillId,
      skillName: skill?.name ?? skillId,
      agentId: resolvedAgentId,
      agentName: agent?.name ?? resolvedAgentId,
      reason: describeSkillUse(skillId, nodeItem),
      evidence: nodeItem.status === 'completed'
        ? `${nodeItem.title} completed and produced ${nodeItem.logs.artifacts.join(', ') || 'node-scoped artifacts'}.`
        : nodeItem.status === 'approval_required'
          ? `${nodeItem.title} is waiting for approval before the skill can finish.`
          : `${nodeItem.title} has not run yet; this skill is assigned for the next execution.`,
    };
  }));
}

export function buildGraphResultReport(state) {
  const progress = getGraphProgress(state);
  if (progress.total === 0 || progress.completed !== progress.total) return null;
  const completedNodes = state.graph.nodes.filter((nodeItem) => nodeItem.status === 'completed');
  const skillUsage = completedNodes.flatMap((nodeItem) => buildSkillUsageSummary(state, nodeItem.id).map((entry) => ({
    ...entry,
    nodeId: nodeItem.id,
    nodeTitle: nodeItem.title,
  })));
  return {
    id: `${state.activeSessionId}-result`,
    sessionId: state.activeSessionId,
    title: `${state.project.name} War Plan Result`,
    status: 'completed',
    progress,
    summary: `${completedNodes.length} graph nodes completed. Skill usage is based on completed node logs and artifacts only.`,
    nodes: completedNodes.map((nodeItem) => ({
      id: nodeItem.id,
      title: nodeItem.title,
      status: nodeItem.status,
      agentId: resolveNodeAgentId(state, nodeItem),
      agentIds: resolveNodeAgentIds(state, nodeItem),
      artifacts: [...nodeItem.logs.artifacts],
      result: nodeItem.review.result,
    })),
    skillUsage,
  };
}

export function filterGraphResultSkillUsage(report, filters = {}) {
  const nodeId = filters.nodeId ?? 'all';
  const agentId = filters.agentId ?? 'all';
  const skillId = filters.skillId ?? 'all';
  return (report?.skillUsage ?? []).filter((entry) => {
    if (nodeId !== 'all' && entry.nodeId !== nodeId) return false;
    if (agentId !== 'all' && entry.agentId !== agentId) return false;
    if (skillId !== 'all' && entry.skillId !== skillId) return false;
    return true;
  });
}

export function addWarPlanNode(state) {
  const customCount = Math.max(0, ...state.graph.nodes
    .filter((nodeItem) => nodeItem.id.startsWith('custom-node-'))
    .map((nodeItem) => Number(nodeItem.id.replace('custom-node-', '')))
    .filter(Number.isInteger)) + 1;
  const id = `custom-node-${customCount}`;
  const previousNode = state.graph.nodes.at(-1);
  const newNode = node(
    id,
    `Custom Node ${customCount}`,
    state.activeAgentId,
    [],
    'idle',
    'Describe the next delegated graph task.',
  );

  return {
    ...state,
    selectedNodeId: id,
    graph: {
      ...state.graph,
      nodes: [...state.graph.nodes, newNode],
      edges: previousNode ? [...state.graph.edges, [previousNode.id, id]] : state.graph.edges,
    },
  };
}

export function removeWarPlanNode(state, nodeId) {
  if (!canRemoveWarPlanNode(state, nodeId)) return state;
  const targetExists = state.graph.nodes.some((nodeItem) => nodeItem.id === nodeId);
  if (!targetExists) return state;
  const remainingNodes = state.graph.nodes.filter((nodeItem) => nodeItem.id !== nodeId);
  const selectedNodeId = state.selectedNodeId === nodeId ? remainingNodes.at(-1)?.id ?? 'start' : state.selectedNodeId;

  return {
    ...state,
    selectedNodeId,
    graph: {
      ...state.graph,
      nodes: remainingNodes,
      edges: state.graph.edges.filter(([from, to]) => from !== nodeId && to !== nodeId),
    },
  };
}

export function canRemoveWarPlanNode(state, nodeId) {
  return state.graph.nodes.some((nodeItem) => nodeItem.id === nodeId) && !protectedWarPlanNodeIds.has(nodeId);
}

export function moveWarPlanNode(state, nodeId, position) {
  const x = Math.round(Number(position?.x ?? 0));
  const y = Math.round(Number(position?.y ?? 0));
  return {
    ...state,
    selectedNodeId: nodeId,
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => nodeItem.id === nodeId ? { ...nodeItem, position: { x, y } } : nodeItem),
    },
  };
}

export function swapWarPlanNodes(state, sourceNodeId, targetNodeId) {
  if (sourceNodeId === targetNodeId) return state;
  const sourceIndex = state.graph.nodes.findIndex((nodeItem) => nodeItem.id === sourceNodeId);
  const targetIndex = state.graph.nodes.findIndex((nodeItem) => nodeItem.id === targetNodeId);
  if (sourceIndex === -1 || targetIndex === -1) return state;
  const nodes = [...state.graph.nodes];
  const sourceNode = nodes[sourceIndex];
  const targetNode = nodes[targetIndex];
  nodes[sourceIndex] = { ...targetNode, position: sourceNode.position ?? targetNode.position };
  nodes[targetIndex] = { ...sourceNode, position: targetNode.position ?? sourceNode.position };
  return {
    ...state,
    selectedNodeId: sourceNodeId,
    graph: {
      ...state.graph,
      nodes,
    },
  };
}

export function exportWorkspaceFiles(state) {
  const files = {
    [state.backend.fileState]: `${JSON.stringify(state, null, 2)}\n`,
  };

  for (const agent of state.agents) {
    files[`${state.backend.agentsDir}/${agent.id}/AGENT.md`] = `${agent.agentMd}\n`;
  }

  for (const skill of state.skills) {
    files[`${state.backend.skillsDir}/${skill.id}.md`] = `${skill.markdown}\n`;
  }

  for (const nodeItem of state.graph.nodes) {
    files[`.harness-rpg/nodes/${nodeItem.id}/work.md`] = `${buildNodeWorkMarkdown(state, nodeItem.id)}\n`;
  }

  files['.harness-rpg/graphs/current/GRAPH.md'] = `${buildGraphMarkdown(state)}\n`;
  state.graph.nodes.forEach((nodeItem, index) => {
    files[`.harness-rpg/graphs/current/${graphNodeFileName(nodeItem, index)}`] = `${buildGraphNodeMarkdown(state, nodeItem.id, index)}\n`;
  });

  return files;
}

function updateGraphNode(state, nodeId, updater) {
  return {
    ...state,
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => {
        if (nodeItem.id !== nodeId) return nodeItem;
        const updatedNode = updater(nodeItem);
        return refreshNodeReview(updatedNode, nodeItem.review?.summary);
      }),
    },
  };
}

function refreshNodeReview(nodeItem, summary) {
  return {
    ...nodeItem,
    review: {
      ...createReviewBundle(nodeItem, nodeItem.status === 'completed'),
      ...(summary ? { summary } : {}),
    },
  };
}

function specNode(baseNode, incoming, agentIds) {
  const incomingAgentIds = Array.isArray(incoming.agentIds)
    ? incoming.agentIds.filter((agentId) => agentIds.has(agentId))
    : [];
  const primaryAgentId = agentIds.has(incoming.agentId) ? incoming.agentId : incomingAgentIds[0] ?? baseNode.agentId;
  const assignedAgentIds = Array.from(new Set([primaryAgentId, ...incomingAgentIds]));
  return refreshNodeReview({
    ...baseNode,
    title: incoming.title ?? baseNode.title,
    description: incoming.description ?? baseNode.description,
    agentId: primaryAgentId,
    agentIds: assignedAgentIds,
    skills: Array.isArray(incoming.skills) ? incoming.skills : baseNode.skills,
    status: 'idle',
    destructive: incoming.destructive ?? baseNode.destructive,
    logs: {
      friendly: 'Waiting for the quest horn.',
      raw: 'event=node.idle',
      artifacts: [],
      why: 'Imported from Ouroboros war-plan spec.',
    },
  });
}

function normalizeSpecNodes(state, nodes) {
  if (!Array.isArray(nodes)) return [];
  const seen = new Set();
  const skillIds = new Set(state.skills.map((skill) => skill.id));
  return nodes.slice(0, maxImportedNodes).flatMap((nodeItem) => {
    if (!nodeIdPattern.test(nodeItem?.id ?? '') || seen.has(nodeItem.id)) return [];
    seen.add(nodeItem.id);
    return [{
      ...nodeItem,
      title: truncateText(nodeItem.title ?? nodeItem.id, maxNodeTitleLength),
      description: truncateText(nodeItem.description ?? 'Imported from Ouroboros war-plan spec.', maxNodeDescriptionLength),
      skills: Array.isArray(nodeItem.skills) ? nodeItem.skills.filter((skillId) => skillIds.has(skillId)) : [],
      agentIds: Array.isArray(nodeItem.agentIds) ? nodeItem.agentIds.filter((agentId) => nodeIdPattern.test(agentId)) : undefined,
      destructive: nodeItem.destructive === true,
    }];
  });
}

function normalizeSpecEdge(edge) {
  if (Array.isArray(edge)) return [String(edge[0] ?? ''), String(edge[1] ?? '')];
  return [String(edge?.fromNodeId ?? ''), String(edge?.toNodeId ?? '')];
}

function truncateText(value, maxLength) {
  return String(value).slice(0, maxLength);
}

function nextCustomNumber(items, prefix) {
  return Math.max(0, ...items
    .filter((item) => String(item.id ?? '').startsWith(prefix))
    .map((item) => Number(String(item.id).replace(prefix, '')))
    .filter(Number.isInteger)) + 1;
}

function uniqueNodeId(nodes, baseId) {
  const existingIds = new Set(nodes.map((nodeItem) => nodeItem.id));
  if (!existingIds.has(baseId)) return baseId;
  let index = 1;
  let id = `${baseId}-copy-${index}`;
  while (existingIds.has(id)) {
    index += 1;
    id = `${baseId}-copy-${index}`;
  }
  return id;
}

function graphNodeFileName(nodeItem, index) {
  return `${graphNodeFileLabel(nodeItem, index)}.md`;
}

function graphNodeFileLabel(nodeItem, index) {
  const number = String(index + 1).padStart(2, '0');
  const title = String(nodeItem.title || nodeItem.id)
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase() || 'NODE';
  return `${number}_${title}_NODE`;
}

function normalizePools(pools, state) {
  const defaults = createPoolsFromState(state);
  if (!pools) return defaults;
  return {
    skills: mergeById(defaults.skills, Array.isArray(pools.skills) ? pools.skills : []),
    skillTrees: mergeById(defaults.skillTrees, Array.isArray(pools.skillTrees) ? pools.skillTrees : []),
    agents: mergeById(defaults.agents, Array.isArray(pools.agents) ? pools.agents : []),
    nodes: mergeById(defaults.nodes, Array.isArray(pools.nodes) ? pools.nodes : []),
    graphs: mergeById(defaults.graphs, Array.isArray(pools.graphs) ? pools.graphs : []),
  };
}

function describeSkillUse(skillId, nodeItem) {
  if (skillId === 'ouroboros-plan') {
    return 'This skill turns the user goal and node work sections into an execution-ready plan before implementation starts.';
  }
  if (skillId === 'wiki-ingest-source') {
    return 'This skill reads project files so the agent can ground the node result in the current repository.';
  }
  if (skillId === 'wiki-build-graph') {
    return 'This skill turns files, concepts, and visible graph nodes into a navigable knowledge graph.';
  }
  if (skillId === 'wiki-query') {
    return 'This skill lets the agent answer from indexed project knowledge instead of guessing.';
  }
  if (skillId === 'wiki-lint') {
    return nodeItem.destructive
      ? 'This skill checks risk and stale assumptions before the destructive approval gate continues.'
      : 'This skill checks stale claims, contradictions, and missing links before the result is trusted.';
  }
  if (skillId === 'wiki-review-actions') {
    return 'This skill converts review feedback into concrete next actions the user can inspect.';
  }
  if (skillId === 'wiki-enrich-wikilinks') {
    return 'This skill strengthens markdown relationships so future agents can traverse the project faster.';
  }
  if (skillId === 'wiki-detect-gaps') {
    return 'This skill finds missing knowledge and isolated graph areas before they become blind spots.';
  }
  if (skillId === 'wiki-deep-research') {
    return 'This skill expands an identified knowledge gap into a researched project artifact.';
  }
  return 'This assigned pool skill gives the agent a reusable capability for this node.';
}

function normalizeWorkSections(sections, nodeItem) {
  const seen = new Set();
  const source = Array.isArray(sections) ? sections : createDefaultWorkSections(nodeItem);
  return source.slice(0, maxWorkSections).flatMap((section, index) => {
    const id = nodeIdPattern.test(section?.id ?? '') ? section.id : `section-${index + 1}`;
    if (seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      label: sanitizeWorkSectionLabel(section?.label, `Section ${index + 1}`),
      body: String(section?.body ?? ''),
    }];
  });
}

function sanitizeWorkSectionLabel(value, fallback) {
  const label = truncateText(String(value ?? '').replace(/\s+/g, ' ').trim(), 60);
  return label || fallback;
}

function resolveNodeAgentId(state, nodeItem) {
  const [agentId] = resolveNodeAgentIds(state, nodeItem);
  return agentId ?? nodeItem?.agentId ?? 'System';
}

function resolveNodeAgentIds(state, nodeItem) {
  if (!nodeItem || nodeItem.agentId === 'System') return ['System'];
  const validAgentIds = new Set(state.agents.map((agent) => agent.id));
  const assignedAgentIds = nodeAgentIds(nodeItem).filter((agentId) => validAgentIds.has(agentId));
  if (assignedAgentIds.length) return assignedAgentIds;
  if (nodeItem.id === 'start' || nodeItem.skills.includes('ouroboros-plan')) return ['auto-planner'];
  return [nodeItem.agentId];
}

function nodeAgentIds(nodeItem) {
  if (!nodeItem || nodeItem.agentId === 'System') return [];
  const ids = Array.isArray(nodeItem.agentIds) && nodeItem.agentIds.length ? nodeItem.agentIds : [nodeItem.agentId];
  return Array.from(new Set(ids.filter(Boolean)));
}

function nodeAgentLabels(state, nodeItem) {
  return nodeAgentIds(nodeItem).map((agentId) => {
    const agent = state.agents.find((item) => item.id === agentId);
    return agent ? `${agent.name} (${agent.id})` : `${agentId} (missing)`;
  });
}

function protocolNode(nodeItem) {
  return {
    id: nodeItem.id,
    title: nodeItem.title,
    description: nodeItem.description,
    agentId: nodeItem.agentId,
    agentIds: nodeAgentIds(nodeItem),
    skills: [...nodeItem.skills],
    status: nodeItem.status,
    destructive: nodeItem.destructive,
    review: { ...nodeItem.review },
  };
}

export function runGraphUntilBlocked(state) {
  let currentState = state;
  for (const nodeItem of state.graph.nodes) {
    const currentNode = currentState.graph.nodes.find((candidate) => candidate.id === nodeItem.id);
    if (!currentNode || currentNode.status === 'completed') continue;
    if (currentNode.destructive) return requireApproval(currentState, currentNode.id);
    currentState = completeGraphNode(currentState, currentNode.id);
  }
  return persistGraphResultReport(currentState);
}

export function startTutorialSession(state) {
  const running = runGraphUntilBlocked(state);
  const blockedNode = running.graph.nodes.find((nodeItem) => nodeItem.status === 'approval_required');
  const report = buildGraphResultReport(running);
  return {
    ...running,
    selectedNodeId: blockedNode?.id ?? 'wiki-make',
    sessions: running.sessions.map((session) => session.id === running.activeSessionId ? { ...session, status: report ? 'completed' : 'running' } : session),
  };
}

function awardClearedNodeExperience(agents, nodes) {
  return nodes.reduce((currentAgents, nodeItem) => {
    return nodeAgentIds(nodeItem).reduce((awardedAgents, agentId) => awardAgentExperience(awardedAgents, agentId), currentAgents);
  }, agents);
}

function awardAgentExperience(agents, agentId) {
  return agents.map((agent) => {
    if (agent.id !== agentId) return agent;
    const total = agent.xp + 1;
    return {
      ...agent,
      level: agent.level + Math.floor(total / 10),
      xp: total % 10,
    };
  });
}

function completeNode(nodeItem, resolvedAgentId = nodeItem.agentId) {
  const skillText = nodeItem.skills.length ? nodeItem.skills.join(', ') : 'none';
  const resolvedNode = { ...nodeItem, agentId: resolvedAgentId };
  const review = createReviewBundle(resolvedNode, true);
  return {
    ...nodeItem,
    status: 'completed',
    logs: {
      friendly: `${nodeItem.title} completed by ${resolvedAgentId} agent. The host agent used ${skillText} through the OpenCode MCP bridge.`,
      raw: `event=opencode.bridge.node.completed node=${nodeItem.id} agent=${resolvedAgentId} skills=${skillText}`,
      artifacts: nodeItem.id === 'wiki-make'
        ? ['.harness-rpg/wiki/wiki/index.md', '.harness-rpg/wiki/wiki/overview.md', '.harness-rpg/wiki/wiki/concepts/opencode-bridge.md']
        : ['session-event.json'],
      why: nodeItem.skills.includes('ouroboros-plan')
        ? 'Ouroboros Plan was selected to turn the user goal and node work sections into an execution-ready plan.'
        : nodeItem.skills.length
        ? `${skillText} was selected because this node maintains project knowledge without direct foundation-LLM coupling.`
        : 'Start node boots the tutorial graph.',
    },
    review: {
      ...review,
      summary: `${nodeItem.title} completed as a node-scoped review package: plan, spec, log, diff, and result are ready for human inspection.`,
    },
  };
}

function approvalNode(nodeItem) {
  return {
    ...nodeItem,
    status: 'approval_required',
    logs: {
      friendly: 'Gate Warden paused this destructive command. User approval is required before continuing.',
      raw: `event=approval.required node=${nodeItem.id} reason=destructive_command`,
      artifacts: ['approval-request.json'],
      why: 'Only destructive commands require a gate; normal graph work auto-runs.',
    },
    review: {
      ...createReviewBundle(nodeItem),
      log: `Log: ${nodeItem.title} is paused until the user approves the destructive command gate.`,
      result: 'Result: Waiting for explicit destructive-command approval.',
    },
  };
}

function appendBridgeEvent(state, event) {
  return { ...state, bridgeEvents: [...state.bridgeEvents, event] };
}

function completeGraphNode(state, nodeId) {
  const clearedNode = state.graph.nodes.find((nodeItem) => nodeItem.id === nodeId);
  const resolvedAgentId = resolveNodeAgentId(state, clearedNode);
  const nextState = {
    ...state,
    agents: clearedNode && resolvedAgentId !== 'System' ? awardClearedNodeExperience(state.agents, [clearedNode]) : state.agents,
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => nodeItem.id === nodeId ? completeNode(nodeItem, resolvedAgentId) : nodeItem),
    },
  };

  return appendBridgeEvent(nextState, {
    type: 'node.completed',
    nodeId,
    agentId: resolvedAgentId,
    skills: clearedNode?.skills ?? [],
  });
}

function requireApproval(state, nodeId) {
  const gatedNode = state.graph.nodes.find((nodeItem) => nodeItem.id === nodeId);
  const nextState = {
    ...state,
    selectedNodeId: nodeId,
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => nodeItem.id === nodeId ? approvalNode(nodeItem) : nodeItem),
    },
  };

  return appendBridgeEvent(nextState, {
    type: 'approval.required',
    nodeId,
    agentId: gatedNode?.agentId ?? 'System',
    skills: gatedNode?.skills ?? [],
  });
}

export function approveDestructiveNode(state, nodeId) {
  const approved = completeGraphNode(state, nodeId);
  const running = runGraphUntilBlocked(approved);
  const blockedNode = running.graph.nodes.find((nodeItem) => nodeItem.status === 'approval_required');
  return {
    ...running,
    selectedNodeId: blockedNode?.id ?? nodeId,
    sessions: running.sessions.map((session) => session.id === running.activeSessionId && !blockedNode ? { ...session, status: 'completed' } : session),
  };
}

function persistGraphResultReport(state) {
  const report = buildGraphResultReport(state);
  if (!report) return state;
  const reports = state.resultReports ?? [];
  return {
    ...state,
    resultReports: [...reports.filter((item) => item.id !== report.id), report],
  };
}

export function createSession(state) {
  const id = `session-${String(state.sessions.length + 1).padStart(3, '0')}`;
  return {
    ...state,
    activeSessionId: id,
    sessions: [...state.sessions, { id, name: `Quest ${state.sessions.length + 1}`, status: 'ready', parentId: null }],
  };
}

export function forkSession(state, sessionId) {
  const id = `${sessionId}-fork-${state.sessions.filter((session) => session.parentId === sessionId).length + 1}`;
  return {
    ...state,
    activeSessionId: id,
    sessions: [...state.sessions, { id, name: `Fork of ${sessionId}`, status: 'forked', parentId: sessionId }],
  };
}

export function serializeState(state) {
  return JSON.stringify(state);
}

export function deserializeState(raw) {
  try {
    return raw ? migrateState(JSON.parse(raw)) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function migrateState(state) {
  const defaults = createInitialState();
  const savedStartNode = state.graph?.nodes?.find((nodeItem) => nodeItem.id === 'start');
  const shouldSeedPlannerAgent = !savedStartNode || savedStartNode.agentId === 'System' || !savedStartNode.skills?.includes('ouroboros-plan');
  const defaultAgents = shouldSeedPlannerAgent ? defaults.agents : defaults.agents.filter((agent) => agent.id !== 'planner-agent');
  const agents = mergeById(defaultAgents, state.agents ?? []);
  const skills = mergeById(defaults.skills, state.skills ?? []);
  const graphNodes = (state.graph?.nodes ?? defaults.graph.nodes).map((nodeItem) => migrateGraphNode(nodeItem, defaults));
  const migratedState = {
    ...state,
    backend: {
      ...backendDefaults,
      ...(state.backend ?? {}),
      bridge: {
        ...backendDefaults.bridge,
        ...(state.backend?.bridge ?? {}),
      },
    },
    bridgeEvents: state.bridgeEvents ?? [],
    resultReports: state.resultReports ?? [],
    agents,
    skills,
    graph: {
      ...(state.graph ?? defaults.graph),
      nodes: graphNodes,
      edges: state.graph?.edges ?? defaults.graph.edges,
    },
  };
  return {
    ...migratedState,
    pools: normalizePools(state.pools, migratedState),
  };
}

function mergeById(defaultItems, savedItems) {
  const savedIds = new Set(savedItems.map((item) => item.id));
  return [...defaultItems.filter((item) => !savedIds.has(item.id)), ...savedItems];
}

function migrateGraphNode(nodeItem, defaults) {
  const defaultNode = defaults.graph.nodes.find((candidate) => candidate.id === nodeItem.id);
  const migratedNode = {
    ...(defaultNode ?? {}),
    ...nodeItem,
  };
  const plannerStartNode = migratedNode.id === 'start'
    ? {
      ...migratedNode,
      agentId: migratedNode.agentId === 'System' ? 'planner-agent' : migratedNode.agentId,
      skills: migratedNode.skills?.length ? migratedNode.skills : ['ouroboros-plan'],
      description: migratedNode.description === 'Boot the tutorial war plan.' ? 'Plan the graph from the user goal before work begins.' : migratedNode.description,
    }
    : migratedNode;
  return {
    ...plannerStartNode,
    agentIds: nodeAgentIds(plannerStartNode),
    workSections: normalizeWorkSections(plannerStartNode.workSections, plannerStartNode),
  };
}
