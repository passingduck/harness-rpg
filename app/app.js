import {
  deserializeState,
  serializeState,
  assignSkillToAgent,
  assignAgentToNode,
  canRemoveWarPlanNode,
  buildOuroborosProtocolPayload,
  applyWarPlanSpec,
  updateNodeText,
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
  createSession,
  forkSession,
  exportWorkspaceFiles,
} from './app-model.mjs';

const STORAGE_KEY = 'harness-rpg-state-v1';
let state = deserializeState(localStorage.getItem(STORAGE_KEY));
let exportStatus = '';
let warPlanSpecText = '';
let warPlanSpecStatus = '';
let dragState = null;

const copy = {
  ko: {
    tagline: 'OpenCode MCP/API 브릿지 · 로컬 우선 에이전트 작업대',
    project: '프로젝트', openProject: '프로젝트 열기', stateDir: '상태 디렉터리',
    localBackend: '로컬 백엔드', database: 'SQLite DB', fileState: '파일 상태', bridgeMode: '브릿지', exportedFiles: '파일-backed export', bridgeEvents: '브릿지 이벤트',
    exportWorkspace: '파일로 저장', exportReady: '저장 준비됨', exportDone: '파일 저장 완료', exportFailed: '파일 저장 실패',
    agentParty: '에이전트 파티', sessions: '세션', newSession: '새 세션', fork: '포크',
    warPlan: '전쟁 계획 튜토리얼', sessionStart: '세션 시작', approve: '파괴 명령 승인',
    addNode: '노드 추가', removeNode: '선택 노드 제거',
    ouroborosProtocol: 'Ouroboros 전쟁 계획 프로토콜', ouroborosPrompt: 'Ouroboros에게 보낼 구조 설명', ouroborosSpec: 'Ouroboros Spec JSON', applySpec: 'Spec 적용', specReady: 'Spec 대기 중', specApplied: 'Spec 적용 완료', specFailed: 'Spec 적용 실패',
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
    ouroborosProtocol: 'Ouroboros War Plan Protocol', ouroborosPrompt: 'Structure prompt for Ouroboros', ouroborosSpec: 'Ouroboros Spec JSON', applySpec: 'Apply Spec', specReady: 'Waiting for spec', specApplied: 'Spec applied', specFailed: 'Spec apply failed',
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

function defaultWarPlanSpecText() {
  const payload = buildOuroborosProtocolPayload(state);
  return JSON.stringify({
    protocol: payload.protocol,
    nodes: payload.currentGraph.nodes.map(({ id, title, description, agentId, skills, destructive }) => ({ id, title, description, agentId, skills, destructive })),
    edges: payload.currentGraph.edges,
  }, null, 2);
}

function renderOuroborosProtocolPanel() {
  const payload = buildOuroborosProtocolPayload(state);
  const specText = warPlanSpecText || defaultWarPlanSpecText();
  return `
    <section class="pixel-panel protocol-panel">
      <h2 class="section-title">${t('ouroborosProtocol')}</h2>
      <label>${t('ouroborosPrompt')}<textarea id="ouroboros-prompt" class="protocol-textarea" readonly>${esc(`${payload.prompt}\n\n${JSON.stringify(payload.graphSchema, null, 2)}`)}</textarea></label>
      <label>${t('ouroborosSpec')}<textarea id="ouroboros-spec" class="protocol-textarea">${esc(specText)}</textarea></label>
      <button id="apply-war-plan-spec" class="secondary">${t('applySpec')}</button>
      <p class="export-status">${warPlanSpecStatus || t('specReady')}</p>
    </section>
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
        ${renderOuroborosProtocolPanel()}
        <section class="pixel-panel">
          <h2 class="section-title">${t('skillTree')}</h2>
          <p class="muted">${t('skillHelp')} ${t('selectedAgent')}: <strong>${esc(agent.name)}</strong></p>
          <div class="skills">${renderSkills(agent)}</div>
        </section>
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
        <section class="pixel-panel">
          <h2 class="section-title">${t('nodeDetail')}</h2>
          <label>${t('nodeTitle')}<input id="node-title" value="${esc(node.title)}" /></label>
          <label>${t('nodeDescription')}<textarea id="node-description" class="node-textarea">${esc(node.description)}</textarea></label>
          <h3 id="node-title-heading">${esc(node.title)}</h3>
          <p id="node-description-preview">${esc(node.description)}</p>
          <p><strong>${t('status')}:</strong> ${statusLabel(node.status)}</p>
          ${renderNodeAgentSelect(node)}
          <p><strong>${t('usedSkills')}:</strong> ${esc(node.skills.join(', ') || 'none')}</p>
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
  document.querySelector('#new-session')?.addEventListener('click', () => save(createSession(state)));
  document.querySelector('#agent-name')?.addEventListener('input', (event) => updateDraft(updateAgentProfile(state, state.activeAgentId, { name: event.target.value })));
  document.querySelector('#profile-image')?.addEventListener('input', (event) => updateDraft(updateAgentProfile(state, state.activeAgentId, { profileImage: event.target.value })));
  document.querySelector('#agent-md')?.addEventListener('input', (event) => updateDraft(updateAgentMarkdown(state, state.activeAgentId, event.target.value)));
  document.querySelector('#node-title')?.addEventListener('input', (event) => {
    updateDraft(updateNodeText(state, state.selectedNodeId, { title: event.target.value }));
    syncSelectedNodeTextPreview(event.target.value, state.graph.nodes.find((node) => node.id === state.selectedNodeId)?.description ?? '');
  });
  document.querySelector('#node-description')?.addEventListener('input', (event) => {
    updateDraft(updateNodeText(state, state.selectedNodeId, { description: event.target.value }));
    syncSelectedNodeTextPreview(state.graph.nodes.find((node) => node.id === state.selectedNodeId)?.title ?? '', event.target.value);
  });
  document.querySelector('#ouroboros-spec')?.addEventListener('input', (event) => {
    warPlanSpecText = event.target.value;
  });
  document.querySelector('#apply-war-plan-spec')?.addEventListener('click', applyWarPlanSpecFromEditor);
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

function applyWarPlanSpecFromEditor() {
  try {
    const spec = JSON.parse(warPlanSpecText || defaultWarPlanSpecText());
    warPlanSpecStatus = t('specApplied');
    save(applyWarPlanSpec(state, spec));
  } catch (error) {
    warPlanSpecStatus = `${t('specFailed')}: ${error.message}`;
    render();
  }
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
