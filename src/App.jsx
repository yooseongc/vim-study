import { useEffect, useRef, useState } from 'react';
import { missions } from './missions.js';
import { useStudyStore } from './hooks/useStudyStore.js';
import { MissionList } from './components/MissionList.jsx';
import { MissionSession } from './components/MissionSession.jsx';
import s from './styles/App.module.css';
import { basics } from './lessons/basics.js';
import { grammar } from './lessons/grammar.js';
import { readBasics, readLesson } from './lessons/progress.js';
import { GuidedLesson } from './components/GuidedLesson.jsx';
import { ReviewSession } from './components/ReviewSession.jsx';
import { review } from './lessons/review.js';

const activities = [basics, grammar, review, ...missions];

const missionFromHash = () =>
  activities.find((mission) => mission.id === location.hash.slice(1)) || basics;
function Guide() {
  return (
    <section id="guide" className={s.guide}>
      <h2>콘솔에서 자유로워지는 학습 경로</h2>
      <p>
        ① 생존: 모드·저장·되돌리기 → ② 의도 단위 편집: 검색·motion·text object → ③ 반복 제거:
        점·치환·매크로 → ④ 작업 공간: 버퍼·분할·레지스터 → ⑤ 현장 전이: quickfix·argdo·필터·셸 왕복
      </p>
      <p>
        아래 여섯 미션은 ①–④의 첫 훈련입니다. 미션마다 도움 없이 해결 → 힌트 확인 → 다른 방식으로
        재도전 → 내 로컬 Vim에서 재현하는 순서를 권합니다. 입문·편집 문법 다음에는 ‘다시 꺼내 쓰는
        연습’에서 변형 예제와 간격 복습을 할 수 있습니다. ⑤의 과정은 후속 구현 범위입니다.
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
          {['basics', 'grammar'].includes(mission.id) ? (
            <GuidedLesson
              key={mission.id}
              course={mission}
              ref={session}
              onPractice={() => select(mission.id === 'basics' ? 'grammar' : 'review')}
              onComplete={() =>
                mission.id === 'basics' ? setBasicsCompleted(true) : setGrammarCompleted(true)
              }
            />
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
