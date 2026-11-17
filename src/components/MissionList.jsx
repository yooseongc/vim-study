import { missions } from '../missions.js';
import s from '../styles/MissionList.module.css';
import { advancedCourses } from '../lessons/catalog.js';

export function MissionList({ current, completed, onSelect, basicsCompleted, grammarCompleted }) {
  return (
    <aside className={s.missions}>
      <div className={s.label}>학습과 자유 연습</div>
      <nav id="mission-list" className={s.list} aria-label="학습 단원과 자유 연습">
        <button className={s.mission} onClick={() => onSelect('workshop')}>
          <span className={s.number}>새로</span>
          <span>
            <strong>한 번 바꾸고, 다시 쓰기</strong>
            <small>이어 입력하는 새 연습</small>
          </span>
        </button>
        <button className={s.mission} onClick={() => onSelect('range-workshop')}>
          <span className={s.number}>새로</span>
          <span>
            <strong>범위를 고르고, 확인하며 바꾸기</strong>
            <small>줄 범위와 치환을 이어 연습</small>
          </span>
        </button>
        <button className={s.mission} onClick={() => onSelect('register-workshop')}>
          <span className={s.number}>새로</span>
          <span>
            <strong>복사한 내용을 지키며 편집하기</strong>
            <small>복사 · 삭제 · 보관함 선택</small>
          </span>
        </button>
        <button className={s.mission} onClick={() => onSelect('macro-workshop')}>
          <span className={s.number}>새로</span>
          <span>
            <strong>여러 동작을 묶고, 확인하며 반복하기</strong>
            <small>녹화 · 한 번 확인 · 예외 건너뛰기</small>
          </span>
        </button>
        <button
          className={`${s.mission} ${current.id === 'basics' ? s.active : ''}`}
          aria-current={current.id === 'basics' ? 'step' : 'false'}
          onClick={() => onSelect('basics')}
        >
          <span className={s.number}>{basicsCompleted ? '✓' : '입문'}</span>
          <span>
            <strong>기억을 정리하는 첫 편집</strong>
            <small>한 단계씩 · 모드와 저장</small>
          </span>
        </button>
        <button
          className={s.mission + (current.id === 'grammar' ? ' ' + s.active : '')}
          aria-current={current.id === 'grammar' ? 'step' : 'false'}
          onClick={() => onSelect('grammar')}
        >
          <span className={s.number}>{grammarCompleted ? '✓' : '조합'}</span>
          <span>
            <strong>편집 명령을 문장처럼 조합하기</strong>
            <small>한 단계씩 · 동작과 범위</small>
          </span>
        </button>
        <button
          className={`${s.mission} ${current.id === 'dot' ? s.active : ''}`}
          aria-current={current.id === 'dot' ? 'step' : 'false'}
          onClick={() => onSelect('dot')}
        >
          <span className={s.number}>반복</span>
          <span>
            <strong>한 번 바꾸고, 점으로 반복하기</strong>
            <small>한 단계씩 · n과 점 명령</small>
          </span>
        </button>
        <button
          className={`${s.mission} ${current.id === 'substitution' ? s.active : ''}`}
          aria-current={current.id === 'substitution' ? 'step' : 'false'}
          onClick={() => onSelect('substitution')}
        >
          <span className={s.number}>치환</span>
          <span>
            <strong>범위를 정하고 확인하며 치환하기</strong>
            <small>현재 줄 · 범위 · 확인</small>
          </span>
        </button>
        {advancedCourses.map((course) => (
          <button
            key={course.id}
            className={`${s.mission} ${current.id === course.id ? s.active : ''}`}
            aria-current={current.id === course.id ? 'step' : 'false'}
            onClick={() => onSelect(course.id)}
          >
            <span className={s.number}>{course.badge}</span>
            <span>
              <strong>{course.title}</strong>
              <small>{course.skill}</small>
            </span>
          </button>
        ))}
        <button
          className={`${s.mission} ${current.id === 'local' ? s.active : ''}`}
          aria-current={current.id === 'local' ? 'step' : 'false'}
          onClick={() => onSelect('local')}
        >
          <span className={s.number}>로컬</span>
          <span>
            <strong>내 터미널에서 마무리하기</strong>
            <small>실습 파일 · 셸 · SSH</small>
          </span>
        </button>
        <button
          className={`${s.mission} ${current.id === 'workspace' ? s.active : ''}`}
          aria-current={current.id === 'workspace' ? 'step' : 'false'}
          onClick={() => onSelect('workspace')}
        >
          <span className={s.number}>파일</span>
          <span>
            <strong>나의 Vim 작업 공간</strong>
            <small>파일 저장 · 버퍼와 창</small>
          </span>
        </button>
        <button
          className={`${s.mission} ${current.id === 'review' ? s.active : ''}`}
          aria-current={current.id === 'review' ? 'step' : 'false'}
          onClick={() => onSelect('review')}
        >
          <span className={s.number}>복습</span>
          <span>
            <strong>다시 꺼내 쓰는 연습</strong>
            <small>상태 점검 · 변형 문제</small>
          </span>
        </button>
        {missions.map((mission, index) => (
          <button
            key={mission.id}
            className={`${s.mission} ${mission.id === current.id ? s.active : ''}`}
            aria-current={mission.id === current.id ? 'step' : 'false'}
            onClick={() => onSelect(mission.id)}
          >
            <span className={s.number}>
              {completed.includes(mission.id) ? '✓' : String(index + 1).padStart(2, '0')}
            </span>
            <span>
              <strong>{mission.title}</strong>
              <small>{mission.skill}</small>
            </span>
          </button>
        ))}
      </nav>
      <div className={s.note}>
        <span>↳</span>
        <p>
          정답은 하나가 아닙니다.
          <br />
          결과가 같다면, 당신의 방법도 정답.
        </p>
      </div>
    </aside>
  );
}
