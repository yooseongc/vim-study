export const workshop = { id: 'workshop', title: '한 번 바꾸고, 다시 쓰기' };
export const practice = {
  guided: {
    file: 'menu.txt',
    initial: 'tea: small\ncoffee: small\nnote: small means 200ml',
    first: 'tea: large\ncoffee: small\nnote: small means 200ml',
    target: 'tea: large\ncoffee: large\nnote: small means 200ml',
    title: '두 잔의 사이즈를 바꿔볼까요?',
    description: 'tea와 coffee의 small을 large로 바꾸세요. 마지막 설명 줄은 그대로 둡니다.',
  },
  challenge: {
    file: 'orders.txt',
    initial:
      'order: morning\nmilk: whole\nnote: whole is the original recipe\nmilk: whole\nsize: tall\nmilk: whole',
    target:
      'order: morning\nmilk: oat\nnote: whole is the original recipe\nmilk: oat\nsize: tall\nmilk: oat',
    title: '이번에는 바꿀 위치도 골라보세요.',
    description:
      '세 milk 항목의 whole을 oat로 바꾸고 저장하세요. note의 whole과 다른 항목은 남겨야 합니다.',
  },
};

export const concepts = [
  { key: 'c', name: '바꾸기', detail: 'change. 무엇을 바꿀지 다음 키를 기다립니다.' },
  {
    key: 'i',
    name: '안쪽',
    detail: 'inside. c 뒤의 i는 입력 모드가 아니라 범위를 고르는 말입니다.',
  },
  { key: 'w', name: '단어', detail: 'word. 커서가 있는 단어를 비우고 입력 모드로 들어갑니다.' },
];

export const guidedGoals = [
  {
    label: '찾기',
    title: '먼저 small의 위치를 찾습니다.',
    explanation: '검색은 위치를 옮깁니다. 아직 파일 내용은 바꾸지 않습니다.',
    keys: [
      ['/', '검색 열기'],
      ['small', '찾을 단어'],
      ['Enter', '위치 확정'],
    ],
    result: '첫 줄의 small 위에 커서가 놓입니다.',
    hints: [
      '슬래시 /를 누르면 아래에 검색줄이 열립니다.',
      'small을 입력하고 Enter를 누르세요. 첫 줄의 small로 이동합니다.',
    ],
  },
  {
    label: '바꾸기',
    title: 'small을 large로 바꿉니다.',
    explanation: 'c → i → w로 단어 안쪽을 비웁니다. large를 입력하고 Esc로 마칩니다.',
    keys: [
      ['c', '바꾸기'],
      ['i', '안쪽'],
      ['w', '단어'],
      ['large', '새 내용'],
      ['Esc', '입력 끝'],
    ],
    result: 'tea만 large가 됩니다. coffee와 note는 그대로입니다.',
    hints: [
      'c는 동작, i와 w는 범위입니다. c 뒤의 i는 inside입니다.',
      'c, i, w를 차례로 누른 뒤 large를 입력하고 Esc를 누르세요.',
    ],
  },
  {
    label: '이동',
    title: '다음 small로 이동합니다.',
    explanation:
      '한 번 만든 변경을 다른 곳에 적용하겠습니다. 먼저 다음 대상이 coffee인지 확인하세요.',
    keys: [['n', '다음 검색 결과']],
    result: '두 번째 줄의 small로 이동합니다. 내용은 아직 그대로입니다.',
    hints: [
      '일반 모드에서 n은 직전 검색을 같은 방향으로 반복합니다.',
      'Esc로 입력을 마친 다음 소문자 n을 한 번 누르세요.',
    ],
  },
  {
    label: '반복',
    title: '점 하나로 같은 변경을 적용합니다.',
    explanation:
      '점은 마지막 변경을 현재 위치에 다시 실행합니다. 검색이나 이동까지 반복하지는 않습니다.',
    keys: [['.', '마지막 변경 반복']],
    result: 'coffee도 large가 됩니다. 마지막 note 줄은 남깁니다.',
    hints: [
      '반복할 변경은 “단어 안쪽을 large로 바꾸기”입니다.',
      'coffee의 small 위에서 마침표 .을 한 번 누르세요.',
    ],
  },
  {
    label: '저장',
    title: '바꾼 내용을 저장합니다.',
    explanation:
      '화면의 버퍼를 바꾸는 것과 파일에 저장하는 것은 별개입니다. 마지막으로 저장까지 확인합니다.',
    keys: [
      [':', '명령줄'],
      ['w', '저장'],
      ['Enter', '실행'],
    ],
    result: '두 메뉴는 large, note는 small인 상태로 저장됩니다.',
    hints: [
      '일반 모드에서 콜론 :을 눌러 명령줄을 여세요.',
      'w를 입력하고 Enter를 누르세요. 저장하면 다음 문제로 갈 수 있습니다.',
    ],
  },
];

export const challengeHints = [
  'whole을 검색한 뒤, 현재 줄이 milk인지 note인지 먼저 확인하세요.',
  '첫 milk에서 단어 안쪽을 oat로 바꾸고 Esc로 나옵니다. 이후에는 검색과 점을 조합할 수 있습니다.',
  'n으로 note를 만나면 점을 누르지 않고 n을 한 번 더 눌러 다음 milk로 갑니다.',
  '남은 milk에 점을 적용합니다. 세 항목을 다 바꿨다면 콜론, w, Enter로 저장하세요.',
];

export function guidedStage(snapshot) {
  if (!snapshot) return 0;
  const text = snapshot.lines.join('\n');
  if (text === practice.guided.target) return 4;
  if (text === practice.guided.first) {
    if (snapshot.mode.startsWith('i')) return 1;
    return snapshot.cursor?.[0] === 2 && snapshot.cursor?.[1] === 9 ? 3 : 2;
  }
  if (text === practice.guided.initial) {
    return snapshot.mode.startsWith('no') ||
      (snapshot.mode === 'n' && snapshot.cursor?.[0] === 1 && snapshot.cursor?.[1] === 6)
      ? 1
      : 0;
  }
  if (text === practice.guided.initial.replace('small', '') && snapshot.mode.startsWith('i'))
    return 1;
  return null;
}

export function checkPractice(kind, snapshot, saved) {
  if (!snapshot) return { kind: 'waiting', message: 'Vim을 준비하고 있습니다.' };
  const course = practice[kind];
  if (snapshot.path !== `/work/${course.file}`)
    return {
      kind: 'path',
      message: `${course.file}에서 연습하고 있습니다. 콜론을 열고 e /work/${course.file}를 입력한 뒤 Enter로 돌아오세요.`,
    };
  const target = course.target.split('\n');
  const row = Array.from(
    { length: Math.max(target.length, snapshot.lines.length) },
    (_, i) => i,
  ).find((i) => target[i] !== snapshot.lines[i]);
  if (row !== undefined)
    return {
      kind: 'text',
      row: row + 1,
      actual: snapshot.lines[row] ?? '(줄 없음)',
      expected: target[row] ?? '(이 줄은 없어야 합니다)',
      message: target[row]?.startsWith('note:')
        ? `${row + 1}번째 설명 줄은 바꾸지 않는 부분입니다. Esc로 나온 뒤 u로 마지막 변경을 되돌려보세요.`
        : `${row + 1}번째 줄을 목표와 비교해보세요. 지금까지 맞게 바꾼 줄은 그대로 두면 됩니다.`,
    };
  if (snapshot.mode !== 'n')
    return {
      kind: 'mode',
      message:
        '내용은 맞습니다. Esc로 일반 모드로 돌아오세요. 명령줄의 저장을 실행 중이라면 Enter로 마치세요.',
    };
  if (snapshot.modified || snapshot.dirtyCount || saved !== course.target)
    return {
      kind: 'save',
      message: '내용은 맞습니다. 콜론 → w → Enter로 저장하면 이 문제가 끝납니다.',
    };
  return { kind: 'success', message: '바꿀 내용과 남길 내용, 저장까지 확인했습니다.' };
}

export function modeText(mode = '') {
  if (mode === 'n') return '일반 모드';
  if (mode.startsWith('no')) return '범위를 기다리는 중';
  if (mode.startsWith('i')) return '입력 모드';
  if (mode.startsWith('c')) return '명령줄 입력 중';
  if (mode === 'r?') return '치환 확인 중';
  return mode ? '다른 모드 · Esc로 돌아오기' : 'Vim 준비 중';
}
