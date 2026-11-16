import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { workshop, practice, concepts, dotWorkshop } from '../lessons/workshop.js';
import { PracticeRun } from './PracticeRun.jsx';
import { CourseMenu, WorkshopHeader } from './WorkshopNavigation.jsx';
import s from '../styles/Workshop.module.css';

function Intro({ start }) {
  const [concept, setConcept] = useState(0);
  const [after, setAfter] = useState(false);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>작은 편집 하나를, 내 것으로.</p>
        <h1 id="title">
          한 번 바꾸고,
          <br />
          <em>다시 쓰기.</em>
        </h1>
        <p className={s.lede}>
          같은 단어를 두 번 고칠 때, 두 번 입력할 필요는 없습니다. 한 번의 변경을 만들고 다음
          위치에서 꺼내 써봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>뜻을 이해하고</b>
          </span>
          <span>
            02 <b>이어 입력하고</b>
          </span>
          <span>
            03 <b>직접 골라 바꿉니다</b>
          </span>
        </div>
        <button className={s.primary} id="workshop-start" onClick={start}>
          직접 연습하기 <span aria-hidden="true">→</span>
        </button>
        <p className={s.small}>검색과 입력을 해본 분에게 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <div className={s.introLesson}>
        <div className={s.previewHeading}>
          <span>오늘의 작은 문제</span>
          <span className={s.fileTag}>menu.txt</span>
        </div>
        <h2>두 잔을 더 큰 사이즈로.</h2>
        <p>
          tea와 coffee만 <code>small</code>에서 <code>large</code>로 바꿉니다. 설명에 쓰인 small은
          남겨두세요.
        </p>
        <div className={s.preview} aria-label={after ? '목표 내용' : '시작 내용'}>
          {(after ? practice.guided.target : practice.guided.initial).split('\n').map((line, i) => (
            <div key={i} className={after && i < 2 ? s.changedLine : ''}>
              <span>{i + 1}</span>
              <code>{line}</code>
            </div>
          ))}
        </div>
        <button className={s.textButton} aria-pressed={after} onClick={() => setAfter((v) => !v)}>
          {after ? '처음 내용 보기' : '바꿀 부분 미리 보기'} <span aria-hidden="true">↔</span>
        </button>
        <div className={s.conceptHeading}>
          <h3>단어 하나를 바꾸는 세 글자</h3>
          <span>각 키를 눌러 뜻을 보세요</span>
        </div>
        <div className={s.concepts}>
          {concepts.map((item, i) => (
            <button key={item.key} aria-pressed={concept === i} onClick={() => setConcept(i)}>
              <kbd>{item.key}</kbd>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <p className={s.conceptDetail} role="status">
          {concepts[concept].detail}
        </p>
        <p className={s.small}>
          순서대로 누르면 <code>ciw</code>. 그다음 새 단어를 쓰고 <kbd>Esc</kbd>로 마칩니다.
        </p>
      </div>
    </main>
  );
}

export function Workshop({ ref, onSelect }) {
  const [phase, setPhase] = useState('intro');
  const [attempt, setAttempt] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const run = useRef(null);
  useImperativeHandle(ref, () => ({ canLeave: () => run.current?.canLeave() ?? true }), []);
  return (
    <div className={s.page}>
      <WorkshopHeader openMenu={() => setMenuOpen(true)} />
      {phase === 'intro' ? (
        <Intro start={() => setPhase('guided')} />
      ) : complete ? (
        <Finish
          kind={phase}
          next={() => {
            setComplete(false);
            setPhase('challenge');
          }}
          reset={() => {
            setComplete(false);
            setAttempt((v) => v + 1);
          }}
          select={onSelect}
        />
      ) : (
        <PracticeRun
          key={`${phase}:${attempt}`}
          ref={run}
          lesson={dotWorkshop}
          kind={phase}
          reset={() => setAttempt((v) => v + 1)}
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

function Finish({ kind, next, reset, select }) {
  const [choice, setChoice] = useState(null);
  const heading = useRef(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <main className={s.finish} ref={heading} tabIndex={-1}>
      <div className={s.finishMark} aria-hidden="true">
        ✓
      </div>
      <p className={s.eyebrow}>
        {kind === 'guided' ? '첫 번째 편집을 마쳤습니다' : '스스로 고른 위치에, 필요한 변경만'}
      </p>
      <h1>
        {kind === 'guided' ? '변경은 한 번. 적용은 두 번.' : '바꿀 줄과 남길 줄을 구별했어요.'}
      </h1>
      <p>
        {kind === 'guided'
          ? '검색으로 위치를 고르고, 단어를 바꾼 뒤, 점으로 다시 적용했습니다. 마지막 설명 줄도 지켰습니다.'
          : '세 milk 항목을 oat로 바꾸고 설명 줄은 보존했습니다. 저장된 파일까지 확인했습니다.'}
      </p>
      <div className={s.finishPreview}>
        <pre>{practice[kind].target}</pre>
      </div>
      {kind === 'guided' ? (
        <div className={s.decision}>
          <h2>다음 검색 결과가 바꾸면 안 되는 설명이라면?</h2>
          <button aria-pressed={choice === 'repeat'} onClick={() => setChoice('repeat')}>
            점으로 바꾼 뒤 다음으로 간다
          </button>
          <button aria-pressed={choice === 'skip'} onClick={() => setChoice('skip')}>
            n으로 건너뛰고 다음 대상을 확인한다
          </button>
          {choice && (
            <p role="status">
              {choice === 'skip'
                ? '맞습니다. 검색은 같은 문자열을 찾습니다. 바꿀 대상인지는 내가 고릅니다.'
                : '점은 현재 위치의 단어도 바꿉니다. 보존할 줄에서는 적용하지 않고 다음 위치로 이동하세요.'}
            </p>
          )}
          <button className={s.primary} disabled={choice !== 'skip'} onClick={next}>
            다른 문제 혼자 풀기 →
          </button>
        </div>
      ) : (
        <div className={s.endLinks}>
          <button className={s.primary} onClick={() => select('range-workshop')}>
            다음에는 범위를 정해 치환하기 →
          </button>
          <button onClick={reset}>이 문제 다시 풀기</button>
          <p className={s.small}>
            이번 판정은 결과와 저장을 확인했습니다. 어떤 방법으로 풀었든, 다음에는 검색과 점을
            조합하는 방법도 비교해보세요.
          </p>
        </div>
      )}
      <p className={s.small}>이 연습의 내용과 완료 기록은 브라우저에 남기지 않습니다.</p>
    </main>
  );
}
