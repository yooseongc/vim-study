import test from 'node:test';
import assert from 'node:assert/strict';
import { curriculum, nextLesson } from '../src/lessons/curriculum.js';
import { guidedCourses } from '../src/lessons/catalog.js';

test('the public path reaches local practice once without cycling through archived courses', () => {
  const visited = [];
  let course = curriculum[0];
  while (course) {
    assert.ok(!visited.includes(course.id), 'no next-course cycle');
    assert.ok(!guidedCourses.some((legacy) => legacy.id === course.id));
    visited.push(course.id);
    course = nextLesson(course.id);
  }
  assert.equal(visited.length, 13);
  assert.equal(visited[0], 'basics-workshop');
  assert.equal(visited.at(-1), 'local');
  assert.equal(nextLesson('missing'), undefined);
});
