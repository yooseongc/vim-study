import test from 'node:test';
import assert from 'node:assert/strict';
import { everydayLessons } from '../src/lessons/everyday-editing.js';
import { checkExercise } from '../src/lessons/exercise.js';

test('everyday edits require exact goals and saving but accept alternative editing methods', () => {
  for (const { lesson } of everydayLessons) {
    const course = lesson.practice.guided || lesson.practice.challenge;
    const state = {
      path: '/work/' + course.file,
      mode: 'n',
      lines: course.target.split('\n'),
      modified: false,
    };
    assert.equal(checkExercise(course, state, course.target).kind, 'success');
    assert.equal(
      checkExercise(course, { ...state, lines: course.initial.split('\n') }, course.initial).kind,
      'text',
    );
    assert.equal(checkExercise(course, { ...state, modified: true }, course.initial).kind, 'save');
    assert.equal(
      checkExercise(course, { ...state, lines: [...state.lines, 'unrelated'] }, course.target).kind,
      'text',
    );
  }
});
test('multi-file feedback identifies the file and first different line', () => {
  const course = { file: 'a.txt', targets: { 'a.txt': 'keep\nnew', 'notes.txt': 'keep' } };
  const result = checkExercise(course, {
    path: '/work/a.txt',
    lines: ['keep', 'old'],
    buffers: { 'notes.txt': 'keep' },
  });
  assert.equal(result.kind, 'files');
  assert.equal(result.file, 'a.txt');
  assert.equal(result.row, 2);
  assert.equal(result.actual, 'old');
  assert.equal(result.expected, 'new');
});
test('line selection explains selecting, expanding, copying and pasting separately', () => {
  const lesson = everydayLessons[2].lesson,
    lines = lesson.practice.guided.initial.split('\n');
  const state = { lines, mode: 'n', cursor: [1, 1] };
  assert.equal(lesson.guidedStage(state), 0);
  assert.equal(lesson.guidedStage({ ...state, cursor: [2, 1] }), 1);
  assert.equal(lesson.guidedStage({ ...state, mode: 'V', cursor: [2, 1] }), 2);
  assert.equal(lesson.guidedStage({ ...state, mode: 'V', cursor: [3, 1] }), 3);
  assert.equal(lesson.guidedStage({ ...state, register: '- lint\n- test\n', cursor: [2, 1] }), 4);
  assert.equal(lesson.guidedStage({ ...state, register: '- lint\n- test\n', cursor: [4, 1] }), 5);
});

test('an unfinished recovery does not switch to saving when opening the command line', () => {
  const lesson = everydayLessons[0].lesson;
  const recovery = lesson.guidedGoals.length - 1;
  assert.equal(lesson.guidedStage({ lines: ['mistake'], mode: 'c' }, recovery), recovery);
});
