export const bufferWorkshop = { id: 'buffer-workshop', title: '버퍼와 창을 구분하며 파일 다루기' };
const reference = [
  '파일은 저장된 내용, 버퍼는 Vim이 편집 중인 내용, 창은 버퍼를 보여주는 자리입니다. 같은 버퍼를 두 창에서 보면 어느 창에서 편집해도 같은 내용이 보입니다.',
  ':split은 현재 버퍼를 위아래 두 창으로 봅니다. :split 뒤에 파일 경로를 쓰면 그 파일을 새 창에서 엽니다. :vsplit은 좌우 분할입니다.',
  'Ctrl+w를 누른 뒤 Ctrl에서 손을 떼고 w를 누르면 다음 창으로 갑니다. Ctrl+w 다음 h/j/k/l로 방향을 고를 수도 있습니다. 창 이동은 파일 내용을 바꾸지 않습니다.',
  ':close는 현재 창을 닫습니다. 파일을 디스크에서 삭제하는 명령이 아닙니다. 마지막 창은 :close로 닫을 수 없습니다. :q는 마지막 창이라면 Vim을 종료하므로 이 연습에서는 :close를 사용합니다.',
  '이 사이트는 hidden 설정을 사용합니다. 수정한 버퍼를 보여주는 마지막 창을 닫아도 편집 내용이 메모리에 남습니다. 로컬 Vim의 설정에 따라 저장을 먼저 요구할 수 있습니다.',
  ':ls로 버퍼 목록을 확인합니다. :buffer b.txt는 이미 목록에 있는 b.txt 버퍼를 현재 창에 보여줍니다. 파일 이름이 겹치면 버퍼 번호나 전체 경로로 구분하세요.',
  ':w는 현재 버퍼만, :wa는 수정된 모든 버퍼를 저장합니다. 창이 없어도 숨은 버퍼의 변경은 남아 있으므로 화면 위 미저장 수를 확인하세요.',
  'u는 현재 버퍼의 마지막 변경을 되돌립니다. 다른 버퍼의 변경은 그 버퍼로 이동해 되돌려야 합니다. :close는 undo도 저장도 아닙니다.',
  '이 단원의 :w와 :wa는 연습 세션 안에서 저장합니다. 자유 작업 공간은 별도 파일을 브라우저에 보관합니다. 연습 파일을 자동으로 옮기거나 기존 개인 파일을 덮어쓰지 않습니다.',
];
const goal = (label, title, explanation, keys, result, hints = []) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
const close = goal(
  '창 닫기',
  '현재 창만 닫습니다.',
  ':close는 창을 닫습니다. 버퍼 내용은 그대로 남습니다.',
  [
    [':close', '현재 창 닫기'],
    ['Enter', '실행'],
  ],
  '창 하나 · 편집 내용 유지',
  ['창이 하나라면 이미 정리됐습니다. :q!로 변경을 버리지 마세요.'],
);
const find = goal(
  '찾기',
  '현재 파일에서 old를 찾습니다.',
  '파일 이름을 확인하고 검색을 확정하세요.',
  [
    ['/old', '찾을 단어'],
    ['Enter', '위치 확정'],
  ],
  'old 위에 커서',
  ['다른 창으로 이동해도 검색어는 공유합니다.'],
);
const editStage = (s, offset) =>
  s.mode.startsWith('i') ||
  (s.mode !== 'c' && s.cursor?.[0] === 1 && s.cursor?.[1] >= 6 && s.cursor?.[1] <= 8)
    ? offset + 1
    : offset;
const edit = () =>
  goal(
    '내용 바꾸기',
    'old를 new로 바꿉니다.',
    '현재 파일 이름을 확인하고 단어만 바꿉니다.',
    [
      ['ciw', '단어 바꾸기'],
      ['new', '새 내용'],
      ['Esc', '입력 마침'],
    ],
    'mode=new · 설명은 그대로',
    ['앞 과정의 검색과 ciw를 이어 씁니다. 이미 new를 입력했다면 Esc로 나오세요.'],
  );
const save = goal(
  '저장',
  '모든 변경을 저장합니다.',
  ':wa는 보이지 않는 버퍼의 변경도 저장합니다.',
  [
    [':wa', '모든 수정 버퍼 저장'],
    ['Enter', '실행'],
  ],
  '미저장 0개',
  [':w만 실행했다면 다른 버퍼의 미저장 변경이 남을 수 있습니다.'],
);
const recovery = {
  ...goal(
    '복구',
    '현재 파일을 확인합니다.',
    '잘못 바꾼 버퍼에서 Esc, u로 되돌려보세요.',
    [
      ['Esc', '일반 모드'],
      ['u', '현재 버퍼 복구'],
    ],
    '바꿀 파일과 보존할 내용 구분',
    [
      '현재 내용 점검으로 다른 파일을 확인하세요. :buffer a.txt와 Enter로 첫 파일에 돌아갈 수 있습니다.',
    ],
  ),
  recovery: true,
};
const acknowledge = {
  ...goal(
    '메시지 확인',
    '메시지를 확인합니다.',
    'Enter로 편집 화면에 돌아오세요.',
    [['Enter', '계속']],
    '편집 화면',
    [],
  ),
  recovery: true,
};
const initial = 'mode=old\nnote: keep';
const target = 'mode=new\nnote: keep';
const getText = (s, name) => (s.path === `/work/${name}` ? s.lines.join('\n') : s.buffers?.[name]);
const sameLesson = {
  title: bufferWorkshop.title,
  reference,
  showBuffers: true,
  challengeHints: [],
  practice: { guided: { file: 'a.txt', initial, target, finalWindowCount: 1 } },
  guidedGoals: [
    goal(
      '같은 버퍼 보기',
      '창을 하나 더 엽니다.',
      '같은 파일을 두 창에서 봅니다. 파일 복사본이 생기는 것은 아닙니다.',
      [
        [':split', '위아래 분할'],
        ['Enter', '실행'],
      ],
      '창 2개 · 버퍼 a.txt 하나',
      ['두 창의 파일 이름이 모두 a.txt인지 보세요.'],
    ),
    find,
    edit(),
    goal(
      '창 이동',
      '다른 창으로 옮깁니다.',
      'Ctrl+w를 누른 뒤 손을 떼고 w를 누릅니다.',
      [
        ['Ctrl+w', '창 명령 시작'],
        ['w', '다음 창'],
      ],
      '다른 창에도 mode=new',
      ['각 창의 커서 위치는 달라도 버퍼 내용은 같습니다.'],
    ),
    close,
    goal(
      '파일 저장',
      '남은 창에서 저장합니다.',
      ':w로 현재 버퍼를 저장합니다. 창을 닫는 것과는 별개입니다.',
      [
        [':w', '현재 파일 저장'],
        ['Enter', '실행'],
      ],
      '창 하나 · 저장 완료',
      [],
    ),
    recovery,
    acknowledge,
  ],
  guidedStage(s) {
    if (s.mode === 'r') return 7;
    const text = s.lines.join('\n');
    if (text === target && !s.mode.startsWith('i'))
      return s.windowCount > 1 ? (s.currentWindow === 1 ? 3 : 4) : 5;
    if (s.mode.startsWith('i')) return 2;
    if (text !== initial) return 6;
    return s.windowCount > 1 ? editStage(s, 1) : 0;
  },
};
const multiCourse = {
  file: 'a.txt',
  initial,
  files: { 'b.txt': initial },
  targets: { 'a.txt': target, 'b.txt': target },
  finalWindowCount: 1,
};
const multiLesson = {
  title: bufferWorkshop.title,
  reference,
  showBuffers: true,
  challengeHints: [],
  practice: { guided: multiCourse },
  guidedGoals: [
    goal(
      '다른 파일 열기',
      '분할 명령을 시작합니다.',
      ':split을 쓰고 파일 경로를 이어 붙입니다.',
      [[':split', '분할 명령']],
      '명령줄 입력 중 · 아직 실행 전',
      ['Enter를 먼저 누르면 같은 버퍼를 분할합니다.'],
    ),
    goal(
      '파일 경로',
      'b.txt 경로를 붙입니다.',
      '공백 하나 뒤에 경로를 쓰고 Enter로 엽니다.',
      [
        ['/work/b.txt', '공백 뒤 파일 경로'],
        ['Enter', '실행'],
      ],
      'a.txt와 b.txt를 각각 표시',
      ['입력은 :split, 공백 하나, /work/b.txt, Enter 순서입니다.'],
    ),
    find,
    edit(),
    close,
    find,
    goal(
      '남은 파일 편집',
      'a.txt도 new로 바꿉니다.',
      '창을 닫은 b.txt의 변경은 숨은 버퍼에 남습니다.',
      [
        ['ciw', '단어 바꾸기'],
        ['new', '새 내용'],
        ['Esc', '입력 마침'],
      ],
      '두 파일 mode=new · 미저장 2개',
      ['b.txt가 저장된 것은 아닙니다. 위 상태에서 숨김과 미저장을 확인하세요.'],
    ),
    save,
    recovery,
    acknowledge,
  ],
  guidedStage(s) {
    if (s.mode === 'r') return 9;
    const a = getText(s, 'a.txt'),
      b = getText(s, 'b.txt');
    if (a === target && b === target && !s.mode.startsWith('i')) return s.windowCount > 1 ? 4 : 7;
    if (s.mode.startsWith('i')) return s.path === '/work/b.txt' ? 3 : 6;
    if (![initial, target].includes(a) || ![initial, target].includes(b)) return 8;
    if (b === target) {
      if (s.windowCount > 1) return 4;
      return s.path === '/work/a.txt' ? editStage(s, 5) : 8;
    }
    if (s.path === '/work/b.txt') return editStage(s, 2);
    return s.mode === 'c' && s.command.startsWith('split') ? 1 : 0;
  },
};
export const bufferLessons = [
  {
    label: '1 / 3 · 같은 버퍼, 두 창',
    recap: '창과 편집 내용을 구분했습니다.',
    detail: '같은 버퍼를 여러 창에 보여줄 수 있습니다. 창을 닫아도 편집한 버퍼 내용은 남습니다.',
    lesson: sameLesson,
    question: ':split으로 같은 파일을 보면?',
    answers: ['독립적인 복사본 두 개가 생긴다', '두 창이 같은 버퍼를 보여준다'],
    correct: 1,
    why: '창은 버퍼를 보는 자리입니다. 같은 버퍼의 변경은 두 창에 함께 나타납니다.',
  },
  {
    label: '2 / 3 · 숨은 변경까지 저장하기',
    recap: '보이지 않는 버퍼도 확인했습니다.',
    detail: 'b.txt 창을 닫아도 변경은 남았습니다. 두 파일의 편집과 저장을 확인했습니다.',
    lesson: multiLesson,
    question: ':w만 실행하면 저장되는 것은?',
    answers: ['현재 버퍼', '숨은 버퍼를 포함한 모든 수정 버퍼'],
    correct: 0,
    why: ':w는 현재 버퍼입니다. 모든 수정 버퍼는 :wa로 저장합니다.',
  },
  {
    label: '3 / 3 · 파일을 오가며 마무리하기',
    recap: '여러 파일을 다룰 준비를 마쳤습니다.',
    detail:
      '두 파일을 편집하고 notes.txt를 보존했습니다. 자유 작업 공간에서는 별도 개인 파일을 만들고 저장할 수 있습니다.',
    workspaceNote:
      '아래 자유 연습에서는 기존 개인 파일을 그대로 엽니다. 이 문제의 파일은 자동 복사하지 않습니다. 파일 목록에서 새 파일을 만들고 :w로 저장하면 이 브라우저에 보관됩니다.',
    lesson: {
      title: bufferWorkshop.title,
      reference,
      showBuffers: true,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          ...multiCourse,
          files: { ...multiCourse.files, 'notes.txt': 'Leave this file unchanged.' },
          targets: { ...multiCourse.targets, 'notes.txt': 'Leave this file unchanged.' },
          protectedFiles: ['notes.txt'],
          title: '두 파일을 고치고 창 하나로 마무리하세요.',
          description:
            'a.txt와 b.txt의 old를 new로 바꾸고 모두 저장하세요. notes.txt는 그대로 두고, 마지막에는 창 하나만 남깁니다.',
          expected: 'a.txt와 b.txt 저장 · notes.txt 보존 · 창 하나',
        },
      },
      challengeHints: [
        ':ls와 Enter로 버퍼 목록을 확인하세요. 메시지가 기다리면 Enter로 돌아옵니다.',
        ':buffer b.txt와 Enter로 기존 버퍼를 현재 창에 보여줄 수 있습니다. 창은 늘어나지 않습니다.',
        '한쪽을 고친 뒤 :buffer a.txt로 다른 버퍼를 열어 편집하세요. :split /work/b.txt로 함께 봐도 됩니다.',
        '창이 여러 개면 :close로 정리하고 :wa로 모든 수정 버퍼를 저장합니다.',
      ],
    },
  },
];
