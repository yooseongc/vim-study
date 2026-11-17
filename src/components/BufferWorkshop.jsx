import { useState } from 'react';
import { bufferWorkshop, bufferLessons } from '../lessons/buffer-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import b from '../styles/BufferWorkshop.module.css';
function BufferIntro({ start }) {
  const [same, setSame] = useState(true);
  const [changed, setChanged] = useState(false);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>파일을 보는 자리와 편집하는 내용</p>
        <h1>
          창은 두 개,
          <br />
          <em>버퍼도 두 개일까요?</em>
        </h1>
        <p className={s.lede}>
          창은 내용을 보여주는 자리입니다. 같은 파일을 나눠 보거나 다른 파일을 오가며, 보이지 않는
          변경까지 저장해봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>같은 버퍼를 나눠 보고</b>
          </span>
          <span>
            02 <b>숨은 변경까지 확인하고</b>
          </span>
          <span>
            03 <b>내 파일로 이어갑니다</b>
          </span>
        </div>
        <button id="buffer-start" className={s.primary} onClick={start}>
          버퍼와 창 연습하기 →
        </button>
        <p className={s.small}>세 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="버퍼와 창 개념 비교">
        <div className={s.previewHeading}>
          <span>고정 예시 · 창 두 개</span>
          <span className={s.fileTag}>버퍼 {same ? 1 : 2}개</span>
        </div>
        <h2>한쪽을 고치면 어디가 바뀔까요?</h2>
        <div className={b.choices}>
          <button aria-pressed={same} onClick={() => setSame(true)}>
            같은 버퍼 보기
          </button>
          <button aria-pressed={!same} onClick={() => setSame(false)}>
            다른 버퍼 보기
          </button>
        </div>
        <div className={b.windows} aria-label="두 창 예시">
          <div>
            창 1 · a.txt<code>mode={changed ? 'new' : 'old'}</code>
          </div>
          <div>
            창 2 · {same ? 'a.txt' : 'b.txt'}
            <code>mode={same && changed ? 'new' : 'old'}</code>
          </div>
        </div>
        <button
          className={s.textButton}
          aria-pressed={changed}
          onClick={() => setChanged(!changed)}
        >
          {changed ? '변경 되돌려 보기' : 'a.txt를 new로 바꿔 보기'}
        </button>
        <p role="status">
          {same
            ? '두 창이 같은 a.txt를 보여줍니다. 한쪽에서 바꾸면 다른 쪽에서도 같은 변경이 보입니다.'
            : 'a.txt와 b.txt는 별도 버퍼입니다. a.txt의 변경이 b.txt를 바꾸지는 않습니다.'}
        </p>
      </section>
    </main>
  );
}
export function BufferWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={bufferWorkshop}
      segments={bufferLessons}
      Intro={BufferIntro}
      continueId="buffer-continue"
    />
  );
}
