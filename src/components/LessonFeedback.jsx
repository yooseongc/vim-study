import s from '../styles/GuidedLesson.module.css';

const visibleText = (value) =>
  value === undefined
    ? '(줄 없음)'
    : value === ''
      ? '(빈 내용)'
      : value.replaceAll(' ', '·').replaceAll('\t', '⇥');

export function LessonFeedback({ feedback, stale }) {
  if (!feedback) return null;
  return (
    <div id="lesson-diagnosis" className={s.diagnosis} role="status">
      <strong>{stale ? '이전 점검 결과 · 수정 후 다시 점검하세요' : '현재 상태 점검'}</strong>
      <p>{feedback.message}</p>
      {Object.hasOwn(feedback, 'expected') && (
        <dl>
          <dt>현재</dt>
          <dd>
            <code>{visibleText(feedback.actual)}</code>
          </dd>
          <dt>목표</dt>
          <dd>
            <code>{visibleText(feedback.expected)}</code>
          </dd>
        </dl>
      )}
      {Object.hasOwn(feedback, 'expected') && <p>·는 공백 한 칸, ⇥는 탭입니다.</p>}
    </div>
  );
}
