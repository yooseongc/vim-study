import { LearningHome, home } from './components/LearningHome.jsx';
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
import { CourseMenu, WorkshopHeader } from './components/WorkshopNavigation.jsx';
import workshopStyles from './styles/Workshop.module.css';
import { BasicsWorkshop } from './components/BasicsWorkshop.jsx';
import { GrammarWorkshop } from './components/GrammarWorkshop.jsx';
import { BufferWorkshop } from './components/BufferWorkshop.jsx';
import { bufferWorkshop } from './lessons/buffer-workshop.js';
import { grammarWorkshop } from './lessons/grammar-workshop.js';
import { basicsWorkshop } from './lessons/basics-workshop.js';
import { globalWorkshop } from './lessons/global-workshop.js';

const activities = [
  home,
  bufferWorkshop,
  grammarWorkshop,
  basicsWorkshop,
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
  activities.find((mission) => mission.id === location.hash.slice(1)) || home;
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
    const next = activities.find((item) => item.id === id);
    if (!next || id === mission.id || !(session.current?.canLeave() ?? true)) return;
    history.pushState(null, '', `#${id}`);
    setMission(next);
    setGuide(false);
    setExpanded(false);
  }
  useEffect(() => {
    const onHashChange = () => {
      const next = missionFromHash();
      if (next.id === selected.current.id) return;
      if (!(session.current?.canLeave() ?? true)) {
        history.replaceState(null, '', `#${selected.current.id}`);
        return;
      }
      setMission(next);
      setGuide(false);
      setExpanded(false);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  function reset() {
    store.reset(mission.id);
    setAttempt((value) => value + 1);
  }
  if (mission.id === 'home') return <LearningHome ref={session} onSelect={select} />;
  if (mission.id === 'local') return <LocalPractice ref={session} onSelect={select} />;
  if (mission.id === 'buffer-workshop') return <BufferWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'grammar-workshop') return <GrammarWorkshop ref={session} onSelect={select} />;
  if (mission.id === 'basics-workshop') return <BasicsWorkshop ref={session} onSelect={select} />;
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
    <div className={workshopStyles.page}>
      <WorkshopHeader openMenu={() => setGuide(true)} />
      <CourseMenu
        open={guide}
        close={() => setGuide(false)}
        select={select}
        title={mission.title}
        currentId={mission.id}
      />
      <main className={s.main}>
        {!expanded && (
          <section className={s.intro}>
            <div>
              <p className={s.eyebrow}>
                {index >= 0
                  ? '배운 방법을 직접 골라 써보기'
                  : mission.id === 'workspace'
                    ? '내 파일로 연습하기'
                    : '이전 버전의 학습 과정'}
              </p>
              <h1>
                {index >= 0
                  ? '작은 문제에, 나의 방법으로.'
                  : mission.id === 'workspace'
                    ? '편집할 파일을 직접 골라보세요.'
                    : '한 단계씩 확인하며 연습하기.'}
              </h1>
              <p className={s.lede}>
                {index >= 0
                  ? '정답은 하나가 아닙니다. 보존할 내용을 지키면서 원하는 결과를 만들어보세요.'
                  : mission.id === 'workspace'
                    ? '파일은 이 브라우저에 저장됩니다. 필요한 설명은 학습 목차에서 다시 열 수 있습니다.'
                    : '기존 기록을 이어서 볼 수 있습니다. 개편한 과정은 상단 학습 목차에서 시작하세요.'}
              </p>
            </div>
            {index >= 0 && (
              <div className={s.journey}>
                <span className={s.tiny}>자유 미션</span>
                <strong>
                  <span id="completed">{String(count).padStart(2, '0')}</span>
                  <small> / 06</small>
                </strong>
                <span>완료한 자유 미션</span>
                <div className={s.progress}>
                  <i id="progress" style={{ width: `${(count / missions.length) * 100}%` }} />
                </div>
              </div>
            )}
          </section>
        )}
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
          ) : mission.id === 'workspace' ? (
            <WorkspaceSession ref={session} onSelect={select} />
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
    </div>
  );
}
