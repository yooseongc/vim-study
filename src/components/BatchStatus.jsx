import s from '../styles/BatchWorkshop.module.css';
export function BatchStatus({ snapshot }) {
  const names = (snapshot?.argumentFiles ?? []).map((path) => path.split('/').pop());
  const position = snapshot?.argumentFiles?.indexOf(snapshot.path) ?? -1;
  return (
    <div className={s.status} aria-label="실제 적용 파일 목록">
      <span id="batch-position">
        {position < 0 && names.length
          ? `목록 밖 · 대상 ${names.length}개`
          : `목록 ${position + 1} / ${names.length}`}{' '}
        · 미저장 {snapshot?.dirtyCount ?? 0}개
      </span>
      <strong id="batch-files" title={names.join(' · ')}>
        {names.join(' · ') || '목록 준비 중'}
      </strong>
    </div>
  );
}
