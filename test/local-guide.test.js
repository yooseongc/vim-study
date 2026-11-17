import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLab, labExpected, labArchiveFiles } from '../src/lessons/local-lab.js';
test('local comparison distinguishes missing files, differing text and final newline', () => {
  const missing = validateLab({})[0];
  assert.equal(missing.row, null);
  const changed = validateLab({ ...labExpected, 'api.conf': 'mode=wrong\nport=8080\n' })[0];
  assert.equal(changed.row, 1);
  assert.equal(changed.actual, 'mode=wrong');
  assert.equal(changed.expected, 'mode=prod');
  const eof = validateLab({ ...labExpected, 'names.txt': 'alpha\nbeta\nzeta' }).at(-1);
  assert.equal(eof.row, 4);
  assert.equal(eof.actual, '(줄 없음)');
  assert.equal(eof.expected, '(마지막 줄바꿈)');
  assert.match(labArchiveFiles()['README.txt'], /:1,2s\/\^\/ready: \//);
});
