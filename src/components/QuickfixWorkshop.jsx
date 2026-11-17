import { useState } from 'react';
import { quickfixWorkshop, quickfixLessons } from '../lessons/quickfix-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import q from '../styles/QuickfixWorkshop.module.css';
function QuickfixIntro({ start }) {
  const [index, setIndex] = useState(0);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>수정할 위치를 모아두기</p>
        <h1 id="title">
          찾아 둔 곳으로,
          <br />
          <em>하나씩 이동하기.</em>
        </h1>
        <p className={s.lede}>
          검색 결과가 여러 파일에 흩어져 있다면 위치 목록을 만들 수 있습니다. quickfix 목록을
          따라가며 내용을 확인하고, 필요한 곳을 고쳐봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>검색 위치를 모으고</b>
          </span>
          <span>
            02 <b>파일을 넘어 이동하고</b>
          </span>
          <span>
            03 <b>수정한 파일을 모두 저장합니다</b>
          </span>
        </div>
        <button id="quickfix-start" className={s.primary} onClick={start}>
          검색 목록 연습하기 →
        </button>
        <p className={s.small}>세 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="검색 목록 미리보기">
        <div className={s.previewHeading}>
          <span>두 파일에서 TODO를 찾았다면</span>
          <span className={s.fileTag}>위치 목록 예시</span>
        </div>
        <h2>다음 결과는 다른 파일일 수도 있습니다.</h2>
        {['api.txt · 1행 1열 · TODO api', 'web.txt · 1행 1열 · TODO web'].map((text, i) => (
          <div
            key={text}
            className={`${q.item} ${index === i ? q.active : ''}`}
            aria-current={index === i ? 'location' : undefined}
          >
            {i + 1}. {text}
          </div>
        ))}
        <div className={q.choices}>
          <button onClick={() => setIndex(0)} disabled={index === 0}>
            이전 결과 · cprevious
          </button>
          <button onClick={() => setIndex(1)} disabled={index === 1}>
            다음 결과 · cnext
          </button>
        </div>
        <p className={q.explanation} role="status">
          {index === 0
            ? '현재 api.txt의 첫 TODO입니다. 다음 결과로 이동하면 web.txt가 열립니다.'
            : '현재 web.txt의 TODO입니다. api.txt에서 수정한 내용은 이동만으로 저장되지 않습니다.'}
        </p>
        <p>
          <code>vimgrep</code>은 검색해서 목록을 만들고, <code>cnext</code>는 목록을 따라
          이동합니다. 이동과 수정, 저장은 각각 다른 동작입니다.
        </p>
        <p className={s.small}>
          실습에서 :copen으로 실제 목록을 보고 :cclose로 닫을 수도 있습니다. 창을 닫아도 목록은
          남습니다.
        </p>
      </section>
    </main>
  );
}
export function QuickfixWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={quickfixWorkshop}
      segments={quickfixLessons}
      Intro={QuickfixIntro}
      continueId="quickfix-continue"
    />
  );
}
