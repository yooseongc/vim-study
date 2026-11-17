import test from 'node:test';
import assert from 'node:assert/strict';
import { grammarLessons } from '../src/lessons/grammar-workshop.js';
import { checkExercise } from '../src/lessons/exercise.js';
test('incremental search is not a confirmed edit location; operator waits before input', () => {
  const lesson = grammarLessons[0].lesson;
  const s = { lines: lesson.practice.guided.initial.split('\n'), mode: 'c', cursor: [1, 7] };
  assert.equal(lesson.guidedStage(s), 0);
  assert.equal(lesson.guidedStage({ ...s, mode: 'n' }), 1);
  assert.equal(lesson.guidedStage({ ...s, mode: 'no' }), 2);
  assert.equal(lesson.guidedStage({ ...s, mode: 'n', cursor: [2, 7] }), 0);
});
test('continuous edits reach saving without observing earlier stages; protected content still matters', () => {
  for (const [index, segment] of grammarLessons.entries()) {
    const course = segment.lesson.practice.guided || segment.lesson.practice.challenge;
    const s = {
      lines: course.target.split('\n'),
      mode: 'n',
      path: `/work/${course.file}`,
      modified: false,
    };
    assert.equal(checkExercise(course, s, course.target).kind, 'success');
    if (index < 3)
      assert.equal(segment.lesson.guidedGoals[segment.lesson.guidedStage(s, 0)].label, '저장');
    assert.equal(checkExercise(course, { ...s, modified: true }, course.initial).kind, 'save');
    assert.equal(
      checkExercise(course, { ...s, lines: course.initial.split('\n') }, course.target).kind,
      'text',
    );
  }
});
