import s from '../styles/VimTerminal.module.css';

export function VimTerminal({
  canvas,
  input,
  status,
  message,
  path,
  keys,
  expanded,
  guided = false,
}) {
  const label = {
    ready: '● VIM 8.2 · WASM',
    loading: 'VIM · 준비 중',
    error: 'VIM · 연결 확인 필요',
    exited: 'VIM · 종료',
  }[status];
  return (
    <div className={`${s.terminal} ${expanded ? s.expanded : ''} ${guided ? s.guided : ''}`}>
      <div className={s.bar}>
        <div>
          <span className={s.dot} />
          <span id="file-name" className={s.path}>
            {path}
          </span>
        </div>
        <span id="engine-status" className={s.status}>
          {label}
        </span>
      </div>
      <div id="editor-host" className={s.host}>
        <canvas ref={canvas} id="vim-canvas" className={s.canvas} aria-label="Vim 편집 화면" />
        <input
          ref={input}
          id="vim-input"
          className={s.input}
          aria-label="Vim 키보드 입력"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {message && (
          <div id="loading" className={s.loading}>
            {message}
          </div>
        )}
      </div>
      <div className={s.footer}>
        <span>
          <kbd>Esc</kbd> 일반 모드 <span>·</span> <kbd>:w</kbd> 파일 저장
        </span>
        <span id="keys">{keys} keys</span>
      </div>
    </div>
  );
}
