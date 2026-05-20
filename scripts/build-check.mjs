import { access, readFile } from 'node:fs/promises';

const required = [
  'app/index.html',
  'app/styles.css',
  'app/app.js',
  'app/app-model.mjs',
  'scripts/dev-server.mjs',
  'src-tauri/Cargo.toml',
  'src-tauri/src/lib.rs',
];

for (const file of required) {
  await access(file);
}

const html = await readFile('app/index.html', 'utf8');
for (const marker of ['Harness RPG', 'app.js', 'styles.css']) {
  if (!html.includes(marker)) {
    throw new Error(`Missing ${marker} in app/index.html`);
  }
}

const app = await readFile('app/app.js', 'utf8');
for (const marker of ["'skill-tree', 'skillTree'", "'market', 'pools'", "'wiki', 'wikiMap'"]) {
  if (!app.includes(marker)) {
    throw new Error(`Missing ${marker} in app/app.js`);
  }
}

console.log('Build check passed');
