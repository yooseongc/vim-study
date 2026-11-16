const key = 'vim-field-guide:basics:v1';
export function readBasics() {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return {
      completed: value?.completed === true,
      savedText: typeof value?.savedText === 'string' ? value.savedText : '',
    };
  } catch {
    return { completed: false, savedText: '' };
  }
}
export function saveBasics(update) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...readBasics(), ...update }));
    return true;
  } catch {
    return false;
  }
}
