import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { GuidedLesson } from './GuidedLesson.jsx';
import { reviewCourse } from '../lessons/review.js';
import { readReviews, recordReview, reviewQueue } from '../lessons/review-progress.js';
import { issueLabels } from '../lessons/feedback.js';
import s from '../styles/ReviewSession.module.css';

const dateLabel = (time) =>
  new Date(time).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function ReviewSession({ ref }) {
  const editor = useRef(null);
  const [records, setRecords] = useState(readReviews);
  const [active, setActive] = useState(null);
  const [result, setResult] = useState('');
  const [warning, setWarning] = useState('');
  const [now, setNow] = useState(Date.now);
  useImperativeHandle(ref, () => ({ canLeave: () => editor.current?.canLeave() ?? true }), []);
  useEffect(() => {
    const refresh = () => {
      setRecords(readReviews());
      setNow(Date.now());
    };
    const tick = setInterval(() => setNow(Date.now()), 30000);
    window.addEventListener('storage', refresh);
    return () => {
      clearInterval(tick);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  const cards = reviewQueue(records, now);
  const due = cards.filter((card) => records[card.id]?.dueAt <= now);
  function start(card) {
    setResult('');
    setActive({ card, course: reviewCourse(card, records[card.id]?.attempts || 0) });
  }
  function complete(report) {
    const {
      records: next,
      record,
      stored,
    } = recordReview(active.card.id, report, Date.now(), records);
    setRecords(next);
    setWarning(
      stored
        ? ''
        : '브라우저 저장 공간에 접근하지 못했습니다. 이번 기록은 새로고침하면 사라집니다.',
    );
    setResult(
      `${record.assisted ? '도움을 받아 해결했습니다.' : '도움 없이 해결했습니다.'} 다음 복습: ${dateLabel(record.dueAt)}.${stored ? ' 기록을 브라우저에 저장했습니다.' : ' 기록을 저장하지 못했습니다.'}`,
    );
  }
  if (active)
    return (
      <div className={s.active}>
        <div className={s.toolbar}>
          <button
            onClick={() => {
              if (editor.current?.canLeave()) {
                setActive(null);
                setNow(Date.now());
              }
            }}
          >
            ← 복습 목록
          </button>
          <span>완료한 문제만 복습 기록에 반영됩니다.</span>
        </div>
        <GuidedLesson
          ref={editor}
          key={active.course.id}
          course={active.course}
          initialChallenge
          onComplete={complete}
          completionNote={result}
          onPractice={() => {
            if (editor.current?.canLeave()) {
              setActive(null);
              setNow(Date.now());
            }
          }}
        />
      </div>
    );
  return (
    <section className={s.hub}>
      <p className={s.eyebrow}>피드백과 변형 복습</p>
      <h2 id="title">다시 꺼내 쓰는 연습</h2>
      <p>
        설명을 보고 따라 했던 편집을 다른 문장에도 적용해 보세요. 막히면 현재 상태를 점검하거나, 한
        키씩 나눈 도움말을 펼칠 수 있습니다.
      </p>
      <div className={s.summary}>
        <strong id="review-due">지금 복습할 항목 {due.length}개</strong>
        <span>처음 풀 문제 {cards.filter((card) => !records[card.id]).length}개</span>
        <button id="review-start" onClick={() => start(cards[0])}>
          {due.length
            ? '복습할 항목부터 시작'
            : cards.some((card) => !records[card.id])
              ? '첫 연습 시작'
              : '미리 연습하기'}
        </button>
      </div>
      {warning && <p role="status">{warning}</p>}
      <div className={s.cards}>
        {cards.map((card) => {
          const record = records[card.id];
          return (
            <article key={card.id} className={s.card} data-review={card.id}>
              <p className={s.eyebrow}>
                {card.from} ·{' '}
                {!record ? '첫 연습' : record.dueAt <= now ? '복습할 시간' : '복습 예정'}
              </p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {record ? (
                <>
                  <p>
                    {record.attempts}회 완료 · 최근{' '}
                    {record.assisted ? '도움받아 해결' : '도움 없이 해결'}
                    <br />
                    다음 복습 {dateLabel(record.dueAt)}
                  </p>
                  {record.issues.length > 0 && (
                    <p>
                      다시 살펴볼 부분:{' '}
                      {record.issues.map((issue) => issueLabels[issue]).join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <p>아직 기록이 없습니다. 먼저 한 번 풀어 보세요.</p>
              )}
              <button onClick={() => start(card)}>{card.title} 연습</button>
            </article>
          );
        })}
      </div>
      <details>
        <summary>복습 간격과 기록은 어떻게 정하나요?</summary>
        <p>
          도움말을 열거나 실패한 상태 점검이 있었다면 10분 뒤에 다시 제안합니다. 도움 없이 해결하면
          1일, 3일, 7일 간격으로 늘립니다. 예정일 전에 미리 풀어도 복습 날짜를 뒤로 미루지 않습니다.
        </p>
        <p>
          완료할 때마다 세 가지 예제를 번갈아 제공합니다. 아직 풀고 있는 문제의 입력이나 중도 종료는
          실패로 기록하지 않습니다. 기록은 이 브라우저에만 저장되며 알림을 보내지는 않습니다.
        </p>
      </details>
    </section>
  );
}
