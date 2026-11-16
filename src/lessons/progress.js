const key = (id) => `vim-field-guide:${id}:v1`;
export function readLesson(id = 'basics') {
  try {
    const value = JSON.parse(localStorage.getItem(key(id)));
    return {
      completed: value?.completed === true,
      savedText: typeof value?.savedText === 'string' ? value.savedText : '',
    };
  } catch {
    return { completed: false, savedText: '' };
  }
}
export function saveLesson(update, id = 'basics') {
  try {
    localStorage.setItem(key(id), JSON.stringify({ ...readLesson(id), ...update }));
    return true;
  } catch {
    return false;
  }
}

export const readBasics = () => readLesson();
export const saveBasics = (update) => saveLesson(update);
