import test from 'node:test';
import assert from 'node:assert/strict';
import { missions, filesFor, validate } from '../src/missions.js';
for (const m of missions) {
  test(`${m.id}: initial fails, target passes, unrelated changes fail`, () => {
    assert.equal(
      validate(m, filesFor(m)).every((r) => r.ok),
      false,
    );
    const target = { [m.file]: m.target, ...m.extraTarget };
    assert.equal(
      validate(m, target).every((r) => r.ok),
      true,
    );
    assert.equal(
      validate(m, { ...target, [m.file]: m.target + 'unexpected\n' }).every((r) => r.ok),
      false,
    );
    assert.equal(
      validate(m, {
        ...target,
        [m.file]: m.target.replace(/\n/g, '\r\n'),
      }).every((r) => r.ok),
      true,
    );
    assert.equal(
      validate(m, {}).every((r) => r.ok),
      false,
    );
  });
}
test('both buffers must be updated', () => {
  const m = missions.at(-1);
  assert.equal(
    validate(m, { ...filesFor(m), [m.file]: m.target }).every((r) => r.ok),
    false,
  );
});
