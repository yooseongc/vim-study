import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('public/vendor', { recursive: true });
for (const file of ['vim.js', 'vim.wasm', 'vim.data']) await copyFile(`node_modules/vim-wasm/${file}`, `public/vendor/${file}`);
await copyFile('node_modules/coi-serviceworker/coi-serviceworker.js', 'public/coi-serviceworker.js');
await copyFile('node_modules/coi-serviceworker/LICENSE', 'public/vendor/COI-LICENSE.txt');
await copyFile('licenses/VIM-LICENSE.txt', 'public/vendor/VIM-LICENSE.txt');
