export const globalWorkshop = { id: 'global-workshop', title: '조건으로 줄을 골라 처리하기' };
export const globalSample = 'DEBUG cache\nINFO ready\nDEBUG worker\nINFO DEBUG stays';
const reference = [
  ':g/패턴/명령은 패턴에 맞는 줄을 골라 뒤의 Ex 명령을 실행합니다. 치환 끝의 g 옵션(각 줄의 모든 일치)과 다릅니다.',
  '^는 줄 시작입니다. DEBUG만 찾으면 줄 중간의 DEBUG도 포함하지만 ^DEBUG는 DEBUG로 시작하는 줄만 고릅니다.',
  'p는 선택한 줄을 출력합니다. 파일을 바꾸지 않고 범위를 살펴볼 수 있습니다. 메시지가 Enter를 기다리면 Enter로 돌아오세요.',
  'd는 선택한 줄 전체를 삭제합니다. 그 줄의 패턴 문자열만 지우는 명령이 아닙니다. Enter 전에는 아직 실행되지 않습니다.',
  ':v/패턴/명령은 반대로 일치하지 않는 줄에 실행합니다. :v/^KEEP/d는 KEEP로 시작하지 않는 줄을 지워 KEEP 줄을 남깁니다.',
  '^TEMP는 TEMPORARY에도 맞습니다. TEMP 다음에 공백이 있어야 한다면 ^TEMP 뒤에 실제 공백 한 칸을 넣으세요.',
  '잘못 삭제했다면 일반 모드에서 u로 되돌린 뒤 범위를 좁힙니다. 이 연습의 global 삭제 한 번은 u 한 번으로 복구할 수 있습니다.',
  '삭제 뒤에도 저장은 별개입니다. 남겨야 할 줄까지 확인한 뒤 :w와 Enter로 저장합니다. 원하는 결과와 저장을 확인하며 특정 키 순서는 강제하지 않습니다.',
];
const goal = (label, title, explanation, keys, result, hints = []) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
function guided(inverse = false) {
  const prefix = inverse ? 'v' : 'g',
    pattern = inverse ? '^KEEP' : '^DEBUG';
  const initial = inverse ? 'DEBUG cache\nKEEP main\nINFO ready\nKEEP DEBUG note' : globalSample;
  const target = inverse ? 'KEEP main\nKEEP DEBUG note' : 'INFO ready\nINFO DEBUG stays';
  const select = `${prefix}/${pattern}/`;
  return {
    title: globalWorkshop.title,
    reference,
    practice: { guided: { file: inverse ? 'keep.txt' : 'events.txt', initial, target } },
    challengeHints: [],
    guidedGoals: [
      goal(
        '줄 선택',
        inverse ? '조건 밖의 줄을 고릅니다.' : '조건에 맞는 줄을 고릅니다.',
        inverse
          ? 'v는 패턴과 일치하지 않는 줄을 고릅니다.'
          : '명령줄의 g는 global입니다. 슬래시 뒤에 줄을 고를 패턴을 씁니다.',
        [
          [':', '명령줄'],
          [`${prefix}/`, inverse ? '일치하지 않는 줄' : '일치하는 줄'],
        ],
        '아직 파일은 그대로',
        ['치환 끝의 g 옵션과는 다른 명령입니다.'],
      ),
      goal(
        '줄 시작',
        inverse ? 'KEEP로 시작하는지 구분합니다.' : 'DEBUG로 시작하는 줄만 고릅니다.',
        inverse
          ? '^KEEP와 슬래시를 입력합니다. v이므로 이 조건 밖의 줄을 처리합니다.'
          : '^는 줄 시작입니다. 줄 중간의 DEBUG를 제외합니다.',
        [[`${pattern}/`, '줄 시작 패턴']],
        inverse ? 'KEEP 줄은 남길 대상' : 'INFO DEBUG stays는 제외',
        ['패턴 뒤 슬래시가 조건의 끝입니다.'],
      ),
      goal(
        '미리 확인',
        '고른 줄을 먼저 출력합니다.',
        'p는 출력입니다. 삭제 전에 어떤 줄이 골라지는지 확인하세요.',
        [
          ['p', '줄 출력'],
          ['Enter', '실행'],
        ],
        '파일 내용은 그대로 · 선택한 줄 출력',
        ['출력 메시지 아래 Enter를 기다리면 Enter로 돌아옵니다.'],
      ),
      goal(
        '같은 범위',
        '확인한 조건을 다시 씁니다.',
        '이번에는 같은 조건 뒤에 삭제 명령을 붙입니다.',
        [[`:${select}`, '같은 줄 조건']],
        '삭제할 명령을 입력할 자리',
        ['앞에서 출력한 줄과 지우려는 줄이 같은지 확인하세요.'],
      ),
      goal(
        '줄 삭제',
        '선택한 줄 전체를 지웁니다.',
        'd를 붙이고 Enter로 실행합니다. 패턴 단어뿐 아니라 줄 전체가 지워집니다.',
        [
          ['d', '줄 삭제'],
          ['Enter', '실행'],
        ],
        inverse ? 'KEEP 줄만 남음' : 'INFO 두 줄은 그대로',
        ['잘못 골랐다면 Esc로 명령을 취소할 수 있습니다. 이미 실행했다면 u로 복구합니다.'],
      ),
      goal(
        '저장',
        '남은 줄을 확인하고 저장합니다.',
        '남겨야 할 줄이 그대로인지 확인한 뒤 저장하세요.',
        [
          [':w', '현재 파일 저장'],
          ['Enter', '실행'],
        ],
        '내용과 저장 확인',
        ['내용이 맞아도 저장 전에는 문제가 끝나지 않습니다.'],
      ),
      {
        ...goal(
          '복구',
          '지운 내용을 먼저 되돌립니다.',
          'Esc로 나온 뒤 u로 삭제를 되돌리고 조건을 다시 확인하세요.',
          [
            ['Esc', '일반 모드'],
            ['u', '되돌리기'],
          ],
          '보존할 줄 복구',
          ['^가 빠졌거나 패턴이 너무 넓지 않은지 확인하세요.'],
        ),
        recovery: true,
      },
      {
        ...goal(
          '출력 확인',
          '메시지를 확인합니다.',
          'Enter로 편집 화면에 돌아옵니다. 출력은 파일을 바꾸지 않습니다.',
          [['Enter', '계속']],
          '일반 모드로 돌아오기',
          ['선택한 줄의 출력이 끝나면 같은 조건으로 삭제할 수 있습니다.'],
        ),
        recovery: true,
      },
    ],
    guidedStage(s) {
      if (s.mode === 'r') return 7;
      const text = s.lines.join('\n');
      if (text === target) return 5;
      if (text !== initial) return 6;
      const cmd = s.command ?? '';
      if (s.lastCommand === `${select}p`) return cmd.startsWith(select) ? 4 : 3;
      if (!cmd.startsWith(`${prefix}/`)) return 0;
      return cmd.startsWith(select) ? 2 : 1;
    },
  };
}
export const globalLessons = [
  {
    label: '1 / 3 · 출력하고 삭제하기',
    recap: '줄 시작 조건으로 필요한 줄만 지웠습니다.',
    detail:
      'DEBUG로 시작하는 줄을 출력해 확인한 뒤 삭제했습니다. 줄 중간에 DEBUG가 있는 INFO 줄은 남겼습니다.',
    lesson: guided(),
    question: 'global 명령 뒤의 d가 지우는 것은?',
    answers: ['선택한 줄 전체', '패턴과 일치한 단어만'],
    correct: 0,
    why: 'global은 줄을 고르고 d는 그 줄을 삭제합니다. 치환 명령과 역할이 다릅니다.',
  },
  {
    label: '2 / 3 · 조건 밖의 줄 지우기',
    recap: '남길 조건을 기준으로 정리했습니다.',
    detail:
      'v는 조건에 맞지 않는 줄을 고릅니다. KEEP로 시작하지 않는 줄을 지워 KEEP 두 줄만 남겼습니다.',
    lesson: guided(true),
    question: ':v/^KEEP/d를 실행하면 무엇이 남나요?',
    answers: ['KEEP로 시작하지 않는 줄', 'KEEP로 시작하는 줄'],
    correct: 1,
    why: 'v가 조건 밖의 줄을 고르고 d가 삭제하므로 조건에 맞는 줄이 남습니다.',
  },
  {
    label: '3 / 3 · 비슷한 단어 구분하기',
    recap: '단어의 시작만으로 범위를 넓히지 않았습니다.',
    detail:
      'TEMP 다음 공백으로 시작하는 줄만 지웠습니다. KEEP TEMP reference와 TEMPORARY plan은 그대로 남겼습니다.',
    lesson: {
      title: globalWorkshop.title,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'cleanup.txt',
          initial: 'TEMP scratch\nKEEP TEMP reference\nTEMP cache\nTEMPORARY plan\nKEEP done',
          target: 'KEEP TEMP reference\nTEMPORARY plan\nKEEP done',
          title: 'TEMP 작업 줄만 정리하세요.',
          description:
            'TEMP 다음 공백으로 시작하는 줄만 삭제하고 저장하세요. KEEP TEMP와 TEMPORARY 줄은 그대로 남깁니다.',
          expected: 'KEEP TEMP reference · TEMPORARY plan · KEEP done',
        },
      },
      challengeHints: [
        '^TEMP만으로는 TEMPORARY도 선택됩니다.',
        'TEMP 뒤에 실제 공백을 넣어 경계를 구분하세요.',
        '먼저 :g/^TEMP /p와 Enter로 출력해 확인할 수 있습니다.',
        '같은 조건 뒤 p 대신 d로 삭제합니다. 남은 세 줄을 확인하고 :w로 저장하세요.',
      ],
    },
  },
];
