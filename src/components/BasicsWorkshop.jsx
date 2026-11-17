import { useState } from 'react';
import { basicsWorkshop, basicsLessons } from '../lessons/basics-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
const modes = [
  ['일반 모드', 'w', '다음 단어로 이동합니다. 글자는 입력되지 않습니다.'],
  ['입력 모드', 'w', '글자 w가 들어갑니다. i로 들어가고 Esc로 나옵니다.'],
  ['명령줄', ':w', 'Enter를 누르면 파일에 저장합니다. 쓰기만 해서는 실행되지 않습니다.'],
];
function BasicsIntro({ start }) {
  const [mode, setMode] = useState(0);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>기억이 흐릿한 명령부터 다시</p>
        <h1>
          같은 키도,
          <br />
          <em>모드에 따라 다릅니다.</em>
        </h1>
        <p className={s.lede}>
          i는 입력 시작, Esc는 일반 모드로 돌아오기. 글자를 바꾸는 것과 저장하는 것을 나눠 익힙니다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>입력하고 저장하고</b>
          </span>
          <span>
            02 <b>되돌렸다 다시 적용하고</b>
          </span>
          <span>
            03 <b>줄을 정리하고 안내문을 완성합니다</b>
          </span>
        </div>
        <button id="basics-workshop-start" className={s.primary} onClick={start}>
          모드부터 연습하기 →
        </button>
        <p className={s.small}>모드와 저장 3문제 · 줄 편집과 적용 4문제</p>
      </div>
      <section className={s.introLesson} aria-label="모드별 키의 뜻">
        <div className={s.previewHeading}>
          <span>같은 w, 다른 뜻</span>
          <span className={s.fileTag}>모드 비교</span>
        </div>
        <h2>w가 저장이 아니었나요?</h2>
        <div className={s.decision}>
          {modes.map(([label], index) => (
            <button key={label} aria-pressed={mode === index} onClick={() => setMode(index)}>
              {label}
            </button>
          ))}
        </div>
        <div className={s.preview}>
          <div>
            <span>키</span>
            <code>{modes[mode][1]}</code>
          </div>
        </div>
        <p role="status">{modes[mode][2]}</p>
        <p>
          먼저 현재 모드를 확인하세요. 입력을 마쳤다면 <kbd>Esc</kbd>, 저장하려면 <kbd>:</kbd> →{' '}
          <kbd>w</kbd> → <kbd>Enter</kbd>입니다.
        </p>
      </section>
    </main>
  );
}
export function BasicsWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={basicsWorkshop}
      segments={basicsLessons}
      Intro={BasicsIntro}
      continueId="basics-workshop-continue"
    />
  );
}
