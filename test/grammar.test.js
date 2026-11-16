import test from 'node:test';
import assert from 'node:assert/strict';
import { grammar } from '../src/lessons/grammar.js';
import { stepSatisfied } from '../src/lessons/evaluate.js';
import { readLesson, saveLesson } from '../src/lessons/progress.js';

test('search requires search command line and confirmed cursor, copy requires register', () => {
  const search = grammar.steps[0];
  const snapshot = { mode: 'c', lines: grammar.initial.split('\n'), command: '', commandType: ':' };
  assert.equal(stepSatisfied(search, snapshot, [], ''), false);
  assert.equal(stepSatisfied(search, { ...snapshot, commandType: '/' }, [], ''), true);
  const location = grammar.steps.find((step) => step.cursor);
  assert.equal(stepSatisfied(location, { ...snapshot, mode: 'n', cursor: [1, 1] }, [], ''), false);
  assert.equal(stepSatisfied(location, { ...snapshot, mode: 'n', cursor: [1, 15] }, [], ''), true);
  const copy = grammar.steps.find((step) => step.register);
  const copied = { mode: 'n', lines: copy.text.split('\n'), register: '' };
  assert.equal(stepSatisfied(copy, copied, [], ''), false);
  assert.equal(stepSatisfied(copy, { ...copied, register: 'admin user' }, [], ''), true);
});

test('lesson saves remain independent and preserve the existing basics key', () => {
  const values = new Map([
    ['vim-field-guide:basics:v1', JSON.stringify({ completed: true, savedText: 'Vim ready' })],
  ]);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) },
  });
  try {
    assert.equal(saveLesson({ savedText: 'new' }, 'grammar'), true);
    assert.equal(saveLesson({ completed: true }, 'grammar'), true);
    assert.deepEqual(readLesson('basics'), { completed: true, savedText: 'Vim ready' });
    assert.deepEqual(readLesson('grammar'), { completed: true, savedText: 'new' });
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
