import { useState } from 'react';
import { blockWorkshop, blockLessons } from '../lessons/block-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import b from '../styles/BlockWorkshop.module.css';
function BlockIntro({ start }) {
  const [mode, setMode] = useState('block');
  const options = [
    ['character', 'v · 문자'],
    ['line', 'V · 줄'],
    ['block', 'Ctrl+v · 블록'],
  ];
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>여러 줄의 같은 자리를 한 번에</p>
        <h1 id="title">
          같은 열을 고르고,
          <br />
          <em>함께 편집하기.</em>
        </h1>
        <p className={s.lede}>
          세 줄 앞에 같은 문구를 붙이거나 번호 열만 지워봅시다. 먼저 범위를 눈으로 확인하고, 선택한
          부분에만 편집을 적용합니다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>세 줄에 함께 입력하고</b>
          </span>
          <span>
            02 <b>번호 열만 지우고</b>
          </span>
          <span>
            03 <b>두 동작을 조합합니다</b>
          </span>
        </div>
        <button id="block-start" className={s.primary} onClick={start}>
          블록 편집 연습하기 →
        </button>
        <p className={s.small}>세 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="선택 방식 비교">
        <div className={s.previewHeading}>
          <span>선택 미리보기</span>
          <span className={s.fileTag}>1행 1열 → 3행 3열</span>
        </div>
        <h2>같은 위치까지 골라도 범위가 다릅니다.</h2>
        <div className={b.choices}>
          {options.map(([value, label]) => (
            <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className={s.preview} aria-label="선택 범위 예시">
          {['01 api', '02 web', '03 job', 'note: keep'].map((line, row) => (
            <div key={line}>
              <span>{row + 1}</span>
              <code>
                {row < 3 ? (
                  <>
                    <mark className={b.selected}>
                      {line.slice(
                        0,
                        mode === 'block' || (mode === 'character' && row === 2) ? 3 : line.length,
                      )}
                    </mark>
                    {line.slice(
                      mode === 'block' || (mode === 'character' && row === 2) ? 3 : line.length,
                    )}
                  </>
                ) : (
                  line
                )}
              </code>
            </div>
          ))}
        </div>
        <p className={b.explanation} role="status">
          {mode === 'block'
            ? 'Ctrl+v는 직사각형입니다. 번호 두 글자와 공백 한 칸만, 세 줄에서 함께 고릅니다.'
            : mode === 'line'
              ? '대문자 V는 줄 전체를 고릅니다. 번호뿐 아니라 api, web, job도 포함됩니다.'
              : '소문자 v는 시작부터 끝까지 이어진 텍스트를 고릅니다. 첫 두 줄 전체와 셋째 줄의 공백까지 포함됩니다.'}
        </p>
        <p>
          블록에서 대문자 <code>I</code>로 입력하면 처음에는 첫 줄만 바뀝니다. <code>Esc</code>로
          입력을 마칠 때 다른 선택 줄에도 적용됩니다.
        </p>
        <p className={s.small}>아래 연습에서는 실제 Vim의 선택 범위와 적용 전후를 확인합니다.</p>
      </section>
    </main>
  );
}
export function BlockWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={blockWorkshop}
      segments={blockLessons}
      Intro={BlockIntro}
      continueId="block-continue"
    />
  );
}
