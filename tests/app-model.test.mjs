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
} from '../app/app-model.mjs';

test('initial state exposes tutorial graph with wiki-make assigned to wiki-maker agent', () => {
  const state = createInitialState();
  const wikiNode = state.graph.nodes.find((node) => node.id === 'wiki-make');

  assert.equal(state.locale, 'ko');
  assert.equal(state.project.path, '/home/sungjin/workspace/harness-rpg');
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

test('startTutorialSession completes automatic nodes and blocks destructive command for approval', () => {
  const state = createInitialState();
  const running = startTutorialSession(state);
  const wikiMaker = running.agents.find((agent) => agent.id === 'wiki-maker');

  assert.equal(running.graph.nodes.find((node) => node.id === 'wiki-make').status, 'completed');
  assert.equal(running.graph.nodes.find((node) => node.id === 'destructive-check').status, 'approval_required');
  assert.equal(running.selectedNodeId, 'wiki-make');
  assert.match(running.graph.nodes.find((node) => node.id === 'wiki-make').logs.friendly, /wiki-maker agent/);
  assert.equal(wikiMaker.xp, 2);
  assert.equal(wikiMaker.level, 1);
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
