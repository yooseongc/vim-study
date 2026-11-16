import test from 'node:test';
import assert from 'node:assert/strict';
import { readStudy, readSettings, writeStorage } from '../src/lib/storage.js';

const storage = (value) => ({ getItem: () => JSON.stringify(value) });
test('existing progress and files survive schema validation', () => {
  const result = readStudy(
    storage({
      completed: ['port', 'port', 'unknown'],
      files: { port: { 'nginx.conf': 'saved\n', 'untrusted.txt': 'ignored' } },
    }),
  );
  assert.deepEqual(result.state, {
    completed: ['port'],
    files: { port: { 'nginx.conf': 'saved\n' } },
  });
});
test('malformed and blocked storage recover without crashing', () => {
  assert.deepEqual(readStudy({ getItem: () => '{bad' }).state, { completed: [], files: {} });
  assert.ok(
    readStudy({
      getItem: () => {
        throw new Error('blocked');
      },
    }).warning,
  );
  assert.equal(
    writeStorage(
      'key',
      {},
      {
        setItem: () => {
          throw new Error('quota');
        },
      },
    ),
    false,
  );
});
test('font settings preserve valid values and reject executable or out-of-range values', () => {
  assert.deepEqual(readSettings(storage({ family: 'JetBrains Mono', size: 22 })), {
    family: 'JetBrains Mono',
    size: 22,
  });
  assert.deepEqual(readSettings(storage({ family: "' | qall!", size: 100 })), {
    family: 'monospace',
    size: 16,
  });
});
