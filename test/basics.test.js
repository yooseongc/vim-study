import test from 'node:test';
import assert from 'node:assert/strict';
import { steps, stepSatisfied } from '../src/lessons/basics.js';

test('step completion requires actual text and exact mode, not only a key', () => {
  const snapshot = { mode: 'i', lines: ['hello'], modified: 0, command: '' };
  assert.equal(stepSatisfied(steps[1], snapshot, ['i'], ''), true);
  assert.equal(stepSatisfied(steps[1], { ...snapshot, mode: 'n' }, ['i'], ''), false);
  assert.equal(stepSatisfied(steps[1], { ...snapshot, lines: ['wrong'] }, ['i'], ''), false);
  assert.equal(stepSatisfied(steps[1], snapshot, [], ''), false);
});
test('command entry does not count as saving', () => {
  const snapshot = { mode: 'c', lines: ['Vim hello'], modified: 1, command: 'w' };
  assert.equal(stepSatisfied(steps[7], snapshot, [], ''), true);
  assert.equal(stepSatisfied(steps[8], snapshot, [], ''), false);
  assert.equal(
    stepSatisfied(steps[8], { ...snapshot, mode: 'n', modified: 0 }, [], 'Vim hello'),
    true,
  );
  assert.equal(
    stepSatisfied(steps[8], { ...snapshot, mode: 'n', modified: 1 }, [], 'Vim hello'),
    false,
  );
});
