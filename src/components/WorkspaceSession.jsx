import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useVimEngine } from '../hooks/useVimEngine.js';
import { readSettings } from '../lib/storage.js';
import {
  readWorkspace,
  persistWorkspace,
  workspaceName,
  validFileName,
  downloadWorkspaceFile,
} from '../lib/workspace-files.js';
import { WorkspaceGuide } from './WorkspaceGuide.jsx';
import { VimTerminal } from './VimTerminal.jsx';
import { SettingsDialog } from './SettingsDialog.jsx';
import s from '../styles/WorkspaceSession.module.css';

export function WorkspaceSession({ ref }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <WorkspaceRun key={attempt} ref={ref} onRestart={() => setAttempt((value) => value + 1)} />
  );
}

function WorkspaceRun({ ref, onRestart }) {
  const [initial] = useState(readWorkspace);
  const [settings] = useState(readSettings);
  const [files, setFiles] = useState(initial.files);
  const fileRef = useRef(files);
  const [state, setState] = useState(null);
  const lastState = useRef('');
  const [message, setMessage] = useState(
    initial.warning || '파일 이름을 눌러 열거나, Vim에서 직접 파일을 열어 보세요.',
  );
  const [storageFailed, setStorageFailed] = useState(false);
  const [name, setName] = useState('');
  const [keys, setKeys] = useState(0);
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const dirty = useRef(false);
  const panel = useRef(null);
  const canLeave = () =>
    (!dirty.current && !storageFailed) ||
    confirm('저장되지 않은 변경 또는 브라우저에 보관하지 못한 파일이 있습니다. 버리고 이동할까요?');
  useImperativeHandle(ref, () => ({ canLeave }), [storageFailed]);
  useEffect(() => {
    const warn = (event) => {
      if (dirty.current || storageFailed) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [storageFailed]);
  function remember(next) {
    fileRef.current = next;
    setFiles(next);
    const stored = persistWorkspace(next);
    setStorageFailed(!stored);
    return stored;
  }
  const editor = useVimEngine(initial.files, settings, {
    key: () => setKeys((value) => value + 1),
    escapeFocus: () => panel.current?.focus(),
    changed: (value) => {
      dirty.current = Boolean(value);
    },
    path: () => {},
    result: () => {},
    saved: () => {},
    workspaceState: (value) => {
      dirty.current = value.buffers.some((buffer) => buffer.modified);
      const encoded = JSON.stringify(value);
      if (lastState.current !== encoded) {
        lastState.current = encoded;
        setState(value);
      }
    },
    workspaceEvent: (kind, path, text) => {
      if (kind === 'error') {
        setMessage(`작업을 마치지 못했습니다. 수정한 버퍼는 먼저 저장하세요. ${text}`);
        return;
      }
      const filename = workspaceName(path);
      if (!filename || text.includes('\0')) {
        setMessage(
          '이 파일은 브라우저에 보관하지 못했습니다. /work 바로 아래의 영문·숫자 파일 이름과 텍스트 파일만 지원합니다.',
        );
        setStorageFailed(true);
        return;
      }
      const next = { ...fileRef.current };
      if (kind === 'saved') next[filename] = text;
      else if (kind === 'deleted') delete next[filename];
      else return;
      const stored = remember(next);
      setMessage(
        stored
          ? `${filename} · ${kind === 'saved' ? '브라우저에 저장했습니다.' : '삭제했습니다.'}`
          : 'Vim 작업은 반영됐지만 브라우저 저장에 실패했습니다. 저장 재시도를 하거나 파일을 다운로드하세요.',
      );
    },
  });
  const available = editor.status === 'ready' && !busy;
  const buffers = state?.buffers || [];
  const names = [
    ...new Set([
      ...Object.keys(files),
      ...buffers.map((buffer) => workspaceName(buffer.path)).filter(Boolean),
    ]),
  ];
  async function open(filename) {
    setBusy(true);
    try {
      await editor.engine.current.openFile(filename);
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function create(event) {
    event.preventDefault();
    if (!validFileName(name)) {
      setMessage(
        '파일 이름은 영문·숫자로 시작하고 영문·숫자·점·밑줄·하이픈만 사용할 수 있습니다 (최대 64자).',
      );
      return;
    }
    if (names.includes(name)) {
      setMessage('같은 이름이 있습니다. 목록에서 그 파일을 열어 주세요.');
      return;
    }
    if (!(await open(name))) return;
    setMessage(`${name} 버퍼를 열었습니다. 내용을 입력한 뒤 :w로 저장하면 파일로 보관됩니다.`);
    setName('');
  }
  async function remove(filename) {
    if (!confirm(`${filename}을 작업 공간에서 삭제할까요? 브라우저에 저장한 내용도 삭제됩니다.`))
      return;
    setBusy(true);
    try {
      await editor.engine.current.deleteFile(filename);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={s.workspace}>
      <header className={s.heading}>
        <p>파일 · 버퍼 · 창</p>
        <h2 id="title">나의 Vim 작업 공간</h2>
        <p>
          파일은 저장된 내용, 버퍼는 편집 중인 내용, 창은 버퍼를 보여 주는 자리입니다. 파일을 바꿔
          열어도 저장하지 않은 버퍼는 이 세션에 남습니다.
        </p>
      </header>
      <div className={s.files} ref={panel} tabIndex={-1} aria-label="작업 공간 도구와 안내">
        <div className={s.tools}>
          <button aria-pressed={!showGuide} onClick={() => setShowGuide(false)}>
            파일 목록
          </button>
          <button aria-pressed={showGuide} onClick={() => setShowGuide(true)}>
            키 안내
          </button>
        </div>
        {showGuide ? (
          <WorkspaceGuide
            guideIndex={guideIndex}
            setGuideIndex={setGuideIndex}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
          />
        ) : (
          <>
            <h3>내 파일</h3>
            <p>브라우저의 /work 폴더 · 기기의 실제 파일을 바꾸지 않습니다.</p>
            <form onSubmit={create} className={s.create}>
              <label htmlFor="workspace-name">새 파일 이름</label>
              <input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="memo.txt"
                maxLength={64}
              />
              <button disabled={!available || !name}>새 버퍼 열기</button>
            </form>
            <p className={s.note}>
              영문·숫자·점·밑줄·하이픈, 최대 64자. 폴더 생성과 바이너리 파일은 지원하지 않습니다.
            </p>
            <ul className={s.list} id="workspace-files">
              {names.map((filename) => {
                const buffer = buffers.find((item) => item.path === `/work/${filename}`);
                const saved = Object.hasOwn(files, filename);
                return (
                  <li key={filename} data-file={filename}>
                    <button
                      className={s.filename}
                      disabled={!available}
                      aria-current={state?.path === `/work/${filename}` ? 'true' : 'false'}
                      onClick={() => open(filename)}
                    >
                      {filename}
                    </button>
                    <span>
                      {buffer?.modified
                        ? '수정 중 · 미저장'
                        : !saved
                          ? '새 버퍼 · 미저장'
                          : '저장된 파일'}
                    </span>
                    <div className={s.fileActions}>
                      <button
                        disabled={!saved}
                        onClick={() => downloadWorkspaceFile(filename, files[filename])}
                        aria-label={`${filename} 저장본 다운로드`}
                      >
                        저장본 다운로드
                      </button>
                      <button
                        disabled={!available || Boolean(buffer?.modified)}
                        onClick={() => remove(filename)}
                        aria-label={`${filename} 삭제`}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!names.length && <p>아직 파일이 없습니다. 위에서 새 버퍼를 열어 보세요.</p>}
            <p className={s.note}>
              다운로드는 마지막 저장본입니다. 수정한 내용은 먼저 Vim에서 저장하세요. 파일과 브라우저
              저장소는 이 탭을 기준으로 동작하므로 여러 탭에서 동시에 편집하지 마세요.
            </p>
          </>
        )}
      </div>
      <div className={s.editor}>
        <div className={s.state} id="workspace-state" aria-live="polite">
          <strong>
            현재 버퍼 {state?.buffer ?? '–'} ·{' '}
            {state?.path ? state.path.split('/').pop() : '이름 없음'}
          </strong>
          <span>
            창 {state?.windows ?? '–'}개 · 현재 창 {state?.windowNumber ?? '–'}
          </span>
          <span>{buffers.filter((buffer) => buffer.modified).length}개 버퍼 미저장</span>
        </div>
        <VimTerminal
          {...editor}
          path={state?.path || '[이름 없는 버퍼]'}
          keys={keys}
          expanded={false}
          guided
        />
        <div className={s.tools}>
          <button
            id="workspace-focus"
            disabled={!available}
            onClick={() => editor.engine.current.focus()}
          >
            편집기에 입력하기
          </button>
          <button id="settings-open" onClick={() => setSettingsOpen(true)}>
            편집기 설정
          </button>
          {editor.status !== 'ready' && (
            <button
              onClick={() => {
                if (canLeave()) onRestart();
              }}
            >
              저장본으로 다시 열기
            </button>
          )}
        </div>
        <p id="workspace-message" role="status">
          {message}
        </p>
        {storageFailed && (
          <button
            onClick={() =>
              setMessage(
                remember(fileRef.current)
                  ? '작업 공간을 브라우저에 저장했습니다.'
                  : '아직 저장할 수 없습니다. 파일을 다운로드하세요.',
              )
            }
          >
            브라우저 저장 재시도
          </button>
        )}
        <p className={s.note}>
          :w로 현재 파일, :wa로 수정한 파일들을 저장합니다. 이름 없는 버퍼는 먼저 :w memo.txt처럼
          이름을 지정하세요. Ctrl+Shift+F로 안내로 돌아옵니다.
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
