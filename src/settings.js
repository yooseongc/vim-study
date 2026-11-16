import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/source-code-pro/latin-400.css';
import '@fontsource/source-code-pro/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-700.css';
import '@fontsource/inconsolata/latin-400.css';
import '@fontsource/inconsolata/latin-700.css';

const key = 'vim-field-guide:editor-settings:v1';
const defaults = { family: 'monospace', size: 16 };
const bundled = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Inconsolata'];
const installed = ['Cascadia Code', 'Cascadia Mono', 'Consolas', 'Menlo', 'Monaco', 'Courier New'];
const families = ['monospace', ...bundled, ...installed];
export async function loadEditorFont({ family, size }) {
  if (!bundled.includes(family)) return;
  // Canvas must measure the real font, not a fallback while the WOFF2 loads.
  await Promise.all([400, 700].map(weight => document.fonts.load(`${weight} ${size}px "${family}"`)));
}
export function readSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return { family: families.includes(value?.family) ? value.family : defaults.family,
      size: Number.isInteger(value?.size) && value.size >= 12 && value.size <= 28 ? value.size : defaults.size };
  } catch { return { ...defaults }; }
}
// Only allowlisted families and bounded integers reach Vim's command line.
export function vimFont(settings) { return `${settings.family}:h${settings.size}`; }
export function setupSettings(apply) {
  const $ = id => document.getElementById(id);
  const select = $('font-family');
  select.replaceChildren(new Option('시스템 Mono (기본)', 'monospace'));
  for (const [label, fonts] of [['바로 사용 · 설치 필요 없음', bundled], ['기기에 설치된 글꼴', installed]]) {
    const group = document.createElement('optgroup'); group.label = label;
    group.append(...fonts.map(font => new Option(font, font)));
    select.append(group);
  }
  let settings = readSettings();
  let pending = Promise.resolve();
  function render() {
    $('font-family').value = settings.family;
    $('font-size').value = settings.size;
    $('font-size-value').textContent = `${settings.size} px`;
    $('font-preview').style.fontFamily = `"${settings.family}", monospace`;
    $('font-preview').style.fontSize = `${settings.size}px`;
  }
  function update() {
    render();
    const next = { ...settings };
    // Serialize requests: vim.wasm allows only one pending cmdline response.
    pending = pending.then(async () => {
      $('settings-status').textContent = '글꼴을 적용하는 중…';
      await loadEditorFont(next);
      await apply(next);
      try { localStorage.setItem(key, JSON.stringify(next)); $('settings-status').textContent = '설정이 적용되었습니다. 다음 방문에도 유지됩니다.'; }
      catch { $('settings-status').textContent = '이번에는 적용했지만 브라우저에 저장하지 못했습니다.'; }
    }).catch(() => { $('settings-status').textContent = 'Vim에 적용하지 못했습니다. 편집기가 준비된 뒤 다시 시도해 주세요.'; });
  }
  $('settings-open').onclick = () => { render(); $('settings').showModal(); };
  $('settings-close').onclick = () => $('settings').close();
  $('font-family').onchange = event => { settings.family = event.target.value; update(); };
  $('font-size').oninput = event => { settings.size = Number(event.target.value); update(); };
  $('settings-reset').onclick = () => { settings = { ...defaults }; update(); };
  render();
}
