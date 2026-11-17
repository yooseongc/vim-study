import test from 'node:test';
import assert from 'node:assert/strict';
import { VimWorker } from 'vim-wasm';
import { installAtomicTransport } from '../src/lib/vim-transport.js';
function worker() {
  const value = Object.create(VimWorker.prototype);
  value.sharedBuffer = new Int32Array(new SharedArrayBuffer(512));
  value.pendingEvents = [];
  value.debug = false;
  installAtomicTransport(value);
  return value;
}
test('payload is complete before its atomic publication; upstream queue keeps event order', () => {
  const value = worker();
  const buffer = value.sharedBuffer;
  const set = buffer.set.bind(buffer);
  let publications = 0;
  buffer.set = (payload, offset) => {
    assert.equal(
      Atomics.load(buffer, 0),
      0,
      'worker must not see a ready event during payload writes',
    );
    set(payload, offset);
    publications++;
  };
  value.notifyKeyEvent('A', 65, false, true, false, false);
  value.notifyKeyEvent('&', 55, false, true, false, false);
  assert.deepEqual([...buffer.slice(0, 8)], [1, 65, 0, 1, 0, 0, 1, 65]);
  assert.equal(publications, 1);
  // Mirror the worker's receiveDone, then let the original queue send the next key.
  Atomics.store(buffer, 0, 0);
  value.onEventDone(1);
  assert.deepEqual([...buffer.slice(0, 8)], [1, 55, 0, 1, 0, 0, 1, 38]);
  assert.equal(publications, 2);
});
test('resize, UTF-16 strings and command payloads retain the upstream wire format', () => {
  const value = worker();
  value.sendEvent(2, [1024, 720]);
  assert.deepEqual([...value.sharedBuffer.slice(0, 3)], [2, 1024, 720]);
  Atomics.store(value.sharedBuffer, 0, 0);
  value.sendEvent(5, ['한😀']);
  assert.deepEqual([...value.sharedBuffer.slice(0, 5)], [5, 3, 0xd55c, 0xd83d, 0xde00]);
});
test('invalid or oversized messages fail before publishing any data', () => {
  const value = worker();
  assert.throws(() => value.sendEvent(5, ['x'.repeat(127)]), RangeError);
  assert.throws(() => value.sendEvent(5, [{}]), TypeError);
  assert.ok(value.sharedBuffer.every((n) => n === 0));
});
