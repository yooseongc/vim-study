import { workspaceGuides } from '../lessons/workspace.js';
import s from '../styles/WorkspaceSession.module.css';
export function WorkspaceGuide({ guideIndex, setGuideIndex, stepIndex, setStepIndex }) {
  const guide = workspaceGuides[guideIndex];
  const step = guide.steps[stepIndex];
  return (
    <div className={s.guide} aria-label="파일과 창 연습 안내">
      <h3>한 동작씩 따라 해보기</h3>
      <div className={s.tools}>
        {workspaceGuides.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={guideIndex === index}
            onClick={() => {
              setGuideIndex(index);
              setStepIndex(0);
            }}
          >
            {item.title}
          </button>
        ))}
      </div>
      <p>
        {guide.title} · {stepIndex + 1} / {guide.steps.length}
      </p>
      <kbd>{step[0]}</kbd>
      <p>{step[1]}</p>
      <div className={s.tools}>
        <button disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>
          이전 설명
        </button>
        <button
          disabled={stepIndex === guide.steps.length - 1}
          onClick={() => setStepIndex((value) => value + 1)}
        >
          다음 설명
        </button>
      </div>
      <p className={s.note}>
        이 안내는 키를 대신 입력하거나 완료를 채점하지 않습니다. 위의 실제 버퍼 이름과 창 수를 보며
        직접 확인하세요.
      </p>
    </div>
  );
}
