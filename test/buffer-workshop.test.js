import test from 'node:test';
import assert from 'node:assert/strict';
import { bufferLessons } from '../src/lessons/buffer-workshop.js';
import { checkExercise } from '../src/lessons/exercise.js';
test('window cleanup is a final result, not a mandatory sequence of split keys', () => {
  const course = bufferLessons[0].lesson.practice.guided;
  const s = { path: '/work/a.txt', mode: 'n', lines: course.target.split('\n'), windowCount: 2 };
  assert.equal(checkExercise(course, s, course.target).kind, 'windows');
  assert.equal(checkExercise(course, { ...s, windowCount: 1 }, course.target).kind, 'success');
  assert.equal(bufferLessons[0].lesson.guidedStage({ ...s, windowCount: 1 }), 5);
});
test('hidden edits, saved file contents and protected files all remain part of completion', () => {
  const course = bufferLessons[2].lesson.practice.challenge;
  const s = {
    path: '/work/a.txt',
    mode: 'n',
    lines: course.targets['a.txt'].split('\n'),
    windowCount: 1,
    buffers: { ...course.targets },
    files: { ...course.targets },
    dirtyCount: 0,
  };
  assert.equal(checkExercise(course, s).kind, 'success');
  assert.equal(
    checkExercise(course, { ...s, files: { ...s.files, 'b.txt': course.initial } }).kind,
    'save',
  );
  assert.equal(
    checkExercise(course, { ...s, buffers: { ...s.buffers, 'notes.txt': 'changed' } }).kind,
    'files',
  );
  assert.equal(checkExercise(course, { ...s, dirtyCount: 1 }).kind, 'save');
  assert.equal(checkExercise(course, { ...s, windowCount: 2 }).kind, 'windows');
});
