import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { checkExercise, modeText } from '../lessons/exercise.js';
import { useVimEngine } from '../hooks/useVimEngine.js';
import { readSettings } from '../lib/storage.js';
import { SettingsDialog } from './SettingsDialog.jsx';
import { VimTerminal } from './VimTerminal.jsx';
import { RegisterShelf } from './RegisterShelf.jsx';
import { MacroStatus } from './MacroStatus.jsx';
import { BlockStatus } from './BlockStatus.jsx';
import { NavigationStatus } from './NavigationStatus.jsx';
import s from '../styles/Workshop.module.css';

export function PracticeRun({ ref, lesson, kind, reset, finish, sectionLabel }) {
  const { practice, guidedGoals, guidedStage, challengeHints, reference } = lesson;
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
  const result = checkExercise(course, snapshot, saved);
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
          setStage((previous) => guidedStage(value, previous) ?? previous);
        }
      }
      if (pendingCheck.current) {
        pendingCheck.current = false;
        checkedState.current = JSON.stringify(value);
        setFeedback(checkExercise(course, value, saved));
      } else if (checkedState.current && checkedState.current !== JSON.stringify(value)) {
        checkedState.current = null;
        setFeedback(null);
      }
    },
  });
  const goal = guidedGoals[stage];
  const extendedCoach = kind === 'guided' && goal.keys.map(([key]) => key).join('').length >= 20;
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
    <main
      className={`${s.practice} ${extendedCoach ? s.extendedCoach : ''} ${lesson.showRegisters || lesson.showMacro || lesson.showNavigation || lesson.showBlock ? s.withMonitor : ''}`}
      onKeyDownCapture={shortcut}
    >
      <div className={s.lessonHeading}>
        <div>
          <p className={s.eyebrow}>
            {sectionLabel || (kind === 'guided' ? '함께 해보기' : '혼자 해결하기')}
          </p>
          <h1 id="title">{lesson.title}</h1>
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
              <span>
                {kind === 'guided'
                  ? goal.recovery
                    ? '복구 안내'
                    : `${stage + 1} / ${guidedGoals.filter((item) => !item.recovery).length}`
                  : '직접 선택하는 문제'}
              </span>
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
                {kind === 'guided' ? goal.result : course.expected}
              </p>
            )}
            <details className={s.reference}>
              <summary>명령의 뜻 다시 보기</summary>
              {reference.map((text) => (
                <p key={text}>{text}</p>
              ))}
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
          {lesson.showRegisters && <RegisterShelf snapshot={snapshot} />}
          {lesson.showMacro && <MacroStatus snapshot={snapshot} />}
          {lesson.showNavigation && <NavigationStatus snapshot={snapshot} />}
          {lesson.showBlock && <BlockStatus snapshot={snapshot} />}
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
              : result.kind === 'recording'
                ? result.message
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
