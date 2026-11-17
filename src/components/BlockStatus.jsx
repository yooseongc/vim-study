import { blockBounds } from '../lessons/block-workshop.js';
import s from '../styles/BlockWorkshop.module.css';
export function BlockStatus({ snapshot }) {
  const bounds = blockBounds(snapshot);
  return (
    <div className={s.status} aria-label="블록 선택 범위">
      <span>
        {bounds
          ? '실제 선택 범위'
          : snapshot?.mode.startsWith('i')
            ? '입력 중 · Esc로 마치기'
            : '블록 선택 대기'}
      </span>
      <strong id="block-range">
        {bounds
          ? `${bounds.top}~${bounds.bottom}행 · ${bounds.left}~${bounds.right}열 (${bounds.rows} × ${bounds.columns})`
          : '선택 없음'}
      </strong>
    </div>
  );
}
