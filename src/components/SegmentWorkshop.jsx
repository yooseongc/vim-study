import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { PracticeRun } from './PracticeRun.jsx';
import { CourseMenu, WorkshopHeader } from './WorkshopNavigation.jsx';
import s from '../styles/Workshop.module.css';

function SegmentFinish({ segment, next, retry, select, nextCourse, continueId }) {
  const [choice, setChoice] = useState(null);
  const heading = useRef(null);
  const course = segment.lesson.practice.guided || segment.lesson.practice.challenge;
  useEffect(() => heading.current?.focus(), []);
  return (
    <main className={s.finish} tabIndex={-1} ref={heading}>
      <div className={s.finishMark} aria-hidden="true">
        ✓
      </div>
      <p className={s.eyebrow}>{segment.label}</p>
      <h1>{segment.recap}</h1>
      <p>{segment.detail}</p>
      <div className={s.finishPreview}>
        {course.targets ? (
          Object.entries(course.targets).map(([name, text]) => (
            <div key={name}>
              <b>{name}</b>
              <pre>{text}</pre>
            </div>
          ))
        ) : (
          <pre>{course.target}</pre>
        )}
      </div>
      {segment.question ? (
        <div className={s.decision}>
          <h2>{segment.question}</h2>
          {segment.answers.map((answer, index) => (
            <button key={answer} aria-pressed={choice === index} onClick={() => setChoice(index)}>
              {answer}
            </button>
          ))}
          {choice !== null && (
            <p role="status">
              {choice === segment.correct ? '맞습니다. ' : '다시 생각해보세요. '}
              {segment.why}
            </p>
          )}
          <button
            id={continueId}
            className={s.primary}
            onClick={next}
            disabled={choice !== segment.correct}
          >
            다음 문제로 →
          </button>
        </div>
      ) : (
        <div className={s.endLinks}>
          <button className={s.primary} onClick={() => select('workspace')}>
            내 파일로 자유롭게 연습하기 →
          </button>
          <button onClick={() => select(nextCourse.id)}>{nextCourse.label} →</button>
          <button onClick={retry}>이 문제 다시 풀기</button>
          <p className={s.small}>
            판정은 결과와 저장을 확인합니다. 정해진 키 순서를 강제하지 않습니다.
          </p>
        </div>
      )}
      <p className={s.small}>이 문제의 내용과 완료 기록은 브라우저에 남기지 않습니다.</p>
    </main>
  );
}

export function SegmentWorkshop({
  ref,
  onSelect,
  workshop,
  segments,
  Intro,
  nextCourse,
  continueId,
}) {
  const [index, setIndex] = useState(-1);
  const [attempt, setAttempt] = useState(0);
  const [complete, setComplete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const run = useRef(null);
  const segment = segments[index];
  useImperativeHandle(ref, () => ({ canLeave: () => run.current?.canLeave() ?? true }), []);
  return (
    <div className={s.page}>
      <WorkshopHeader openMenu={() => setMenuOpen(true)} />
      {index < 0 ? (
        <Intro start={() => setIndex(0)} />
      ) : complete ? (
        <SegmentFinish
          key={index}
          segment={segment}
          nextCourse={nextCourse}
          continueId={continueId}
          next={() => {
            setComplete(false);
            setIndex(index + 1);
          }}
          retry={() => {
            setComplete(false);
            setAttempt(attempt + 1);
          }}
          select={onSelect}
        />
      ) : (
        <PracticeRun
          key={`${index}:${attempt}`}
          ref={run}
          lesson={segment.lesson}
          kind={segment.lesson.practice.guided ? 'guided' : 'challenge'}
          sectionLabel={segment.label}
          reset={() => setAttempt(attempt + 1)}
          finish={() => setComplete(true)}
        />
      )}
      <CourseMenu
        title={workshop.title}
        open={menuOpen}
        close={() => setMenuOpen(false)}
        select={onSelect}
      />
    </div>
  );
}
