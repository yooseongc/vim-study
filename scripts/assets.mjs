import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('public/vendor', { recursive: true });
for (const file of ['vim.js', 'vim.wasm', 'vim.data']) await copyFile(`node_modules/vim-wasm/${file}`, `public/vendor/${file}`);
await copyFile('node_modules/coi-serviceworker/coi-serviceworker.js', 'public/coi-serviceworker.js');
await copyFile('node_modules/coi-serviceworker/LICENSE', 'public/vendor/COI-LICENSE.txt');
await copyFile('licenses/VIM-LICENSE.txt', 'public/vendor/VIM-LICENSE.txt');
for (const font of ['jetbrains-mono', 'fira-code', 'source-code-pro', 'ibm-plex-mono', 'inconsolata']) {
  await copyFile(`node_modules/@fontsource/${font}/LICENSE`, `public/vendor/${font}-LICENSE.txt`);
}
