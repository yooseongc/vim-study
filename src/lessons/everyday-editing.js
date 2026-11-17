const title = '모드를 알고, 편집하고 저장하기';
const save = {
  label: '저장',
  title: '목표와 비교하고 저장합니다.',
  explanation: '변경할 부분과 그대로 남길 부분을 확인한 뒤 저장하세요.',
  keys: [
    [':', '명령줄'],
    ['w', '현재 파일 저장'],
    ['Enter', '실행'],
  ],
  result: '목표 내용과 저장',
  hints: ['Esc로 일반 모드에 돌아온 뒤 저장하세요.'],
};
function guided(file, initial, steps, description) {
  const target = steps.at(-1).after;
  const goals = steps.map((step) => ({
    ...step,
    label: '줄 편집',
    result: step.after,
    hints: ['잘못 바꿨다면 Esc로 나온 뒤 u로 되돌리고 시작과 목표를 비교하세요.'],
  }));
  goals.push(save, {
    ...save,
    label: '복구',
    title: '바뀐 부분을 다시 확인합니다.',
    explanation:
      '현재 내용 점검에서 다른 줄을 확인하세요. Esc로 나온 뒤 u로 최근 변경을 되돌릴 수 있습니다.',
    keys: [
      ['Esc', '일반 모드'],
      ['u', '최근 변경 되돌리기'],
    ],
    recovery: true,
  });
  return {
    title,
    reference: steps.map((s) => s.explanation),
    practice: { guided: { file, initial, target, description } },
    guidedGoals: goals,
    challengeHints: [],
    guidedStage(s, previous = 0) {
      const text = s.lines.join('\n');
      if (
        s.mode.startsWith('i') ||
        s.mode.startsWith('c') ||
        s.mode === 'V' ||
        s.mode.startsWith('no')
      )
        return previous;
      if (text === target) return steps.length;
      if (text === initial) return 0;
      const index = steps.findIndex((step) => step.after === text);
      return index < 0 ? steps.length + 1 : index + 1;
    },
  };
}
export const everydayLessons = [
  {
    label: '줄 뒤에 쓰고 새 줄 만들기',
    recap: '메모에 날짜와 담당자를 추가했습니다.',
    detail: 'A는 줄 끝에서 입력하고 o는 현재 줄 아래에 새 줄을 만듭니다.',
    lesson: guided(
      'memo.txt',
      'Ship package',
      [
        {
          title: '줄 끝에 날짜를 덧붙입니다.',
          explanation:
            '대문자 A는 줄 끝으로 가서 입력을 시작합니다. 먼저 공백 하나를 쓰고 Friday를 붙인 뒤 Esc로 나옵니다.',
          keys: [
            ['A', '줄 끝에서 입력'],
            [' Friday', '앞에 공백 한 칸'],
            ['Esc', '입력 마치기'],
          ],
          after: 'Ship package Friday',
        },
        {
          title: '아래에 담당자 줄을 만듭니다.',
          explanation:
            '소문자 o는 현재 줄 아래에 빈 줄을 만들고 입력을 시작합니다. Enter로 줄을 먼저 만들 필요가 없습니다.',
          keys: [
            ['o', '아래 새 줄에서 입력'],
            ['Owner: me', '담당자'],
            ['Esc', '입력 마치기'],
          ],
          after: 'Ship package Friday\nOwner: me',
        },
      ],
      '배송 메모 끝에 요일을 붙이고, 아래에 담당자를 추가하세요.',
    ),
  },
  {
    label: '줄 재배치와 횟수',
    recap: '배포 전에 테스트하도록 순서를 고쳤습니다.',
    detail:
      'dd는 줄을 잘라 보관하고 p는 그 줄을 현재 줄 아래에 붙입니다. 2dd는 두 줄을 삭제합니다.',
    lesson: guided(
      'release.txt',
      'build\ndeploy\ntest\nold\nold\nnote: keep',
      [
        {
          title: 'deploy 줄을 test 아래로 옮깁니다.',
          explanation:
            'j로 deploy 줄에 갑니다. d를 두 번 눌러 줄을 잘라내면 test 줄이 현재 줄이 됩니다. p로 그 아래에 붙이세요.',
          keys: [
            ['j', '아래 한 줄'],
            ['dd', '현재 줄 잘라내기'],
            ['p', '현재 줄 아래에 붙이기'],
          ],
          after: 'build\ntest\ndeploy\nold\nold\nnote: keep',
        },
        {
          title: '오래된 두 줄을 한 번에 지웁니다.',
          explanation:
            '현재 deploy 줄에서 j로 첫 old에 갑니다. 숫자 2는 뒤 동작의 횟수입니다. 2와 d와 d를 차례로 누르세요.',
          keys: [
            ['j', '첫 old 줄'],
            ['2', '두 번'],
            ['dd', '줄 삭제'],
          ],
          after: 'build\ntest\ndeploy\nnote: keep',
        },
      ],
      'build → test → deploy 순서로 정리하고 old 두 줄만 제거하세요. 설명 줄은 남깁니다.',
    ),
  },
  {
    label: '여러 줄을 골라 복사하기',
    recap: '두 체크 항목을 배포 목록에도 넣었습니다.',
    detail:
      'V는 줄 단위 선택, j는 선택 확장, y는 복사입니다. G로 마지막 줄에 간 뒤 p로 아래에 붙일 수 있습니다.',
    lesson: guided(
      'checklist.txt',
      'Daily:\n- lint\n- test\nRelease:',
      [
        {
          title: '두 항목을 골라 배포 목록에도 붙입니다.',
          explanation:
            'j로 첫 항목에 갑니다. 대문자 V로 줄 선택을 시작하고 j로 한 줄 더 고릅니다. y로 복사한 뒤 G로 마지막 줄에 가서 p로 붙이세요. 원본 항목은 남습니다.',
          keys: [
            ['j', '첫 항목'],
            ['V', '줄 단위 선택'],
            ['j', '다음 줄까지 선택'],
            ['y', '선택한 줄 복사'],
            ['G', '마지막 줄'],
            ['p', '아래에 붙이기'],
          ],
          after: 'Daily:\n- lint\n- test\nRelease:\n- lint\n- test',
        },
      ],
      'Daily의 두 체크 항목을 유지하면서 Release 아래에도 같은 항목을 추가하세요.',
    ),
  },
  {
    label: '방법을 골라 안내문 완성하기',
    recap: '안내문의 순서와 내용을 함께 정리했습니다.',
    detail: '짧은 문서는 줄 이동과 새 줄 입력을 조합해도 되고, 필요한 범위만 다시 써도 됩니다.',
    lesson: {
      title,
      guidedGoals: [],
      guidedStage: () => null,
      reference: [
        'A는 줄 끝에서 입력, o는 아래 새 줄에서 입력합니다.',
        'dd는 현재 줄을 잘라내며 p는 줄 단위 내용을 아래에 붙입니다.',
        'j는 아래 한 줄, G는 마지막 줄, gg는 첫 줄입니다.',
      ],
      practice: {
        challenge: {
          file: 'instructions.txt',
          initial: 'Pack bag\nLeave home\nCheck tickets\nnote: keep this line',
          target: 'Pack bag tonight\nCheck tickets\nLeave home\nBring water\nnote: keep this line',
          title: '출발 안내문을 읽기 좋은 순서로 고치세요.',
          description:
            '가방 준비는 tonight로 구체화하고, 티켓 확인을 출발보다 먼저 배치하세요. 출발 아래에 Bring water를 추가하고 마지막 설명은 남깁니다.',
          expected: '네 행동의 내용과 순서 · 설명 보존 · 저장',
        },
      },
      challengeHints: [
        '줄 끝에 덧붙이는 동작과 줄을 옮기는 동작을 나눠 생각하세요.',
        'Leave home을 잘라 Check tickets 아래에 붙일 수 있습니다.',
        'Bring water를 새 줄에 입력합니다. 설명 줄을 덮어쓰지 마세요.',
      ],
      solutions: [
        [
          '줄을 옮기는 방법',
          'A로 tonight를 붙이고, dd와 p로 출발 줄을 옮긴 뒤 o로 물을 챙기는 줄을 추가할 수 있습니다.',
        ],
        [
          '내용을 다시 쓰는 방법',
          '작은 범위를 다시 입력해도 같은 목표를 만들 수 있습니다. 긴 줄이거나 이미 맞는 내용이 많을수록 잘라 옮기는 편이 편리합니다.',
        ],
      ],
    },
  },
];

// Selection changes no file text, so guide it by cursor, mode and the actual register.
const visual = everydayLessons[2].lesson;
const selectionSteps = [
  [
    '먼저 복사할 첫 항목으로 갑니다.',
    'j는 아래로 한 줄 이동합니다. Daily 제목 아래의 첫 항목을 고릅니다.',
    [['j', '첫 항목으로']],
    '첫 lint 항목 위에 커서',
  ],
  [
    '줄 단위 선택을 시작합니다.',
    '대문자 V를 누릅니다. 소문자 v는 문자 단위 선택입니다.',
    [['V', '현재 줄 전체 선택']],
    '줄 선택 모드',
  ],
  [
    '다음 항목도 함께 고릅니다.',
    '선택 중 j로 한 줄 내려가면 두 항목이 함께 선택됩니다.',
    [['j', '선택 범위 한 줄 확장']],
    'lint와 test 두 줄 선택',
  ],
  [
    '선택한 두 줄을 복사합니다.',
    'y는 yank, 복사입니다. 선택이 풀려도 원문은 그대로 남고 보관함에 두 줄이 들어갑니다.',
    [['y', '선택 내용 복사']],
    '원문 유지 · 일반 모드',
  ],
  [
    '붙일 위치로 이동합니다.',
    '대문자 G는 마지막 줄로 갑니다. Release 제목 아래에 항목을 붙일 것입니다.',
    [['G', '마지막 줄']],
    'Release 줄 위에 커서',
  ],
  [
    '복사한 항목을 아래에 붙입니다.',
    '줄 단위로 복사한 내용에 p를 쓰면 현재 줄 아래에 들어갑니다.',
    [['p', '아래에 붙이기']],
    'Release 아래에 두 항목 추가',
  ],
];
visual.guidedGoals = [
  ...selectionSteps.map(([title, explanation, keys, result]) => ({
    label: '줄 선택과 복사',
    title,
    explanation,
    keys,
    result,
    hints: ['Esc로 선택을 취소하고 다시 고를 수 있습니다. 이미 붙였다면 u로 되돌리세요.'],
  })),
  save,
  {
    ...save,
    recovery: true,
    title: '목표와 다른 부분을 확인하세요.',
    explanation: '현재 내용 점검으로 다른 줄을 찾고, Esc 다음 u로 최근 편집을 되돌릴 수 있습니다.',
  },
];
visual.guidedStage = (s) => {
  const text = s.lines.join('\n');
  if (text === visual.practice.guided.target) return 6;
  if (text !== visual.practice.guided.initial) return 7;
  if (s.mode === 'V') return s.cursor?.[0] === 2 ? 2 : 3;
  if (s.register?.includes('- lint\n- test')) return s.cursor?.[0] === 4 ? 5 : 4;
  return s.cursor?.[0] === 2 ? 1 : 0;
};
