// vim-wasm 0.0.13 publishes its status before filling the shared payload.
// A polling worker can then consume stale fields. Keep the upstream queue and
// acknowledgements, but publish only after the complete payload is written.
export function installAtomicTransport(worker) {
  worker.sendEvent = (status, values) => {
    const payload = [];
    for (const value of values) {
      if (typeof value === 'string') {
        payload.push(value.length);
        for (let i = 0; i < value.length; i++) payload.push(value.charCodeAt(i));
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        payload.push(Number(value));
      } else {
        throw new TypeError('Unsupported Vim worker payload');
      }
    }
    const buffer = worker.sharedBuffer;
    if (payload.length >= buffer.length)
      throw new RangeError('Vim worker payload exceeds shared buffer');
    buffer.set(payload, 1);
    Atomics.store(buffer, 0, status);
    Atomics.notify(buffer, 0, 1);
  };
}
