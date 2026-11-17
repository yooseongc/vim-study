import s from '../styles/NavigationWorkshop.module.css';
function position(value) {
  return value?.[0] ? `${value[0]}행 ${value[1]}열` : '표시 없음';
}
export function NavigationStatus({ snapshot }) {
  return (
    <div className={s.status} aria-label="위치와 이동 기록">
      <div>
        <span>현재 위치</span>
        <code id="navigation-cursor">{snapshot ? position(snapshot.cursor) : '준비 중'}</code>
      </div>
      <div>
        <span>mark a</span>
        <code id="navigation-mark">{position(snapshot?.markA)}</code>
      </div>
      <div>
        <span>점프 기록</span>
        <code id="navigation-jumps">{snapshot?.jumpCount ?? 0}곳</code>
      </div>
    </div>
  );
}
