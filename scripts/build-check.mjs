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

console.log('Build check passed');
