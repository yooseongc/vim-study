import s from '../styles/ExerciseBrief.module.css';
export function ExerciseBrief({ course }) {
  const initial = { [course.file]: course.initial, ...course.files };
  const targets = course.targets || { [course.file]: course.target };
  const changed = Object.entries(targets).filter(([name, text]) => initial[name] !== text);
  const preserved = Object.keys(targets).filter((name) => initial[name] === targets[name]);
  return (
    <section className={s.brief} aria-label="이번 문제의 전체 목표">
      <div className={s.heading}>
        <h2>이번 문제의 목표</h2>
        <span>편집한 뒤 저장까지</span>
      </div>
      {course.description && <p>{course.description}</p>}
      <div className={s.files}>
        {changed.map(([name, target]) => (
          <div key={name}>
            <h3>{name}</h3>
            <div className={s.compare}>
              <div>
                <b>시작</b>
                <pre>{initial[name]}</pre>
              </div>
              <div>
                <b>목표</b>
                <pre>{target}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className={s.note}>
        {preserved.length
          ? `${preserved.join(', ')} 파일은 그대로 남깁니다. `
          : '시작과 목표에서 같은 부분은 그대로 남깁니다. '}
        {course.finalWindowCount
          ? `마지막에는 창 ${course.finalWindowCount}개로 정리합니다.`
          : '방법은 직접 골라도 됩니다.'}
      </p>
    </section>
  );
}
