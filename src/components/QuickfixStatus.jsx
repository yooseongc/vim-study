import s from '../styles/QuickfixWorkshop.module.css';
export function QuickfixStatus({ snapshot }) {
  return (
    <div className={s.status} aria-label="검색 목록과 저장 상태">
      <div>
        <span>검색 목록 위치</span>
        <strong id="quickfix-position">
          {snapshot?.quickfixIndex ?? 0} / {snapshot?.quickfixCount ?? 0}
        </strong>
      </div>
      <div>
        <span>미저장 버퍼</span>
        <strong id="quickfix-dirty">{snapshot?.dirtyCount ?? 0}개</strong>
      </div>
    </div>
  );
}
