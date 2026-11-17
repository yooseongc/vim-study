export const quickfixWorkshop = { id: 'quickfix-workshop', title: '검색 목록을 따라 편집하기' };
const reference = [
  'quickfix는 파일·줄·열 같은 위치를 모은 목록입니다. 검색 결과가 곧 수정 지시는 아닙니다. 각 줄의 뜻을 확인하세요.',
  ':vimgrep은 Vim 안에서 파일을 검색합니다. /TODO/는 찾을 패턴, %는 현재 파일 이름입니다. 명령과 패턴, 파일 사이에는 공백이 필요합니다.',
  '두 파일을 검색할 때는 % 대신 /work/api.txt /work/web.txt처럼 파일 이름을 공백으로 구분합니다. 이 예시는 notes.txt를 검색 대상에서 제외합니다.',
  ':cnext는 다음 결과, :cprevious는 이전 결과, :cfirst는 첫 결과입니다. n은 현재 버퍼의 일반 검색 반복이며 quickfix의 다음 항목으로 이동하는 명령이 아닙니다.',
  ':copen으로 목록 창을 볼 수 있습니다. :cclose는 창만 닫고 검색 목록은 남깁니다. 목록에는 검색 당시의 문구가 남을 수 있어 실제 파일에서 수정 결과를 확인해야 합니다.',
  'ciw는 커서가 있는 단어를 지우고 입력 모드로 들어갑니다. c는 바꾸기, iw는 단어 안쪽입니다. DONE을 입력한 뒤 Esc로 마칩니다.',
  '이 연습은 hidden 설정으로 저장하지 않고 다른 버퍼로 이동할 수 있습니다. 이동은 저장이 아닙니다. :w는 현재 파일, :wa는 모든 수정 버퍼를 저장합니다.',
  '검색 결과가 없으면 패턴과 파일 이름을 확인하세요. 목록 끝에서 :cnext를 실행해도 처음으로 순환하지 않습니다. :cprevious 또는 :cfirst로 돌아갈 수 있습니다.',
  '이 브라우저에서는 외부 grep이나 빌드 프로세스를 실행하지 않습니다. 로컬 Vim의 :make 등으로 만든 오류 목록도 quickfix 이동 명령을 사용할 수 있습니다.',
];
const goal = (label, title, explanation, keys, result, hints = []) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
function searchGoals(multi) {
  return [
    goal(
      '검색 명령',
      '검색 명령을 엽니다.',
      '콜론 뒤 vimgrep과 공백을 입력합니다. 아직 Enter는 누르지 마세요.',
      [
        [':', '명령줄'],
        ['vimgrep ', '끝에 공백'],
      ],
      'Vim 안에서 파일 검색',
      ['vimgrep은 외부 프로그램 없이 검색합니다.'],
    ),
    goal(
      '검색어',
      '찾을 단어를 지정합니다.',
      '슬래시 사이에 TODO를 넣고, 뒤에 공백을 넣습니다.',
      [['/TODO/ ', '끝에 공백']],
      'TODO가 있는 위치를 모으기',
      ['슬래시는 패턴의 시작과 끝을 구분합니다.'],
    ),
    ...(multi
      ? [
          goal(
            '첫 파일',
            '첫 번째 검색 파일을 넣습니다.',
            'api.txt의 경로 뒤에 공백을 넣습니다. 아직 명령을 실행하지 않습니다.',
            [['/work/api.txt ', '끝에 공백']],
            'api.txt만 우선 지정',
            ['경로는 /work/api.txt입니다.'],
          ),
          goal(
            '두 번째 파일',
            'web.txt까지 지정하고 실행합니다.',
            '두 파일만 검색합니다. 설명용 notes.txt는 제외합니다.',
            [
              ['/work/web.txt', '두 번째 파일'],
              ['Enter', '검색 실행'],
            ],
            '검색 목록 두 항목 · 첫 결과로 이동',
            ['완성된 명령은 :vimgrep /TODO/ /work/api.txt /work/web.txt입니다.'],
          ),
        ]
      : [
          goal(
            '검색 파일',
            '현재 파일에서 검색합니다.',
            '%는 현재 파일 이름입니다. 입력 뒤 Enter로 실행하세요.',
            [
              ['%', '현재 파일'],
              ['Enter', '검색 실행'],
            ],
            '검색 목록 두 항목 · 첫 결과로 이동',
            ['완성된 명령은 :vimgrep /TODO/ %입니다.'],
          ),
        ]),
  ];
}
function searchStage(s, multi) {
  const cmd = s.command ?? '';
  if (!cmd.startsWith('vimgrep ')) return 0;
  if (!cmd.includes('/TODO/ ')) return 1;
  if (multi && cmd.includes('/work/api.txt ')) return 3;
  return 2;
}
const edit = goal(
  '단어 수정',
  '현재 TODO를 DONE으로 바꿉니다.',
  'TODO 위에서 ciw로 단어를 바꿉니다. DONE을 입력하고 Esc로 마치세요.',
  [
    ['ciw', '단어 바꾸기'],
    ['DONE', '입력'],
    ['Esc', '입력 끝'],
  ],
  '현재 결과 한 곳만 DONE',
  ['c는 바꾸기, iw는 커서가 있는 단어 안쪽입니다.', '목록의 위치와 실제 파일 내용을 함께 보세요.'],
);
const next = goal(
  '다음 위치',
  '다음 검색 결과로 갑니다.',
  'cnext는 quickfix의 다음 항목으로 이동합니다.',
  [
    [':cnext', '다음 결과'],
    ['Enter', '실행'],
  ],
  '목록 위치 2 / 2',
  ['cprevious로 이전 결과, cfirst로 첫 결과에 돌아올 수 있습니다.'],
);
const first = goal(
  '위치 복귀',
  '첫 검색 결과로 돌아갑니다.',
  'cfirst로 첫 항목에 돌아와 TODO를 수정하세요.',
  [
    [':cfirst', '첫 결과'],
    ['Enter', '실행'],
  ],
  '첫 결과의 TODO 위',
  ['두 번째 항목에서는 :cprevious로도 돌아갈 수 있습니다.'],
);
const close = {
  ...goal(
    '목록 창',
    '목록 창을 닫습니다.',
    'cclose로 창만 닫습니다. 목록은 남습니다.',
    [
      [':cclose', '목록 창 닫기'],
      ['Enter', '실행'],
    ],
    '파일 편집 화면 · 목록 유지',
    ['목록은 검색할 때의 문구를 보여줍니다. 파일 수정과 자동으로 같아지지 않을 수 있습니다.'],
  ),
  recovery: true,
};
const recover = {
  ...goal(
    '편집 복구',
    '바꾼 내용을 확인합니다.',
    '현재 내용 점검으로 다른 부분을 찾으세요. 잘못 바꾼 파일에서 Esc 뒤 u로 되돌립니다.',
    [
      ['Esc', '일반 모드'],
      ['u', '현재 버퍼 되돌리기'],
    ],
    '보존할 줄은 그대로',
    [
      '다른 파일의 변경은 그 파일로 돌아가 되돌립니다.',
      '문제 초기화는 이번 문제의 모든 파일을 처음으로 돌립니다.',
    ],
  ),
  recovery: true,
};
const singleInitial = 'TODO api\nTODO web\nnote: keep';
const singleTarget = 'DONE api\nDONE web\nnote: keep';
const notes = 'note: TODO means unfinished';
const multiCourse = (a, b) => ({
  file: 'api.txt',
  initial: `TODO ${a}\nnote: keep`,
  files: { 'web.txt': `TODO ${b}\nnote: keep`, 'notes.txt': notes },
  target: `DONE ${a}\nnote: keep`,
  targets: {
    'api.txt': `DONE ${a}\nnote: keep`,
    'web.txt': `DONE ${b}\nnote: keep`,
    'notes.txt': notes,
  },
  protectedFiles: ['notes.txt'],
});
function guided(multi) {
  const course = multi
    ? multiCourse('api', 'web')
    : { file: 'tasks.txt', initial: singleInitial, target: singleTarget };
  const offset = multi ? 4 : 3;
  const goals = [
    ...searchGoals(multi),
    edit,
    next,
    edit,
    goal(
      '저장',
      multi ? '두 파일을 모두 저장합니다.' : '편집한 파일을 저장합니다.',
      multi
        ? 'wa는 write all입니다. 다른 버퍼에 남은 변경도 함께 저장합니다.'
        : 'note 줄을 확인한 뒤 w로 저장합니다.',
      [
        [multi ? ':wa' : ':w', multi ? '모든 수정 버퍼' : '현재 파일'],
        ['Enter', '실행'],
      ],
      '내용과 저장까지 확인',
      ['현재 내용 점검에서 저장이 남았는지 확인할 수 있습니다.'],
    ),
    { ...first, recovery: true },
    close,
    recover,
  ];
  return {
    title: quickfixWorkshop.title,
    showQuickfix: true,
    reference,
    practice: { guided: course },
    guidedGoals: goals,
    challengeHints: [],
    guidedStage(s) {
      if (s.quickfixWindow) return offset + 5;
      const current = s.lines.join('\n');
      const all = multi
        ? { ...s.buffers, [s.path.replace('/work/', '')]: current }
        : { 'tasks.txt': current };
      const targets = course.targets ?? { 'tasks.txt': course.target };
      const done = Object.entries(targets).every(([name, value]) => all[name] === value);
      if (done) return s.mode.startsWith('i') ? offset + 2 : offset + 3;
      if (s.mode.startsWith('i')) return s.quickfixIndex === 2 ? offset + 2 : offset;
      const expectedInitial = multi
        ? { [course.file]: course.initial, ...course.files }
        : { 'tasks.txt': course.initial };
      const valid = Object.entries(expectedInitial).every(([name, value]) =>
        multi
          ? all[name] === value || all[name] === targets[name]
          : [value, 'DONE api\nTODO web\nnote: keep', course.target].includes(all[name]),
      );
      if (!valid) return offset + 6;
      if (s.quickfixCount !== 2) return searchStage(s, multi);
      const firstDone = multi
        ? all['api.txt'] === targets['api.txt']
        : all['tasks.txt'].startsWith('DONE api\n');
      if (!firstDone)
        return s.quickfixIndex === 1 && s.cursor[0] === 1 && s.cursor[1] <= 4 ? offset : offset + 4;
      return s.quickfixIndex === 2 ? offset + 2 : offset + 1;
    },
  };
}
export const quickfixLessons = [
  {
    label: '1 / 3 · 검색 위치 모으기',
    recap: '검색 목록을 따라 두 곳을 고쳤습니다.',
    detail:
      'vimgrep으로 위치를 모으고 cnext로 다음 결과에 갔습니다. 목록은 위치 안내이고, 변경 결과는 실제 파일에서 확인합니다.',
    lesson: guided(false),
    question: 'cnext가 따라가는 것은 무엇인가요?',
    answers: ['quickfix에 모아 둔 다음 위치', '무조건 다음 줄'],
    correct: 0,
    why: '결과 사이에 여러 줄이 있거나 다른 파일이어도 목록의 다음 항목으로 갑니다.',
  },
  {
    label: '2 / 3 · 파일을 넘어 편집하기',
    recap: '파일 이동과 저장을 구분했습니다.',
    detail:
      'api와 web을 수정한 뒤 wa로 모두 저장했습니다. 파일을 옮겨도 이전 버퍼의 변경은 남으며, w만으로 다른 버퍼까지 저장되지는 않습니다.',
    lesson: guided(true),
    question: 'web.txt에서 w만 실행하면 어떻게 되나요?',
    answers: ['api.txt까지 항상 함께 저장됩니다.', '현재 web.txt만 저장합니다.'],
    correct: 1,
    why: '다른 버퍼의 변경까지 저장하려면 wa를 쓰거나 각 파일에서 따로 저장해야 합니다.',
  },
  {
    label: '3 / 3 · 대상과 설명 구분하기',
    recap: '대상 파일만 수정하고 모두 저장했습니다.',
    detail:
      'dev와 prod의 TODO는 DONE으로 바꾸고 notes의 설명은 남겼습니다. 검색에 걸리는 모든 단어가 수정 대상인 것은 아닙니다.',
    lesson: {
      title: quickfixWorkshop.title,
      showQuickfix: true,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          ...multiCourse('dev', 'prod'),
          title: '두 파일만 바꾸고 저장하세요.',
          description:
            'api.txt와 web.txt의 TODO를 DONE으로 바꾸세요. 각 note 줄과 notes.txt 전체는 그대로 보존합니다.',
          expected: 'api·web 수정 및 저장 · notes 보존',
        },
      },
      challengeHints: [
        '검색할 파일 두 개를 먼저 고르세요.',
        'vimgrep 뒤 /TODO/와 두 경로 /work/api.txt /work/web.txt를 공백으로 구분합니다. Enter로 실행하세요.',
        '각 결과에서 ciw로 단어를 바꾸고 DONE 입력 뒤 Esc로 마칩니다. cnext는 다음 결과입니다.',
        'wa로 모든 수정 버퍼를 저장하세요. 설명 파일을 바꿨으면 그 파일로 돌아가 복구합니다.',
      ],
    },
  },
];
