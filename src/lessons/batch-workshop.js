export const batchWorkshop = { id: 'batch-workshop', title: '목록을 정하고 함께 바꾸기' };
const reference = [
  'arglist는 명령을 반복할 파일 목록입니다. 열린 모든 버퍼와 다릅니다. :args 뒤에 파일 경로를 공백으로 구분해 목록을 정합니다.',
  ':args만 실행하면 현재 목록을 볼 수 있습니다. :first는 첫 파일, :next는 다음 파일, :last는 마지막 파일로 이동합니다. quickfix의 cnext와는 다른 목록입니다.',
  ':argdo 뒤의 명령은 목록의 각 파일에서 실행됩니다. %s/old/new/g의 %는 각 파일의 전체 줄, s는 치환, g는 한 줄의 모든 일치입니다.',
  '먼저 한 파일에서 치환 결과를 확인합니다. 목록에 들어갈 파일마다 같은 변경을 적용해도 되는지 확인한 뒤 반복하세요.',
  '치환은 버퍼를 바꾸며 바로 저장하지 않습니다. :argdo update는 목록을 순회하며 수정된 버퍼만 저장합니다. :wa는 목록 밖의 수정 버퍼도 저장합니다.',
  '여러 파일을 바꾼 뒤 u를 누르면 현재 버퍼만 되돌립니다. 다른 파일의 변경은 그 파일로 이동해 따로 되돌려야 합니다. 문제 초기화는 이번 문제의 모든 파일을 처음으로 돌립니다.',
  '명령 도중 오류가 나도 앞서 바뀐 파일이 자동으로 복구되지 않습니다. 파일별 편집 내용과 저장 상태를 확인하세요. 이 연습의 두 대상 파일에는 모두 찾을 단어가 있습니다.',
  '치환의 e 옵션은 패턴이 없는 오류를 억제할 때 쓸 수 있지만, 이 연습에서는 오류를 숨기기 전에 대상을 확인합니다.',
  '여러 변경·저장 메시지 뒤 Enter를 기다리면 Enter로 편집 화면에 돌아옵니다. 다른 파일로 이동해도 hidden 설정 덕분에 미저장 버퍼는 남습니다.',
];
const goal = (label, title, explanation, keys, result, hints = []) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
const recovery = {
  ...goal(
    '복구',
    '파일별 변경을 확인합니다.',
    '잘못 바꾼 파일에서 u로 되돌립니다. 다른 파일의 변경도 따로 확인하세요.',
    [['u', '현재 버퍼 되돌리기']],
    '보존할 파일과 줄은 그대로',
    [
      '현재 내용 점검으로 다른 파일을 찾으세요.',
      '목록 밖 파일은 :e /work/notes.txt와 Enter로 열 수 있습니다.',
    ],
  ),
  recovery: true,
};
const escape = {
  ...goal(
    '입력 마치기',
    '일반 모드로 돌아옵니다.',
    'Esc로 입력을 마친 뒤 내용을 확인하세요.',
    [['Esc', '일반 모드']],
    '편집한 내용 확인',
    ['치환 명령은 일반 모드에서 콜론으로 시작합니다.'],
  ),
  recovery: true,
};
const acknowledge = {
  ...goal(
    '메시지 확인',
    '메시지를 확인합니다.',
    'Enter로 편집 화면에 돌아오세요.',
    [['Enter', '계속']],
    '일반 모드로 돌아오기',
    ['메시지 확인은 저장을 취소하지 않습니다.'],
  ),
  recovery: true,
};
const substitute = [
  goal(
    '줄 범위',
    '파일의 전체 줄을 고릅니다.',
    '%는 전체 줄, s는 치환입니다. 슬래시 다음에 찾을 단어를 넣습니다.',
    [['%s/', '전체 줄에서 치환']],
    '찾을 단어를 입력할 자리',
    ['%는 파일 목록 전체가 아니라 현재 파일의 전체 줄입니다.'],
  ),
  goal(
    '찾을 단어',
    'old를 찾습니다.',
    'old 뒤 슬래시로 찾을 단어를 구분합니다.',
    [['old/', '찾을 단어']],
    '바꿀 단어를 입력할 자리',
    ['대소문자를 포함해 예시대로 입력하세요.'],
  ),
  goal(
    '바꿀 단어',
    'new로 모두 바꿉니다.',
    'g는 한 줄의 모든 일치를 바꿉니다. Enter로 실행하세요.',
    [
      ['new/g', '바꿀 단어 · 모든 일치'],
      ['Enter', '실행'],
    ],
    'mode와 backup이 모두 new',
    ['g가 없으면 각 줄의 첫 old만 바뀝니다.'],
  ),
];
function subStage(command, offset) {
  if (!command.includes('%s/')) return offset;
  if (!command.includes('%s/old/')) return offset + 1;
  return offset + 2;
}
const initial = 'mode=old backup=old\nnote: keep';
const target = 'mode=new backup=new\nnote: keep';
export const batchFiles = ['/work/api.txt', '/work/web.txt'];
export const correctBatchList = (s) =>
  s?.argumentFiles?.length === 2 && batchFiles.every((path, i) => s.argumentFiles[i] === path);
const course = (from = 'old', to = 'new') => ({
  file: 'api.txt',
  initial: `mode=${from} backup=${from}\nnote: keep`,
  files: {
    'web.txt': `mode=${from} backup=${from}\nnote: keep`,
    'notes.txt': `mode=${from} backup=${from}\nnote: keep`,
  },
  target: `mode=${to} backup=${to}\nnote: keep`,
  targets: {
    'api.txt': `mode=${to} backup=${to}\nnote: keep`,
    'web.txt': `mode=${to} backup=${to}\nnote: keep`,
    'notes.txt': `mode=${from} backup=${from}\nnote: keep`,
  },
  protectedFiles: ['notes.txt'],
});
const multi = course();
const listGoals = [
  goal(
    '파일 목록',
    '작업할 파일 목록을 정합니다.',
    '콜론 뒤 args와 공백을 입력합니다. 열린 버퍼와는 별개인 목록입니다.',
    [[':args ', '끝에 공백']],
    'api와 web만 대상으로 지정',
    ['현재 목록에 notes가 있다면 제외해야 합니다.'],
  ),
  goal(
    '첫 파일',
    'api.txt를 목록에 넣습니다.',
    '첫 경로 뒤에 공백을 넣고 다음 파일을 이어 씁니다.',
    [['/work/api.txt ', '끝에 공백']],
    '첫 파일 api.txt',
    ['경로 사이의 공백이 파일들을 구분합니다.'],
  ),
  goal(
    '두 번째 파일',
    'web.txt까지 지정합니다.',
    'Enter로 목록을 확정합니다. notes.txt는 제외합니다.',
    [
      ['/work/web.txt', '두 번째 파일'],
      ['Enter', '목록 확정'],
    ],
    '목록 api.txt · web.txt',
    ['완성된 명령은 :args /work/api.txt /work/web.txt입니다.'],
  ),
];
const allGoals = [
  ...listGoals,
  goal(
    '반복 명령',
    '목록의 각 파일에서 실행합니다.',
    'argdo 뒤에 각 파일에서 실행할 치환 명령을 이어 씁니다.',
    [[':argdo ', '끝에 공백']],
    '두 파일에 같은 명령',
    ['아직 Enter를 누르지 않고 %s/를 이어 씁니다.'],
  ),
  ...substitute,
  goal(
    '저장 범위',
    '목록의 파일만 저장합니다.',
    '바뀐 내용을 확인했다면 argdo 뒤에 저장 명령을 붙입니다.',
    [[':argdo ', '끝에 공백']],
    '두 파일을 순회하며 저장',
    ['텍스트 보기에서 각 파일의 편집 내용과 저장본을 비교할 수 있습니다.'],
  ),
  goal(
    '저장 실행',
    '수정된 버퍼를 저장합니다.',
    'update는 수정된 경우에만 저장합니다. Enter로 실행하세요.',
    [
      ['update', '수정된 버퍼 저장'],
      ['Enter', '실행'],
    ],
    '대상 두 파일 저장 · notes 보존',
    ['완성된 명령은 :argdo update입니다.'],
  ),
  acknowledge,
  recovery,
  escape,
];
export const batchLessons = [
  {
    label: '1 / 3 · 한 파일에서 확인하기',
    recap: '한 줄의 두 항목을 모두 바꿨습니다.',
    detail:
      '%는 전체 줄이고 g는 각 줄의 모든 일치입니다. 먼저 한 파일에서 치환 결과를 확인했습니다.',
    lesson: {
      title: batchWorkshop.title,
      reference,
      practice: { guided: { file: 'sample.txt', initial, target } },
      guidedGoals: [
        goal(
          '명령줄',
          '콜론으로 명령줄을 엽니다.',
          '치환 명령은 일반 모드에서 콜론으로 시작합니다.',
          [[':', '명령줄']],
          '파일을 바꿀 명령 입력',
          ['Esc로 일반 모드에 돌아온 뒤 콜론을 누르세요.'],
        ),
        ...substitute,
        goal(
          '저장',
          '확인한 결과를 저장합니다.',
          'mode와 backup이 모두 new인지 보고 저장하세요.',
          [
            [':w', '현재 파일 저장'],
            ['Enter', '실행'],
          ],
          'note는 그대로 · 파일 저장',
          ['g를 빠뜨렸다면 남은 old에 같은 치환을 다시 실행할 수 있습니다.'],
        ),
        recovery,
        escape,
      ],
      challengeHints: [],
      guidedStage(s) {
        if (s.mode.startsWith('i')) return 6;
        const text = s.lines.join('\n');
        if (text === target) return 4;
        if (![initial, 'mode=new backup=old\nnote: keep'].includes(text)) return 5;
        if (s.mode === 'c' && s.commandType === ':') return subStage(s.command, 1);
        return 0;
      },
    },
    question: '한 줄에 old가 두 번 있으면 g는 어떤 역할인가요?',
    answers: ['그 줄의 모든 일치 항목을 바꿉니다.', '자동으로 모든 파일을 찾습니다.'],
    correct: 0,
    why: 'g는 각 줄의 일치 범위이고, 파일 목록은 args로 따로 정합니다.',
  },
  {
    label: '2 / 3 · 두 파일에 반복하기',
    recap: '대상 목록에만 변경을 적용했습니다.',
    detail:
      'arglist를 두 파일로 한정하고 argdo로 치환했습니다. 변경을 확인한 뒤 argdo update로 저장했으며 notes는 그대로 남겼습니다.',
    lesson: {
      title: batchWorkshop.title,
      showBatch: true,
      reference,
      practice: { guided: multi },
      guidedGoals: allGoals,
      challengeHints: [],
      guidedStage(s) {
        if (s.mode === 'r') return 9;
        if (s.mode.startsWith('i')) return 11;
        const buffers = { ...s.buffers, [s.path.replace('/work/', '')]: s.lines.join('\n') };
        const valid = Object.entries(multi.targets).every(
          ([name, value]) =>
            buffers[name] === value ||
            buffers[name] === initial ||
            (name !== 'notes.txt' && buffers[name] === 'mode=new backup=old\nnote: keep'),
        );
        if (!valid || buffers['notes.txt'] !== initial) return 10;
        const cmd = s.command ?? '';
        if (!correctBatchList(s)) {
          if (!cmd.startsWith('args ')) return 0;
          return cmd.includes('/work/api.txt ') ? 2 : 1;
        }
        const done = Object.entries(multi.targets).every(
          ([name, value]) => buffers[name] === value,
        );
        if (done) return cmd.startsWith('argdo ') ? 8 : 7;
        if (!cmd.startsWith('argdo ')) return 3;
        return subStage(cmd, 4);
      },
    },
    question: '두 파일을 바꾼 뒤 u를 한 번 누르면?',
    answers: ['모든 파일이 한꺼번에 돌아갑니다.', '현재 버퍼의 변경만 되돌립니다.'],
    correct: 1,
    why: '다른 파일의 변경은 그 파일로 이동해 따로 복구합니다.',
  },
  {
    label: '3 / 3 · 대상 파일만 바꾸기',
    recap: '바꿀 파일과 남길 파일을 구분했습니다.',
    detail:
      'api와 web의 draft는 final로 바꾸고 notes는 보존했습니다. 각 파일의 결과와 저장을 모두 확인했습니다.',
    lesson: {
      title: batchWorkshop.title,
      showBatch: true,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          ...course('draft', 'final'),
          title: '두 파일의 draft를 바꾸세요.',
          description:
            'api와 web의 draft를 모두 final로 바꾸고 저장하세요. notes.txt와 각 note 줄은 그대로 남깁니다.',
          expected: 'api·web 모두 final · notes는 draft 유지',
        },
      },
      challengeHints: [
        'args로 api.txt와 web.txt 두 파일만 지정하세요.',
        'argdo 뒤 %s/draft/final/g를 이어 쓰고 Enter로 실행할 수 있습니다.',
        '현재 내용 점검과 텍스트 보기로 각 파일을 확인하세요.',
        'argdo update로 목록 안의 수정 버퍼를 저장합니다. 잘못 바꾼 notes는 직접 열어 u로 복구하세요.',
      ],
    },
  },
];
