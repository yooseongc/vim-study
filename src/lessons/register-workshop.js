export const registerWorkshop = { id: 'register-workshop', title: '복사한 내용을 지키며 편집하기' };
const initial = 'ready\ntrash\nslot';
const removed = 'ready\nslot';
const mistaken = 'ready\nslot\ntrash';
const target = 'ready\nslot\nready';
const reference = [
  '레지스터는 Vim 안의 보관함입니다. 운영체제 클립보드와는 별개입니다. 화면의 ↵는 줄바꿈을 뜻합니다.',
  'yy는 현재 줄 복사, dd는 현재 줄 삭제입니다. 둘 다 기본 레지스터를 바꿉니다. 줄 단위로 보관했으므로 p는 현재 줄 아래에 붙입니다.',
  '"0p는 큰따옴표, 숫자 0, p 순서입니다. 0에는 레지스터를 따로 지정하지 않고 마지막으로 복사한 내용이 남습니다. 삭제는 0을 바꾸지 않습니다.',
  '"ayy는 큰따옴표, a, y, y입니다. a에 줄을 보관하고 "ap로 꺼냅니다. 소문자 a는 덮어쓰기, 대문자 A는 a에 덧붙이기입니다.',
  '"_dd는 밑줄 레지스터로 줄을 버립니다. 기본 보관함과 0, a를 바꾸지 않습니다. 일반 모드의 u로 파일 변경을 되돌릴 수 있지만, 레지스터까지 이전 상태로 돌아가는 것은 아닙니다.',
];
const save = {
  label: '저장',
  title: 'ready를 붙였으면 저장합니다.',
  explanation: 'trash는 없어지고 slot 아래에 ready가 있어야 합니다.',
  keys: [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  result: 'ready · slot · ready 순서로 저장',
  hints: ['p는 줄 단위 내용을 현재 줄 아래에 붙입니다.', ':w를 입력하고 Enter로 저장하세요.'],
};
const goal = (label, title, explanation, keys, result, hints) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
function lesson(file, goals, guidedStage) {
  return {
    title: registerWorkshop.title,
    showRegisters: true,
    reference,
    practice: { guided: { file, initial, target } },
    guidedGoals: goals,
    guidedStage,
    challengeHints: [],
  };
}
const copy = goal(
  '복사',
  'ready 줄을 복사합니다.',
  'y는 yank, 복사입니다. y를 두 번 누르면 현재 줄 전체를 복사합니다.',
  [
    ['y', '복사'],
    ['y', '현재 줄'],
  ],
  '기본과 0에 ready ↵',
  ['현재 첫 줄에 커서가 있습니다.', 'yy를 이어 누르세요. 내용은 그대로이고 보관함이 바뀝니다.'],
);
const remove = goal(
  '삭제',
  '아래의 trash를 지웁니다.',
  'j로 한 줄 내려간 뒤 dd로 줄을 지웁니다. 기본 보관함의 변화를 보세요.',
  [
    ['j', '한 줄 아래'],
    ['d', '삭제'],
    ['d', '현재 줄'],
  ],
  '파일에는 ready와 slot · 기본에는 trash',
  ['삭제도 기본 보관함에 내용을 넣습니다.', 'j, d, d를 차례로 누르고 보관함을 비교하세요.'],
);

export const registerLessons = [
  {
    label: '1 / 4 · 복사와 삭제 비교하기',
    recap: '삭제 뒤에도 복사한 내용은 0에 남습니다.',
    detail:
      '기본 보관함은 trash로 바뀌었지만 0에는 ready가 남아 있습니다. "0p로 복사한 줄을 다시 꺼낼 수 있습니다.',
    lesson: lesson(
      'zero.txt',
      [
        copy,
        remove,
        goal(
          '비교',
          '그냥 p를 눌러 비교합니다.',
          '지금 커서는 slot 줄입니다. p가 어느 보관함을 쓰는지 직접 확인하세요.',
          [['p', '기본 내용 붙이기']],
          'slot 아래에 trash가 다시 나타납니다.',
          [
            '이 단계에서는 일부러 기본 보관함을 씁니다.',
            'p를 한 번 누르세요. 복사한 ready가 아니라 삭제한 trash가 나옵니다.',
          ],
        ),
        goal(
          '복구',
          '방금 붙인 trash를 되돌립니다.',
          'u는 마지막 파일 변경을 되돌립니다. 기본 보관함은 여전히 trash입니다.',
          [['u', '붙이기 되돌리기']],
          '파일은 ready · slot',
          ['보관함과 파일의 내용은 별개입니다.', 'u를 한 번 누르세요. 방금 붙인 줄만 사라집니다.'],
        ),
        goal(
          '복사 전용',
          '이번에는 0에서 꺼냅니다.',
          '큰따옴표로 보관함을 고릅니다. 숫자 0을 고른 뒤 p로 붙입니다.',
          [
            ['"', '보관함 선택'],
            ['0', '숫자 0'],
            ['p', '붙이기'],
          ],
          'slot 아래에 ready',
          [
            '0은 영문 o가 아니라 숫자입니다.',
            '큰따옴표, 숫자 0, p를 차례로 누르세요. 콜론은 필요 없습니다.',
          ],
        ),
        save,
      ],
      (snap, previous = 0) => {
        const text = snap?.lines.join('\n');
        if (text === target) return 5;
        if (text === mistaken) return 3;
        if (text === removed) return previous >= 3 ? 4 : 2;
        if (text === initial) return snap.registerZero === 'ready\n' ? 1 : 0;
        return null;
      },
    ),
    question: 'dd 뒤에 최근 복사한 줄을 꺼내려면?',
    answers: ['p — 항상 최근 복사 내용', '"0p — 복사 전용 0의 내용'],
    correct: 1,
    why: 'p는 기본 보관함을 씁니다. 삭제 뒤에는 0을 지정해 복사한 내용을 꺼낼 수 있습니다.',
  },
  {
    label: '2 / 4 · 이름 붙여 보관하기',
    recap: '오래 쓸 내용에는 이름을 붙일 수 있습니다.',
    detail:
      'a에 ready를 보관하고 trash를 삭제했습니다. 기본 보관함이 바뀌어도 a의 내용은 남습니다.',
    lesson: lesson(
      'named.txt',
      [
        goal(
          '이름 붙이기',
          'ready를 a에 보관합니다.',
          '큰따옴표, a로 보관함을 고릅니다. 이어 yy로 줄을 복사합니다.',
          [
            ['"', '보관함 선택'],
            ['a', '이름 a'],
            ['y', '복사'],
            ['y', '현재 줄'],
          ],
          'a에 ready ↵',
          [
            '여기의 a는 입력 모드로 들어가는 키가 아닙니다.',
            '큰따옴표, a, y, y를 순서대로 누르세요.',
          ],
        ),
        remove,
        goal(
          '이름으로 꺼내기',
          'a에서 ready를 꺼냅니다.',
          'slot 아래에 붙입니다. 기본 보관함 대신 a를 지정하세요.',
          [
            ['"', '보관함 선택'],
            ['a', '이름 a'],
            ['p', '붙이기'],
          ],
          'slot 아래에 ready',
          ['기본에는 trash, a에는 ready가 있습니다.', '큰따옴표, a, p를 이어 누르세요.'],
        ),
        save,
      ],
      (snap) => {
        const text = snap?.lines.join('\n');
        return text === target
          ? 3
          : text === removed
            ? 2
            : text === initial
              ? snap.registerA === 'ready\n'
                ? 1
                : 0
              : null;
      },
    ),
    question: 'a에 복사한 뒤 dd로 다른 줄을 삭제하면?',
    answers: ['a의 복사 내용은 그대로 남습니다.', 'a도 방금 삭제한 내용으로 바뀝니다.'],
    correct: 0,
    why: '레지스터를 지정하지 않은 일반 삭제는 a를 덮어쓰지 않습니다.',
  },
  {
    label: '3 / 4 · 보관하지 않고 버리기',
    recap: '버리는 삭제는 기본 보관함을 지킵니다.',
    detail:
      '밑줄 레지스터로 trash를 버렸습니다. 기본 보관함의 ready가 그대로라서 p로 바로 붙일 수 있었습니다.',
    lesson: lesson(
      'discard.txt',
      [
        copy,
        goal(
          '버리기',
          'trash를 보관하지 않고 지웁니다.',
          'j로 내려갑니다. 큰따옴표 뒤의 밑줄은 버리기 전용 보관함입니다.',
          [
            ['j', '아래로'],
            ['"', '보관함'],
            ['_', '밑줄'],
            ['dd', '줄 삭제'],
          ],
          '기본과 0은 ready 그대로',
          [
            '밑줄은 키보드에서 보통 Shift와 -를 함께 눌러 입력합니다.',
            'j 뒤에 큰따옴표, 밑줄, d, d를 누르세요.',
          ],
        ),
        goal(
          '그대로 붙이기',
          '이제 p로 ready를 붙입니다.',
          '삭제가 기본 보관함을 바꾸지 않았습니다. slot 아래에 붙여보세요.',
          [['p', '기본 내용 붙이기']],
          'slot 아래에 ready',
          [
            '기본 보관함이 ready인지 화면에서 확인하세요.',
            'p를 누릅니다. trash가 나오면 u로 되돌리고 "0p로 복구할 수도 있습니다.',
          ],
        ),
        save,
      ],
      (snap) => {
        const text = snap?.lines.join('\n');
        return text === target
          ? 3
          : text === removed
            ? 2
            : text === initial
              ? snap.registerZero === 'ready\n'
                ? 1
                : 0
              : null;
      },
    ),
    question: '"_dd와 dd의 차이는 무엇인가요?',
    answers: [
      '"_dd는 줄을 지우지 않습니다.',
      '둘 다 지우지만 "_dd는 기존 보관함을 바꾸지 않습니다.',
    ],
    correct: 1,
    why: '밑줄 레지스터는 삭제한 내용을 버립니다. 파일 변경은 u로 되돌릴 수 있습니다.',
  },
  {
    label: '4 / 4 · 내 방법으로 해결하기',
    recap: '복사와 삭제를 섞어도 원하는 내용을 꺼냈습니다.',
    detail:
      'remove 줄은 지우고 slot 아래에 gold를 붙였습니다. 설명 줄을 보존하고 저장한 결과까지 확인했습니다.',
    lesson: {
      title: registerWorkshop.title,
      showRegisters: true,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'keep.txt',
          initial: 'gold\nremove\nnote: keep\nslot',
          target: 'gold\nnote: keep\nslot\ngold',
          title: 'gold는 복사하고 remove는 지우세요.',
          description:
            'remove를 지운 뒤 slot 아래에 gold를 붙여 저장하세요. note: keep은 그대로 남깁니다. 보관함은 직접 고르세요.',
          expected: 'gold · note: keep · slot · gold 순서로 저장',
        },
      },
      challengeHints: [
        'gold를 복사한 뒤 지울 줄로 이동하세요. 0 또는 이름 붙인 보관함을 사용할 수 있습니다.',
        'yy 다음 jdd로 remove를 지워도 0의 gold는 남습니다.',
        'G는 마지막 줄로 이동합니다. slot에서 "0p로 gold를 붙일 수 있습니다.',
        '원하는 결과인지 확인한 뒤 :w와 Enter로 저장합니다.',
      ],
    },
  },
];
