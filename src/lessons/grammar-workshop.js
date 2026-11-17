export const grammarWorkshop = { id: 'grammar-workshop', title: '찾고, 이동하고, 범위를 편집하기' };
const reference = [
  '/는 앞으로 검색하는 입력줄을 엽니다. 검색어를 쓰는 동안 위치가 미리 보이지만 Enter로 확정해야 편집을 시작합니다. Esc는 검색을 취소합니다.',
  'n은 직전 검색을 같은 방향으로 반복하고 N은 반대 방향으로 찾습니다. 설명 줄의 같은 단어까지 바꾸지 않도록 현재 줄을 확인하세요.',
  '일반 모드의 w는 다음 단어의 시작, b는 단어의 시작 쪽으로 뒤로 이동합니다. 이 예시에서 단어 시작에 있을 때 b는 앞 단어 시작으로 갑니다. 0은 줄 맨 앞, $는 줄 끝입니다.',
  'c는 change, d는 delete입니다. 뒤에 범위를 기다리며 Esc로 취소할 수 있습니다. c는 범위를 지운 뒤 입력 모드로, d는 지운 뒤 일반 모드로 남습니다.',
  'iw는 inner word, 단어 안쪽입니다. ciw의 i는 inside이며 일반 모드에서 단독으로 누르는 입력 시작 i와 다릅니다.',
  'dw는 현재 위치부터 다음 단어 앞까지 지웁니다. 이 단원의 영문 예시에서는 첫 단어와 뒤 공백이 함께 지워집니다. 문장부호나 줄 끝에서는 범위를 다시 확인하세요.',
  'i"는 큰따옴표 안쪽입니다. ci"는 따옴표를 남겨두고 안쪽을 새로 입력하며, di"는 안쪽만 비운 채 일반 모드에 남습니다. 작은따옴표는 i\'로 구분합니다.',
  '이동과 검색은 파일 내용을 바꾸지 않습니다. 편집 후 Esc로 나오고 :w와 Enter로 저장합니다. 실수는 일반 모드의 u로 되돌리고 Ctrl+r로 다시 적용할 수 있습니다.',
];
const goal = (label, title, explanation, keys, result, hints = []) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
const save = goal(
  '저장',
  '확인하고 저장합니다.',
  '내용이 맞으면 콜론으로 명령줄을 열고 저장을 실행하세요.',
  [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  '목표 내용과 저장 확인',
  ['Esc는 저장이 아닙니다. :w를 입력한 뒤 Enter로 실행합니다.'],
);
const recovery = {
  ...goal(
    '복구',
    '바뀐 범위를 다시 확인합니다.',
    'Esc로 나온 뒤 u로 마지막 변경을 되돌려보세요. 설명 줄은 그대로 남겨야 합니다.',
    [
      ['Esc', '일반 모드'],
      ['u', '마지막 변경 복구'],
    ],
    '바꿀 줄과 보존할 줄 구분',
    ['현재 내용 점검으로 목표와 다른 줄을 확인할 수 있습니다.'],
  ),
  recovery: true,
};
const at = (s, row, from, to = from) =>
  s.cursor?.[0] === row && s.cursor?.[1] >= from && s.cursor?.[1] <= to;
const search = (word) =>
  goal(
    '검색',
    `${word}의 위치를 찾습니다.`,
    '검색은 위치만 옮깁니다. 검색어를 쓴 뒤 Enter로 확정하세요.',
    [
      ['/', '앞으로 검색'],
      [word, '찾을 글자'],
      ['Enter', '위치 확정'],
    ],
    `${word} 위에 커서 · 내용은 그대로`,
    ['검색을 취소하려면 Enter 대신 Esc를 누릅니다.'],
  );
const firstInitial = 'role: guest\nnote: guest is an example';
const firstTarget = 'role: admin\nnote: guest is an example';
const searchLesson = {
  title: grammarWorkshop.title,
  reference,
  challengeHints: [],
  practice: { guided: { file: 'role.txt', initial: firstInitial, target: firstTarget } },
  guidedGoals: [
    search('guest'),
    goal(
      '동작',
      '바꾸기 동작을 고릅니다.',
      'c는 change입니다. 무엇을 바꿀지 범위를 기다립니다.',
      [['c', '바꾸기']],
      '범위 대기 · 아직 입력 모드 아님',
      ['c를 눌렀다가 Esc로 취소해도 내용은 그대로입니다.'],
    ),
    goal(
      '범위',
      '단어 안쪽을 고릅니다.',
      'i는 inside, w는 word입니다. 단어를 비우고 입력을 시작합니다.',
      [
        ['i', '안쪽'],
        ['w', '단어'],
      ],
      'guest가 비워지고 입력 모드',
      ['ciw의 i는 단독으로 누르는 입력 시작 i와 뜻이 다릅니다.'],
    ),
    goal(
      '새 내용',
      'admin을 입력합니다.',
      '빈 단어 자리에 admin을 쓰고 Esc로 입력을 마칩니다.',
      [
        ['admin', '새 단어'],
        ['Esc', '입력 마치기'],
      ],
      '첫 줄 role: admin · 설명 줄은 그대로',
      ['이미 입력한 글자는 중복해서 쓰지 마세요. 다 썼다면 Esc만 누릅니다.'],
    ),
    save,
    recovery,
  ],
  guidedStage(s) {
    const text = s.lines.join('\n');
    if (text === firstTarget) return s.mode.startsWith('i') ? 3 : 4;
    if (s.mode.startsWith('i')) return 3;
    if (text !== firstInitial) return 5;
    if (s.mode.startsWith('c')) return 0;
    if (at(s, 1, 7, 11)) return s.mode.startsWith('no') ? 2 : 1;
    return 0;
  },
};
const motionInitial = 'remove keep end\nnote: keep this line';
const motionTarget = 'keep end\nnote: keep this line';
const motionLesson = {
  title: grammarWorkshop.title,
  reference,
  challengeHints: [],
  practice: { guided: { file: 'words.txt', initial: motionInitial, target: motionTarget } },
  guidedGoals: [
    goal(
      '앞으로 이동',
      '다음 단어의 시작으로 갑니다.',
      '0으로 줄 맨 앞, w로 다음 단어 시작에 갑니다. 내용은 그대로입니다.',
      [
        ['0', '줄 맨 앞 · 숫자 영'],
        ['w', '다음 단어 시작'],
      ],
      'keep의 k 위에 커서',
      ['0과 w는 차례로 누릅니다. 저장 명령이 아닙니다.'],
    ),
    goal(
      '뒤로 이동',
      '앞 단어로 돌아옵니다.',
      'keep의 시작에서 b를 누르면 remove의 시작으로 돌아갑니다.',
      [['b', '단어 시작 쪽으로 뒤로']],
      'remove의 r 위에 커서',
      ['단어 중간에서 b를 누르면 먼저 그 단어의 시작으로 갑니다.'],
    ),
    goal(
      '동작',
      '지우기 동작을 고릅니다.',
      'd는 delete입니다. 범위를 지운 뒤 일반 모드에 남습니다.',
      [['d', '삭제']],
      '범위 대기 · 내용은 그대로',
      ['Esc로 취소할 수 있습니다.'],
    ),
    goal(
      '이동 범위',
      '다음 단어 앞까지 지웁니다.',
      'w를 붙이면 remove와 뒤 공백을 지웁니다. keep은 남습니다.',
      [['w', '다음 단어 시작까지']],
      'keep end · 일반 모드 유지',
      ['dw는 이동 w를 삭제 범위로 사용합니다. di와 w를 누르는 diw와 구분하세요.'],
    ),
    save,
    recovery,
  ],
  guidedStage(s, previous = 0) {
    const text = s.lines.join('\n');
    if (text === motionTarget) return 4;
    if (text !== motionInitial) return 5;
    if (s.mode !== 'n' && !s.mode.startsWith('no')) return 5;
    if (at(s, 1, 8)) return 1;
    if (at(s, 1, 1)) return s.mode.startsWith('no') ? 3 : [1, 2, 3, 4].includes(previous) ? 2 : 0;
    return 0;
  },
};
const quoteInitial = 'name: "guest user"\ntag: "old label"\nnote: keep both quotes';
const quoteChanged = 'name: "admin user"\ntag: "old label"\nnote: keep both quotes';
const quoteTarget = 'name: "admin user"\ntag: ""\nnote: keep both quotes';
const quoteLesson = {
  title: grammarWorkshop.title,
  reference,
  challengeHints: [],
  practice: { guided: { file: 'profile.txt', initial: quoteInitial, target: quoteTarget } },
  guidedGoals: [
    search('guest'),
    goal(
      '바꿀 범위',
      '따옴표 안쪽을 바꿉니다.',
      'c는 바꾸기, i와 큰따옴표는 안쪽 범위입니다. 따옴표는 남습니다.',
      [
        ['c', '바꾸기'],
        ['i', '안쪽'],
        ['"', '큰따옴표 범위'],
      ],
      'name의 따옴표 안이 비워짐',
      [
        '물리 키는 영문 배열에서 보통 Shift와 작은따옴표 키입니다. 입력할 문자는 큰따옴표 하나입니다.',
      ],
    ),
    goal(
      '새 내용',
      'admin user를 입력합니다.',
      '두 단어와 사이 공백을 쓰고 Esc로 나옵니다. 따옴표는 쓰지 않습니다.',
      [
        ['admin user', '새 내용'],
        ['Esc', '입력 마치기'],
      ],
      'name: "admin user"',
      ['ciw는 단어 하나, ci"는 큰따옴표 안쪽 전체를 바꿉니다.'],
    ),
    search('old'),
    goal(
      '비울 범위',
      'tag의 안쪽만 비웁니다.',
      'd로 안쪽만 지웁니다. 따옴표는 남고, 입력 모드로 들어가지 않습니다.',
      [
        ['d', '삭제'],
        ['i', '안쪽'],
        ['"', '큰따옴표 범위'],
      ],
      'tag: "" · 일반 모드 유지',
      ['따옴표 두 개는 남겨두세요. di" 뒤에는 Esc 없이도 일반 모드입니다.'],
    ),
    save,
    recovery,
  ],
  guidedStage(s) {
    const text = s.lines.join('\n');
    if (text === quoteTarget) return 5;
    if (text === quoteChanged) {
      if (s.mode.startsWith('i')) return 2;
      if (s.mode.startsWith('c')) return 3;
      return at(s, 2, 7, 15) ? 4 : 3;
    }
    if (
      s.mode.startsWith('i') &&
      s.lines[1] === 'tag: "old label"' &&
      s.lines[2] === 'note: keep both quotes'
    )
      return 2;
    if (text !== quoteInitial) return 6;
    if (s.mode.startsWith('c')) return 0;
    return at(s, 1, 8, 17) ? 1 : 0;
  },
};
export const grammarLessons = [
  {
    label: '1 / 4 · 검색과 단어 바꾸기',
    recap: '검색과 편집을 구분했습니다.',
    detail: '검색은 위치를 찾고, ciw는 커서가 있는 단어를 바꿉니다. 설명 속 guest는 남겼습니다.',
    lesson: searchLesson,
    question: 'ciw에서 i는 무엇을 뜻하나요?',
    answers: ['입력 모드로 바로 전환', '안쪽 범위를 선택'],
    correct: 1,
    why: 'c 뒤의 iw는 단어 안쪽입니다. 일반 모드에서 단독으로 누르는 i와 구분합니다.',
  },
  {
    label: '2 / 4 · 이동을 편집 범위로',
    recap: '이동을 삭제 범위로 사용했습니다.',
    detail:
      'w는 이동이지만 d 뒤에 붙이면 삭제 범위가 됩니다. 이 예시에서는 remove와 뒤 공백을 지웠습니다.',
    lesson: motionLesson,
    question: '이 예시에서 dw를 실행한 직후에는?',
    answers: ['일반 모드에 남는다', '새 글자를 넣는 입력 모드가 된다'],
    correct: 0,
    why: 'd는 지우고 일반 모드에 남습니다. c는 지운 뒤 입력 모드로 들어갑니다.',
  },
  {
    label: '3 / 4 · 따옴표 안쪽 바꾸기와 비우기',
    recap: '동작과 범위를 나눠 선택했습니다.',
    detail:
      '같은 i" 범위에 c를 붙여 새 내용을 쓰거나 d를 붙여 비울 수 있습니다. 바깥 따옴표는 유지됩니다.',
    lesson: quoteLesson,
    question: 'di"로 남기는 것은?',
    answers: ['큰따옴표 안의 글자', '바깥 큰따옴표 두 개'],
    correct: 1,
    why: 'i"는 따옴표 안쪽입니다. d는 그 안쪽만 삭제합니다.',
  },
  {
    label: '4 / 4 · 직접 위치와 범위 고르기',
    recap: '필요한 위치와 범위를 골라 편집했습니다.',
    detail: 'role과 label을 고치고 remove를 지웠습니다. 설명 줄은 그대로 보존했습니다.',
    lesson: {
      title: grammarWorkshop.title,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'settings.txt',
          initial: 'role: guest\nnote: guest must stay here\nlabel: "old title"\nremove keep end',
          target: 'role: admin\nnote: guest must stay here\nlabel: "production ready"\nkeep end',
          title: '세 곳만 고치고 설명은 남겨주세요.',
          description:
            'role의 guest는 admin으로, label 안쪽은 production ready로 바꿉니다. 마지막 줄의 remove와 뒤 공백을 지우고 저장하세요. note는 그대로 둡니다.',
          expected: 'role: admin · label: "production ready" · keep end · note 보존',
        },
      },
      challengeHints: [
        'guest를 검색한 뒤 현재 줄이 role인지 확인하세요. n은 설명 줄로도 이동합니다.',
        'role의 guest에서 ciw로 단어를 바꾸고 admin, Esc로 마칩니다.',
        'old를 검색한 뒤 ci"로 안쪽을 바꾸고 production ready, Esc로 마칩니다.',
        'remove를 검색해 단어 맨 앞에서 dw로 지웁니다. 마지막으로 :w와 Enter로 저장합니다.',
      ],
    },
  },
];
