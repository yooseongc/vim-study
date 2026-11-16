// Shared shape only: every lesson still declares its own expected Vim state.
export function action(key, title, explanation, text, extra = {}) {
  const pressed = key === 'Esc' ? 'Escape' : key;
  return {
    key,
    title,
    explanation,
    text,
    mode: 'n',
    action:
      key === 'Esc'
        ? 'Esc를 한 번 누르세요.'
        : key.startsWith('Ctrl+')
          ? `${key.replace('+', '을 누른 채 ')} 키를 한 번 누르세요.`
          : `${key}를 입력하세요.`,
    expected: '내용과 커서, 현재 모드를 확인하세요.',
    recovery:
      '입력 도중이면 Esc로 취소하세요. 일반 모드에서 u는 마지막 변경을 되돌립니다. 시작 위치나 상태를 잃었다면 처음부터 다시 연습할 수 있습니다.',
    pressed,
    ...extra,
  };
}
export function ex(parts, text, after, extra = {}) {
  let command = '';
  return [
    action(':', '명령줄을 엽니다', '콜론으로 명령을 입력할 준비를 합니다.', text, {
      mode: 'c',
      commandType: ':',
      command: '',
    }),
    ...parts.map(([key, title, explanation]) => {
      command += key;
      return action(key, title, explanation, text, {
        mode: 'c',
        commandType: ':',
        command,
        pressed: undefined,
      });
    }),
    action('Enter', '명령을 실행합니다', 'Enter로 실행한 뒤 결과를 확인하세요.', after, extra),
  ];
}
export const save = (text, extra = {}) =>
  ex([['w', '편집한 내용을 저장합니다', 'w는 현재 버퍼를 파일에 쓰는 명령입니다.']], text, text, {
    saved: true,
    ...extra,
  });
export const question = (prompt, right, wrong, why) => ({
  question: prompt,
  answers: [right, ...wrong],
  correct: 0,
  why,
});
export function search(word, text, cursor) {
  return [
    action(
      '/',
      '검색줄을 엽니다',
      '먼저 이동할 위치를 찾습니다. 파일 내용은 바뀌지 않습니다.',
      text,
      { mode: 'c', commandType: '/', command: '' },
    ),
    action(word, '찾을 내용을 입력합니다', '검색어만 입력하고 다음 단계에서 확정하세요.', text, {
      mode: 'c',
      commandType: '/',
      command: word,
      pressed: undefined,
    }),
    action('Enter', '검색 위치를 확정합니다', '강조된 위치가 편집할 대상인지 확인하세요.', text, {
      cursor,
    }),
  ];
}
export function changeWord(before, empty, value, after) {
  return [
    action('c', '바꾸기를 시작합니다', 'change: 다음에 범위를 지정합니다.', before, { mode: 'no' }),
    action('i', '안쪽 범위를 고릅니다', 'inside: 여기의 i는 입력 모드 명령이 아닙니다.', before, {
      mode: 'no',
    }),
    action('w', '단어 안쪽을 비웁니다', 'word: 단어를 지운 뒤 입력 모드로 들어갑니다.', empty, {
      mode: 'i',
    }),
    action(value, '새 내용을 입력합니다', '주변 문장은 그대로 두고 새 단어를 입력하세요.', after, {
      mode: 'i',
      pressed: undefined,
    }),
    action('Esc', '입력을 마칩니다', '일반 모드로 돌아와 결과를 확인하세요.', after),
  ];
}
