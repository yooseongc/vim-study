import s from '../styles/BufferWorkshop.module.css';
export function BufferStatus({ snapshot }) {
  const buffers = snapshot?.bufferList ?? [];
  return (
    <div className={s.status} aria-label="실제 창과 버퍼 상태">
      <strong id="buffer-windows">
        창 {snapshot?.currentWindow ?? 1} / {snapshot?.windowCount ?? 1} · 미저장{' '}
        {snapshot?.dirtyCount ?? 0}개
      </strong>
      <span id="buffer-list">
        {buffers
          .map(
            (b) =>
              `${b.name} · ${b.changed ? '미저장' : '변경 없음'}${b.loaded && !b.visible ? ' · 숨김' : ''}`,
          )
          .join(' / ') || '버퍼 준비 중'}
      </span>
    </div>
  );
}
