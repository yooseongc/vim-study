import { useImperativeHandle, useRef, useState } from 'react';
import { localSections, labExpected, validateLab } from '../lessons/local-lab.js';
import { labGoals, localOutcomes, commandParts } from '../lessons/local-guide.js';
import { CourseMenu, WorkshopHeader } from './WorkshopNavigation.jsx';
import w from '../styles/Workshop.module.css';
import s from '../styles/LocalPractice.module.css';
export const localCourse = { id: 'local', title: '내 터미널에서 마무리하기' };
function Command({ step }) {
  const [copied, setCopied] = useState('');
  if (!step.command) return null;
  const parts = commandParts[step.command];
  const canCopy = step.where?.includes('셸') || step.where === 'Vim 명령줄';
  async function copy() {
    try {
      await navigator.clipboard.writeText(step.command);
      setCopied('복사했습니다. 표시된 위치에 붙여 넣고 확인한 뒤 실행하세요.');
    } catch {
      setCopied('복사하지 못했습니다. 위 명령을 직접 선택해 복사하세요.');
    }
  }
  return (
    <div className={s.command}>
      <span className={s.where}>{step.where}</span>
      <pre>
        <code>{step.command}</code>
      </pre>
      {parts && (
        <dl className={s.parts}>
          {parts.map(([key, meaning]) => (
            <div key={key}>
              <dt>
                <code>{key}</code>
              </dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      )}
      {canCopy && <button onClick={copy}>명령 복사</button>}
      {copied && <p role="status">{copied}</p>}
    </div>
  );
}
export function LocalPractice({ ref, onSelect }) {
  useImperativeHandle(ref, () => ({ canLeave: () => true }), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');
  const [environment, setEnvironment] = useState('wsl');
  const selection = useRef(0),
    fileInput = useRef(null),
    verifyHeading = useRef(null),
    stepHeading = useRef(null);
  const section = localSections[sectionIndex],
    step = section.steps[stepIndex];
  const optional = ['permissions', 'ssh'].includes(section.id);
  function choose(index) {
    setSectionIndex(index);
    setStepIndex(0);
    setShowGuide(index === 0);
  }
  function move(index) {
    setStepIndex(index);
    stepHeading.current?.focus();
  }
  function clear() {
    selection.current++;
    fileInput.current.value = '';
    setResults(null);
    setMessage('선택한 파일과 검사 결과를 지웠습니다.');
  }
  async function inspect(event) {
    const current = ++selection.current;
    const selected = [...event.target.files];
    setResults(null);
    setMessage('');
    if (!selected.length) return;
    if (selected.some((file) => file.size > 64 * 1024) || selected.length > 6) {
      setMessage('실습 파일 여섯 개만 선택하세요. 각 파일은 64KB 이하여야 합니다.');
      return;
    }
    if (new Set(selected.map((file) => file.name)).size !== selected.length) {
      setMessage('같은 이름의 파일이 두 개 있습니다. 편집한 실습 폴더에서 선택하세요.');
      return;
    }
    if (selected.some((file) => !Object.hasOwn(labExpected, file.name))) {
      setMessage(
        '과제의 여섯 파일 이름만 선택하세요. verify.sh나 README.txt는 검사 대상이 아닙니다.',
      );
      return;
    }
    setMessage('파일을 읽고 있습니다…');
    try {
      const files = Object.fromEntries(
        await Promise.all(selected.map(async (file) => [file.name, await file.text()])),
      );
      if (current !== selection.current) return;
      setResults(validateLab(files));
      setMessage(
        `${selected.length}개 파일을 이 브라우저 안에서만 비교했습니다. 서버로 전송하거나 기록하지 않습니다.`,
      );
    } catch {
      if (current === selection.current) setMessage('파일을 읽지 못했습니다. 다시 선택하세요.');
    }
  }
  return (
    <div className={w.page}>
      <WorkshopHeader openMenu={() => setMenuOpen(true)} />
      <main className={s.local}>
        <header className={s.hero}>
          <div>
            <p className={s.eyebrow}>배운 편집을 실제 파일로</p>
            <h1 id="title">{localCourse.title}</h1>
            <p>
              작은 프로젝트를 직접 고치고, 저장된 결과를 확인합니다. 막히면 안내를 열고 필요한
              동작만 참고하세요.
            </p>
          </div>
          <div className={s.actions}>
            <a
              className={s.download}
              href={`${import.meta.env.BASE_URL}vim-study-lab.zip`}
              download
            >
              실습 묶음 받기 (.zip)
            </a>
            <button
              onClick={() => {
                verifyHeading.current.scrollIntoView({ block: 'start' });
                verifyHeading.current.focus();
              }}
            >
              편집한 파일 검사하기 ↓
            </button>
            <span>실행은 내 터미널에서 · 학습 기록 없음</span>
          </div>
        </header>
        <section className={s.setup} aria-label="실습 환경">
          <h2>어디서 실행하나요?</h2>
          <div className={s.environment}>
            {[
              ['wsl', 'Windows · WSL'],
              ['unix', 'Linux · macOS'],
              ['native', 'Windows 네이티브 Vim'],
            ].map(([id, label]) => (
              <button key={id} aria-pressed={environment === id} onClick={() => setEnvironment(id)}>
                {label}
              </button>
            ))}
          </div>
          <p role="status">
            {environment === 'wsl'
              ? 'WSL의 Bash 터미널에서 실행하세요. Windows 파일은 /mnt/c/… 경로에서 찾을 수 있습니다. PowerShell에는 아래 Bash 명령을 그대로 붙이지 마세요.'
              : environment === 'unix'
                ? 'Vim과 Bash, sort, diff가 있는 로컬 터미널에서 진행합니다. 실습 ZIP을 새 폴더에 풀고 시작하세요.'
                : '편집 과제와 아래 파일 비교는 할 수 있습니다. 외부 sort·Bash 검사·Ctrl+z/fg 실습은 WSL에서 진행하세요. names.txt의 파일 목표만 맞추려면 Vim의 :sort u를 사용할 수 있지만, 외부 필터 실습을 대신한 것은 아닙니다.'}
          </p>
        </section>
        <section className={s.goals} aria-labelledby="lab-goals">
          <h2 id="lab-goals">이번에 만들 결과</h2>
          <p>ZIP의 최상위 파일을 편집합니다. expected 폴더는 비교용 정답이므로 수정하지 마세요.</p>
          <div className={s.goalGrid}>
            {labGoals.map(([name, target, note]) => (
              <article key={name}>
                <h3>{name}</h3>
                <p>{target}</p>
                <small>{note}</small>
              </article>
            ))}
          </div>
        </section>
        <div className={s.lessonLayout}>
          <nav className={s.tabs} aria-label="로컬 실습 과정">
            <p>필요한 과정부터 열기</p>
            {localSections.map((item, index) => (
              <button
                key={item.id}
                aria-current={index === sectionIndex ? 'step' : undefined}
                onClick={() => choose(index)}
              >
                {item.title}
                {index >= 4 && <small>선택 확장</small>}
              </button>
            ))}
          </nav>
          <article className={s.section}>
            <p className={s.eyebrow}>
              {optional ? '선택 확장 · 파일 검사와 별개' : '기본 실습'} · {sectionIndex + 1} /{' '}
              {localSections.length}
            </p>
            <h2>{section.title}</h2>
            <p>{section.intro}</p>
            <div className={s.outcome}>
              <h3>직접 확인할 결과</h3>
              <ul>
                {localOutcomes[section.id].map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
            <button
              className={s.guideToggle}
              aria-expanded={showGuide}
              aria-controls="local-step"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? '안내 접기' : '막히면 단계별 안내 보기'}
            </button>
            {showGuide && (
              <section id="local-step" className={s.step}>
                <p className={s.eyebrow}>
                  설명 {stepIndex + 1} / {section.steps.length} · 실행 완료를 자동 판정하지 않습니다
                </p>
                <h3 ref={stepHeading} tabIndex={-1}>
                  {step.title}
                </h3>
                <Command key={`${section.id}:${stepIndex}`} step={step} />
                <p>{step.text}</p>
                <div className={s.controls}>
                  <button disabled={stepIndex === 0} onClick={() => move(stepIndex - 1)}>
                    이전 설명
                  </button>
                  <button
                    disabled={stepIndex === section.steps.length - 1}
                    onClick={() => move(stepIndex + 1)}
                  >
                    다음 설명
                  </button>
                </div>
              </section>
            )}
            <div className={s.controls}>
              <button disabled={sectionIndex === 0} onClick={() => choose(sectionIndex - 1)}>
                이전 과정
              </button>
              <button
                disabled={sectionIndex === localSections.length - 1}
                onClick={() => choose(sectionIndex + 1)}
              >
                다음 과정
              </button>
            </div>
          </article>
        </div>
        <section className={s.verify}>
          <h2 ref={verifyHeading} tabIndex={-1}>
            편집 결과 확인
          </h2>
          <p>
            저장한 api.conf, web.conf, notes.txt, tasks.txt, events.log, names.txt를 선택하세요.
            일부만 선택하면 나머지는 미선택으로 표시합니다. expected 폴더가 아닌 직접 편집한
            파일입니다.
          </p>
          <p>
            파일 내용만 비교합니다. 사용한 명령, 셸 왕복, 권한·SSH 실습의 수행 여부는 판정하지
            않습니다.
          </p>
          <label className={s.fileLabel}>
            실습 파일 여섯 개 선택
            <input
              ref={fileInput}
              type="file"
              multiple
              onChange={inspect}
              aria-label="실습 파일 여섯 개 선택"
            />
          </label>
          <button onClick={clear}>선택과 검사 결과 지우기</button>
          <p id="local-message" role="status">
            {message}
          </p>
          {results && (
            <>
              <p className={s.summary}>파일 일치 {results.filter((r) => r.passed).length} / 6</p>
              <ul id="local-results" className={s.results}>
                {results.map((result) => (
                  <li key={result.name}>
                    <strong>
                      {result.passed ? '✓' : '○'} {result.name}
                    </strong>
                    <p>{result.message}</p>
                    {result.row && (
                      <details>
                        <summary>{result.row}번째 줄 비교</summary>
                        <dl>
                          <dt>선택한 파일</dt>
                          <dd>
                            <code>{result.actual}</code>
                          </dd>
                          <dt>목표</dt>
                          <dd>
                            <code>{result.expected}</code>
                          </dd>
                        </dl>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {results?.every((r) => r.passed) && (
            <div id="local-success" className={s.success}>
              <h3>여섯 파일이 목표와 일치합니다.</h3>
              <p>
                이 결과는 저장된 내용의 확인입니다. 다음에는 안내 없이 다시 풀거나, 자신의 파일에서
                작업 범위를 직접 골라보세요. 선택 확장은 필요할 때 이어가면 됩니다.
              </p>
            </div>
          )}
        </section>
        <section className={s.finish}>
          <h2>이제 내 작업에 적용해보세요.</h2>
          <p>
            작업 공간에서는 별도 개인 파일을 엽니다. 선택한 로컬 실습 파일은 자동으로 가져오거나
            보관하지 않습니다.
          </p>
          <div className={s.controls}>
            <button onClick={() => onSelect('workspace')}>내 파일에서 자유롭게 연습하기</button>
            <button onClick={() => onSelect('buffer-workshop')}>버퍼와 창 다시 연습하기</button>
          </div>
        </section>
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
      </main>
      <CourseMenu
        title={localCourse.title}
        open={menuOpen}
        close={() => setMenuOpen(false)}
        select={onSelect}
      />
    </div>
  );
}
