import test from 'node:test';
import assert from 'node:assert/strict';
import { practice, guidedStage, checkPractice } from '../src/lessons/workshop.js';
const snap = (kind, text, extra = {}) => ({
  path: `/work/${practice[kind].file}`,
  lines: text.split('\n'),
  mode: 'n',
  cursor: [1, 1],
  modified: 0,
  dirtyCount: 0,
  ...extra,
});
test('continuous typing can reach a later checkpoint without intermediate observations', () => {
  assert.equal(guidedStage(snap('guided', practice.guided.target)), 4);
  assert.equal(guidedStage(snap('guided', practice.guided.first, { mode: 'i' })), 1);
  assert.equal(guidedStage(snap('guided', practice.guided.first, { cursor: [2, 9] })), 3);
  assert.equal(guidedStage(snap('guided', practice.guided.initial)), 0);
  assert.equal(guidedStage(snap('guided', 'a mistake')), null);
});
test('success requires exact preserved content, the practice file, normal mode and saved buffers', () => {
  for (const kind of ['guided', 'challenge']) {
    const text = practice[kind].target,
      good = snap(kind, text);
    assert.equal(checkPractice(kind, good, text).kind, 'success');
    assert.equal(checkPractice(kind, good, '').kind, 'save');
    assert.equal(checkPractice(kind, { ...good, dirtyCount: 1 }, text).kind, 'save');
    assert.equal(checkPractice(kind, { ...good, mode: 'i' }, text).kind, 'mode');
    assert.equal(checkPractice(kind, { ...good, recording: 'a' }, text).kind, 'recording');
    assert.equal(checkPractice(kind, { ...good, path: '/work/other.txt' }, text).kind, 'path');
  }
});
test('a changed explanation line gets a precise recovery message', () => {
  const text = practice.challenge.target.replace('note: whole', 'note: oat');
  const feedback = checkPractice('challenge', snap('challenge', text), text);
  assert.equal(feedback.row, 3);
  assert.equal(feedback.expected, 'note: whole is the original recipe');
  assert.match(feedback.message, /u로/);
});
