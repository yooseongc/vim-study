const key = 'vim-field-guide:editor-settings:v1';
const defaults = { family: 'monospace', size: 16 };
const families = ['monospace', 'Consolas', 'Menlo', 'Courier New'];
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
