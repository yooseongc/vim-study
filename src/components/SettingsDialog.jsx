import { useEffect, useRef, useState } from 'react';
import {
  readSettings,
  defaultSettings,
  bundledFonts,
  installedFonts,
  writeStorage,
  SETTINGS_KEY,
} from '../lib/storage.js';
import s from '../styles/SettingsDialog.module.css';

export function SettingsDialog({ open, onClose, apply }) {
  const dialog = useRef(null);
  const [settings, setSettings] = useState(readSettings);
  const [message, setMessage] = useState('');
  const revision = useRef(0);
  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);
  useEffect(
    () => () => {
      revision.current++;
    },
    [],
  );
  async function update(next) {
    const request = ++revision.current;
    setSettings(next);
    setMessage('글꼴을 적용하는 중…');
    try {
      await apply(next);
      if (request !== revision.current) return;
      setMessage(
        writeStorage(SETTINGS_KEY, next)
          ? '설정이 적용되었습니다. 다음 방문에도 유지됩니다.'
          : '이번에는 적용했지만 브라우저에 저장하지 못했습니다.',
      );
    } catch {
      if (request === revision.current)
        setMessage('Vim에 적용하지 못했습니다. 편집기가 준비된 뒤 다시 시도해 주세요.');
    }
  }
  return (
    <dialog
      ref={dialog}
      id="settings"
      className={s.dialog}
      aria-labelledby="settings-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <div className={s.heading}>
        <h2 id="settings-title">편집기 설정</h2>
        <button id="settings-close" aria-label="설정 닫기" onClick={onClose}>
          닫기
        </button>
      </div>
      <p>내 눈에 편한 글꼴과 크기로 Vim을 사용하세요.</p>
      <label htmlFor="font-family">Mono 폰트</label>
      <select
        id="font-family"
        aria-describedby="font-help"
        value={settings.family}
        onChange={(event) => update({ ...settings, family: event.target.value })}
      >
        <option value="monospace">시스템 Mono (기본)</option>
        <optgroup label="바로 사용 · 설치 필요 없음">
          {bundledFonts.map((font) => (
            <option key={font}>{font}</option>
          ))}
        </optgroup>
        <optgroup label="기기에 설치된 글꼴">
          {installedFonts.map((font) => (
            <option key={font}>{font}</option>
          ))}
        </optgroup>
      </select>
      <p className={s.help} id="font-help">
        JetBrains Mono 등 5종은 설치 없이 사용할 수 있습니다. ‘기기에 설치된 글꼴’은 설치되어 있지
        않으면 시스템 Mono로 표시됩니다. 한글은 기기의 대체 글꼴로 표시됩니다.
      </p>
      <label htmlFor="font-size">
        글자 크기{' '}
        <output id="font-size-value" htmlFor="font-size">
          {settings.size} px
        </output>
      </label>
      <input
        id="font-size"
        type="range"
        min="12"
        max="28"
        step="1"
        value={settings.size}
        onChange={(event) => update({ ...settings, size: Number(event.target.value) })}
      />
      <pre
        id="font-preview"
        className={s.preview}
        aria-label="글꼴 미리보기"
        style={{
          fontFamily: `"${settings.family}", monospace`,
          fontSize: settings.size,
        }}
      >
        {'const hello = "Vim";\n0O 1Il  {} [] ()  != =>\n읽기 편한 크기로 연습하세요.'}
      </pre>
      <p id="settings-status" className={s.status} role="status" aria-live="polite">
        {message}
      </p>
      <button id="settings-reset" onClick={() => update({ ...defaultSettings })}>
        글꼴 설정 초기화
      </button>
    </dialog>
  );
}
