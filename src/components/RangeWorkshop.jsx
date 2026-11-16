import { useState } from 'react';
import {
  rangeWorkshop,
  rangeLessons,
  sample,
  previewSubstitution,
} from '../lessons/range-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import s from '../styles/Workshop.module.css';
import r from '../styles/RangeWorkshop.module.css';

function RangeIntro({ start }) {
  const [scope, setScope] = useState('');
  const [all, setAll] = useState(false);
  const result = previewSubstitution(scope, all).split('\n');
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>검색과 점 반복, 그다음</p>
        <h1 id="title">
          범위를 고르고,
          <br />
          <em>확인하며 바꾸기.</em>
        </h1>
        <p className={s.lede}>
          같은 변경을 여러 줄에 적용할 때는 치환을 쓸 수 있습니다. 어디까지 바꿀지 정하고, 남길
          항목은 직접 골라봅시다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>한 줄에서 비교하고</b>
          </span>
          <span>
            02 <b>범위를 넓히고</b>
          </span>
          <span>
            03 <b>예외를 남깁니다</b>
          </span>
        </div>
        <button id="range-start" className={s.primary} onClick={start}>
          치환 연습 시작하기 →
        </button>
        <p className={s.small}>네 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="치환 범위 미리보기">
        <div className={s.previewHeading}>
          <span>실행 전에 비교해보기</span>
          <span className={s.fileTag}>현재 줄: 1번</span>
        </div>
        <h2>어디를, 몇 개 바꿀까요?</h2>
        <p>small을 large로 바꾸는 예시입니다. 범위와 g 옵션을 바꿔 결과를 비교하세요.</p>
        <fieldset className={r.options}>
          <legend>어떤 줄을 바꿀까요?</legend>
          {[
            ['', '현재 줄'],
            ['1,2', '1~2번 줄'],
            ['%', '전체 줄'],
          ].map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="scope"
                value={value}
                checked={scope === value}
                onChange={() => setScope(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label className={r.all}>
          <input type="checkbox" checked={all} onChange={(event) => setAll(event.target.checked)} />
          g · 각 줄 안의 모든 일치 항목
        </label>
        <p className={r.command} aria-label="미리보기 명령">
          <code>
            :{scope}s/small/large/{all ? 'g' : ''}
          </code>
        </p>
        <div className={s.preview} aria-label="치환 결과 미리보기" aria-live="polite">
          {result.map((line, index) => (
            <div key={index} className={line !== sample.split('\n')[index] ? s.changedLine : ''}>
              <span>{index + 1}</span>
              <code>{line}</code>
            </div>
          ))}
        </div>
        <p className={r.explanation} role="status">
          {scope === '%'
            ? '전체 줄을 고르면 note도 바뀝니다. 실습에서는 확인 옵션 c로 이 항목을 남깁니다.'
            : all
              ? 'g를 켜도 대상 줄은 늘어나지 않습니다. 선택한 줄 안에서만 모두 바뀝니다.'
              : 'g가 없으면 대상 줄마다 첫 번째 small만 바뀝니다.'}
        </p>
        <p className={s.small}>
          :는 명령줄, s는 치환, /는 내용의 구분자입니다. 실습에서 각 부분의 뜻을 다시 짚습니다.
        </p>
      </section>
    </main>
  );
}

export function RangeWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={rangeWorkshop}
      segments={rangeLessons}
      Intro={RangeIntro}
      continueId="range-continue"
      nextCourse={{ id: 'register-workshop', label: '이어서 복사한 내용 보관하기' }}
    />
  );
}
