import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';

import { findAvailablePort, writeWorkspaceFiles } from '../scripts/dev-server.mjs';

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
