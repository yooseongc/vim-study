import { useEffect, useRef, useState } from 'react';
import { missions } from './missions.js';
import { useStudyStore } from './hooks/useStudyStore.js';
import { MissionList } from './components/MissionList.jsx';
import { MissionSession } from './components/MissionSession.jsx';
import s from './styles/App.module.css';
import { readBasics, readLesson } from './lessons/progress.js';
import { GuidedLesson } from './components/GuidedLesson.jsx';
import { ReviewSession } from './components/ReviewSession.jsx';
import { review } from './lessons/review.js';
import { workspace } from './lib/workspace-files.js';
import { WorkspaceSession } from './components/WorkspaceSession.jsx';
import { guidedCourses, nextCourse } from './lessons/catalog.js';
import { LocalPractice, localCourse } from './components/LocalPractice.jsx';
import { workshop } from './lessons/workshop.js';
import { Workshop } from './components/Workshop.jsx';
import { rangeWorkshop } from './lessons/range-workshop.js';
import { RangeWorkshop } from './components/RangeWorkshop.jsx';
import { RegisterWorkshop } from './components/RegisterWorkshop.jsx';
import { registerWorkshop } from './lessons/register-workshop.js';
import { MacroWorkshop } from './components/MacroWorkshop.jsx';
import { macroWorkshop } from './lessons/macro-workshop.js';
import { NavigationWorkshop } from './components/NavigationWorkshop.jsx';
import { navigationWorkshop } from './lessons/navigation-workshop.js';

import { BlockWorkshop } from './components/BlockWorkshop.jsx';
import { blockWorkshop } from './lessons/block-workshop.js';

import { QuickfixWorkshop } from './components/QuickfixWorkshop.jsx';
import { quickfixWorkshop } from './lessons/quickfix-workshop.js';

import { BatchWorkshop } from './components/BatchWorkshop.jsx';
import { batchWorkshop } from './lessons/batch-workshop.js';

import { GlobalWorkshop } from './components/GlobalWorkshop.jsx';
import { globalWorkshop } from './lessons/global-workshop.js';

const activities = [
  globalWorkshop,
  batchWorkshop,
  quickfixWorkshop,
  blockWorkshop,
  workshop,
  rangeWorkshop,
  registerWorkshop,
  macroWorkshop,
  navigationWorkshop,
  ...guidedCourses,
  localCourse,
  workspace,
  review,
  ...missions,
];

const missionFromHash = () =>
  activities.find((mission) => mission.id === location.hash.slice(1)) || workshop;
function Guide() {
  return (
    <section id="guide" className={s.guide}>
      <h2>콘솔에서 자유로워지는 학습 경로</h2>
      <p>
        ① 생존: 모드·저장·되돌리기 → ② 의도 단위 편집: 검색·motion·text object → ③ 반복 제거:
        점·치환·매크로 → ④ 작업 공간: 버퍼·분할·레지스터 → ⑤ 현장 전이: quickfix·argdo·필터·셸 왕복
      </p>
      <p>
        안내 단원은 입문부터 레지스터·매크로·블록 편집·여러 파일 작업까지 이어집니다. 마지막 ‘내
        터미널에서 마무리하기’에서 실습 파일을 내려받아 셸·필터·권한·SSH를 연습하세요. 자유 작업
        공간에서는 파일과 창을 직접 다루고, 여섯 자유 미션에서는 배운 방법을 조합할 수 있습니다.
      </p>
      <p>
        실제 Vim 8.2 / 플러그인 없음 / 브라우저 가상 파일. <code>:!grep</code> 같은 외부 프로세스와
        실제 서버 접속은 지원하지 않습니다. 키보드가 있는 데스크톱 사용을 권장합니다.
      </p>
    </section>
  );
}

export default function App() {
  const store = useStudyStore();
  const [basicsCompleted, setBasicsCompleted] = useState(() => readBasics().completed);
  const [grammarCompleted, setGrammarCompleted] = useState(() => readLesson('grammar').completed);
  const [mission, setMission] = useState(missionFromHash);
  const [attempt, setAttempt] = useState(0),
    [guide, setGuide] = useState(false),
    [expanded, setExpanded] = useState(false);
  const session = useRef(null),
    selected = useRef(mission);
  selected.current = mission;
  const index = missions.indexOf(mission);
  const count = store.state.completed.length;
  function select(id) {
    if (id === mission.id || !session.current?.canLeave()) return;
    history.pushState(null, '', `#${id}`);
    setMission(activities.find((item) => item.id === id));
    setExpanded(false);
  }
  useEffect(() => {
    const onHashChange = () => {
      const next = missionFromHash();
      if (next.id === selected.current.id) return;
      if (!session.current?.canLeave()) {
        history.replaceState(null, '', `#${selected.current.id}`);
        return;
      }
      setMission(next);
      setExpanded(false);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  function reset() {
    store.reset(mission.id);
    setAttempt((value) => value + 1);
  }
  if (mission.id === 'global-workshop') return <GlobalWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'batch-workshop') return <BatchWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'quickfix-workshop')
    return <QuickfixWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'block-workshop') return <BlockWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'macro-workshop') return <MacroWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'navigation-workshop')
    return <NavigationWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'workshop') return <Workshop ref={session} onSelect={select} />;
  if (mission.id === 'range-workshop') return <RangeWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'register-workshop')
    return <RegisterWorkshop ref={session} onSelect={select} />;
  return (
    <>
      <header className={s.header}>
        <a className={s.brand} href="./">
          <span className={s.logo}>v_</span> VIM <b>FIELD GUIDE</b>
        </a>
        <span className={s.edition}>
          실전에서 손에 익히는 Vim <span> / VOL. 01</span>
        </span>
        <button
          id="guide-toggle"
          onClick={() => {
            setExpanded(false);
            setGuide((value) => !value);
          }}
        >
          학습 지도 ↗
        </button>
      </header>
      <main className={s.main}>
        {!expanded && (
          <section className={s.intro}>
            <div>
              <p className={s.eyebrow}>LESS TYPING. MORE THINKING.</p>
              <h1>
                키를 외우지 말고, <em>문제를 해결하세요.</em>
              </h1>
              <p className={s.lede}>
                모드와 저장부터 한 단계씩 이해하고 연습하세요. 익숙해지면 자유 연습에서 직접 조합해
                보세요.
              </p>
            </div>
            <div className={s.journey}>
              <span className={s.tiny}>YOUR FIELD NOTES</span>
              <strong>
                <span id="completed">{String(count).padStart(2, '0')}</span>
                <small> / 06</small>
              </strong>
              <span>완료한 실전 미션</span>
              <div className={s.progress}>
                <i id="progress" style={{ width: `${(count / missions.length) * 100}%` }} />
              </div>
            </div>
          </section>
        )}
        {guide && !expanded && <Guide />}
        <div className={`${s.workspace} ${expanded ? s.expanded : ''}`}>
          {!expanded && (
            <MissionList
              current={mission}
              completed={store.state.completed}
              onSelect={select}
              basicsCompleted={basicsCompleted}
              grammarCompleted={grammarCompleted}
            />
          )}
          {guidedCourses.some((course) => course.id === mission.id) ? (
            <GuidedLesson
              key={mission.id}
              course={mission}
              ref={session}
              onPractice={() => select(nextCourse(mission.id))}
              onComplete={() =>
                mission.id === 'basics'
                  ? setBasicsCompleted(true)
                  : mission.id === 'grammar'
                    ? setGrammarCompleted(true)
                    : undefined
              }
            />
          ) : mission.id === 'local' ? (
            <LocalPractice ref={session} onPractice={() => select('workspace')} />
          ) : mission.id === 'workspace' ? (
            <WorkspaceSession ref={session} />
          ) : mission.id === 'review' ? (
            <ReviewSession ref={session} />
          ) : (
            <MissionSession
              key={`${mission.id}:${attempt}`}
              ref={session}
              mission={mission}
              index={index}
              saved={store.state.files[mission.id]}
              warning={store.warning}
              saveFile={store.saveFile}
              complete={store.complete}
              onReset={reset}
              onNext={missions[index + 1] ? () => select(missions[index + 1].id) : null}
              expanded={expanded}
              onExpand={() => setExpanded((value) => !value)}
            />
          )}
        </div>
        {!expanded && (
          <footer className={s.footer}>
            <span>VIM FIELD GUIDE / 작은 편집, 큰 차이.</span>
            <span>
              Powered by{' '}
              <a href="https://github.com/rhysd/vim.wasm" target="_blank" rel="noreferrer">
                vim.wasm ↗
              </a>{' '}
              · 로컬에 저장되는 나만의 훈련장
            </span>
          </footer>
        )}
      </main>
    </>
  );
}
