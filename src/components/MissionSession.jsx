import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { filesFor, validate } from '../missions.js';
import { readSettings } from '../lib/storage.js';
import { useVimEngine } from '../hooks/useVimEngine.js';
import { SettingsDialog } from './SettingsDialog.jsx';
import { VimTerminal } from './VimTerminal.jsx';
import s from '../styles/MissionSession.module.css';

export function MissionSession({
  ref,
  mission,
  index,
  saved,
  warning,
  saveFile,
  complete,
  onReset,
  onNext,
  expanded,
  onExpand,
}) {
  const [files] = useState(() => ({ ...filesFor(mission), ...saved }));
  const [settings] = useState(readSettings);
  const dirty = useRef(false),
    checkButton = useRef(null);
  const [keys, setKeys] = useState(0),
    [path, setPath] = useState(`/work/${mission.file}`);
  const [hints, setHints] = useState(0),
    [settingsOpen, setSettingsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(warning || ':w로 저장하면 다음 방문에도 이어집니다');
  const [feedback, setFeedback] = useState(null),
    [review, setReview] = useState(false),
    [checking, setChecking] = useState(false);
  const storageFailure =
    '저장 공간에 접근할 수 없습니다. 페이지를 닫기 전 파일을 내려받으세요 (:export).';
  useImperativeHandle(
    ref,
    () => ({
      canLeave: () =>
        !dirty.current ||
        confirm('저장하지 않은 편집이 있습니다. :w로 저장하지 않은 내용을 버리고 이동할까요?'),
    }),
    [],
  );
  useEffect(() => {
    const beforeUnload = (event) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);
  const editor = useVimEngine(files, settings, {
    key: () => setKeys((count) => count + 1),
    escapeFocus: () => checkButton.current?.focus(),
    changed: (modified) => {
      dirty.current = Boolean(modified);
    },
    path: setPath,
    saved: (fullPath, lines) => {
      const name = fullPath.replace(/^\/work\//, '');
      if (!Object.hasOwn(files, name)) return;
      setSaveStatus(
        saveFile(mission.id, name, `${lines.join('\n')}\n`)
          ? `${name} · 이 브라우저에 저장됨`
          : storageFailure,
      );
    },
    result: (contents, modified) => {
      dirty.current = Boolean(modified);
      const results = validate(mission, contents);
      const success = results.every((result) => result.ok) && !modified;
      setFeedback({
        success,
        text: success
          ? '✓ 미션 완료. 정확한 편집으로 문제를 해결했습니다.'
          : modified
            ? '저장하지 않은 변경이 있습니다. :w 또는 :wa로 저장한 뒤 다시 확인하세요.'
            : `다시 살펴보세요: ${results
                .filter((result) => !result.ok)
                .map((result) => result.file)
                .join(', ')}. 목표 외의 내용도 유지해야 합니다.`,
      });
      if (success) {
        if (!complete(mission.id)) setSaveStatus(storageFailure);
        setReview(true);
      }
      setChecking(false);
    },
  });
  async function check() {
    setChecking(true);
    try {
      await editor.engine.current.check();
    } catch (error) {
      setFeedback({
        success: false,
        text: `검증하지 못했습니다. ${error.message}`,
      });
      setChecking(false);
    }
  }
  function reset() {
    if (
      !confirm(
        '이 미션의 파일을 처음 상태로 되돌릴까요? 저장한 편집도 초기화됩니다. 완료 기록은 유지됩니다.',
      )
    )
      return;
    dirty.current = false;
    onReset();
  }
  return (
    <section className={`${s.lab} ${expanded ? s.expanded : ''}`}>
      {!expanded && (
        <div id="mission-brief" className={s.brief}>
          <div className={s.meta}>
            <span id="level">FIELD MISSION {String(index + 1).padStart(2, '0')}</span>
            <span id="tags">{mission.skill}</span>
          </div>
          <h2 id="title">{mission.title}</h2>
          <p id="story" className={s.story}>
            {mission.story}
          </p>
          <div className={s.objective}>
            <span>MISSION</span>
            <p id="objective">{mission.objective}</p>
          </div>
        </div>
      )}
      <VimTerminal {...editor} path={path} keys={keys} expanded={expanded} />
      <div className={s.actions}>
        <button
          ref={checkButton}
          id="check"
          className={s.primary}
          disabled={editor.status !== 'ready' || checking}
          onClick={check}
        >
          결과 확인 <span>↗</span>
        </button>
        <button
          id="hint"
          onClick={() => setHints((count) => Math.min(count + 1, mission.hints.length))}
        >
          {hints === 0
            ? '힌트 펼치기'
            : hints < mission.hints.length
              ? `다음 힌트 (${hints}/3)`
              : '힌트 모두 펼침'}
        </button>
        <button id="editor-expand" aria-pressed={expanded} onClick={onExpand}>
          {expanded ? '학습 화면으로' : '편집기 확대'}
        </button>
        <button id="settings-open" aria-haspopup="dialog" onClick={() => setSettingsOpen(true)}>
          편집기 설정
        </button>
        <button id="reset" className={s.muted} onClick={reset}>
          미션 초기화
        </button>
        <span id="save-status" className={s.saveStatus}>
          {saveStatus}
        </span>
      </div>
      <div
        id="feedback"
        data-result={feedback ? (feedback.success ? 'success' : 'retry') : undefined}
        className={feedback ? `${s.feedback} ${feedback.success ? s.success : s.retry}` : undefined}
        role="status"
        aria-live="polite"
      >
        {feedback?.text}
      </div>
      {hints > 0 && (
        <div id="hint-panel" className={s.hints}>
          {mission.hints.slice(0, hints).map((hint, i) => (
            <p key={hint}>
              {i + 1}. {hint}
            </p>
          ))}
        </div>
      )}
      {review && (
        <div id="review" className={s.review}>
          <h3>FIELD NOTE / 현장에서 써먹기</h3>
          <p>{mission.review}</p>
          {onNext && <button onClick={onNext}>다음 미션으로 →</button>}
        </div>
      )}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apply={(next) =>
          editor.engine.current?.setFont(next) ?? Promise.reject(new Error('Vim is not ready'))
        }
      />
    </section>
  );
}
