import { missions } from '../missions.js';
import { guidedCourses } from '../lessons/catalog.js';
import s from '../styles/MissionList.module.css';

export function MissionList({ current, completed, onSelect, basicsCompleted, grammarCompleted }) {
  function entry(course, badge) {
    return (
      <button
        key={course.id}
        className={`${s.mission} ${current.id === course.id ? s.active : ''}`}
        aria-current={current.id === course.id ? 'step' : undefined}
        onClick={() => onSelect(course.id)}
      >
        <span className={s.number}>{badge}</span>
        <span>
          <strong>{course.title}</strong>
          {course.skill && <small>{course.skill}</small>}
        </span>
      </button>
    );
  }
  return (
    <aside className={s.missions}>
      <div className={s.label}>학습과 자유 연습</div>
      <nav id="mission-list" className={s.list} aria-label="학습 단원과 자유 연습">
        {entry(
          { id: 'home', title: '전체 학습 목차', skill: '입문부터 내 터미널까지 · 13개 과정' },
          '↗',
        )}
        {entry(
          { id: 'workspace', title: '나의 Vim 작업 공간', skill: '파일 저장 · 버퍼와 창' },
          '파일',
        )}
        <details
          open={guidedCourses.some((course) => course.id === current.id) || current.id === 'review'}
        >
          <summary>이전 과정과 복습 열기</summary>
          {guidedCourses.map((course) =>
            entry(
              course,
              (course.id === 'basics' && basicsCompleted) ||
                (course.id === 'grammar' && grammarCompleted)
                ? '✓'
                : course.badge,
            ),
          )}
          {entry({ id: 'review', title: '다시 꺼내 쓰는 연습', skill: '기존 복습 화면' }, '복습')}
        </details>
        {missions.map((course, index) =>
          entry(course, completed.includes(course.id) ? '✓' : String(index + 1).padStart(2, '0')),
        )}
      </nav>
      <div className={s.note}>
        <span>↳</span>
        <p>
          정답은 하나가 아닙니다.
          <br />
          결과가 같다면, 당신의 방법도 정답.
        </p>
      </div>
    </aside>
  );
}
