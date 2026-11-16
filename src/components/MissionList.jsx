import { missions } from '../missions.js';
import s from '../styles/MissionList.module.css';

export function MissionList({ current, completed, onSelect }) {
  return (
    <aside className={s.missions}>
      <div className={s.label}>
        THE PRACTICE PATH <span>01—06</span>
      </div>
      <nav id="mission-list" className={s.list} aria-label="실전 미션">
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
