import { VimWasm, checkBrowserCompatibility } from 'vim-wasm';
import { missions, filesFor, validate } from './missions.js';
import './style.css';
import { readSettings, setupSettings, vimFont } from './settings.js';

const $ = id => document.getElementById(id);
const storageKey = 'vim-field-guide:v1';
let state = { completed: [], files: {} };
let storageWarning = '';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.completed) && saved.files && typeof saved.files === 'object') state = saved;
} catch { storageWarning = '저장 기록을 읽지 못했습니다. 이번 세션에서 계속할 수 있습니다.'; }
const current = missions.find(m => m.id === location.hash.slice(1)) || missions[0];
const index = missions.indexOf(current);
let vim, dirty = false, keys = 0, hints = 0;
setupSettings(async settings => {
  if (!vim?.isRunning()) throw new Error('Vim is not ready');
  await vim.cmdline(`let &guifont = '${vimFont(settings)}' | redraw!`);
});
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; }
  catch { $('save-status').textContent = '저장 공간에 접근할 수 없습니다. 페이지를 닫기 전 파일을 내려받으세요 (:export).'; return false; }
}
function renderProgress() {
  const count = missions.filter(m => state.completed.includes(m.id)).length;
  $('completed').textContent = String(count).padStart(2, '0');
  $('progress').style.width = `${count / missions.length * 100}%`;
  $('mission-list').replaceChildren(...missions.map((m, i) => {
    const button = document.createElement('button');
    button.className = `mission ${m.id === current.id ? 'active' : ''}`;
    button.setAttribute('aria-current', m.id === current.id ? 'step' : 'false');
    const number = document.createElement('span'); number.className = 'mission-number'; number.textContent = state.completed.includes(m.id) ? '✓' : String(i + 1).padStart(2, '0');
    const content = document.createElement('span');
    const title = document.createElement('strong'); title.textContent = m.title;
    const subtitle = document.createElement('small'); subtitle.textContent = m.skill;
    content.append(title, subtitle); button.append(number, content);
    button.onclick = () => {
      if (m.id === current.id || (dirty && !confirm('저장하지 않은 편집이 있습니다. :w로 저장하지 않은 내용을 버리고 이동할까요?'))) return;
      location.hash = m.id; location.reload();
    };
    return button;
  }));
}
renderProgress();
$('level').textContent = `FIELD MISSION ${String(index + 1).padStart(2, '0')}`;
$('tags').textContent = current.skill;
$('title').textContent = current.title;
$('story').textContent = current.story;
$('objective').textContent = current.objective;
$('file-name').textContent = `/work/${current.file}`;
$('guide-toggle').onclick = () => { $('guide').hidden = !$('guide').hidden; };
$('hint').onclick = () => {
  $('hint-panel').hidden = false;
  if (hints < current.hints.length) hints++;
  $('hint-panel').replaceChildren(...current.hints.slice(0, hints).map((hint, i) => { const p = document.createElement('p'); p.textContent = `${i + 1}. ${hint}`; return p; }));
  $('hint').textContent = hints < current.hints.length ? `다음 힌트 (${hints}/3)` : '힌트 모두 펼침';
};
$('reset').onclick = () => {
  if (!confirm('이 미션의 파일을 처음 상태로 되돌릴까요? 저장한 편집도 초기화됩니다. 완료 기록은 유지됩니다.')) return;
  delete state.files[current.id];
  if (persist()) { dirty = false; location.reload(); }
};
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
$('vim-input').addEventListener('keydown', event => {
  if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) $('keys').textContent = `${++keys} keys`;
  // Ctrl+Shift+F moves focus out of the terminal, even if Vim consumes Tab.
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') { event.preventDefault(); event.stopImmediatePropagation(); $('check').focus(); }
}, true);
window.fieldChanged = modified => { dirty = Boolean(modified); };
window.fieldPath = path => { $('file-name').textContent = path; };
window.fieldSaved = (path, lines) => {
  const name = path.replace(/^\/work\//, '');
  if (!Object.hasOwn(filesFor(current), name)) return;
  state.files[current.id] ??= {};
  state.files[current.id][name] = `${lines.join('\n')}\n`;
  if (persist()) $('save-status').textContent = `${name} · 이 브라우저에 저장됨`;
};
window.fieldResult = (files, modified) => {
  dirty = Boolean(modified);
  const results = validate(current, files);
  const success = results.every(r => r.ok) && !dirty;
  $('feedback').className = success ? 'success' : 'retry';
  $('feedback').textContent = success ? '✓ 미션 완료. 정확한 편집으로 문제를 해결했습니다.' : dirty ? '저장하지 않은 변경이 있습니다. :w 또는 :wa로 저장한 뒤 다시 확인하세요.' : `다시 살펴보세요: ${results.filter(r => !r.ok).map(r => r.file).join(', ')}. 목표 외의 내용도 유지해야 합니다.`;
  if (success) {
    if (!state.completed.includes(current.id)) state.completed.push(current.id);
    persist(); renderProgress();
    $('review').hidden = false;
    $('review').replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = 'FIELD NOTE / 현장에서 써먹기';
    const p = document.createElement('p'); p.textContent = current.review;
    $('review').append(heading, p);
    if (missions[index + 1]) { const next = document.createElement('button'); next.textContent = '다음 미션으로 →'; next.onclick = () => { location.hash = missions[index + 1].id; location.reload(); }; $('review').append(next); }
  }
  $('check').disabled = false;
};
const names = Object.keys(filesFor(current));
const dict = '{' + names.map(name => `'${name}': join(readfile('/work/${name}'), "\\n")`).join(',') + '}';
$('check').onclick = async () => {
  $('check').disabled = true;
  try {
    vim.sendKeydown('Escape', 27);
    await vim.cmdline('call FieldCheck()');
  } catch (error) { showError(error); }
};
function showError(error) {
  $('loading').hidden = false;
  $('loading').textContent = `Vim을 실행하지 못했습니다. 최신 데스크톱 브라우저에서 새로고침해 주세요. ${error.message || error}`;
  $('engine-status').textContent = 'VIM · 연결 확인 필요';
  $('check').disabled = true;
}
const vimrc = `set nocompatible
set number hidden noswapfile nobackup nowritebackup
set incsearch hlsearch ignorecase smartcase
set backspace=indent,eol,start
let &guifont = '${vimFont(readSettings())}'
set laststatus=2
let &statusline = '%f %m%r%=%l:%c'
syntax on
set background=dark
highlight Normal guifg=#d5e2dd guibg=#152521
highlight LineNr guifg=#71847c guibg=#152521
highlight StatusLine guifg=#152521 guibg=#b0c4a0
highlight Search guifg=#152521 guibg=#e6c27a
function! FieldCheck()
call jsevalfunc('window.fieldResult(arguments[0], arguments[1])', [${dict}, len(filter(getbufinfo(), 'v:val.changed'))], v:true)
endfunction
augroup FieldGuide
autocmd!
autocmd BufWritePost /work/* call jsevalfunc('window.fieldSaved(arguments[0],arguments[1])', [expand('%:p'), getline(1,'$')], v:true)
autocmd BufEnter * call jsevalfunc('window.fieldPath(arguments[0])', [expand('%:p')], v:true)
autocmd TextChanged,TextChangedI,BufWritePost,BufEnter * call jsevalfunc('window.fieldChanged(arguments[0])', [len(filter(getbufinfo(), 'v:val.changed'))], v:true)
augroup END
`;
function boot() {
  const incompatibility = checkBrowserCompatibility();
  if (incompatibility) { showError('보안 격리 초기화가 필요합니다. HTTPS 또는 localhost로 접속하고 서비스 워커를 허용하세요.'); return; }
  vim = new VimWasm({ canvas: $('vim-canvas'), input: $('vim-input'), workerScriptPath: `${import.meta.env.BASE_URL}vendor/vim.js` });
  vim.onVimInit = () => { $('loading').hidden = true; $('engine-status').textContent = '● VIM 8.2 · WASM'; $('check').disabled = false; vim.focus(); };
  vim.onError = showError;
  vim.onVimExit = () => { dirty = false; $('loading').hidden = false; $('loading').textContent = 'Vim을 종료했습니다. 새로고침하면 저장한 파일로 다시 시작합니다.'; $('check').disabled = true; $('engine-status').textContent = 'VIM · 종료'; };
  vim.onFileExport = (path, contents) => {
    const url = URL.createObjectURL(new Blob([contents])); const a = document.createElement('a'); a.href = url; a.download = path.split('/').pop(); a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const initial = filesFor(current);
  for (const name of names) if (typeof state.files[current.id]?.[name] === 'string') initial[name] = state.files[current.id][name];
  vim.start({ clipboard: false, dirs: ['/work'], files: { '/field.vim': vimrc, ...Object.fromEntries(Object.entries(initial).map(([name, content]) => [`/work/${name}`, content])) }, cmdArgs: ['-u', '/field.vim', ...names.map(name => `/work/${name}`)] });
}
if (storageWarning) $('save-status').textContent = storageWarning;
try { boot(); } catch (error) { showError(error); }
