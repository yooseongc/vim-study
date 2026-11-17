import test from 'node:test';
import assert from 'node:assert/strict';
import { codeEditingLessons } from '../src/lessons/code-editing.js';
import { repetitionTransfer, filesTransfer } from '../src/lessons/transfer-practice.js';
import { localSectionsFor } from '../src/lessons/local-environments.js';
import { checkExercise } from '../src/lessons/exercise.js';
test('code and transfer exercises accept saved targets, reject initial content and preserved-line damage', () => {
  for (const part of [...codeEditingLessons, repetitionTransfer, filesTransfer]) {
    const c = part.lesson.practice.guided || part.lesson.practice.challenge;
    const target = c.target || c.targets[c.file];
    const state = {
      path: '/work/' + c.file,
      lines: target.split('\n'),
      mode: 'n',
      modified: false,
      dirtyCount: 0,
      files: c.targets,
      buffers: c.targets,
    };
    assert.equal(checkExercise(c, state, target).kind, 'success');
    assert.notEqual(
      checkExercise(c, { ...state, lines: c.initial.split('\n') }, c.initial).kind,
      'success',
    );
    assert.notEqual(
      checkExercise(c, { ...state, lines: [...state.lines, 'extra'] }, target).kind,
      'success',
    );
    assert.equal(checkExercise(c, { ...state, dirtyCount: 1 }, target).kind, 'save');
  }
});
test('native route avoids Unix process commands and keeps internal sorting distinct', () => {
  const native = localSectionsFor('native');
  assert.equal(native.length, 4);
  const commands = native.flatMap((section) => section.steps.map((s) => s.command)).filter(Boolean);
  assert.ok(commands.includes(':sort u'));
  assert.ok(commands.includes('Get-Location'));
  for (const command of ['Ctrl+z', 'fg', 'jobs', ':!bash verify.sh', ':%!sort -u'])
    assert.ok(!commands.includes(command));
  assert.equal(localSectionsFor('unix').length, 6);
  assert.ok(
    localSectionsFor('unix')
      .flatMap((s) => s.steps)
      .some((s) => s.command === ':%!sort -u'),
  );
  assert.ok(!localSectionsFor('unix')[0].steps.some((s) => s.text.includes('/mnt/c')));
});
test('indentation guide waits for setup and distinguishes one selected line from two', () => {
  const lesson = codeEditingLessons[1].lesson;
  const state = { mode: 'n', lines: lesson.practice.guided.initial.split('\n'), cursor: [1, 1] };
  assert.equal(lesson.guidedStage(state), 0);
  assert.equal(lesson.guidedStage({ ...state, lastCommand: 'setlocal shiftwidth=2 expandtab' }), 1);
  assert.equal(lesson.guidedStage({ ...state, mode: 'V', cursor: [2, 1] }, 2), 3);
  assert.equal(lesson.guidedStage({ ...state, mode: 'V', cursor: [3, 1] }, 3), 4);
});
