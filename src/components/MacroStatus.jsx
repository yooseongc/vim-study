import { readableMacro } from '../lessons/macro-workshop.js';
import s from '../styles/MacroWorkshop.module.css';

export function MacroStatus({ snapshot }) {
  return (
    <div className={s.status} aria-label="매크로 상태">
      <span className={snapshot?.recording ? s.recording : ''} id="macro-recording">
        {snapshot?.recording
          ? `${snapshot.recording} 녹화 중 · 일반 모드 q로 종료`
          : '녹화 중 아님'}
      </span>
      <code id="macro-content" title={readableMacro(snapshot?.registerA)}>
        {snapshot?.recording
          ? '녹화 종료 후 a 내용 표시'
          : snapshot?.registerA
            ? `a: ${readableMacro(snapshot.registerA)}`
            : 'a: 아직 녹화한 내용 없음'}
      </code>
    </div>
  );
}
