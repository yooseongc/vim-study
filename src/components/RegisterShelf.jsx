import s from '../styles/RegisterWorkshop.module.css';

export function RegisterShelf({ snapshot }) {
  return (
    <div className={s.shelf} aria-label="현재 레지스터 내용">
      {[
        ['기본', 'register'],
        ['0 · 최근 복사', 'registerZero'],
        ['a · 이름 붙임', 'registerA'],
      ].map(([label, field]) => (
        <div key={field}>
          <span>{label}</span>
          <code data-register={field} title={snapshot?.[field] || '비어 있음'}>
            {snapshot?.[field]?.replaceAll('\n', ' ↵ ') || '비어 있음'}
          </code>
        </div>
      ))}
    </div>
  );
}
