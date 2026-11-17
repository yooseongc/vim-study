import { useState } from 'react';
import { grammarWorkshop, grammarLessons } from '../lessons/grammar-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
const examples = [
  [
    'ciw',
    '단어 바꾸기',
    'guest → admin',
    'c는 바꾸기, iw는 단어 안쪽입니다. 단어를 비운 뒤 새 내용을 입력합니다.',
  ],
  [
    'dw',
    '이동 범위 삭제',
    'remove keep → keep',
    'd는 삭제, w는 다음 단어 시작까지의 범위입니다. 이 예시에서는 뒤 공백도 함께 지웁니다.',
  ],
  [
    'ci"',
    '따옴표 안쪽 바꾸기',
    '"guest user" → "admin user"',
    'c는 바꾸기, i"는 큰따옴표 안쪽입니다. 공백을 포함한 전체 내용을 바꾸고 따옴표는 남깁니다.',
  ],
  [
    'di"',
    '따옴표 안쪽 비우기',
    '"old label" → ""',
    'd는 삭제, i"는 큰따옴표 안쪽입니다. 새 입력 없이 일반 모드에 남습니다.',
  ],
];
function GrammarIntro({ start }) {
  const [selected, setSelected] = useState(0);
  const item = examples[selected];
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>입력과 저장 다음에 익힐 것</p>
        <h1>
          어디를 찾고,
          <br />
          <em>무엇을 바꿀까요?</em>
        </h1>
        <p className={s.lede}>
          먼저 위치를 찾고, 동작과 범위를 고릅니다. 짧은 명령을 통째로 외우기 전에 각 부분의 뜻을
          실제 편집으로 확인하세요.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>검색으로 위치를 찾고</b>
          </span>
          <span>
            02 <b>이동을 범위로 사용하고</b>
          </span>
          <span>
            03 <b>동작과 안쪽 범위를 조합합니다</b>
          </span>
        </div>
        <button id="grammar-workshop-start" className={s.primary} onClick={start}>
          검색과 편집 연습하기 →
        </button>
        <p className={s.small}>네 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="동작과 범위 비교">
        <div className={s.previewHeading}>
          <span>동작 + 범위</span>
          <span className={s.fileTag}>명령 조합</span>
        </div>
        <h2>바꾸기와 삭제, 범위는 따로.</h2>
        <div className={s.decision}>
          {examples.map(([keys, name], i) => (
            <button key={keys} aria-pressed={selected === i} onClick={() => setSelected(i)}>
              <kbd>{keys}</kbd> · {name}
            </button>
          ))}
        </div>
        <div className={s.preview}>
          <div>
            <code>{item[2]}</code>
          </div>
        </div>
        <p role="status">{item[3]}</p>
        <p>
          실습에서는 검색·동작·범위를 나누어 설명합니다. 익숙해지면 중간 안내를 기다리지 않고 이어
          입력해도 됩니다.
        </p>
      </section>
    </main>
  );
}
export function GrammarWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={grammarWorkshop}
      segments={grammarLessons}
      Intro={GrammarIntro}
      continueId="grammar-workshop-continue"
      nextCourse={{ id: 'workshop', label: '이어서 한 번 바꾸고 다시 쓰기' }}
    />
  );
}
