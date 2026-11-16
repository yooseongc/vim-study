import { useState } from 'react';
import { registerWorkshop, registerLessons } from '../lessons/register-workshop.js';
import { SegmentWorkshop } from './SegmentWorkshop.jsx';
import { RegisterShelf } from './RegisterShelf.jsx';
import s from '../styles/Workshop.module.css';
import r from '../styles/RegisterWorkshop.module.css';

function RegisterIntro({ start }) {
  const [deleted, setDeleted] = useState(false);
  return (
    <main className={s.intro}>
      <div className={s.introCopy}>
        <p className={s.eyebrow}>복사해 두었는데, 왜 다른 내용이 나올까요?</p>
        <h1 id="title">
          복사한 내용을
          <br />
          <em>지키며 편집하기.</em>
        </h1>
        <p className={s.lede}>
          Vim은 삭제한 내용도 보관합니다. 복사와 삭제가 섞일 때, 어떤 보관함에서 꺼낼지 고르면
          원하는 내용을 붙일 수 있습니다.
        </p>
        <div className={s.promise}>
          <span>
            01 <b>보관함의 변화를 보고</b>
          </span>
          <span>
            02 <b>꺼낼 곳을 고르고</b>
          </span>
          <span>
            03 <b>필요 없는 것은 버립니다</b>
          </span>
        </div>
        <button id="register-start" className={s.primary} onClick={start}>
          복사와 삭제 연습하기 →
        </button>
        <p className={s.small}>네 개의 짧은 문제 · 실제 Vim · 학습 기록 없이</p>
      </div>
      <section className={s.introLesson} aria-label="보관함 변화 예시">
        <div className={s.previewHeading}>
          <span>ready를 복사한 다음 trash를 지운다면</span>
          <span className={s.fileTag}>예시</span>
        </div>
        <h2>기본 보관함은 계속 바뀝니다.</h2>
        <div className={r.choices}>
          <button aria-pressed={!deleted} onClick={() => setDeleted(false)}>
            yy로 ready를 복사한 뒤
          </button>
          <button aria-pressed={deleted} onClick={() => setDeleted(true)}>
            dd로 trash를 삭제한 뒤
          </button>
        </div>
        <RegisterShelf
          snapshot={{
            register: deleted ? 'trash\n' : 'ready\n',
            registerZero: 'ready\n',
            registerA: '',
          }}
        />
        <p className={r.explanation} role="status">
          {deleted
            ? '그냥 p를 누르면 trash가 나옵니다. 하지만 0에는 ready가 남아 있습니다.'
            : '기본과 0 모두 ready입니다. yy는 파일 내용을 바꾸지 않고 보관함에 복사합니다.'}
        </p>
        <div className={s.preview}>
          <div>
            <code>{deleted ? 'p   → trash' : 'p   → ready'}</code>
          </div>
          <div>
            <code>{'"0p → ready'}</code>
          </div>
        </div>
        <p>
          레지스터는 Vim 안의 보관함입니다. <code>"0p</code>는 큰따옴표로 보관함을 고르고, 숫자 0을
          지정한 뒤, p로 꺼내는 순서입니다.
        </p>
        <p className={s.small}>실습 화면에서도 실제 보관함이 함께 표시됩니다. ↵는 줄바꿈입니다.</p>
      </section>
    </main>
  );
}

export function RegisterWorkshop({ ref, onSelect }) {
  return (
    <SegmentWorkshop
      ref={ref}
      onSelect={onSelect}
      workshop={registerWorkshop}
      segments={registerLessons}
      Intro={RegisterIntro}
      continueId="register-continue"
      nextCourse={{ id: 'macros', label: '이어서 여러 동작을 매크로로 묶기' }}
    />
  );
}
