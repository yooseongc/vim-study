import test from 'node:test';
import assert from 'node:assert/strict';
import { checkExercise } from '../src/lessons/exercise.js';
import { quickfixLessons } from '../src/lessons/quickfix-workshop.js';
const course = quickfixLessons[1].lesson.practice.guided;
const good = () => ({
  path: '/work/web.txt',
  lines: course.targets['web.txt'].split('\n'),
  buffers: { ...course.targets },
  files: { ...course.targets },
  mode: 'n',
  dirtyCount: 0,
  modified: 0,
});
test('continuous edits reach saving, but final insertion still explains Escape', () => {
  const lesson = quickfixLessons[1].lesson;
  const snapshot = { ...good(), cursor: [1, 4], quickfixIndex: 2, quickfixCount: 2 };
  assert.equal(lesson.guidedGoals[lesson.guidedStage(snapshot)].label, '저장');
  assert.ok(
    lesson.guidedGoals[lesson.guidedStage({ ...snapshot, mode: 'i' })].keys.some(
      ([key]) => key === 'Esc',
    ),
  );
});
test('multi-file success requires saved targets, intact protected file and no hidden changes', () => {
  assert.equal(checkExercise(course, good()).kind, 'success');
  const unsaved = good();
  unsaved.files['api.txt'] = course.initial;
  assert.equal(checkExercise(course, unsaved).kind, 'save');
  const hidden = good();
  hidden.buffers['api.txt'] = course.initial;
  assert.equal(checkExercise(course, hidden).kind, 'files');
  const protectedFile = good();
  protectedFile.buffers['notes.txt'] = 'changed';
  assert.match(checkExercise(course, protectedFile).message, /notes.txt/);
  assert.equal(checkExercise(course, { ...good(), dirtyCount: 1 }).kind, 'save');
  assert.equal(checkExercise(course, { ...good(), mode: 'i' }).kind, 'mode');
  assert.equal(checkExercise(course, { ...good(), recording: 'a' }).kind, 'recording');
  assert.equal(checkExercise(course, { ...good(), quickfixWindow: 1 }).kind, 'path');
  assert.equal(checkExercise(course, { ...good(), path: '/work/unknown.txt' }).kind, 'path');
});
test('current buffer overrides an older buffer snapshot and individual saves are accepted', () => {
  assert.equal(checkExercise(course, { ...good(), lines: ['wrong'] }).kind, 'files');
  const state = good();
  state.buffers['web.txt'] = 'older observation';
  assert.equal(checkExercise(course, state).kind, 'success');
});
