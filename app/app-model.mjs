const PROJECT_PATH = '/home/sungjin/workspace/harness-rpg';

export const wikiSkills = [
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
  return {
    project: {
      name: 'harness-rpg',
      path: PROJECT_PATH,
      stateDir: '.harness-rpg/',
      bridge: 'OpenCode MCP/API bridge',
    },
    locale: 'ko',
    agents: [
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
    ],
    activeAgentId: 'wiki-maker',
    skills: wikiSkills,
    graph: {
      nodes: [
        node('start', 'Start', 'System', [], 'ready', 'Boot the tutorial war plan.'),
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
}

export function setLocale(state, locale) {
  return { ...state, locale: locale === 'en' ? 'en' : 'ko' };
}

function node(id, title, agentId, skills, status, description, destructive = false) {
  return {
    id,
    title,
    agentId,
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
    review: createReviewBundle({ id, title, agentId, skills, status, description, destructive }),
  };
}

function createReviewBundle(nodeItem, completed = false) {
  const skillText = nodeItem.skills.length ? nodeItem.skills.join(', ') : 'none';
  const resultText = completed
    ? `${nodeItem.title} completed by ${nodeItem.agentId} agent with ${skillText}.`
    : `${nodeItem.title} is waiting for execution.`;
  const diffText = completed && nodeItem.id === 'wiki-make'
    ? 'Diff: Added wiki/index.md, wiki/overview.md, and concepts/opencode-bridge.md to the project wiki artifact set.'
    : completed
      ? `Diff: Captured ${nodeItem.id} node event artifacts without mixing results from other nodes.`
      : `Diff: No file changes yet for ${nodeItem.id}.`;

  return {
    plan: `Plan: ${nodeItem.description}`,
    spec: `Spec: Agent ${nodeItem.agentId} owns this graph node and may use ${skillText}.`,
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

export function getGraphProgress(state) {
  const total = state.graph.nodes.length;
  const completed = state.graph.nodes.filter((nodeItem) => nodeItem.status === 'completed').length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function startTutorialSession(state) {
  const completed = new Set(['start', 'wiki-make', 'skill-attune']);
  const completedNodes = state.graph.nodes.filter((nodeItem) => completed.has(nodeItem.id) && nodeItem.agentId !== 'System');
  return {
    ...state,
    agents: awardClearedNodeExperience(state.agents, completedNodes),
    selectedNodeId: 'wiki-make',
    sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, status: 'running' } : session),
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => {
        if (completed.has(nodeItem.id)) return completeNode(nodeItem);
        if (nodeItem.id === 'destructive-check') return approvalNode(nodeItem);
        return nodeItem;
      }),
    },
  };
}

function awardClearedNodeExperience(agents, nodes) {
  return nodes.reduce((currentAgents, nodeItem) => awardAgentExperience(currentAgents, nodeItem.agentId), agents);
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

function completeNode(nodeItem) {
  const skillText = nodeItem.skills.length ? nodeItem.skills.join(', ') : 'none';
  const review = createReviewBundle(nodeItem, true);
  return {
    ...nodeItem,
    status: 'completed',
    logs: {
      friendly: `${nodeItem.title} completed by ${nodeItem.agentId} agent. The host agent used ${skillText} through the OpenCode MCP bridge.`,
      raw: `event=opencode.bridge.node.completed node=${nodeItem.id} agent=${nodeItem.agentId} skills=${skillText}`,
      artifacts: nodeItem.id === 'wiki-make'
        ? ['.harness-rpg/wiki/wiki/index.md', '.harness-rpg/wiki/wiki/overview.md', '.harness-rpg/wiki/wiki/concepts/opencode-bridge.md']
        : ['session-event.json'],
      why: nodeItem.skills.length
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

export function approveDestructiveNode(state, nodeId) {
  const clearedNode = state.graph.nodes.find((nodeItem) => nodeItem.id === nodeId);
  return {
    ...state,
    agents: clearedNode ? awardClearedNodeExperience(state.agents, [clearedNode]) : state.agents,
    selectedNodeId: nodeId,
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((nodeItem) => nodeItem.id === nodeId ? completeNode({ ...nodeItem, status: 'running' }) : nodeItem),
    },
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
    return raw ? JSON.parse(raw) : createInitialState();
  } catch {
    return createInitialState();
  }
}
