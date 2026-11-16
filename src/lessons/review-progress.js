import { reviewCards } from './review.js';
import { issueLabels } from './feedback.js';
const key = 'vim-field-guide:review:v1';
const day = 24 * 60 * 60 * 1000;
const intervals = [day, 3 * day, 7 * day];
const integer = (value, max = 1000000) => Number.isSafeInteger(value) && value >= 0 && value <= max;

export function readReviews() {
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    return Object.fromEntries(
      reviewCards.flatMap(({ id }) => {
        const item = raw?.[id];
        if (
          !item ||
          !integer(item.attempts) ||
          !integer(item.streak, 3) ||
          !integer(item.dueAt, 8640000000000000) ||
          !integer(item.lastAt, 8640000000000000)
        )
          return [];
        return [
          [
            id,
            {
              ...item,
              assisted: item.assisted === true,
              issues: Array.isArray(item.issues)
                ? item.issues.filter((issue) => Object.hasOwn(issueLabels, issue))
                : [],
            },
          ],
        ];
      }),
    );
  } catch {
    return {};
  }
}

export function nextReview(previous, report, now) {
  const assisted = report.hintUsed || report.issues.length > 0;
  const streak = assisted ? 0 : Math.min((previous?.streak || 0) + 1, 3);
  // Early practice rotates examples but never increases a future review interval.
  const early = !assisted && previous && previous.dueAt > now;
  return {
    attempts: Math.min((previous?.attempts || 0) + 1, 1000000),
    streak: early ? previous.streak : streak,
    lastAt: now,
    dueAt: early ? previous.dueAt : now + (assisted ? 10 * 60 * 1000 : intervals[streak - 1]),
    assisted: Boolean(assisted),
    issues: [...new Set(report.issues)].filter((issue) => Object.hasOwn(issueLabels, issue)),
  };
}

export function recordReview(id, report, now = Date.now(), fallback = {}) {
  const records = { ...fallback, ...readReviews() };
  const record = nextReview(records[id], report, now);
  records[id] = record;
  try {
    localStorage.setItem(key, JSON.stringify(records));
    return { records, record, stored: true };
  } catch {
    return { records, record, stored: false };
  }
}

export function reviewQueue(records, now = Date.now()) {
  return [...reviewCards].sort((a, b) => {
    const priority = (card) => (!records[card.id] ? 1 : records[card.id].dueAt <= now ? 0 : 2);
    return priority(a) - priority(b) || (records[a.id]?.dueAt || 0) - (records[b.id]?.dueAt || 0);
  });
}
