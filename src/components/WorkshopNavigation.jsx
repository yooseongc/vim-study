import { useEffect, useRef } from 'react';
import { curriculum, curriculumGroups } from '../lessons/curriculum.js';
import { guidedCourses } from '../lessons/catalog.js';
import s from '../styles/Workshop.module.css';
import { VimLogo } from './VimLogo.jsx';

export function CourseMenu({ open, close, select, title, currentId }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  const current = currentId;
  const go = (id) => {
    if (id === current) close();
    else select(id);
  };
  return (
    <dialog
      ref={dialog}
      className={s.menu}
      onCancel={close}
      onClose={close}
      aria-labelledby="course-menu-title"
    >
      <div className={s.menuHeading}>
        <h2 id="course-menu-title">어디부터 연습할까요?</h2>
        <button onClick={close} aria-label="학습 목차 닫기">
          닫기
        </button>
      </div>
      <p>{title} · 순서대로 배우거나 필요한 과정부터 시작하세요.</p>
      <div className={s.menuLinks}>
        <button onClick={() => go('home')}>학습 시작 안내</button>
        <button onClick={() => go('workspace')}>나의 Vim 작업 공간</button>
      </div>
      {curriculumGroups.map((group) => (
        <section key={group}>
          <h3>{group}</h3>
          <div className={s.menuLinks}>
            {curriculum
              .filter((course) => course.group === group)
              .map((course) => (
                <button
                  key={course.id}
                  className={s.courseLink}
                  onClick={() => go(course.id)}
                  aria-current={current === course.id ? 'step' : undefined}
                >
                  <span>{String(curriculum.indexOf(course) + 1).padStart(2, '0')}</span>
                  <span className={s.courseTitle}>{course.title}</span>
                  {current === course.id && <span>현재</span>}
                </button>
              ))}
          </div>
        </section>
      ))}
      <section>
        <h3>자유롭게 적용하기</h3>
        <div className={s.menuLinks}>
          <button onClick={() => go('port')}>여섯 자유 미션</button>
        </div>
      </section>
      <details>
        <summary>이전 과정과 복습 열기</summary>
        <p>단계마다 확인하던 이전 버전입니다. 기존 기록과 주소를 유지합니다.</p>
        <div className={s.menuLinks}>
          {guidedCourses.map((course) => (
            <button key={course.id} onClick={() => go(course.id)}>
              {course.title}
            </button>
          ))}
          <button onClick={() => go('review')}>기존 복습 화면</button>
        </div>
      </details>
    </dialog>
  );
}

export function WorkshopHeader({ openMenu }) {
  return (
    <header className={s.header}>
      <span className={s.brand}>
        <VimLogo className={s.logo} /> Vim <span>작은 편집, 큰 차이</span>
      </span>
      <button onClick={() => openMenu()} aria-haspopup="dialog">
        학습 목차 <span aria-hidden="true">☰</span>
      </button>
    </header>
  );
}
