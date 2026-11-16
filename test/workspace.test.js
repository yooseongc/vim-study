import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readWorkspace,
  persistWorkspace,
  validFileName,
  workspaceName,
  WORKSPACE_KEY,
  starterFiles,
} from '../src/lib/workspace-files.js';

test('workspace names cannot escape /work or become Ex commands', () => {
  for (const name of ['memo.txt', 'README', 'a-b_01.js']) assert.equal(validFileName(name), true);
  for (const name of [
    '../memo',
    '/tmp/file',
    "x'|q",
    'a b',
    'a/b',
    '__proto__',
    'a\nb',
    'a'.repeat(65),
  ])
    assert.equal(validFileName(name), false);
  assert.equal(workspaceName('/work/memo.txt'), 'memo.txt');
  assert.equal(workspaceName('/work/sub/file'), null);
  assert.equal(workspaceName('/other/memo.txt'), null);
});
test('workspace preserves file bytes, empty workspace and independent storage', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.deepEqual(readWorkspace(storage).files, starterFiles);
  const files = { 'empty.txt': '', 'lf.txt': 'a\nb\n', 'noeol.txt': 'last', 'dos.txt': 'a\r\n' };
  assert.equal(persistWorkspace(files, storage), true);
  assert.deepEqual(readWorkspace(storage).files, files);
  assert.deepEqual([...values.keys()], [WORKSPACE_KEY]);
  persistWorkspace({}, storage);
  assert.deepEqual(readWorkspace(storage).files, {});
  values.set(WORKSPACE_KEY, '{bad');
  assert.ok(readWorkspace(storage).warning);
  values.set(WORKSPACE_KEY, JSON.stringify({ files: { '../x': 'bad' } }));
  assert.ok(readWorkspace(storage).warning);
  storage.setItem = () => {
    throw new Error('quota');
  };
  assert.equal(persistWorkspace(files, storage), false);
});
