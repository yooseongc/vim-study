import { useState } from 'react';
import { batchWorkshop, batchLessons } from '../lessons/batch-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import b from '../styles/BatchWorkshop.module.css';
function BatchIntro({ start }) {
  const [includeNotes, setIncludeNotes] = useState(false);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>같은 변경을 여러 파일에</p>
        <h1 id="title">
          목록을 정하고,
          <br />
          <em>함께 바꾸기.</em>
        </h1>
        <p className={s.lede}>
          여러 파일에서 같은 단어를 바꿔야 할 때, 반복할 대상부터 고릅니다. 한 파일에서 결과를
          확인한 뒤 선택한 파일들에 적용하고 저장해봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>한 파일에서 확인하고</b>
          </span>
          <span>
            02 <b>목록 안에서 반복하고</b>
          </span>
          <span>
            03 <b>파일별 결과를 확인합니다</b>
          </span>
        </div>
        <button id="batch-start" className={s.primary} onClick={start}>
          파일 목록 연습하기 →
        </button>
        <p className={s.small}>세 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="파일 목록 범위 미리보기">
        <div className={s.previewHeading}>
          <span>세 파일이 열려 있어도</span>
          <span className={s.fileTag}>고정 예시의 치환 결과</span>
        </div>
        <h2>적용 범위는 목록으로 정합니다.</h2>
        <div className={b.choices}>
          <button aria-pressed={!includeNotes} onClick={() => setIncludeNotes(false)}>
            api·web만 선택
          </button>
          <button aria-pressed={includeNotes} onClick={() => setIncludeNotes(true)}>
            notes도 포함
          </button>
        </div>
        {['api.txt', 'web.txt', 'notes.txt'].map((name) => (
          <div className={b.file} key={name}>
            <b>{name}</b>
            <code>
              {name !== 'notes.txt' || includeNotes ? 'mode=new backup=new' : 'mode=old backup=old'}
            </code>
          </div>
        ))}
        <p className={b.explanation} role="status">
          {includeNotes
            ? 'notes까지 목록에 넣으면 같은 old도 함께 바뀝니다. 이번 문제에서 notes는 보존할 파일입니다.'
            : 'notes는 열려 있어도 목록 밖이면 argdo의 대상이 아닙니다. api와 web에만 같은 변경을 적용합니다.'}
        </p>
        <p>
          <code>args</code>는 파일 목록을 정하고, <code>argdo</code>는 그 목록에서 명령을
          반복합니다. 앞에서 배운 quickfix는 검색 결과의 위치 목록입니다.
        </p>
      </section>
    </main>
  );
}
export function BatchWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={batchWorkshop}
      segments={batchLessons}
      Intro={BatchIntro}
      continueId="batch-continue"
      nextCourse={{ id: 'global-workshop', label: '이어서 조건에 맞는 줄만 처리하기' }}
    />
  );
}
