import test from 'node:test';
import assert from 'node:assert/strict';
import { basicsLessons } from '../src/lessons/basics-workshop.js';
import { checkExercise } from '../src/lessons/exercise.js';
test('fast input can reach saved completion without observing intermediate undo stages', () => {
  const lesson = basicsLessons[1].lesson;
  const course = lesson.practice.guided;
  const snapshot = { lines: [course.target], mode: 'n', modified: false, path: '/work/undo.txt' };
  assert.equal(lesson.guidedStage(snapshot, 0), 4);
  assert.equal(checkExercise(course, snapshot, course.target).kind, 'success');
  assert.equal(checkExercise(course, { ...snapshot, mode: 'i' }, course.target).kind, 'mode');
  assert.equal(checkExercise(course, { ...snapshot, modified: true }, course.initial).kind, 'save');
});
test('recovering a typo does not instruct the learner to redo the wrong text', () => {
  const lesson = basicsLessons[1].lesson;
  const recovery = lesson.guidedStage({ lines: ['xready'], mode: 'n' }, 1);
  assert.equal(recovery, 5);
  assert.equal(lesson.guidedStage({ lines: ['ready'], mode: 'n' }, recovery), 0);
});
