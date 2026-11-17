import { Worker } from 'node:worker_threads';
import assert from 'node:assert/strict';
import { VimWorker } from 'vim-wasm';
import { installAtomicTransport } from '../src/lib/vim-transport.js';
const sender = Object.create(VimWorker.prototype);
sender.sharedBuffer = new Int32Array(new SharedArrayBuffer(512));
sender.debug = false;
const control = new Int32Array(new SharedArrayBuffer(16));
const reader = new Worker(
  `
  const {workerData}=require('node:worker_threads');
  const buffer=new Int32Array(workerData.buffer), control=new Int32Array(workerData.control);
  Atomics.store(control,0,1); Atomics.notify(control,0);
  while(Atomics.load(buffer,0)===0) Atomics.wait(buffer,0,0,100);
  Atomics.store(control,2,buffer[7]);
  Atomics.store(control,1,1); Atomics.notify(control,1);
`,
  { eval: true, workerData: { buffer: sender.sharedBuffer.buffer, control: control.buffer } },
);
try {
  if (Atomics.load(control, 0) === 0) Atomics.wait(control, 0, 0, 5000);
  assert.equal(Atomics.load(control, 0), 1, 'reader ready');
  const encode = sender.encodeStringToBuffer;
  sender.encodeStringToBuffer = function (value, index) {
    // Model preemption immediately before writing the string. The worker is
    // allowed to poll at this point; a producer must not yet publish readiness.
    if (Atomics.load(this.sharedBuffer, 0) !== 0 && Atomics.load(control, 1) === 0)
      Atomics.wait(control, 1, 0, 2000);
    return encode.call(this, value, index);
  };
  if (process.env.UNPATCHED_TRANSPORT !== '1') installAtomicTransport(sender);
  sender.sendEvent(1, [65, false, false, false, false, 'a']);
  if (Atomics.load(control, 1) === 0) Atomics.wait(control, 1, 0, 5000);
  assert.equal(Atomics.load(control, 1), 1, 'reader consumed the event');
  assert.equal(
    Atomics.load(control, 2),
    97,
    'a published key must already contain its complete string payload',
  );
  console.log('PASS: a polling worker receives the complete key under preemption.');
} finally {
  await reader.terminate();
}
