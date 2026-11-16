export const WORKSPACE_KEY = 'vim-field-guide:workspace:v1';
export const workspace = { id: 'workspace', title: '나의 Vim 작업 공간' };
export const starterFiles = {
  'notes.txt': 'My Vim notes\nA buffer holds text. A window shows a buffer.\n',
  'tasks.txt': 'Open a file\nSplit a window\nSave a new file\n',
};
export function validFileName(name) {
  return typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(name);
}
export function workspaceName(path) {
  const name = path.startsWith('/work/') ? path.slice(6) : '';
  return validFileName(name) ? name : null;
}
export function readWorkspace(storage = localStorage) {
  try {
    const raw = storage.getItem(WORKSPACE_KEY);
    if (raw === null) return { files: { ...starterFiles }, warning: '' };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.files !== 'object' || Array.isArray(parsed.files) || !parsed.files)
      throw new Error('Invalid workspace');
    const entries = Object.entries(parsed.files);
    if (
      entries.some(
        ([name, text]) => !validFileName(name) || typeof text !== 'string' || text.includes('\0'),
      )
    )
      throw new Error('Invalid file');
    return { files: Object.fromEntries(entries), warning: '' };
  } catch {
    return {
      files: { ...starterFiles },
      warning:
        '작업 공간을 읽지 못했습니다. 예제 파일로 시작합니다. 저장 전 중요한 내용은 다운로드하세요.',
    };
  }
}
export function persistWorkspace(files, storage = localStorage) {
  try {
    storage.setItem(WORKSPACE_KEY, JSON.stringify({ files }));
    return true;
  } catch {
    return false;
  }
}
export function downloadWorkspaceFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
