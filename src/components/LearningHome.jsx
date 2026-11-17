import { useImperativeHandle, useState } from 'react';
import { curriculum, curriculumGroups } from '../lessons/curriculum.js';
import { CourseMenu, WorkshopHeader } from './WorkshopNavigation.jsx';
import s from '../styles/LearningHome.module.css';
import shared from '../styles/Workshop.module.css';

export const home = { id: 'home', title: 'Vim 학습 시작' };
export function LearningHome({ ref, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useImperativeHandle(ref, () => ({ canLeave: () => true }), []);
  return (
    <div className={shared.page}>
      <WorkshopHeader openMenu={() => setMenuOpen(true)} />
      <main className={s.main}>
        <section className={s.intro} aria-labelledby="home-title">
          <div>
            <p className={s.eyebrow}>작은 편집 하나를, 내 것으로.</p>
            <h1 id="home-title">
              뜻을 이해하고,
              <br />
              손으로 이어 쓰는 Vim.
            </h1>
            <p>
              키 하나의 의미부터 여러 파일을 다루는 편집까지.
              <br />
              설명을 읽고, 실제 Vim에서 바꾸고, 다른 문제에 다시 써봅니다.
            </p>
            <p className={s.note}>
              키보드가 있는 데스크톱을 권장합니다. 새 과정은 학습 기록을 남기지 않습니다.
            </p>
          </div>
          <div className={s.starts}>
            <h2>어디부터 시작할까요?</h2>
            <p>입력·검색·저장은 써봤지만 기억이 흐릿하다면, 입문에서 짧게 정리하세요.</p>
            <button
              id="home-start"
              className={s.primary}
              onClick={() => onSelect('basics-workshop')}
            >
              모드와 저장이 헷갈리면 입문부터 →
            </button>
            <button onClick={() => onSelect('workshop')}>
              기본 편집을 안다면, 반복 줄이기부터 →
            </button>
            <p className={s.note}>완료 조건 없이 어느 과정이든 바로 열 수 있습니다.</p>
          </div>
        </section>
        <section aria-labelledby="path-title">
          <div className={s.heading}>
            <h2 id="path-title">학습 목차</h2>
            <p>12개 브라우저 과정 → 내 터미널 실습</p>
          </div>
          <div className={s.groups}>
            {curriculumGroups.map((group) => (
              <section key={group} className={s.group}>
                <h3>{group}</h3>
                <ol>
                  {curriculum
                    .filter((course) => course.group === group)
                    .map((course) => (
                      <li key={course.id}>
                        <button onClick={() => onSelect(course.id)}>
                          <span className={s.number}>
                            {String(curriculum.indexOf(course) + 1).padStart(2, '0')}
                          </span>
                          <span>{course.title}</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      </li>
                    ))}
                </ol>
              </section>
            ))}
          </div>
        </section>
        <section className={s.free} aria-labelledby="free-title">
          <div>
            <h2 id="free-title">배운 것을 내 편집에 써보기</h2>
            <p>
              작업 공간의 파일은 이 브라우저에 저장됩니다. 자유 미션에서는 방법을 직접 고릅니다.
            </p>
          </div>
          <div>
            <button onClick={() => onSelect('workspace')}>나의 Vim 작업 공간 →</button>
            <button onClick={() => onSelect('port')}>여섯 자유 미션 →</button>
          </div>
        </section>
      </main>
      <CourseMenu
        open={menuOpen}
        close={() => setMenuOpen(false)}
        select={onSelect}
        title={home.title}
        currentId="home"
      />
    </div>
  );
}
