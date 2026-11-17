import { useState } from 'react';
import {
  navigationWorkshop,
  navigationLessons,
  navigationSample,
} from '../lessons/navigation-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import n from '../styles/NavigationWorkshop.module.css';
function NavigationIntro({ start }) {
  const [exact, setExact] = useState(false);
  const col = exact ? 10 : 2;
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>살펴보고, 다시 편집하던 곳으로</p>
        <h1 id="title">
          멀리 이동하고,
          <br />
          <em>다시 돌아오기.</em>
        </h1>
        <p className={s.lede}>
          파일 끝을 살펴본 뒤, 편집하던 단어로 돌아와야 할 때가 있습니다. 돌아갈 위치를 표시하거나
          이동 기록을 따라가는 방법을 익혀봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>위치를 표시하고</b>
          </span>
          <span>
            02 <b>이동 기록을 따라가고</b>
          </span>
          <span>
            03 <b>돌아와 편집을 이어갑니다</b>
          </span>
        </div>
        <button id="navigation-start" className={s.primary} onClick={start}>
          이동과 복귀 연습하기 →
        </button>
        <p className={s.small}>세 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="표시한 줄과 칸 비교">
        <div className={s.previewHeading}>
          <span>old의 o에 mark a를 남겼다면</span>
          <span className={s.fileTag}>2행 11열</span>
        </div>
        <h2>줄로 갈까요, 정확한 칸으로 갈까요?</h2>
        <div className={n.choices}>
          <button aria-pressed={!exact} onClick={() => setExact(false)}>
            작은따옴표 · 표시한 줄
          </button>
          <button aria-pressed={exact} onClick={() => setExact(true)}>
            백틱 · 표시한 칸
          </button>
        </div>
        <div className={s.preview} aria-label="복귀 위치 예시">
          {navigationSample.split('\n').map((line, index) => (
            <div key={index}>
              <span>{index + 1}</span>
              <code>
                {index === 1 ? (
                  <>
                    {line.slice(0, col)}
                    <mark className={n.caret}>{line[col]}</mark>
                    {line.slice(col + 1)}
                  </>
                ) : (
                  line
                )}
              </code>
            </div>
          ))}
        </div>
        <p className={n.explanation} role="status">
          {exact
            ? '백틱과 a는 표시한 2행 11열로 돌아갑니다. 커서는 old의 o 위에 놓입니다.'
            : '작은따옴표와 a는 표시한 줄의 첫 공백 아닌 문자로 갑니다. 앞에 공백 두 칸이 있어 2행 3열입니다.'}
        </p>
        <p>
          <code>ma</code>의 m은 mark, a는 표시 이름입니다. 위치를 표시하는 a와 앞에서 쓴 복사·매크로
          보관함 a는 서로 별개입니다.
        </p>
        <p className={s.small}>
          따로 표시하지 않은 최근 점프는 Ctrl+o와 Ctrl+i로 따라갈 수 있습니다.
        </p>
      </section>
    </main>
  );
}
export function NavigationWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={navigationWorkshop}
      segments={navigationLessons}
      Intro={NavigationIntro}
      continueId="navigation-continue"
      nextCourse={{ id: 'block-workshop', label: '이어서 여러 줄을 블록으로 편집하기' }}
    />
  );
}
