import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  workshop,
  practice,
  concepts,
  guidedGoals,
  challengeHints,
  guidedStage,
  checkPractice,
  modeText,
} from '../lessons/workshop.js';
import { guidedCourses } from '../lessons/catalog.js';
import { useVimEngine } from '../hooks/useVimEngine.js';
import { readSettings } from '../lib/storage.js';
import { SettingsDialog } from './SettingsDialog.jsx';
import { VimTerminal } from './VimTerminal.jsx';
import s from '../styles/Workshop.module.css';

const groups = [
  ['기본부터 정리하기', ['basics', 'grammar', 'registers', 'block']],
  ['이동과 반복 익히기', ['navigation', 'dot', 'substitution', 'macros']],
  ['파일과 작업 범위 넓히기', ['workspace', 'quickfix', 'batch', 'global', 'local']],
];
const extraTitles = { workspace: '나의 Vim 작업 공간', local: '내 터미널에서 마무리하기' };

function CourseMenu({ open, close, select }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className={s.menu}
      onCancel={close}
      onClose={close}
      aria-labelledby="course-menu-title"
    >
      <div className={s.menuHeading}>
        <h2 id="course-menu-title">어디부터 연습할까요?</h2>
        <button onClick={close} aria-label="학습 목차 닫기">
          닫기
        </button>
      </div>
      <p>
        지금은 ‘한 번 바꾸고, 다시 쓰기’를 연습하고 있습니다. 기존 과정도 필요한 부분부터 열 수
        있습니다.
      </p>
      {groups.map(([name, ids]) => (
        <section key={name}>
          <h3>{name}</h3>
          <div className={s.menuLinks}>
            {ids.map((id) => (
              <button key={id} onClick={() => select(id)}>
                {guidedCourses.find((c) => c.id === id)?.title || extraTitles[id]}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <details>
        <summary>자유 미션과 기존 복습</summary>
        <div className={s.menuLinks}>
          <button onClick={() => select('port')}>여섯 자유 미션</button>
          <button onClick={() => select('review')}>기존 복습 화면</button>
        </div>
      </details>
    </dialog>
  );
}

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
      <header className={s.header}>
        <span className={s.brand}>
          <b>v_</b> Vim <span>작은 편집, 큰 차이</span>
        </span>
        <button onClick={() => setMenuOpen(true)} aria-haspopup="dialog">
          학습 목차 <span aria-hidden="true">☰</span>
        </button>
      </header>
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
          kind={phase}
          reset={() => setAttempt((v) => v + 1)}
          finish={() => setComplete(true)}
        />
      )}
      <CourseMenu open={menuOpen} close={() => setMenuOpen(false)} select={onSelect} />
    </div>
  );
}

function PracticeRun({ ref, kind, reset, finish }) {
  const course = practice[kind];
  const [files] = useState(() => ({ [course.file]: course.initial + '\n' }));
  const [settings] = useState(readSettings);
  const [snapshot, setSnapshot] = useState(null);
  const [stage, setStage] = useState(0);
  const [saved, setSaved] = useState('');
  const [hintCount, setHintCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const observed = useRef(null),
    dirty = useRef(false),
    pendingCheck = useRef(false),
    guideRef = useRef(null),
    coachScroll = useRef(null),
    helpRef = useRef(null),
    checkedState = useRef(null);
  const result = checkPractice(kind, snapshot, saved);
  const passed = result.kind === 'success';
  useImperativeHandle(
    ref,
    () => ({
      canLeave: () =>
        !dirty.current || confirm('저장하지 않은 연습 내용이 있습니다. 다른 과정으로 이동할까요?'),
    }),
    [],
  );
  useEffect(() => {
    const warn = (event) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  useEffect(() => {
    setHintCount(0);
    setFeedback(null);
    coachScroll.current?.scrollTo({ top: 0 });
  }, [stage]);
  useEffect(() => {
    if (hintCount || feedback) helpRef.current?.scrollIntoView({ block: 'nearest' });
  }, [hintCount, feedback]);
  const editor = useVimEngine(files, settings, {
    key: () => {},
    escapeFocus: () => guideRef.current?.focus(),
    changed: (value) => {
      dirty.current = Boolean(value);
    },
    path: () => {},
    result: () => {},
    saved: (path, lines) => {
      if (path === `/work/${course.file}`) setSaved(lines.join('\n'));
    },
    observe: (value) => {
      if (JSON.stringify(value) !== JSON.stringify(observed.current)) {
        observed.current = value;
        setSnapshot(value);
        if (kind === 'guided') {
          const found = guidedStage(value);
          if (found !== null) setStage(found);
        }
      }
      if (pendingCheck.current) {
        pendingCheck.current = false;
        checkedState.current = JSON.stringify(value);
        setFeedback(checkPractice(kind, value, saved));
      } else if (checkedState.current && checkedState.current !== JSON.stringify(value)) {
        checkedState.current = null;
        setFeedback(null);
      }
    },
  });
  const goal = guidedGoals[stage];
  const hints = kind === 'guided' ? goal.hints : challengeHints;
  function focusEditor() {
    editor.engine.current?.focus();
  }
  function hint() {
    setHintCount((n) => Math.min(n + 1, hints.length));
  }
  function continueLesson() {
    if (passed) finish();
    else focusEditor();
  }
  function shortcut(event) {
    if (settingsOpen) return;
    if (event.key === 'F2') {
      event.preventDefault();
      event.stopPropagation();
      hint();
    }
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      continueLesson();
    }
  }
  return (
    <main className={s.practice} onKeyDownCapture={shortcut}>
      <div className={s.lessonHeading}>
        <div>
          <p className={s.eyebrow}>{kind === 'guided' ? '함께 해보기' : '혼자 해결하기'}</p>
          <h1 id="title">{workshop.title}</h1>
        </div>
        <div className={s.phases}>
          <span>뜻 이해하기</span>
          <span aria-current={kind === 'guided' ? 'step' : undefined}>함께 해보기</span>
          <span aria-current={kind === 'challenge' ? 'step' : undefined}>혼자 해결하기</span>
        </div>
      </div>
      <div className={s.workbench}>
        <aside className={s.coach} ref={guideRef} tabIndex={-1} aria-label="현재 연습 안내">
          <div className={s.coachScroll} ref={coachScroll}>
            <div className={s.coachLabel}>
              <span>{kind === 'guided' ? `${stage + 1} / 5` : '직접 선택하는 문제'}</span>
              <span>{kind === 'guided' ? goal.label : '적용과 건너뛰기'}</span>
            </div>
            <h2 id="workshop-goal">
              {passed ? '저장까지 확인했습니다.' : kind === 'guided' ? goal.title : course.title}
            </h2>
            <p>
              {passed
                ? '아래 버튼이나 Ctrl+Enter로 이번 편집을 마무리하세요.'
                : kind === 'guided'
                  ? goal.explanation
                  : course.description}
            </p>
            {!passed && kind === 'guided' && (
              <ol className={s.keySequence} aria-label="순서대로 누를 키">
                {goal.keys.map(([key, meaning], i) => (
                  <li key={`${key}-${i}`}>
                    <kbd>{key}</kbd>
                    <span>{meaning}</span>
                  </li>
                ))}
              </ol>
            )}
            {!passed && (
              <p className={s.expected}>
                <b>확인할 결과</b>
                {kind === 'guided'
                  ? goal.result
                  : 'milk: oat 세 줄 · note와 다른 항목은 그대로 · 저장 완료'}
              </p>
            )}
            <details className={s.reference}>
              <summary>명령의 뜻 다시 보기</summary>
              <p>
                <code>ciw</code>는 c(바꾸기) + i(안쪽) + w(단어)입니다. 새 단어를 쓰고 Esc로
                나옵니다.
              </p>
              <p>
                <code>n</code>은 다음 검색 위치, <code>.</code>은 현재 위치에서 마지막 변경
                반복입니다.
              </p>
              <p>
                잘못 바꿨다면 Esc로 나온 뒤 <code>u</code>로 되돌리고 위치를 확인하세요.{' '}
                <code>Ctrl+r</code>는 되돌린 변경을 복원합니다.
              </p>
            </details>
            {hintCount > 0 && (
              <div className={s.hints} role="status">
                <b>
                  힌트 {hintCount} / {hints.length}
                </b>
                {hints.slice(0, hintCount).map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            )}
            {feedback && (
              <div className={s.diagnosis} role="status">
                <b>현재 내용 점검</b>
                <p>{feedback.message}</p>
                {feedback.kind === 'text' && (
                  <dl>
                    <dt>{feedback.row}번째 줄 · 현재</dt>
                    <dd>{feedback.actual}</dd>
                    <dt>목표</dt>
                    <dd>{feedback.expected}</dd>
                  </dl>
                )}
              </div>
            )}
            <div ref={helpRef} />
          </div>
          <div className={s.coachTools}>
            <button onClick={hint} disabled={hintCount >= hints.length}>
              힌트 한 단계 <kbd>F2</kbd>
            </button>
            <button
              onClick={() => {
                pendingCheck.current = true;
              }}
              disabled={editor.status !== 'ready'}
            >
              현재 내용 점검
            </button>
          </div>
        </aside>
        <section
          className={`${s.editor} ${focused ? s.focused : ''}`}
          onFocusCapture={(event) => setFocused(event.target === editor.input.current)}
          onBlurCapture={() => setFocused(false)}
          aria-label="실제 Vim 연습"
        >
          <div className={s.editorHeading}>
            <span id="workshop-mode">
              {editor.status === 'ready'
                ? modeText(snapshot?.mode)
                : editor.status === 'exited'
                  ? 'Vim 종료됨'
                  : 'Vim 준비 중'}
            </span>
            <button onClick={focusEditor} disabled={editor.status !== 'ready'} id="workshop-focus">
              {focused ? '여기에 입력 중' : '편집기로 돌아가기'}
            </button>
          </div>
          <VimTerminal
            {...editor}
            path={snapshot?.path || `/work/${course.file}`}
            keys={0}
            expanded={false}
            studio
          />
          <div className={s.editorBottom}>
            <span>
              {snapshot?.modified
                ? '아직 저장하지 않은 변경'
                : saved
                  ? '연습 파일에 저장됨'
                  : '문제의 시작 상태'}
            </span>
            <button onClick={() => setSettingsOpen(true)} id="settings-open">
              글꼴과 크기
            </button>
            <button onClick={reset} title="지금 문제의 편집 내용만 처음 상태로 되돌립니다">
              문제 초기화
            </button>
          </div>
          <details className={s.textView}>
            <summary>편집 내용을 텍스트로 보기</summary>
            <pre>{snapshot?.lines.join('\n') || course.initial}</pre>
          </details>
        </section>
      </div>
      <footer className={s.actionBar}>
        <div role="status">
          <span className={passed ? s.passDot : s.waitDot} />
          <span>
            {passed
              ? '바꿀 부분과 남길 부분, 저장까지 확인했어요.'
              : result.kind === 'save'
                ? '내용이 맞습니다. 이제 저장해보세요.'
                : kind === 'guided'
                  ? '입력을 이어가세요. 맞는 결과에서 안내가 이어집니다.'
                  : '원하는 방법으로 해결하세요. 위치를 고르는 건 내 몫입니다.'}
          </span>
        </div>
        <button
          className={s.primary}
          id="workshop-next"
          disabled={!passed}
          onClick={continueLesson}
        >
          {kind === 'guided' ? '편집 마무리' : '결과 확인'} <kbd>Ctrl ↵</kbd>
        </button>
      </footer>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          focusEditor();
        }}
        apply={(value) =>
          editor.engine.current?.setFont(value) ?? Promise.reject(new Error('Vim 준비 중'))
        }
      />
    </main>
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
          <button className={s.primary} onClick={() => select('substitution')}>
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
