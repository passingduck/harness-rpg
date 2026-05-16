import {
  deserializeState,
  serializeState,
  assignSkillToAgent,
  updateAgentMarkdown,
  updateAgentProfile,
  setLocale,
  selectAgent,
  selectNode,
  getGraphProgress,
  startTutorialSession,
  approveDestructiveNode,
  createSession,
  forkSession,
} from './app-model.mjs';

const STORAGE_KEY = 'harness-rpg-state-v1';
let state = deserializeState(localStorage.getItem(STORAGE_KEY));

const copy = {
  ko: {
    tagline: 'OpenCode MCP/API 브릿지 · 로컬 우선 에이전트 작업대',
    project: '프로젝트', openProject: '프로젝트 열기', stateDir: '상태 디렉터리',
    agentParty: '에이전트 파티', sessions: '세션', newSession: '새 세션', fork: '포크',
    warPlan: '전쟁 계획 튜토리얼', sessionStart: '세션 시작', approve: '파괴 명령 승인',
    overallProgress: '전체 진행률', clearedNodes: '클리어 노드',
    flow: '흐름: 프로젝트 열기 → 에이전트/스킬 세팅 → Start → wiki-maker agent의 wiki-make → 파괴 명령 승인 게이트.',
    skillTree: 'OpenCode 스킬 트리', selectedAgent: '선택된 에이전트',
    skillHelp: '기존 OpenCode markdown 스킬은 영어 원문을 유지하고, UI만 번역합니다.',
    wikiMap: 'LLM Wiki 월드맵', wikiHelp: 'llm_wiki 개념을 host-agent skill로 포팅: ingest, query, lint, graph, gap detection, deep research, review actions, wikilink enrichment.',
    agentEditor: 'Agent.md 편집기', profileEditor: '프로필 편집', agentName: '에이전트 이름', profileImage: '프로필 이미지 URL', feedback: '앱 피드백',
    nodeDetail: '노드 상세', status: '상태', agent: '에이전트', usedSkills: '사용 스킬', friendlyLog: '친화 로그', rawLog: '원본 로그', whyUsed: '사용 이유', artifacts: '산출물',
    reviewCenter: '리뷰 센터', reviewSummary: '요약', reviewPlan: '계획', reviewSpec: '스펙', reviewLog: '로그', reviewDiff: '변경점', reviewResult: '결과',
    level: '레벨', xp: '경험치', language: 'English UI', markdownNote: 'Agent가 읽는 markdown은 영어로 유지됩니다.',
  },
  en: {
    tagline: 'OpenCode MCP/API bridge · local-first agent workbench',
    project: 'Project', openProject: 'Open Project', stateDir: 'State dir',
    agentParty: 'Agent Party', sessions: 'Sessions', newSession: 'New Session', fork: 'Fork',
    warPlan: 'War Plan Tutorial', sessionStart: 'Session Start', approve: 'Approve Destructive Command',
    overallProgress: 'Overall Progress', clearedNodes: 'Cleared Nodes',
    flow: 'Flow: project open → agent/skill setup → Start → wiki-make by wiki-maker agent → approval-gated destructive command.',
    skillTree: 'OpenCode Skill Tree', selectedAgent: 'Selected agent',
    skillHelp: 'Existing OpenCode markdown skills stay in English; only the human UI is localized.',
    wikiMap: 'LLM Wiki World Map', wikiHelp: 'llm_wiki concepts ported as host-agent skills: ingest, query, lint, graph, gap detection, deep research, review actions, wikilink enrichment.',
    agentEditor: 'Agent.md Editor', profileEditor: 'Profile Editor', agentName: 'Agent name', profileImage: 'Profile image URL', feedback: 'App Feedback',
    nodeDetail: 'Node Detail', status: 'Status', agent: 'Agent', usedSkills: 'Used skills', friendlyLog: 'Friendly Log', rawLog: 'Raw Log', whyUsed: 'Why Used', artifacts: 'Artifacts',
    reviewCenter: 'Review Center', reviewSummary: 'Summary', reviewPlan: 'Plan', reviewSpec: 'Spec', reviewLog: 'Log', reviewDiff: 'Diff', reviewResult: 'Result',
    level: 'Level', xp: 'XP', language: '한국어 UI', markdownNote: 'Markdown read by agents remains English.',
  },
};

function t(key) {
  return copy[state.locale]?.[key] ?? copy.ko[key] ?? key;
}

function save(next) {
  state = next;
  localStorage.setItem(STORAGE_KEY, serializeState(state));
  render();
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
    <article class="agent-card ${agent.id === state.activeAgentId ? 'active' : ''}" data-agent-id="${agent.id}" tabindex="0">
      <div class="avatar" aria-label="2-head-tall pixel avatar for ${agent.name}" ${agent.profileImage ? `style="background-image:url('${agent.profileImage}');background-size:cover;background-position:center"` : ''}></div>
      <div>
        <strong>${agent.name}</strong>
        <div class="muted">${t('level')} ${agent.level} · ${agent.className}</div>
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
        <strong>${skill.name}</strong>
        <span>${skill.branch}</span>
        <small>${skill.markdown.split('\n\n')[1]}</small>
      </button>
    `;
  }).join('');
}

function nodePosition(id) {
  return {
    start: [4, 140],
    'wiki-make': [190, 70],
    'skill-attune': [380, 190],
    'destructive-check': [575, 82],
    'session-plan': [760, 190],
  }[id] ?? [20, 20];
}

function renderEdges() {
  const centers = Object.fromEntries(state.graph.nodes.map((node) => {
    const [x, y] = nodePosition(node.id);
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
    const [x, y] = nodePosition(node.id);
    const selected = node.id === state.selectedNodeId;
    const runningClass = selected && node.status === 'completed' ? 'running' : '';
    return `
      <button class="node ${node.status} ${selected ? 'selected' : ''} ${runningClass}" data-node-id="${node.id}" style="left:${x}px;top:${y}px">
        ${node.title}
        <small>${statusLabel(node.status)}</small>
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
      <span>${session.name}<br><small class="muted">${session.id} · ${session.status}${session.parentId ? ` · fork of ${session.parentId}` : ''}</small></span>
      <button class="secondary" data-fork-session="${session.id}">${t('fork')}</button>
    </li>
  `).join('');
}

function renderWikiMap() {
  return state.wikiMap.map((pin) => `
    <div class="wiki-pin ${pin.kind}" style="left:${pin.x}%;top:${pin.y}%">${pin.label}</div>
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
      ${review.summary ? `<div class="review-summary"><strong>${t('reviewSummary')}</strong><span>${review.summary}</span></div>` : ''}
      <div class="review-grid">
        ${rows.map(([labelKey, value]) => `
          <article class="review-card">
            <h4>${t(labelKey)}</h4>
            <p>${value ?? ''}</p>
          </article>
        `).join('')}
      </div>
    </div>
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
          <div class="project-path">${state.project.path}</div>
          <small class="muted">${t('stateDir')}: ${state.project.stateDir} · SQLite + markdown files</small>
          <p><button id="open-project">${t('openProject')}</button></p>
        </section>
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
          <button id="start-session">${t('sessionStart')}</button>
          ${node.status === 'approval_required' ? `<button id="approve-node" class="secondary">${t('approve')}</button>` : ''}
          <div class="graph" aria-label="Diablo-style war plan graph">${renderGraph()}</div>
        </section>
        <section class="pixel-panel">
          <h2 class="section-title">${t('skillTree')}</h2>
          <p class="muted">${t('skillHelp')} ${t('selectedAgent')}: <strong>${agent.name}</strong></p>
          <div class="skills">${renderSkills(agent)}</div>
        </section>
        <section class="pixel-panel">
          <h2 class="section-title">${t('wikiMap')}</h2>
          <p class="muted">${t('wikiHelp')}</p>
          <div class="wiki-map">${renderWikiMap()}</div>
        </section>
      </main>

      <aside class="inspector">
        <section class="pixel-panel">
          <h2 class="section-title">${t('profileEditor')}</h2>
          <label>${t('agentName')}<input id="agent-name" value="${agent.name}" /></label>
          <label>${t('profileImage')}<input id="profile-image" value="${agent.profileImage ?? ''}" placeholder="https://..." /></label>
          <p class="muted">${t('markdownNote')}</p>
          <h2 class="section-title">${t('agentEditor')}</h2>
          <textarea id="agent-md" aria-label="Agent.md editor">${agent.agentMd}</textarea>
          ${agent.feedback ? `<h2 class="section-title">${t('feedback')}</h2><ul class="feedback-list">${agent.feedback.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
        </section>
        <section class="pixel-panel">
          <h2 class="section-title">${t('nodeDetail')}</h2>
          <h3>${node.title}</h3>
          <p>${node.description}</p>
          <p><strong>${t('status')}:</strong> ${statusLabel(node.status)}</p>
          <p><strong>${t('agent')}:</strong> ${node.agentId}</p>
          <p><strong>${t('usedSkills')}:</strong> ${node.skills.join(', ') || 'none'}</p>
          <h2 class="section-title review-title">${t('reviewCenter')}</h2>
          ${renderReviewCenter(node)}
          <h4>${t('friendlyLog')}</h4>
          <div class="log-box">${node.logs.friendly}</div>
          <h4>${t('rawLog')}</h4>
          <div class="log-box">${node.logs.raw}</div>
          <h4>${t('whyUsed')}</h4>
          <div class="log-box">${node.logs.why}</div>
          <h4>${t('artifacts')}</h4>
          <ul>${node.logs.artifacts.map((artifact) => `<li class="artifact">${artifact}</li>`).join('')}</ul>
        </section>
      </aside>
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelector('#toggle-locale')?.addEventListener('click', () => save(setLocale(state, state.locale === 'ko' ? 'en' : 'ko')));
  document.querySelector('#open-project')?.addEventListener('click', () => save({ ...state, project: { ...state.project, opened: true } }));
  document.querySelector('#start-session')?.addEventListener('click', () => save(startTutorialSession(state)));
  document.querySelector('#approve-node')?.addEventListener('click', () => save(approveDestructiveNode(state, 'destructive-check')));
  document.querySelector('#new-session')?.addEventListener('click', () => save(createSession(state)));
  document.querySelector('#agent-name')?.addEventListener('input', (event) => save(updateAgentProfile(state, state.activeAgentId, { name: event.target.value })));
  document.querySelector('#profile-image')?.addEventListener('input', (event) => save(updateAgentProfile(state, state.activeAgentId, { profileImage: event.target.value })));
  document.querySelector('#agent-md')?.addEventListener('input', (event) => save(updateAgentMarkdown(state, state.activeAgentId, event.target.value)));
  document.querySelectorAll('[data-agent-id]').forEach((element) => element.addEventListener('click', () => save(selectAgent(state, element.dataset.agentId))));
  document.querySelectorAll('[data-skill-id]').forEach((element) => element.addEventListener('click', () => save(assignSkillToAgent(state, state.activeAgentId, element.dataset.skillId))));
  document.querySelectorAll('[data-node-id]').forEach((element) => element.addEventListener('click', () => save(selectNode(state, element.dataset.nodeId))));
  document.querySelectorAll('[data-fork-session]').forEach((element) => element.addEventListener('click', () => save(forkSession(state, element.dataset.forkSession))));
}

render();
