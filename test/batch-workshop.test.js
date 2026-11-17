import test from 'node:test';
import assert from 'node:assert/strict';
import { batchLessons, correctBatchList, batchFiles } from '../src/lessons/batch-workshop.js';
const lesson = batchLessons[1].lesson;
const course = lesson.practice.guided;
const snapshot = () => ({
  path: '/work/api.txt',
  lines: course.initial.split('\n'),
  buffers: { 'api.txt': course.initial, ...course.files },
  mode: 'n',
  command: '',
  argumentFiles: batchFiles,
});
test('argument names, not just argument count, define the intended list', () => {
  assert.ok(correctBatchList(snapshot()));
  assert.equal(
    correctBatchList({ ...snapshot(), argumentFiles: ['/work/api.txt', '/work/notes.txt'] }),
    false,
  );
  const wrong = { ...snapshot(), argumentFiles: ['/work/api.txt', '/work/notes.txt'] };
  assert.equal(lesson.guidedGoals[lesson.guidedStage(wrong)].label, '파일 목록');
});
test('continuous multi-file edits reach saving without intermediate observations', () => {
  const done = { ...snapshot(), buffers: course.targets, lines: course.target.split('\n') };
  assert.equal(lesson.guidedGoals[lesson.guidedStage(done)].label, '저장 범위');
  assert.equal(
    lesson.guidedGoals[lesson.guidedStage({ ...done, command: 'argdo ', mode: 'c' })].label,
    '저장 실행',
  );
  assert.equal(lesson.guidedGoals[lesson.guidedStage({ ...done, mode: 'r' })].label, '메시지 확인');
});
test('a changed excluded buffer takes priority over repeating the batch command', () => {
  const wrong = {
    ...snapshot(),
    buffers: { ...course.targets, 'notes.txt': course.target },
    lines: course.target.split('\n'),
  };
  assert.equal(lesson.guidedGoals[lesson.guidedStage(wrong)].label, '복구');
});
