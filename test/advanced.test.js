import test from 'node:test';
import assert from 'node:assert/strict';
import { stateMatches, stepSatisfied } from '../src/lessons/evaluate.js';
import { labExpected, labInitial, validateLab } from '../src/lessons/local-lab.js';
import { quickfix } from '../src/lessons/quickfix.js';

test('Vim dictionary key order does not affect file validation; missing or changed files fail', () => {
  const expected = quickfix.challengeState;
  const snapshot = {
    ...expected,
    files: Object.fromEntries(Object.entries(expected.files).reverse()),
  };
  assert.equal(stateMatches(expected, snapshot), true);
  assert.equal(
    stateMatches(expected, { ...snapshot, files: { ...snapshot.files, 'notes.txt': 'changed' } }),
    false,
  );
  const { 'notes.txt': omitted, ...missing } = snapshot.files;
  assert.equal(stateMatches(expected, { ...snapshot, files: missing }), false);
  assert.equal(stateMatches(expected, { ...snapshot, dirtyCount: 1 }), false);
  assert.equal(stateMatches({ markA: [2, 9] }, { markA: [9, 2] }), false);
});
test('correct visible buffer cannot substitute for saved multi-file state', () => {
  const step = { mode: 'n', text: quickfix.challengeTarget, state: quickfix.challengeState };
  const snapshot = {
    ...quickfix.challengeState,
    mode: 'n',
    lines: quickfix.challengeTarget.split('\n'),
  };
  assert.equal(stepSatisfied(step, snapshot, [], ''), true);
  assert.equal(stepSatisfied(step, { ...snapshot, files: {} }, [], ''), false);
  assert.equal(stepSatisfied(step, { ...snapshot, path: '/work/notes.txt' }, [], ''), false);
});
test('local checker rejects initial files, omitted files, collateral edits and missing final newline', () => {
  assert.equal(
    validateLab(labInitial).every((result) => result.passed),
    false,
  );
  assert.equal(
    validateLab(labExpected).every((result) => result.passed),
    true,
  );
  assert.equal(
    validateLab({}).some((result) => result.passed),
    false,
  );
  assert.equal(
    validateLab({ ...labExpected, 'notes.txt': 'edited\n' }).find(
      (result) => result.name === 'notes.txt',
    ).passed,
    false,
  );
  assert.equal(
    validateLab({ ...labExpected, 'names.txt': 'alpha\nbeta\nzeta' }).find(
      (result) => result.name === 'names.txt',
    ).passed,
    false,
  );
  assert.equal(
    validateLab(
      Object.fromEntries(
        Object.entries(labExpected).map(([name, text]) => [name, text.replaceAll('\n', '\r\n')]),
      ),
    ).every((result) => result.passed),
    true,
  );
});
