import {
  deserializeState,
  serializeState,
  assignSkillToAgent,
  assignAgentToNode,
  canRemoveWarPlanNode,
  updateNodeText,
  buildNodeWorkMarkdown,
  updateNodeWorkSection,
  addNodeWorkSection,
  removeNodeWorkSection,
  updateAgentMarkdown,
  updateAgentProfile,
  setLocale,
  selectAgent,
  selectNode,
  getGraphProgress,
  startTutorialSession,
  approveDestructiveNode,
  addWarPlanNode,
  removeWarPlanNode,
  moveWarPlanNode,
  swapWarPlanNodes,
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
  buildSkillUsageSummary,
  createSession,
  forkSession,
  exportWorkspaceFiles,
} from './app-model.mjs';

const STORAGE_KEY = 'harness-rpg-state-v1';
let state = deserializeState(localStorage.getItem(STORAGE_KEY));
let exportStatus = '';
let dragState = null;
let marketplaceTab = 'agents';

const copy = {
  ko: {
    tagline: 'OpenCode MCP/API 브릿지 · 로컬 우선 에이전트 작업대',
    project: '프로젝트', openProject: '프로젝트 열기', stateDir: '상태 디렉터리',
    localBackend: '로컬 백엔드', database: 'SQLite DB', fileState: '파일 상태', bridgeMode: '브릿지', exportedFiles: '파일-backed export', bridgeEvents: '브릿지 이벤트',
    exportWorkspace: '파일로 저장', exportReady: '저장 준비됨', exportDone: '파일 저장 완료', exportFailed: '파일 저장 실패',
    agentParty: '에이전트 파티', sessions: '세션', newSession: '새 세션', fork: '포크',
    warPlan: '전쟁 계획 튜토리얼', sessionStart: '세션 시작', approve: '파괴 명령 승인',
    addNode: '노드 추가', removeNode: '선택 노드 제거',
    nodeWork: '노드 작업 브리프', nodeWorkHelp: '사용자는 섹션을 편집하고, 에이전트는 아래 markdown을 그대로 읽습니다.', addWorkSection: '섹션 추가', removeWorkSection: '섹션 삭제', sectionTitle: '섹션 이름', sectionBody: '섹션 내용', aiMarkdown: 'AI용 Markdown',
    nodeSettingsWidget: '노드 설정 위젯', nodeSettingsHelp: '그래프 노드를 누르면 이 큰 위젯에서 담당자, 작업 브리프, 스킬 사용 이유를 한 번에 조정합니다.',
    pools: '리소스 마켓', poolsHelp: '마켓플레이스처럼 Agent를 노드에 배치하고, 선택 Agent에 Skill/Skill tree를 장착하고, Node/Graph 템플릿을 가져옵니다.', poolSkills: 'Skill', poolSkillTrees: 'Skill Tree', poolAgents: 'Agent', poolNodes: 'Node', poolGraphs: 'Graph', addPoolSkill: 'Skill 추가', addPoolSkillTree: 'Skill tree 추가', addPoolAgent: 'Agent 추가', addPoolNode: 'Node 추가', addPoolGraph: 'Graph 추가', assignToNode: '노드에 배치', equipSkill: 'Agent에 장착', unequipSkill: '장착 해제', deleteSkill: 'Skill 삭제', useNodeTemplate: '노드로 추가', applyGraph: 'Graph 적용', applySkillTree: 'Tree 장착', marketplaceContext: '현재 노드', activeAgentLabel: '선택 Agent', poolPreview: '풀 아이템',
    skillUsage: '스킬 사용 내역', skillUsageHelp: 'Agent가 어떤 스킬을 왜 썼는지 사용자가 읽기 쉬운 카드로 보여줍니다.', noSkillUsage: '아직 배정된 스킬이 없습니다.', skillReason: '왜 사용했나', skillEvidence: '증거',
    overallProgress: '전체 진행률', clearedNodes: '클리어 노드',
    flow: '흐름: 프로젝트 열기 → 에이전트/스킬 세팅 → Start → wiki-maker agent의 wiki-make → 파괴 명령 승인 게이트.',
    skillTree: 'OpenCode 스킬 트리', selectedAgent: '선택된 에이전트',
    skillHelp: '기존 OpenCode markdown 스킬은 영어 원문을 유지하고, UI만 번역합니다.',
    wikiMap: 'LLM Wiki 월드맵', wikiHelp: 'llm_wiki 개념을 host-agent skill로 포팅: ingest, query, lint, graph, gap detection, deep research, review actions, wikilink enrichment.',
    agentEditor: 'Agent.md 편집기', profileEditor: '프로필 편집', agentName: '에이전트 이름', profileImage: '프로필 이미지 URL', feedback: '앱 피드백',
    nodeDetail: '노드 상세', nodeTitle: '노드명', nodeDescription: '노드 설명', status: '상태', agent: '에이전트', nodeOwner: '담당 에이전트', systemNode: '시스템 노드는 담당자를 바꿀 수 없습니다.', usedSkills: '사용 스킬', friendlyLog: '친화 로그', rawLog: '원본 로그', whyUsed: '사용 이유', artifacts: '산출물',
    reviewCenter: '리뷰 센터', reviewSummary: '요약', reviewPlan: '계획', reviewSpec: '스펙', reviewLog: '로그', reviewDiff: '변경점', reviewResult: '결과',
    level: '레벨', xp: '경험치', language: 'English UI', markdownNote: 'Agent가 읽는 markdown은 영어로 유지됩니다.',
  },
  en: {
    tagline: 'OpenCode MCP/API bridge · local-first agent workbench',
    project: 'Project', openProject: 'Open Project', stateDir: 'State dir',
    localBackend: 'Local Backend', database: 'SQLite DB', fileState: 'File State', bridgeMode: 'Bridge', exportedFiles: 'File-backed Export', bridgeEvents: 'Bridge Events',
    exportWorkspace: 'Save to Files', exportReady: 'Ready to save', exportDone: 'Files saved', exportFailed: 'File save failed',
    agentParty: 'Agent Party', sessions: 'Sessions', newSession: 'New Session', fork: 'Fork',
    warPlan: 'War Plan Tutorial', sessionStart: 'Session Start', approve: 'Approve Destructive Command',
    addNode: 'Add Node', removeNode: 'Remove Selected Node',
    nodeWork: 'Node Work Brief', nodeWorkHelp: 'Users edit these sections; agents later receive the packed markdown below.', addWorkSection: 'Add Section', removeWorkSection: 'Delete Section', sectionTitle: 'Section title', sectionBody: 'Section body', aiMarkdown: 'AI Markdown',
    nodeSettingsWidget: 'Node Settings Widget', nodeSettingsHelp: 'Click a graph node to tune owner, work brief, and skill-use rationale in this larger widget.',
    pools: 'Resource Market', poolsHelp: 'Browse it like a marketplace: assign agents to nodes, equip skills/skill trees to the selected agent, and instantiate node/graph templates.', poolSkills: 'Skill', poolSkillTrees: 'Skill Tree', poolAgents: 'Agent', poolNodes: 'Node', poolGraphs: 'Graph', addPoolSkill: 'Add Skill', addPoolSkillTree: 'Add Skill Tree', addPoolAgent: 'Add Agent', addPoolNode: 'Add Node', addPoolGraph: 'Add Graph', assignToNode: 'Assign to Node', equipSkill: 'Equip Agent', unequipSkill: 'Unequip', deleteSkill: 'Delete Skill', useNodeTemplate: 'Add as Node', applyGraph: 'Apply Graph', applySkillTree: 'Equip Tree', marketplaceContext: 'Current node', activeAgentLabel: 'Selected agent', poolPreview: 'Pool item',
    skillUsage: 'Skill Usage', skillUsageHelp: 'Shows which skill the agent used and why in user-friendly cards.', noSkillUsage: 'No skills assigned yet.', skillReason: 'Why it was used', skillEvidence: 'Evidence',
    overallProgress: 'Overall Progress', clearedNodes: 'Cleared Nodes',
    flow: 'Flow: project open → agent/skill setup → Start → wiki-make by wiki-maker agent → approval-gated destructive command.',
    skillTree: 'OpenCode Skill Tree', selectedAgent: 'Selected agent',
    skillHelp: 'Existing OpenCode markdown skills stay in English; only the human UI is localized.',
    wikiMap: 'LLM Wiki World Map', wikiHelp: 'llm_wiki concepts ported as host-agent skills: ingest, query, lint, graph, gap detection, deep research, review actions, wikilink enrichment.',
    agentEditor: 'Agent.md Editor', profileEditor: 'Profile Editor', agentName: 'Agent name', profileImage: 'Profile image URL', feedback: 'App Feedback',
    nodeDetail: 'Node Detail', nodeTitle: 'Node title', nodeDescription: 'Node description', status: 'Status', agent: 'Agent', nodeOwner: 'Node Agent', systemNode: 'System nodes cannot be reassigned.', usedSkills: 'Used skills', friendlyLog: 'Friendly Log', rawLog: 'Raw Log', whyUsed: 'Why Used', artifacts: 'Artifacts',
    reviewCenter: 'Review Center', reviewSummary: 'Summary', reviewPlan: 'Plan', reviewSpec: 'Spec', reviewLog: 'Log', reviewDiff: 'Diff', reviewResult: 'Result',
    level: 'Level', xp: 'XP', language: '한국어 UI', markdownNote: 'Markdown read by agents remains English.',
  },
};

function t(key) {
  return copy[state.locale]?.[key] ?? copy.ko[key] ?? key;
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function save(next) {
  state = next;
  persistState();
  render();
}

function updateDraft(next) {
  state = next;
  persistState();
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, serializeState(state));
}

function activeAgent() {
  return state.agents.find((agent) => agent.id === state.activeAgentId) ?? state.agents[0];
}

function selectedNode() {
  return state.graph.nodes.find((node) => node.id === state.selectedNodeId) ?? state.graph.nodes[0];
}

function statusLabel(status) {
  return status.replaceAll('_', ' ').toUpperCase();
}

function renderAgents() {
  return state.agents.map((agent) => `
    <article class="agent-card ${agent.id === state.activeAgentId ? 'active' : ''}" data-agent-id="${esc(agent.id)}" tabindex="0">
      <div class="avatar" aria-label="2-head-tall pixel avatar for ${esc(agent.name)}"></div>
      <div class="agent-card-body">
        <strong class="agent-card-name">${esc(agent.name)}</strong>
        <div class="muted agent-card-role">${esc(t('level'))} ${esc(agent.level)} · ${esc(agent.className)}</div>
        <div class="xp-line"><span>${t('xp')} ${agent.xp}/10</span><div class="bar xp"><span style="width:${agent.xp * 10}%"></span></div></div>
      </div>
    </article>
  `).join('');
}

function renderSkills(agent) {
  return state.skills.map((skill) => {
    const selected = agent.selectedSkills.includes(skill.id);
    return `
      <button class="skill-node ${selected ? 'selected' : ''}" data-skill-id="${skill.id}" aria-pressed="${selected}">
        <strong>${esc(skill.name)}</strong>
        <span>${esc(skill.branch)}</span>
        <small>${esc(skill.markdown.split('\n\n')[1])}</small>
      </button>
    `;
  }).join('');
}

function defaultNodePosition(id) {
  const fixed = {
    start: [4, 140],
    'wiki-make': [155, 70],
    'skill-attune': [305, 190],
    'destructive-check': [455, 82],
    'session-plan': [605, 190],
  }[id];
  if (fixed) return fixed;
  const fixedIds = new Set(['start', 'wiki-make', 'skill-attune', 'destructive-check', 'session-plan']);
  const dynamicIndex = Math.max(0, state.graph.nodes.filter((node) => !fixedIds.has(node.id)).findIndex((node) => node.id === id));
  return [80 + (dynamicIndex % 4) * 170, 270 + Math.floor(dynamicIndex / 4) * 90];
}

function nodePosition(node) {
  if (node.position) return [node.position.x, node.position.y];
  return defaultNodePosition(node.id);
}

function nodePositionById(nodeId) {
  const node = state.graph.nodes.find((item) => item.id === nodeId);
  return node ? nodePosition(node) : [0, 0];
}

function renderEdges() {
  const centers = Object.fromEntries(state.graph.nodes.map((node) => {
    const [x, y] = nodePosition(node);
    return [node.id, [x + 65, y + 35]];
  }));
  return state.graph.edges.map(([from, to]) => {
    const [x1, y1] = centers[from];
    const [x2, y2] = centers[to];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return `<div class="edge" style="left:${x1}px;top:${y1}px;width:${length}px;transform:rotate(${angle}deg)"></div>`;
  }).join('');
}

function renderGraph() {
  return `${renderEdges()}${state.graph.nodes.map((node) => {
    const [x, y] = nodePosition(node);
    const selected = node.id === state.selectedNodeId;
    const dragging = dragState?.nodeId === node.id;
    const runningClass = selected && node.status === 'completed' ? 'running' : '';
    return `
      <button class="node ${node.status} ${selected ? 'selected' : ''} ${runningClass} ${dragging ? 'dragging' : ''}" data-node-id="${esc(node.id)}" style="left:${x}px;top:${y}px" draggable="false" aria-label="${esc(node.title)} drag node">
        <span class="node-title">${esc(node.title)}</span>
        <small>${esc(statusLabel(node.status))}</small>
      </button>
    `;
  }).join('')}`;
}

function renderGraphProgress() {
  const progress = getGraphProgress(state);
  return `
    <div class="quest-progress" aria-label="${t('overallProgress')}">
      <div>
        <strong>${t('overallProgress')}</strong>
        <span>${progress.percent}% · ${t('clearedNodes')} ${progress.completed}/${progress.total}</span>
      </div>
      <div class="bar quest"><span style="width:${progress.percent}%"></span></div>
    </div>
  `;
}

function renderSessions() {
  return state.sessions.map((session) => `
    <li>
      <span>${esc(session.name)}<br><small class="muted">${esc(session.id)} · ${esc(session.status)}${session.parentId ? ` · fork of ${esc(session.parentId)}` : ''}</small></span>
      <button class="secondary" data-fork-session="${esc(session.id)}">${t('fork')}</button>
    </li>
  `).join('');
}

function renderWikiMap() {
  return state.wikiMap.map((pin) => `
    <div class="wiki-pin ${esc(pin.kind)}" style="left:${pin.x}%;top:${pin.y}%">${esc(pin.label)}</div>
  `).join('');
}

function renderReviewCenter(node) {
  const review = node.review ?? {};
  const rows = [
    ['reviewPlan', review.plan],
    ['reviewSpec', review.spec],
    ['reviewLog', review.log],
    ['reviewDiff', review.diff],
    ['reviewResult', review.result],
  ];

  return `
    <div class="review-center" aria-label="${t('reviewCenter')}">
      ${review.summary ? `<div class="review-summary"><strong>${t('reviewSummary')}</strong><span>${esc(review.summary)}</span></div>` : ''}
      <div class="review-grid">
        ${rows.map(([labelKey, value]) => `
          <article class="review-card">
            <h4>${t(labelKey)}</h4>
            <p>${esc(value ?? '')}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderNodeAgentSelect(node) {
  if (node.agentId === 'System') {
    return `<label>${t('nodeOwner')}<select id="node-agent" disabled><option>System</option></select><small class="muted">${t('systemNode')}</small></label>`;
  }
  return `
    <label>${t('nodeOwner')}
      <select id="node-agent">
        ${state.agents.map((agent) => `<option value="${esc(agent.id)}" ${agent.id === node.agentId ? 'selected' : ''}>${esc(agent.name)} · ${esc(agent.className)}</option>`).join('')}
      </select>
    </label>
  `;
}

function renderNodeWorkEditor(node) {
  const sections = node.workSections ?? [];
  return `
    <div class="work-editor">
      <div class="work-editor-header">
        <div>
          <h3>${t('nodeWork')}</h3>
          <p class="muted">${t('nodeWorkHelp')}</p>
        </div>
        <button id="add-work-section" class="secondary">${t('addWorkSection')}</button>
      </div>
      <div class="work-section-list">
        ${sections.map((section) => `
          <article class="work-section" data-work-section-id="${esc(section.id)}">
            <label>${t('sectionTitle')}<input class="work-section-title" data-work-section-label="${esc(section.id)}" value="${esc(section.label)}" /></label>
            <label>${t('sectionBody')}<textarea class="work-section-body" data-work-section-body="${esc(section.id)}">${esc(section.body)}</textarea></label>
            <button class="secondary work-section-remove" data-remove-work-section="${esc(section.id)}">${t('removeWorkSection')}</button>
          </article>
        `).join('')}
      </div>
      <label>${t('aiMarkdown')}<textarea id="node-work-markdown" class="node-work-markdown" readonly>${esc(buildNodeWorkMarkdown(state, node.id))}</textarea></label>
    </div>
  `;
}

function renderSkillUsage(node) {
  const entries = buildSkillUsageSummary(state, node.id);
  return `
    <div class="skill-usage" aria-label="${t('skillUsage')}">
      <div class="skill-usage-header">
        <h3>${t('skillUsage')}</h3>
        <p class="muted">${t('skillUsageHelp')}</p>
      </div>
      <div class="skill-usage-grid">
        ${entries.length ? entries.map((entry) => `
          <article class="skill-usage-card">
            <strong>${esc(entry.skillName)}</strong>
            <span>${esc(entry.agentName)} · ${esc(entry.skillId)}</span>
            <dl>
              <dt>${t('skillReason')}</dt><dd>${esc(entry.reason)}</dd>
              <dt>${t('skillEvidence')}</dt><dd>${esc(entry.evidence)}</dd>
            </dl>
          </article>
        `).join('') : `<p class="muted">${t('noSkillUsage')}</p>`}
      </div>
    </div>
  `;
}

function renderNodeSettingsWidget(node) {
  return `
    <section class="pixel-panel node-settings-widget" aria-label="${t('nodeSettingsWidget')}">
      <div class="widget-heading">
        <div>
          <h2 class="section-title">${t('nodeSettingsWidget')}</h2>
          <p class="muted">${t('nodeSettingsHelp')}</p>
        </div>
        <div class="node-status-badge ${esc(node.status)}">${esc(statusLabel(node.status))}</div>
      </div>
      <div class="node-settings-grid">
        <div class="node-settings-main">
          <label>${t('nodeTitle')}<input id="node-title" value="${esc(node.title)}" /></label>
          <label>${t('nodeDescription')}<textarea id="node-description" class="node-textarea">${esc(node.description)}</textarea></label>
          ${renderNodeAgentSelect(node)}
          ${renderNodeWorkEditor(node)}
        </div>
        <div class="node-settings-side">
          <h3 id="node-title-heading">${esc(node.title)}</h3>
          <p id="node-description-preview">${esc(node.description)}</p>
          <p><strong>${t('usedSkills')}:</strong> ${esc(node.skills.join(', ') || 'none')}</p>
          ${renderSkillUsage(node)}
          <h2 class="section-title review-title">${t('reviewCenter')}</h2>
          ${renderReviewCenter(node)}
          <h4>${t('friendlyLog')}</h4>
          <div class="log-box">${esc(node.logs.friendly)}</div>
          <h4>${t('rawLog')}</h4>
          <div class="log-box">${esc(node.logs.raw)}</div>
          <h4>${t('whyUsed')}</h4>
          <div class="log-box">${esc(node.logs.why)}</div>
          <h4>${t('artifacts')}</h4>
          <ul>${node.logs.artifacts.map((artifact) => `<li class="artifact">${esc(artifact)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>
  `;
}

function renderPoolPanel() {
  const pools = state.pools ?? { skills: state.skills, skillTrees: [], agents: state.agents, nodes: state.graph.nodes, graphs: [] };
  const node = selectedNode();
  const agent = activeAgent();
  const tabs = [
    ['agents', 'poolAgents', pools.agents.length],
    ['skills', 'poolSkills', pools.skills.length],
    ['skillTrees', 'poolSkillTrees', pools.skillTrees.length],
    ['nodes', 'poolNodes', pools.nodes.length],
    ['graphs', 'poolGraphs', pools.graphs.length],
  ];
  return `
    <section class="pixel-panel pool-panel marketplace-panel">
      <h2 class="section-title">${t('pools')}</h2>
      <p class="muted">${t('poolsHelp')}</p>
      <div class="market-context">
        <span>${t('marketplaceContext')}: <strong>${esc(node.title)}</strong></span>
        <span>${t('activeAgentLabel')}: <strong>${esc(agent.name)}</strong></span>
      </div>
      <div class="market-tabs" role="tablist">
        ${tabs.map(([tab, labelKey, count]) => `
          <button class="market-tab ${marketplaceTab === tab ? 'active' : ''}" data-market-tab="${tab}" aria-pressed="${marketplaceTab === tab}">${t(labelKey)} <span>${count}</span></button>
        `).join('')}
      </div>
      <div class="market-actions">
        <button id="add-pool-agent" class="secondary">${t('addPoolAgent')}</button>
        <button id="add-pool-skill" class="secondary">${t('addPoolSkill')}</button>
        <button id="add-pool-skill-tree" class="secondary">${t('addPoolSkillTree')}</button>
        <button id="add-pool-node" class="secondary">${t('addPoolNode')}</button>
        <button id="add-pool-graph" class="secondary">${t('addPoolGraph')}</button>
      </div>
      ${renderMarketplaceShelf(pools, node, agent)}
    </section>
  `;
}

function renderMarketplaceShelf(pools, node, agent) {
  if (marketplaceTab === 'skills') return renderSkillMarketplace(pools.skills, node, agent);
  if (marketplaceTab === 'skillTrees') return renderSkillTreeMarketplace(pools.skillTrees, agent);
  if (marketplaceTab === 'nodes') return renderNodeMarketplace(pools.nodes);
  if (marketplaceTab === 'graphs') return renderGraphMarketplace(pools.graphs);
  return renderAgentMarketplace(pools.agents, node);
}

function renderAgentMarketplace(agents, node) {
  return `<div class="market-grid">${agents.map((agent) => `
    <article class="market-card ${agent.id === node.agentId ? 'chosen' : ''}">
      <small>${t('poolPreview')}</small>
      <h3>${esc(agent.name)}</h3>
      <p>${esc(agent.className)}</p>
      <p class="muted">${esc((agent.selectedSkills ?? []).join(', ') || 'no skills')}</p>
      <button class="secondary" data-assign-pool-agent="${esc(agent.id)}">${t('assignToNode')}</button>
    </article>
  `).join('')}</div>`;
}

function renderSkillMarketplace(skills, node, agent) {
  return `<div class="market-grid">${skills.map((skill) => {
    const equipped = agent.selectedSkills.includes(skill.id);
    const nodeUsesSkill = node.skills.includes(skill.id);
    return `
      <article class="market-card ${equipped ? 'chosen' : ''}">
        <small>${esc(skill.branch)}</small>
        <h3>${esc(skill.name)}</h3>
        <p>${esc(skill.markdown.split('\n\n')[1] ?? '')}</p>
        <p class="muted">${nodeUsesSkill ? `${esc(node.title)} uses this skill` : `${esc(agent.name)} ${equipped ? 'has this skill' : 'can equip this skill'}`}</p>
        <div class="market-card-actions">
          <button class="secondary" data-toggle-pool-skill="${esc(skill.id)}">${equipped ? t('unequipSkill') : t('equipSkill')}</button>
          <button class="secondary danger" data-delete-pool-skill="${esc(skill.id)}">${t('deleteSkill')}</button>
        </div>
      </article>
    `;
  }).join('')}</div>`;
}

function renderSkillTreeMarketplace(skillTrees, agent) {
  return `<div class="market-grid">${skillTrees.map((tree) => `
    <article class="market-card">
      <small>${tree.skillIds.length} skills</small>
      <h3>${esc(tree.name)}</h3>
      <p>${esc(tree.description)}</p>
      <p class="muted">${esc(tree.skillIds.slice(0, 5).join(', '))}${tree.skillIds.length > 5 ? '…' : ''}</p>
      <button class="secondary" data-apply-pool-skill-tree="${esc(tree.id)}">${t('applySkillTree')} → ${esc(agent.name)}</button>
    </article>
  `).join('')}</div>`;
}

function renderNodeMarketplace(nodes) {
  return `<div class="market-grid">${nodes.map((nodeTemplate) => `
    <article class="market-card">
      <small>${esc(nodeTemplate.agentId)}</small>
      <h3>${esc(nodeTemplate.title)}</h3>
      <p>${esc(nodeTemplate.description)}</p>
      <p class="muted">${esc((nodeTemplate.skills ?? []).join(', ') || 'no skills')}</p>
      <button class="secondary" data-instantiate-pool-node="${esc(nodeTemplate.id)}">${t('useNodeTemplate')}</button>
    </article>
  `).join('')}</div>`;
}

function renderGraphMarketplace(graphs) {
  return `<div class="market-grid">${graphs.map((graph) => `
    <article class="market-card">
      <small>${graph.nodeIds.length} nodes · ${graph.edges.length} edges</small>
      <h3>${esc(graph.name)}</h3>
      <p>${esc(graph.description)}</p>
      <p class="muted">${esc(graph.nodeIds.slice(0, 5).join(' → '))}${graph.nodeIds.length > 5 ? '…' : ''}</p>
      <button class="secondary" data-apply-pool-graph="${esc(graph.id)}">${t('applyGraph')}</button>
    </article>
  `).join('')}</div>`;
}

function renderBackendPanel() {
  const files = exportWorkspaceFiles(state);
  const fileNames = Object.keys(files).slice(0, 6);
  return `
    <section class="pixel-panel">
      <h2 class="section-title">${t('localBackend')}</h2>
      <dl class="backend-list">
        <dt>${t('database')}</dt><dd>${esc(state.backend.database)}</dd>
        <dt>${t('fileState')}</dt><dd>${esc(state.backend.fileState)}</dd>
        <dt>${t('bridgeMode')}</dt><dd>${esc(state.backend.bridge.mode)}</dd>
      </dl>
      <h3>${t('exportedFiles')}</h3>
       <ul class="file-list">${fileNames.map((file) => `<li>${esc(file)}</li>`).join('')}</ul>
      <button id="export-workspace" class="secondary">${t('exportWorkspace')}</button>
      <p class="export-status">${exportStatus || t('exportReady')}</p>
    </section>
  `;
}

function renderBridgeEvents() {
  const events = state.bridgeEvents.slice(-6).reverse();
  return `
    <section class="pixel-panel">
      <h2 class="section-title">${t('bridgeEvents')}</h2>
      <ul class="event-list">${events.map((event) => `<li><strong>${esc(event.type)}</strong><span>${esc(event.nodeId)} · ${esc(event.agentId)} · ${esc(event.skills.join(', ') || 'none')}</span></li>`).join('')}</ul>
    </section>
  `;
}

function render() {
  const agent = activeAgent();
  const node = selectedNode();
  document.querySelector('#app').innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>Harness RPG</h1>
          <p>${t('tagline')}</p>
          <button id="toggle-locale" class="secondary">${t('language')}</button>
        </div>
        <section class="pixel-panel">
          <h2 class="section-title">${t('project')}</h2>
          <div class="project-path">${esc(state.project.path)}</div>
          <small class="muted">${t('stateDir')}: ${esc(state.project.stateDir)} · SQLite + markdown files</small>
          <p><button id="open-project">${t('openProject')}</button></p>
        </section>
        ${renderBackendPanel()}
        <section class="pixel-panel">
          <h2 class="section-title">${t('agentParty')}</h2>
          ${renderAgents()}
        </section>
        <section class="pixel-panel">
          <h2 class="section-title">${t('sessions')}</h2>
          <button id="new-session" class="secondary">${t('newSession')}</button>
          <ul class="sessions">${renderSessions()}</ul>
        </section>
      </aside>

      <main class="main">
        <section class="pixel-panel">
          <h2 class="section-title">${t('warPlan')}</h2>
          <p class="muted">${t('flow')}</p>
          ${renderGraphProgress()}
          <div class="graph-actions">
            <button id="start-session">${t('sessionStart')}</button>
            <button id="add-node" class="secondary">${t('addNode')}</button>
            <button id="remove-node" class="secondary" ${canRemoveWarPlanNode(state, node.id) ? '' : 'disabled'}>${t('removeNode')}</button>
            ${node.status === 'approval_required' ? `<button id="approve-node" class="secondary">${t('approve')}</button>` : ''}
          </div>
          <div class="graph" aria-label="Diablo-style war plan graph">${renderGraph()}</div>
        </section>
        ${renderNodeSettingsWidget(node)}
        <section class="pixel-panel">
          <h2 class="section-title">${t('skillTree')}</h2>
          <p class="muted">${t('skillHelp')} ${t('selectedAgent')}: <strong>${esc(agent.name)}</strong></p>
          <div class="skills">${renderSkills(agent)}</div>
        </section>
        ${renderPoolPanel()}
        <section class="pixel-panel">
          <h2 class="section-title">${t('wikiMap')}</h2>
          <p class="muted">${t('wikiHelp')}</p>
          <div class="wiki-map">${renderWikiMap()}</div>
        </section>
        ${renderBridgeEvents()}
      </main>

      <aside class="inspector">
        <section class="pixel-panel">
          <h2 class="section-title">${t('profileEditor')}</h2>
          <label>${t('agentName')}<input id="agent-name" value="${esc(agent.name)}" /></label>
          <label>${t('profileImage')}<input id="profile-image" value="${esc(agent.profileImage ?? '')}" placeholder="https://..." /></label>
          <p class="muted">${t('markdownNote')}</p>
          <h2 class="section-title">${t('agentEditor')}</h2>
          <textarea id="agent-md" aria-label="Agent.md editor">${esc(agent.agentMd)}</textarea>
          ${agent.feedback ? `<h2 class="section-title">${t('feedback')}</h2><ul class="feedback-list">${agent.feedback.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}
        </section>
      </aside>
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelector('#toggle-locale')?.addEventListener('click', () => save(setLocale(state, state.locale === 'ko' ? 'en' : 'ko')));
  document.querySelector('#open-project')?.addEventListener('click', () => save({ ...state, project: { ...state.project, opened: true } }));
  document.querySelector('#export-workspace')?.addEventListener('click', exportWorkspaceToFiles);
  document.querySelector('#start-session')?.addEventListener('click', () => save(startTutorialSession(state)));
  document.querySelector('#add-node')?.addEventListener('click', () => save(addWarPlanNode(state)));
  document.querySelector('#remove-node')?.addEventListener('click', () => save(removeWarPlanNode(state, state.selectedNodeId)));
  document.querySelector('#approve-node')?.addEventListener('click', () => save(approveDestructiveNode(state, state.selectedNodeId)));
  document.querySelector('#add-pool-skill')?.addEventListener('click', () => save(addPoolSkill(state)));
  document.querySelector('#add-pool-skill-tree')?.addEventListener('click', () => save(addPoolSkillTree(state)));
  document.querySelector('#add-pool-agent')?.addEventListener('click', () => save(addPoolAgent(state)));
  document.querySelector('#add-pool-node')?.addEventListener('click', () => save(addPoolNode(state)));
  document.querySelector('#add-pool-graph')?.addEventListener('click', () => save(addPoolGraph(state)));
  document.querySelectorAll('[data-market-tab]').forEach((element) => element.addEventListener('click', () => {
    marketplaceTab = element.dataset.marketTab;
    render();
  }));
  document.querySelectorAll('[data-assign-pool-agent]').forEach((element) => element.addEventListener('click', () => save(assignPoolAgentToNode(state, state.selectedNodeId, element.dataset.assignPoolAgent))));
  document.querySelectorAll('[data-toggle-pool-skill]').forEach((element) => element.addEventListener('click', () => save(togglePoolSkillForAgent(state, state.activeAgentId, element.dataset.togglePoolSkill, state.selectedNodeId))));
  document.querySelectorAll('[data-delete-pool-skill]').forEach((element) => element.addEventListener('click', () => save(removePoolSkill(state, element.dataset.deletePoolSkill))));
  document.querySelectorAll('[data-apply-pool-skill-tree]').forEach((element) => element.addEventListener('click', () => save(applyPoolSkillTreeToAgent(state, state.activeAgentId, element.dataset.applyPoolSkillTree, state.selectedNodeId))));
  document.querySelectorAll('[data-instantiate-pool-node]').forEach((element) => element.addEventListener('click', () => save(instantiatePoolNode(state, element.dataset.instantiatePoolNode))));
  document.querySelectorAll('[data-apply-pool-graph]').forEach((element) => element.addEventListener('click', () => save(applyPoolGraph(state, element.dataset.applyPoolGraph))));
  document.querySelector('#new-session')?.addEventListener('click', () => save(createSession(state)));
  document.querySelector('#agent-name')?.addEventListener('input', (event) => updateDraft(updateAgentProfile(state, state.activeAgentId, { name: event.target.value })));
  document.querySelector('#profile-image')?.addEventListener('input', (event) => updateDraft(updateAgentProfile(state, state.activeAgentId, { profileImage: event.target.value })));
  document.querySelector('#agent-md')?.addEventListener('input', (event) => updateDraft(updateAgentMarkdown(state, state.activeAgentId, event.target.value)));
  document.querySelector('#node-title')?.addEventListener('input', (event) => {
    updateDraft(updateNodeText(state, state.selectedNodeId, { title: event.target.value }));
    syncSelectedNodeTextPreview(event.target.value, state.graph.nodes.find((node) => node.id === state.selectedNodeId)?.description ?? '');
    syncNodeWorkMarkdownPreview();
  });
  document.querySelector('#node-description')?.addEventListener('input', (event) => {
    updateDraft(updateNodeText(state, state.selectedNodeId, { description: event.target.value }));
    syncSelectedNodeTextPreview(state.graph.nodes.find((node) => node.id === state.selectedNodeId)?.title ?? '', event.target.value);
    syncNodeWorkMarkdownPreview();
  });
  document.querySelector('#add-work-section')?.addEventListener('click', () => save(addNodeWorkSection(state, state.selectedNodeId)));
  document.querySelectorAll('[data-remove-work-section]').forEach((element) => element.addEventListener('click', () => save(removeNodeWorkSection(state, state.selectedNodeId, element.dataset.removeWorkSection))));
  document.querySelectorAll('[data-work-section-label]').forEach((element) => element.addEventListener('input', (event) => {
    updateDraft(updateNodeWorkSection(state, state.selectedNodeId, element.dataset.workSectionLabel, { label: event.target.value }));
    syncNodeWorkMarkdownPreview();
  }));
  document.querySelectorAll('[data-work-section-body]').forEach((element) => element.addEventListener('input', (event) => {
    updateDraft(updateNodeWorkSection(state, state.selectedNodeId, element.dataset.workSectionBody, { body: event.target.value }));
    syncNodeWorkMarkdownPreview();
  }));
  document.querySelector('#node-agent')?.addEventListener('change', (event) => save(assignAgentToNode(state, state.selectedNodeId, event.target.value)));
  document.querySelectorAll('[data-agent-id]').forEach((element) => element.addEventListener('click', () => save(selectAgent(state, element.dataset.agentId))));
  document.querySelectorAll('[data-skill-id]').forEach((element) => element.addEventListener('click', () => save(assignSkillToAgent(state, state.activeAgentId, element.dataset.skillId))));
  document.querySelectorAll('[data-node-id]').forEach((element) => element.addEventListener('click', () => save(selectNode(state, element.dataset.nodeId))));
  document.querySelectorAll('.graph [data-node-id]').forEach((element) => element.addEventListener('pointerdown', startNodeDrag));
  document.querySelectorAll('[data-fork-session]').forEach((element) => element.addEventListener('click', () => save(forkSession(state, element.dataset.forkSession))));
}

function startNodeDrag(event) {
  if (event.button !== 0) return;
  const nodeElement = event.currentTarget;
  const graph = nodeElement.closest('.graph');
  const graphRect = graph.getBoundingClientRect();
  const nodeRect = nodeElement.getBoundingClientRect();
  const [homeX, homeY] = nodePositionById(nodeElement.dataset.nodeId);
  dragState = {
    nodeId: nodeElement.dataset.nodeId,
    offsetX: event.clientX - nodeRect.left,
    offsetY: event.clientY - nodeRect.top,
    lastSwapNodeId: '',
    homePosition: { x: homeX, y: homeY },
  };
  state = selectNode(state, dragState.nodeId);
  nodeElement.classList.add('dragging');
  nodeElement.style.zIndex = '5';
  event.preventDefault();
  window.addEventListener('pointermove', dragNode);
  window.addEventListener('pointerup', finishNodeDrag, { once: true });
  moveDraggedNode(event, graph, graphRect, nodeElement);
}

function dragNode(event) {
  if (!dragState) return;
  const graph = document.querySelector('.graph');
  const nodeElement = document.querySelector(`.graph [data-node-id="${CSS.escape(dragState.nodeId)}"]`);
  if (!graph || !nodeElement) return;
  const graphRect = graph.getBoundingClientRect();
  moveDraggedNode(event, graph, graphRect, nodeElement);
  swapDraggedNodeOnHover(event);
}

function moveDraggedNode(event, graph, graphRect, nodeElement) {
  const x = Math.max(0, event.clientX - graphRect.left + graph.scrollLeft - dragState.offsetX);
  const y = Math.max(0, event.clientY - graphRect.top + graph.scrollTop - dragState.offsetY);
  nodeElement.style.left = `${Math.round(x)}px`;
  nodeElement.style.top = `${Math.round(y)}px`;
  updateDraft(moveWarPlanNode(state, dragState.nodeId, { x, y }));
}

function swapDraggedNodeOnHover(event) {
  const hoverNode = document.elementsFromPoint(event.clientX, event.clientY)
    .map((element) => element.closest?.('.graph .node'))
    .find((element) => element && element.dataset.nodeId !== dragState.nodeId);
  const targetNodeId = hoverNode?.dataset.nodeId;
  if (!targetNodeId || targetNodeId === dragState.nodeId || targetNodeId === dragState.lastSwapNodeId) return;
  const [targetX, targetY] = nodePositionById(targetNodeId);
  dragState.lastSwapNodeId = targetNodeId;
  state = moveWarPlanNode(state, dragState.nodeId, dragState.homePosition);
  state = moveWarPlanNode(state, targetNodeId, { x: targetX, y: targetY });
  dragState.homePosition = { x: targetX, y: targetY };
  save(swapWarPlanNodes(state, dragState.nodeId, targetNodeId));
}

function finishNodeDrag() {
  window.removeEventListener('pointermove', dragNode);
  if (!dragState) return;
  dragState = null;
  render();
}

function syncSelectedNodeTextPreview(title, description) {
  const selectedTitle = document.querySelector('.node.selected .node-title');
  const heading = document.querySelector('#node-title-heading');
  const preview = document.querySelector('#node-description-preview');
  if (selectedTitle) selectedTitle.textContent = title;
  if (heading) heading.textContent = title;
  if (preview) preview.textContent = description;
}

function syncNodeWorkMarkdownPreview() {
  const preview = document.querySelector('#node-work-markdown');
  if (preview) preview.value = buildNodeWorkMarkdown(state, state.selectedNodeId);
}

async function exportWorkspaceToFiles() {
  try {
    const response = await fetch('/api/export-workspace', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ files: exportWorkspaceFiles(state) }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    exportStatus = `${t('exportDone')}: ${payload.written}`;
  } catch (error) {
    exportStatus = `${t('exportFailed')}: ${error.message}`;
  }
  render();
}

render();
