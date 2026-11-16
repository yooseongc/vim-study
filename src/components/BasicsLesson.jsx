import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { steps, stepSatisfied, questions } from '../lessons/basics.js';
import { saveBasics, readBasics } from '../lessons/progress.js';
import { readSettings } from '../lib/storage.js';
import { useVimEngine } from '../hooks/useVimEngine.js';
import { VimTerminal } from './VimTerminal.jsx';
import { SettingsDialog } from './SettingsDialog.jsx';
import s from '../styles/BasicsLesson.module.css';

export function BasicsLesson({ ref, onPractice, onComplete }) {
  const [run, setRun] = useState(0);
  const [challenge, setChallenge] = useState(false);
  return (
    <LessonRun
      key={`${run}:${challenge}`}
      ref={ref}
      challenge={challenge}
      onRestart={() => {
        setChallenge(false);
        setRun((value) => value + 1);
      }}
      onChallenge={() => setChallenge(true)}
      onPractice={onPractice}
      onComplete={onComplete}
    />
  );
}

function LessonRun({ ref, challenge, onRestart, onChallenge, onPractice, onComplete }) {
  const [files] = useState(() => ({ 'first-edit.txt': challenge ? 'ready\n' : 'hello\n' }));
  const [settings] = useState(readSettings);
  const [previouslyCompleted] = useState(() => readBasics().completed);
  const [stepIndex, setStepIndex] = useState(0),
    [snapshot, setSnapshot] = useState(null);
  const [pressed, setPressed] = useState([]),
    [keys, setKeys] = useState(0);
  const [saved, setSaved] = useState(''),
    [saveMessage, setSaveMessage] = useState('');
  const [quiz, setQuiz] = useState(false),
    [question, setQuestion] = useState(0),
    [answer, setAnswer] = useState(null);
  const [done, setDone] = useState(false),
    [settingsOpen, setSettingsOpen] = useState(false),
    [hint, setHint] = useState(false);
  const dirty = useRef(false),
    instructions = useRef(null);
  useImperativeHandle(
    ref,
    () => ({
      canLeave: () =>
        !dirty.current ||
        confirm('저장하지 않은 변경이 있습니다. 버리고 다른 연습으로 이동할까요?'),
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
  const editor = useVimEngine(files, settings, {
    key: (event) => {
      setKeys((value) => value + 1);
      setPressed((value) => [
        ...value.slice(-80),
        event.ctrl ? `Ctrl+${event.key.toLowerCase()}` : event.key,
      ]);
    },
    escapeFocus: () => instructions.current?.focus(),
    changed: (modified) => {
      dirty.current = Boolean(modified);
    },
    path: () => {},
    result: () => {},
    observe: setSnapshot,
    saved: (path, lines) => {
      if (path !== '/work/first-edit.txt') return;
      const text = lines.join('\n');
      setSaved(text);
      setSaveMessage(
        saveBasics({ savedText: text })
          ? '브라우저에도 저장했습니다.'
          : 'Vim에는 저장했지만 브라우저 저장 공간에 접근하지 못했습니다.',
      );
    },
  });
  const step = steps[stepIndex];
  const passed = stepSatisfied(step, snapshot, pressed, saved);
  const challengePassed =
    snapshot?.lines.join('\n') === 'Vim ready' &&
    snapshot?.mode === 'n' &&
    !snapshot?.modified &&
    saved === 'Vim ready';
  const mode = snapshot?.mode || '';
  const modeName = mode.startsWith('i')
    ? '입력 모드'
    : mode.startsWith('c')
      ? '명령줄 모드'
      : mode === 'n'
        ? '일반 모드'
        : mode
          ? `다른 모드 (${mode})`
          : '상태 확인 중';
  function advance() {
    if (!passed) return;
    if (stepIndex === steps.length - 1) setQuiz(true);
    else {
      setStepIndex((value) => value + 1);
      setPressed([]);
    }
  }
  function finish() {
    if (!challengePassed) return;
    const stored = saveBasics({ completed: true });
    if (!stored) setSaveMessage('완료했습니다. 다만 브라우저에 완료 기록을 저장하지 못했습니다.');
    onComplete();
    setDone(true);
  }
  function restart() {
    if (dirty.current && !confirm('지금 편집한 내용을 버리고 첫 단계부터 다시 연습할까요?')) return;
    dirty.current = false;
    onRestart();
  }
  return (
    <section className={s.lesson}>
      <div
        id="lesson-instructions"
        ref={instructions}
        tabIndex={-1}
        className={s.instructions}
        aria-label="단계별 안내"
      >
        <p className={s.eyebrow}>첫 단원 · 모드 → 편집 → 되돌리기 → 저장</p>
        <h2 id="title">{challenge ? '설명 없이 한 번 더' : '기억을 정리하는 첫 편집'}</h2>
        {!challenge && !quiz && (
          <>
            <p>먼저 읽고, 한 번 직접 실행하고, 확인한 뒤 다음으로 넘어가세요.</p>
            <p className={s.stepCount} id="lesson-step">
              {stepIndex + 1} / {steps.length}
            </p>
            <h3>{step.title}</h3>
            <p>{step.explanation}</p>
            <div className={s.action}>
              <span>이번에 누를 키</span>
              <kbd>{step.key}</kbd>
              <p>{step.action}</p>
            </div>
            <p id="lesson-feedback" role="status" className={passed ? s.success : s.notice}>
              {passed
                ? '✓ 실제 Vim에서 확인했습니다. 다음 단계로 넘어가세요.'
                : '편집기에서 실행해 보세요. 모드와 내용이 맞으면 다음 단계가 열립니다.'}
            </p>
            <button id="lesson-next" disabled={!passed} onClick={advance}>
              {stepIndex === steps.length - 1 ? '이해 확인으로' : '다음 단계'}
            </button>
            <p>
              <strong>예상 결과</strong>
              <br />
              {step.expected}
            </p>
            <details key={stepIndex}>
              <summary>헷갈리거나 잘못 입력했다면</summary>
              <p>{step.recovery}</p>
            </details>
          </>
        )}
        {quiz && (
          <div className={s.quiz}>
            <p>
              기억을 확인해 봅시다 · {question + 1} / {questions.length}
            </p>
            <h3>{questions[question].question}</h3>
            {questions[question].answers.map((text, index) => (
              <button key={text} aria-pressed={answer === index} onClick={() => setAnswer(index)}>
                {text}
              </button>
            ))}
            {answer !== null && (
              <p role="status">
                {answer === questions[question].correct ? '맞습니다. ' : '다시 생각해 보세요. '}
                {questions[question].why}
              </p>
            )}
            <button
              id="quiz-next"

              disabled={answer !== questions[question].correct}
              onClick={() => {
                if (question === questions.length - 1) onChallenge();
                else {
                  setQuestion((value) => value + 1);
                  setAnswer(null);
                }
              }}
            >
              {question === questions.length - 1 ? '직접 해보기' : '다음 질문'}
            </button>
          </div>
        )}
        {challenge && (
          <>
            <p>
              새 파일에는 <code>ready</code>가 있습니다. 앞에 <code>Vim</code>과 공백 하나를 붙여{' '}
              <code>Vim ready</code>로 만들고 저장하세요. 이번에는 직접 모드를 선택해 보세요.
            </p>
            <button onClick={() => setHint((value) => !value)}>
              {hint ? '도움말 접기' : '기억이 안 나면 도움말'}
            </button>
            {hint && (
              <ol>
                <li>Esc로 일반 모드로 돌아갑니다.</li>
                <li>줄의 맨 앞에서 i를 눌러 입력 모드로 들어갑니다.</li>
                <li>Vim을 입력하고 Space를 한 번 누릅니다.</li>
                <li>Esc로 일반 모드로 돌아갑니다.</li>
                <li>콜론을 입력해 명령줄을 엽니다.</li>
                <li>w를 입력합니다.</li>
                <li>Enter로 저장을 실행합니다.</li>
              </ol>
            )}
            <p id="lesson-feedback" role="status">
              {challengePassed
                ? '✓ 수정한 내용과 저장 상태를 확인했습니다.'
                : 'Vim ready를 만들고 저장하면 완료할 수 있습니다.'}
            </p>
            {!done && (
              <button id="lesson-finish" disabled={!challengePassed} onClick={finish}>
                첫 단원 완료
              </button>
            )}
            {done && (
              <div className={s.success}>
                <h3>첫 단원을 마쳤습니다.</h3>
                <p>
                  i는 입력, Esc는 일반 모드 복귀, u는 undo, Ctrl+r는 redo입니다. 저장은 콜론 → w →
                  Enter입니다.
                </p>
                <p>
                  종료는 명령줄에서 q를 입력한 뒤 Enter입니다. :q!는 저장하지 않은 변경을 버립니다.
                  !가 모든 곳에서 무조건 강제를 뜻하지는 않습니다.
                </p>
                <button onClick={onPractice}>자유 연습으로 이동</button>
              </div>
            )}
          </>
        )}
      </div>
      <div className={s.editor}>
        <div className={s.mode} aria-live="polite">
          <strong id="lesson-mode">
            {editor.status === 'ready'
              ? modeName
              : editor.status === 'exited'
                ? 'Vim 종료됨'
                : editor.status === 'error'
                  ? '실행 확인 필요'
                  : 'Vim 준비 중'}
          </strong>
          <span>
            {!snapshot
              ? '상태 확인 중'
              : snapshot.modified
                ? '저장하지 않은 변경 있음'
                : '파일과 일치'}
          </span>
        </div>
        <VimTerminal {...editor} path="/work/first-edit.txt" keys={keys} expanded={false} guided />
        <div className={s.tools}>
          <button
            id="lesson-focus"
            onClick={() => editor.engine.current?.focus()}
            disabled={editor.status !== 'ready'}
          >
            편집기에 입력하기
          </button>
          <button id="settings-open" onClick={() => setSettingsOpen(true)}>
            편집기 설정
          </button>
          <button onClick={restart}>처음부터 다시</button>
        </div>
        <p className={s.notice}>
          입력하기 버튼으로 포커스를 옮기세요. Ctrl+Shift+F로 안내 쪽으로 돌아올 수 있습니다. 키
          이름을 문자로 입력하지 마세요.
        </p>
        {saved && <p id="lesson-save">{saveMessage}</p>}
        <p className={s.notice}>
          연습 파일은 다시 방문하면 처음 상태에서 시작합니다. 완료 기록은 유지됩니다.
          {previouslyCompleted ? ' 이전에 완료한 단원입니다.' : ''}
        </p>
      </div>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apply={(value) =>
          editor.engine.current?.setFont(value) ?? Promise.reject(new Error('not ready'))
        }
      />
    </section>
  );
}
