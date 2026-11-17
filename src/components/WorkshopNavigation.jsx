import { useEffect, useRef } from 'react';
import { guidedCourses } from '../lessons/catalog.js';
import s from '../styles/Workshop.module.css';

const groups = [
  [
    '이어 입력하는 새 과정',
    [
      'workshop',
      'range-workshop',
      'register-workshop',
      'macro-workshop',
      'navigation-workshop',
      'block-workshop',
      'quickfix-workshop',
      'batch-workshop',
      'global-workshop',
    ],
  ],
  ['기본부터 정리하기', ['basics', 'grammar', 'registers', 'block']],
  ['이동과 반복 익히기', ['navigation', 'dot', 'substitution', 'macros']],
  ['파일과 작업 범위 넓히기', ['workspace', 'quickfix', 'batch', 'global', 'local']],
];
const extraTitles = {
  'global-workshop': '조건으로 줄을 골라 처리하기',
  'batch-workshop': '목록을 정하고 함께 바꾸기',
  'quickfix-workshop': '검색 목록을 따라 편집하기',
  'block-workshop': '같은 열을 골라 함께 편집하기',
  workshop: '한 번 바꾸고, 다시 쓰기',
  'range-workshop': '범위를 고르고, 확인하며 바꾸기',
  'register-workshop': '복사한 내용을 지키며 편집하기',
  'macro-workshop': '여러 동작을 묶고, 확인하며 반복하기',
  'navigation-workshop': '멀리 이동하고, 다시 돌아오기',
  workspace: '나의 Vim 작업 공간',
  local: '내 터미널에서 마무리하기',
};

export function CourseMenu({ open, close, select, title }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
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
      <p>지금은 ‘{title}’를 연습하고 있습니다. 기존 과정도 필요한 부분부터 열 수 있습니다.</p>
      {groups.map(([name, ids]) => (
        <section key={name}>
          <h3>{name}</h3>
          <div className={s.menuLinks}>
            {ids.map((id) => (
              <button key={id} onClick={() => select(id)}>
                {guidedCourses.find((c) => c.id === id)?.title || extraTitles[id]}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <details>
        <summary>자유 미션과 기존 복습</summary>
        <div className={s.menuLinks}>
          <button onClick={() => select('port')}>여섯 자유 미션</button>
          <button onClick={() => select('review')}>기존 복습 화면</button>
        </div>
      </details>
    </dialog>
  );
}

export function WorkshopHeader({ openMenu }) {
  return (
    <header className={s.header}>
      <span className={s.brand}>
        <b>v_</b> Vim <span>작은 편집, 큰 차이</span>
      </span>
      <button onClick={() => openMenu()} aria-haspopup="dialog">
        학습 목차 <span aria-hidden="true">☰</span>
      </button>
    </header>
  );
}
