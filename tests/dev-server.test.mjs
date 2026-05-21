import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createServer } from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { createDevServer, findAvailablePort, runOpenCodeNode, writeWorkspaceFiles } from '../scripts/dev-server.mjs';

const execFileAsync = promisify(execFile);
const repoRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');

test('findAvailablePort falls back when preferred port is already in use', async () => {
  const blocker = createServer();
  await new Promise((resolve) => blocker.listen(0, '127.0.0.1', resolve));
  const preferredPort = blocker.address().port;

  try {
    const port = await findAvailablePort(preferredPort);
    assert.notEqual(port, preferredPort);
    assert.equal(port, preferredPort + 1);
  } finally {
    await new Promise((resolve) => blocker.close(resolve));
  }
});

test('writeWorkspaceFiles persists relative project files and rejects path escapes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-'));

  try {
    await writeWorkspaceFiles(root, { '.harness-rpg/state.json': '{"ok":true}\n' });
    const state = await readFile(join(root, '.harness-rpg/state.json'), 'utf8');

    assert.equal(state, '{"ok":true}\n');
    await assert.rejects(
      () => writeWorkspaceFiles(root, { '../escape.txt': 'nope' }),
      /Refusing to write outside project root/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('writeWorkspaceFiles removes stale static graph node markdown files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-'));

  try {
    await writeWorkspaceFiles(root, {
      '.harness-rpg/graphs/current/GRAPH.md': '# Graph\n',
      '.harness-rpg/graphs/current/01_START_NODE.md': '# Start\n',
      '.harness-rpg/graphs/current/02_WIKI_MAKE_NODE.md': '# Wiki\n',
    });
    await writeWorkspaceFiles(root, {
      '.harness-rpg/graphs/current/GRAPH.md': '# Graph\n',
      '.harness-rpg/graphs/current/01_START_NODE.md': '# Start\n',
    });

    const graph = await readFile(join(root, '.harness-rpg/graphs/current/GRAPH.md'), 'utf8');
    await assert.rejects(
      () => readFile(join(root, '.harness-rpg/graphs/current/02_WIKI_MAKE_NODE.md'), 'utf8'),
      /ENOENT/,
    );
    assert.equal(graph, '# Graph\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runOpenCodeNode writes workspace files and invokes opencode with node prompt', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-'));
  const calls = [];

  try {
    const result = await runOpenCodeNode(root, {
      nodeId: 'wiki-make',
      agentId: 'wiki-maker',
      agentIds: ['wiki-maker'],
      skills: ['wiki-ingest-source'],
      files: { '.harness-rpg/graphs/current/GRAPH.md': '# Graph\n' },
      prompt: '# Wiki Make\n\nDo the node work.',
    }, {
      runner: async (command, args, options) => {
        calls.push({ command, args, cwd: options.cwd, timeoutMs: options.timeoutMs });
        return { stdout: 'node result from opencode', stderr: '' };
      },
    });
    const graph = await readFile(join(root, '.harness-rpg/graphs/current/GRAPH.md'), 'utf8');

    assert.equal(graph, '# Graph\n');
    assert.equal(calls[0].command, 'opencode');
    assert.equal(calls[0].timeoutMs, 60000);
    assert.deepEqual(calls[0].args.slice(0, 4), ['run', '--dir', root, '--model']);
    assert.equal(calls[0].args.at(-1), '# Wiki Make\n\nDo the node work.');
    assert.equal(result.ok, true);
    assert.equal(result.nodeId, 'wiki-make');
    assert.equal(result.stdout, 'node result from opencode');
    assert.match(result.artifact, /\.harness-rpg\/opencode\/wiki-make-result\.md/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('opencode node endpoint returns JSON failure without an HTTP error status', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-'));
  const server = createDevServer(root, {
    opencode: {
      runner: async () => {
        throw new Error('opencode unavailable');
      },
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/opencode-node`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nodeId: 'start', prompt: 'run start', files: {} }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, false);
    assert.equal(payload.error, 'opencode unavailable');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test('project info endpoint reports the target project root separately from the harness root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-target-'));
  const server = createDevServer(root);
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/project-info`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.projectRoot, root);
    assert.equal(payload.harnessRoot, repoRoot);
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
    await rm(root, { recursive: true, force: true });
  }
});

test('project state endpoint returns target harness state when present', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-target-state-'));
  await writeWorkspaceFiles(root, {
    '.harness-rpg/state.json': '{"project":{"name":"go2-octo-vla-gym","path":"/tmp/testbed"}}\n',
  });
  const server = createDevServer(root);
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/project-state`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.state.project.name, 'go2-octo-vla-gym');
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
    await rm(root, { recursive: true, force: true });
  }
});

test('project state endpoint reports empty state when target state is absent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-rpg-empty-state-'));
  const server = createDevServer(root);
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/project-state`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.state, null);
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
    await rm(root, { recursive: true, force: true });
  }
});

test('setup.sh installs a project-local launcher for clone-only agent projects', async () => {
  const target = await mkdtemp(join(tmpdir(), 'claude-opencode-codex-project-'));

  try {
    const { stdout } = await execFileAsync('bash', [join(repoRoot, 'setup.sh'), target], { cwd: repoRoot });
    const launcher = join(target, '.harness-rpg/bin/harness-rpg');
    const envFile = join(target, '.harness-rpg/harness-rpg.env');
    const readme = join(target, '.harness-rpg/README.md');
    const launcherText = await readFile(launcher, 'utf8');
    const envText = await readFile(envFile, 'utf8');
    const readmeText = await readFile(readme, 'utf8');
    const launcherMode = (await stat(launcher)).mode;

    assert.match(stdout, /Harness RPG installed/);
    assert.match(launcherText, /HARNESS_RPG_PROJECT_ROOT=/);
    assert.match(launcherText, /scripts\/dev-server\.mjs/);
    assert.match(envText, new RegExp(`HARNESS_RPG_PROJECT_ROOT=${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.match(envText, /HARNESS_RPG_ROOT=/);
    assert.match(readmeText, /Claude Code, OpenCode, Copilot, Codex/);
    assert.notEqual(launcherMode & 0o111, 0);
  } finally {
    await rm(target, { recursive: true, force: true });
  }
});
