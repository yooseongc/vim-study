import { useState } from 'react';
import { globalWorkshop, globalLessons, globalSample } from '../lessons/global-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import g from '../styles/GlobalWorkshop.module.css';
function GlobalIntro({ start }) {
  const [anchored, setAnchored] = useState(true);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>어떤 줄에 명령을 실행할까요?</p>
        <h1 id="title">
          조건으로 고르고,
          <br />
          <em>필요한 줄만 처리하기.</em>
        </h1>
        <p className={s.lede}>
          같은 단어가 보여도 모두 지울 줄은 아닐 수 있습니다. 줄의 시작과 단어의 경계를 구분하고,
          선택 결과를 먼저 확인해봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>출력으로 범위를 확인하고</b>
          </span>
          <span>
            02 <b>조건 안과 밖을 구분하고</b>
          </span>
          <span>
            03 <b>남길 줄을 지킵니다</b>
          </span>
        </div>
        <button id="global-start" className={s.primary} onClick={start}>
          조건별 줄 처리 연습하기 →
        </button>
        <p className={s.small}>세 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="줄 선택 미리보기">
        <div className={s.previewHeading}>
          <span>이 예시에서 골라지는 줄</span>
          <span className={s.fileTag}>출력 p → 삭제 d</span>
        </div>
        <h2>중간에 있는 DEBUG도 지워야 할까요?</h2>
        <div className={g.choices}>
          <button aria-pressed={anchored} onClick={() => setAnchored(true)}>
            ^DEBUG · 줄 시작
          </button>
          <button aria-pressed={!anchored} onClick={() => setAnchored(false)}>
            DEBUG · 위치 상관없이
          </button>
        </div>
        <div className={s.preview} aria-label="선택된 줄 예시">
          {globalSample.split('\n').map((line, i) => (
            <div key={line}>
              <span>{i + 1}</span>
              <code>
                {(anchored ? line.startsWith('DEBUG') : line.includes('DEBUG')) ? (
                  <mark className={g.selection}>{line}</mark>
                ) : (
                  line
                )}
              </code>
            </div>
          ))}
        </div>
        <p className={g.explanation} role="status">
          {anchored
            ? '^DEBUG는 DEBUG로 시작하는 두 줄만 고릅니다. INFO DEBUG stays는 남길 수 있습니다.'
            : 'DEBUG만 찾으면 INFO DEBUG stays까지 세 줄이 골라집니다. 뒤에 d를 붙이면 그 줄 전체도 삭제됩니다.'}
        </p>
        <p>
          <code>:g/조건/p</code>로 출력해 보고, 같은 조건에 <code>d</code>를 붙여 삭제합니다. 치환
          끝의 <code>g</code> 옵션과 구분해서 연습합니다.
        </p>
      </section>
    </main>
  );
}
export function GlobalWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={globalWorkshop}
      segments={globalLessons}
      Intro={GlobalIntro}
      continueId="global-continue"
    />
  );
}
