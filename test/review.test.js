import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnose } from '../src/lessons/feedback.js';
import { reviewCards, reviewCourse } from '../src/lessons/review.js';
import {
  nextReview,
  readReviews,
  recordReview,
  reviewQueue,
} from '../src/lessons/review-progress.js';

const now = 1700000000000;
const day = 86400000;
const solo = { hintUsed: false, issues: [] };

test('feedback distinguishes editing, command, cursor, register and saving problems', () => {
  const step = { mode: 'n', text: 'new name', saved: true };
  const snapshot = { mode: 'n', lines: ['new name'], modified: 1, cursor: [1, 1], register: '' };
  assert.equal(diagnose(step, null).kind, 'waiting');
  assert.equal(diagnose(step, { ...snapshot, mode: 'i' }).kind, 'mode');
  assert.equal(diagnose(step, { ...snapshot, lines: ['old name'] }).kind, 'text');
  assert.equal(diagnose(step, snapshot).kind, 'save');
  assert.equal(diagnose(step, { ...snapshot, modified: 0 }, [], 'new name').kind, 'success');
  assert.equal(
    diagnose({ ...step, mode: 'c', command: 'w' }, { ...snapshot, mode: 'c', command: 'q' }).kind,
    'command',
  );
  assert.equal(diagnose({ ...step, cursor: [1, 4] }, snapshot).kind, 'cursor');
  assert.equal(diagnose({ ...step, register: 'new' }, snapshot).kind, 'register');
  const missing = diagnose({ ...step, text: 'one\ntwo' }, { ...snapshot, lines: ['one'] });
  assert.equal(missing.actual, undefined);
  assert.equal(missing.expected, 'two');
});

test('independent due reviews grow to 1, 3 and 7 days; early practice preserves due date', () => {
  const first = nextReview(undefined, solo, now);
  assert.equal(first.dueAt, now + day);
  const early = nextReview(first, solo, now + 1000);
  assert.equal(early.dueAt, first.dueAt);
  assert.equal(early.streak, first.streak);
  const second = nextReview(first, solo, first.dueAt);
  assert.equal(second.dueAt, first.dueAt + 3 * day);
  const third = nextReview(second, solo, second.dueAt);
  assert.equal(third.dueAt, second.dueAt + 7 * day);
  assert.equal(nextReview(third, solo, third.dueAt).streak, 3);
  for (const report of [
    { hintUsed: true, issues: [] },
    { hintUsed: false, issues: ['text', 'save'] },
  ]) {
    const repeat = nextReview(third, report, now);
    assert.equal(repeat.streak, 0);
    assert.equal(repeat.dueAt, now + 600000);
    assert.equal(repeat.assisted, true);
  }
});

test('due cards precede unseen cards and future cards; variants rotate', () => {
  const records = {
    insert: { ...nextReview(undefined, solo, now), dueAt: now + day },
    quotes: { ...nextReview(undefined, solo, now), dueAt: now - 1 },
  };
  assert.deepEqual(
    reviewQueue(records, now).map(({ id }) => id),
    ['quotes', 'word', 'insert'],
  );
  for (const card of reviewCards) {
    assert.notEqual(reviewCourse(card, 0).challengeTarget, reviewCourse(card, 1).challengeTarget);
    assert.equal(reviewCourse(card, 0).challengeTarget, reviewCourse(card, 3).challengeTarget);
  }
});

test('review storage validates corrupt data, preserves other cards and reports blocked writes', () => {
  let data = '{bad';
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = {
    getItem: () => data,
    setItem: (_key, value) => {
      data = value;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  try {
    assert.deepEqual(readReviews(), {});
    recordReview('insert', solo, now);
    recordReview('word', { hintUsed: true, issues: ['text'] }, now);
    assert.equal(readReviews().insert.attempts, 1);
    assert.deepEqual(readReviews().word.issues, ['text']);
    data = JSON.stringify({
      insert: { attempts: -1 },
      word: { attempts: 2, streak: 1, dueAt: 'tomorrow' },
    });
    assert.deepEqual(readReviews(), {});
    storage.setItem = () => {
      throw new Error('blocked');
    };
    assert.equal(recordReview('quotes', solo, now).stored, false);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
