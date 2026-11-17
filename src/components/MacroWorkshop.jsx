import { useState } from 'react';
import { macroWorkshop, macroLessons } from '../lessons/macro-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import m from '../styles/MacroWorkshop.module.css';

function MacroIntro({ start }) {
  const [macro, setMacro] = useState(false);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>한 번의 변경에서, 여러 동작의 반복으로</p>
        <h1 id="title">
          여러 동작을 묶고,
          <br />
          <em>확인하며 반복하기.</em>
        </h1>
        <p className={s.lede}>
          편집하고 다음 줄로 이동하는 일을 반복한다면, 두 동작을 함께 녹화할 수 있습니다. 한 번
          실행해 결과와 끝 위치를 확인해봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>짧게 녹화하고</b>
          </span>
          <span>
            02 <b>한 번 확인하고</b>
          </span>
          <span>
            03 <b>필요한 곳에만 적용합니다</b>
          </span>
        </div>
        <button id="macro-start" className={s.primary} onClick={start}>
          매크로 연습 시작하기 →
        </button>
        <p className={s.small}>매크로 3문제 · 방법을 고르는 배포표 1문제</p>
      </div>
      <section className={s.introLesson} aria-label="점과 매크로 비교 예시">
        <div className={s.previewHeading}>
          <span>web 줄에서 반복한다면</span>
          <span className={s.fileTag}>예시</span>
        </div>
        <h2>같은 편집, 다른 끝 위치.</h2>
        <p>
          첫 줄에 문구를 붙인 변경을 반복합니다. a에는 문구 붙이기와 다음 줄 이동을 함께 녹화했다고
          가정합니다.
        </p>
        <div className={m.choices}>
          <button aria-pressed={!macro} onClick={() => setMacro(false)}>
            점 · 마지막 변경
          </button>
          <button aria-pressed={macro} onClick={() => setMacro(true)}>
            @a · 편집과 이동
          </button>
        </div>
        <div className={s.preview} aria-label="실행 후 예시">
          {['enabled: api', 'enabled: web', 'job'].map((line, index) => (
            <div key={line} className={index === (macro ? 2 : 1) ? m.cursor : ''}>
              <span>{index + 1}</span>
              <code>{line}</code>
              <span>{index === (macro ? 2 : 1) ? '← 커서' : ''}</span>
            </div>
          ))}
        </div>
        <p className={m.explanation} role="status">
          {macro
            ? 'a에 j까지 녹화했으므로 web을 바꾼 뒤 job으로 이동합니다. 다음 실행을 시작할 위치까지 정한 셈입니다.'
            : '점으로 변경을 반복해도 j 이동까지 반복하지는 않습니다. 커서는 편집한 web 줄에 남습니다.'}
        </p>
        <p>
          <code>qa</code>로 녹화 시작 → 편집과 이동 → 일반 모드에서 <code>q</code>로 종료 →{' '}
          <code>@a</code>로 한 번 실행합니다.
        </p>
        <p className={s.small}>
          a는 이전 단원에서 쓴 보관함과 같습니다. 새로 녹화하면 a의 이전 내용이 바뀝니다.
        </p>
      </section>
    </main>
  );
}
export function MacroWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={macroWorkshop}
      segments={macroLessons}
      Intro={MacroIntro}
      continueId="macro-continue"
    />
  );
}
