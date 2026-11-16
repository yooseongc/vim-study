import { useImperativeHandle, useRef, useState } from 'react';
import { localSections, validateLab } from '../lessons/local-lab.js';
import s from '../styles/LocalPractice.module.css';

export const localCourse = { id: 'local', title: '내 터미널에서 마무리하기' };
export function LocalPractice({ ref, onPractice }) {
  useImperativeHandle(ref, () => ({ canLeave: () => true }), []);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');
  const selection = useRef(0);
  const section = localSections[sectionIndex];
  async function inspect(event) {
    const currentSelection = ++selection.current;
    const selected = [...event.target.files];
    setResults(null);
    if (selected.some((file) => file.size > 64 * 1024) || selected.length > 6) {
      setMessage('실습 파일 여섯 개만 선택하세요. 각 파일은 64KB 이하여야 합니다.');
      return;
    }
    if (new Set(selected.map((file) => file.name)).size !== selected.length) {
      setMessage('같은 이름의 파일이 두 개 있습니다. 편집한 실습 폴더에서 선택하세요.');
      return;
    }
    try {
      const contents = Object.fromEntries(
        await Promise.all(selected.map(async (file) => [file.name, await file.text()])),
      );
      if (currentSelection !== selection.current) return;
      setResults(validateLab(contents));
      setMessage(
        '선택한 파일을 이 브라우저 안에서만 비교했습니다. 서버로 전송하거나 기록하지 않습니다.',
      );
    } catch {
      if (currentSelection !== selection.current) return;
      setMessage('파일을 읽지 못했습니다. 실습 파일을 다시 선택하세요.');
    }
  }
  return (
    <section className={s.local}>
      <p className={s.eyebrow}>마지막 과정 · 브라우저에서 내 터미널로</p>
      <h2 id="title">{localCourse.title}</h2>
      <p>
        배운 편집을 실제 파일에 조합하고, 셸과 원격 환경까지 연결합니다. 명령을 실행할 위치와 예상
        결과를 구분해 안내합니다.
      </p>
      <a className={s.download} href={`${import.meta.env.BASE_URL}vim-study-lab.zip`} download>
        실습 묶음 받기 (.zip)
      </a>
      <nav className={s.tabs} aria-label="로컬 실습 과정">
        {localSections.map((item, index) => (
          <button
            key={item.id}
            aria-current={index === sectionIndex ? 'step' : 'false'}
            onClick={() => setSectionIndex(index)}
          >
            {item.title}
          </button>
        ))}
      </nav>
      <article className={s.section} key={section.id}>
        <h3>{section.title}</h3>
        <p>{section.intro}</p>
        <ol className={s.steps}>
          {section.steps.map((step) => (
            <li key={step.title}>
              <h4>{step.title}</h4>
              {step.command && (
                <>
                  <span className={s.where}>{step.where}</span>
                  <pre>
                    <code>{step.command}</code>
                  </pre>
                </>
              )}
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className={s.controls}>
          <button
            disabled={sectionIndex === 0}
            onClick={() => setSectionIndex((index) => index - 1)}
          >
            이전 과정
          </button>
          <button
            disabled={sectionIndex === localSections.length - 1}
            onClick={() => setSectionIndex((index) => index + 1)}
          >
            다음 과정
          </button>
        </div>
      </article>
      <section className={s.verify}>
        <h3>편집 결과 확인</h3>
        <p>
          저장한 api.conf, web.conf, notes.txt, tasks.txt, events.log, names.txt를 함께 선택하세요.
          expected 폴더가 아닌 직접 편집한 파일입니다. 이 검사는 파일 내용만 확인하며 셸·권한·SSH
          실습의 수행 여부는 판정하지 않습니다.
        </p>
        <label className={s.fileLabel}>
          실습 파일 여섯 개 선택
          <input type="file" multiple onChange={inspect} aria-label="실습 파일 여섯 개 선택" />
        </label>
        <p role="status">{message}</p>
        {results && (
          <ul id="local-results">
            {results.map((result) => (
              <li key={result.name}>
                <strong>
                  {result.passed ? '✓' : '○'} {result.name}
                </strong>{' '}
                — {result.message}
              </li>
            ))}
          </ul>
        )}
        {results?.every((result) => result.passed) && (
          <p id="local-success" className={s.success}>
            여섯 파일이 모두 목표와 일치합니다. 다음에는 도움말 없이 같은 과제를 풀어보고, 자신의
            프로젝트에서 적용할 작업을 골라 보세요.
          </p>
        )}
      </section>
      <p>
        과정은 여기까지입니다. 익숙하지 않은 단원으로 돌아가거나 작업 공간에서 자유롭게 조합해
        보세요. 숙련 여부는 다른 파일과 환경에서도 스스로 판단하고 해결할 수 있는지로 확인합니다.
      </p>
      <button onClick={onPractice}>내 파일에서 자유롭게 연습하기</button>
      <p className={s.sources}>
        참고:{' '}
        <a href="https://vimhelp.org/usr_21.txt.html" target="_blank" rel="noreferrer">
          Vim과 셸
        </a>{' '}
        ·{' '}
        <a href="https://vimhelp.org/usr_10.txt.html" target="_blank" rel="noreferrer">
          필터와 반복 편집
        </a>{' '}
        ·{' '}
        <a href="https://man.openbsd.org/ssh.1" target="_blank" rel="noreferrer">
          OpenSSH
        </a>
      </p>
    </section>
  );
}
