import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Tauri scaffold declares the desktop shell and backend commands', async () => {
  const cargo = await readFile('src-tauri/Cargo.toml', 'utf8');
  const lib = await readFile('src-tauri/src/lib.rs', 'utf8');
  const config = await readFile('src-tauri/tauri.conf.json', 'utf8');

  assert.match(cargo, /harness-rpg/);
  assert.match(lib, /save_state/);
  assert.match(lib, /load_state/);
  assert.match(lib, /append_bridge_event/);
  assert.match(config, /Harness RPG/);
});
