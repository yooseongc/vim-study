import { missions, filesFor } from '../missions.js';

export const STUDY_KEY = 'vim-field-guide:v1';
export const SETTINGS_KEY = 'vim-field-guide:editor-settings:v1';
export const defaultSettings = { family: 'monospace', size: 16 };
export const bundledFonts = [
  'JetBrains Mono',
  'Fira Code',
  'Source Code Pro',
  'IBM Plex Mono',
  'Inconsolata',
];
export const installedFonts = [
  'Cascadia Code',
  'Cascadia Mono',
  'Consolas',
  'Menlo',
  'Monaco',
  'Courier New',
];

export function readStudy(storage = localStorage) {
  const state = { completed: [], files: {} };
  try {
    const value = JSON.parse(storage.getItem(STUDY_KEY));
    for (const mission of missions) {
      if (Array.isArray(value?.completed) && value.completed.includes(mission.id))
        state.completed.push(mission.id);
      for (const name of Object.keys(filesFor(mission))) {
        const text = value?.files?.[mission.id]?.[name];
        if (typeof text === 'string') (state.files[mission.id] ??= {})[name] = text;
      }
    }
    return { state, warning: '' };
  } catch {
    return {
      state,
      warning: '저장 기록을 읽지 못했습니다. 이번 세션에서 계속할 수 있습니다.',
    };
  }
}
export function readSettings(storage = localStorage) {
  try {
    const value = JSON.parse(storage.getItem(SETTINGS_KEY));
    return {
      family: ['monospace', ...bundledFonts, ...installedFonts].includes(value?.family)
        ? value.family
        : defaultSettings.family,
      size:
        Number.isInteger(value?.size) && value.size >= 12 && value.size <= 28
          ? value.size
          : defaultSettings.size,
    };
  } catch {
    return { ...defaultSettings };
  }
}
export function writeStorage(key, value, storage = localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
