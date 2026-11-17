import { repetitionTransfer } from './transfer-practice.js';
export const macroWorkshop = { id: 'macro-workshop', title: '여러 동작을 묶고, 확인하며 반복하기' };
export function readableMacro(value = '') {
  return value
    .replaceAll('\u001b', '<Esc>')
    .replaceAll('\r', '<Enter>')
    .replaceAll('\n', '<Enter>');
}
const reference = [
  '점은 마지막 변경을 반복합니다. 매크로는 레지스터에 녹화한 키들을 실행하므로 이동과 여러 편집을 함께 묶을 수 있습니다.',
  'qa는 q(녹화 시작) 뒤에 a(보관함 이름)입니다. 소문자 a에 새로 녹화하면 이전 a 내용은 대체됩니다. 복사와 매크로는 같은 레지스터를 씁니다.',
  '대문자 I는 현재 줄의 첫 공백 아닌 문자 앞에서 입력합니다. 새 내용을 쓴 뒤 Esc로 나오고, j로 한 줄 내려갑니다.',
  '일반 모드의 q로 녹화를 끝냅니다. 입력 모드에서 q를 쓰면 글자 q가 들어갑니다. :q는 Vim 종료이므로 서로 다릅니다.',
  '@a는 a를 한 번 실행합니다. @@는 마지막에 실행한 매크로입니다. 먼저 한 번 실행해 내용과 끝 위치를 확인하세요.',
  '잘못 적용했다면 일반 모드에서 u로 변경을 되돌리고 결과를 확인합니다. 여러 변경이 담긴 매크로는 u가 한 번보다 더 필요할 수 있습니다. 녹화된 a 자체는 undo로 지워지지 않습니다.',
  '횟수를 붙인 2@a는 두 번 실행합니다. 중간에 남겨야 할 줄이 있으면 자동 반복이 그 줄까지 바꿀 수 있습니다. 이 단원에서는 한 번씩 적용합니다.',
];
function goal(label, title, explanation, keys, result, hints) {
  return { label, title, explanation, keys, result, hints };
}
function recordGoals(prefix) {
  return [
    goal(
      '녹화 시작',
      'a에 짧게 녹화합니다.',
      'q로 녹화를 시작하고 a를 보관함으로 고릅니다.',
      [
        ['q', '녹화'],
        ['a', '보관함 a'],
      ],
      '화면에 a 녹화 중',
      [
        '이번 문제는 새 파일과 빈 보관함으로 시작합니다.',
        '소문자 q, a를 차례로 누르세요. 콜론은 필요 없습니다.',
      ],
    ),
    goal(
      '편집 녹화',
      '줄 앞에 문구를 붙입니다.',
      '대문자 I로 줄 앞에 씁니다. 공백까지 쓰고 Esc로 나옵니다.',
      [
        ['I', '줄 앞 입력'],
        [prefix, '끝에 공백'],
        ['Esc', '입력 끝'],
      ],
      '첫 줄만 변경 · 녹화는 계속',
      [
        'I는 소문자 i와 다릅니다. 커서의 가로 위치와 관계없이 줄 앞에서 시작합니다.',
        `I를 누른 뒤 ${prefix}를 입력하고 Esc를 누르세요.`,
      ],
    ),
    goal(
      '이동 녹화',
      '다음 줄로 이동합니다.',
      'j로 한 줄 내려갑니다. 이 이동까지 녹화해야 다음 줄에서 다시 시작할 수 있습니다.',
      [['j', '한 줄 아래']],
      '두 번째 줄에 커서 · 녹화는 계속',
      [
        '매크로가 끝나는 위치는 다음 실행의 시작 위치입니다.',
        '일반 모드에서 소문자 j를 한 번 누르세요.',
      ],
    ),
    goal(
      '녹화 종료',
      '일반 모드에서 q로 끝냅니다.',
      '이제 녹화를 멈춥니다. :q가 아니라 일반 모드의 q입니다.',
      [['q', '녹화 끝']],
      'a 내용에 편집과 j가 함께 보입니다.',
      ['입력 모드라면 먼저 Esc로 나오세요.', 'q를 한 번 누르면 녹화 표시가 꺼집니다.'],
    ),
  ];
}
const replay = goal(
  '한 번 실행',
  'a를 한 번 실행해봅니다.',
  '@로 실행할 보관함을 고르고 a를 누릅니다. 바뀐 줄과 커서 위치를 확인하세요.',
  [
    ['@', '실행'],
    ['a', '보관함 a'],
  ],
  '두 번째 줄 변경 · 다음 줄로 이동',
  ['점과 달리 녹화한 j 이동도 실행됩니다.', '골뱅이 @, 소문자 a를 차례로 누르세요.'],
);
const save = goal(
  '저장',
  '남길 줄을 확인하고 저장합니다.',
  'note는 그대로여야 합니다. 녹화가 끝났는지도 확인하세요.',
  [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  '목표 내용 저장 · 녹화 종료',
  [
    '매크로 녹화는 파일 저장과 별개입니다.',
    '녹화 중이면 일반 모드에서 q로 끝낸 뒤 :w와 Enter로 저장하세요.',
  ],
);
function recordStage(snap, initial, first) {
  const text = snap?.lines.join('\n');
  if (snap?.recording) {
    if (text === initial || snap.mode.startsWith('i')) return 1;
    if (text === first) return snap.cursor?.[0] === 1 ? 2 : 3;
    return 3;
  }
  if (text === initial) return 0;
  if (text === first) return snap.registerA ? 4 : null;
  return null;
}
function lesson(file, initial, target, goals, stage) {
  return {
    title: macroWorkshop.title,
    showMacro: true,
    reference,
    practice: { guided: { file, initial, target } },
    guidedGoals: goals,
    guidedStage: stage,
    challengeHints: [],
  };
}
const initial = 'api\nweb\nnote: keep';
const first = 'enabled: api\nweb\nnote: keep';
const target = 'enabled: api\nenabled: web\nnote: keep';
const initial2 = 'api\nweb\nnote: keep\njob';
const first2 = 'active: api\nweb\nnote: keep\njob';
const second2 = 'active: api\nactive: web\nnote: keep\njob';
const target2 = 'active: api\nactive: web\nnote: keep\nactive: job';
const recovery = {
  ...goal(
    '편집 복구',
    '편집 내용을 먼저 복구합니다.',
    '예상한 내용과 다릅니다. Esc로 나온 뒤 u로 되돌리고 안내를 확인하세요.',
    [
      ['Esc', '일반 모드'],
      ['u', '변경 복구'],
    ],
    '원래 내용이 되면 다시 녹화할 수 있습니다.',
    [
      '현재 내용 점검으로 다른 줄을 비교할 수도 있습니다.',
      '원래 내용으로 돌아오면 qa로 다시 녹화하세요. 이전 a의 잘못된 녹화는 새 내용으로 바뀝니다.',
    ],
  ),
  recovery: true,
};
const coreLessons = [
  {
    label: '1 / 3 · 녹화하고 한 번 확인하기',
    recap: '편집 뒤의 이동도 함께 반복했습니다.',
    detail:
      'api와 web 앞에 enabled: 를 붙이고 note는 남겼습니다. 이 예시의 매크로는 편집 후 j로 다음 줄로 이동하도록 녹화합니다.',
    lesson: lesson(
      'record.txt',
      initial,
      target,
      [...recordGoals('enabled: '), replay, save, recovery],
      (snap) => {
        if (snap?.recording) return recordStage(snap, initial, first);
        if (snap?.lines.join('\n') === target) return 5;
        return recordStage(snap, initial, first) ?? 6;
      },
    ),
    question: '이 예시에서 점과 @a가 다른 점은?',
    answers: ['@a에는 녹화한 j 이동도 포함됩니다.', '점은 방금 했던 이동까지 모두 재현합니다.'],
    correct: 0,
    why: '점은 마지막 변경, @a는 a에 녹화한 키들을 실행합니다. 매크로 내용에 따라 이동도 함께 실행됩니다.',
  },
  {
    label: '2 / 3 · 남길 줄은 건너뛰기',
    recap: '반복할 위치는 직접 골랐습니다.',
    detail:
      'api·web·job에는 active: 를 붙이고 note는 남겼습니다. 중간에 예외가 있을 때는 현재 줄을 확인하고 다음 대상에서 재생합니다.',
    lesson: lesson(
      'skip.txt',
      initial2,
      target2,
      [
        ...recordGoals('active: '),
        replay,
        goal(
          '예외 확인',
          'note에서는 실행하지 않습니다.',
          'note를 남겨야 합니다. j로 다음 job 줄에 이동하세요.',
          [['j', 'note 건너뛰기']],
          'job 줄에서 다음 실행 준비',
          [
            '@@는 예외를 판단하지 않고 녹화한 키를 다시 실행합니다.',
            '현재 note 줄이면 j를 한 번 눌러 job으로 가세요.',
          ],
        ),
        goal(
          '실수 복구',
          'note에 적용한 변경을 되돌립니다.',
          '이 예시에서는 u 한 번으로 방금 붙인 문구를 되돌릴 수 있습니다.',
          [['u', '마지막 변경 복구']],
          'note: keep 복원 · a는 유지',
          [
            '일반 모드로 나온 뒤 실제로 복구된 줄을 확인하세요.',
            'u로 note를 복구하고 job 줄에서만 매크로를 실행하세요.',
          ],
        ),
        goal(
          '다시 실행',
          'job에서 마지막 매크로를 실행합니다.',
          '@@는 마지막으로 실행한 매크로를 다시 실행합니다.',
          [
            ['@', '실행'],
            ['@', '마지막 매크로'],
          ],
          'job만 변경 · note는 그대로',
          ['첫 번째 @ 뒤에 레지스터 이름 대신 @를 다시 씁니다.', '골뱅이 두 개를 이어 누르세요.'],
        ),
        save,
        recovery,
      ],
      (snap) => {
        const text = snap?.lines.join('\n');
        if (snap?.recording) return recordStage(snap, initial2, first2);
        if (text === target2) return 8;
        if (snap?.lines[2] === 'active: note: keep') return 6;
        if (text === second2) return snap.cursor?.[0] === 4 ? 7 : 5;
        return recordStage(snap, initial2, first2) ?? 9;
      },
    ),
    question: 'note에서 @@를 실행했다면 어떻게 복구할까요?',
    answers: [
      '다시 @@를 실행하면 원래대로 돌아옵니다.',
      'u로 파일 변경을 되돌린 뒤 위치를 확인합니다.',
    ],
    correct: 1,
    why: '@@는 같은 작업을 더 적용합니다. undo 뒤에도 a의 녹화 내용은 남으므로 위치를 다시 고르세요.',
  },
  {
    label: '3 / 3 · 내 손으로 묶어서 적용하기',
    recap: '세 대상에만 변경을 적용했습니다.',
    detail:
      'dev·prod·worker 앞에 done: 를 붙이고 설명 줄은 보존했습니다. 저장 결과와 녹화 종료까지 확인했습니다.',
    lesson: {
      title: macroWorkshop.title,
      showMacro: true,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'tasks.txt',
          initial: 'dev\nnote: keep\nprod\nworker',
          target: 'done: dev\nnote: keep\ndone: prod\ndone: worker',
          title: '대상 세 줄을 완료 처리하세요.',
          description:
            'dev·prod·worker 앞에 done: 와 공백을 붙이고 저장하세요. note는 남깁니다. 첫 줄에서 녹화하고, 이후 실행할 위치를 고르세요.',
          expected: '대상 세 줄에 done: · note 보존 · 녹화 종료 · 저장',
        },
      },
      challengeHints: [
        '먼저 반복할 한 덩어리를 정하세요. 줄 앞에 문구를 쓰고 다음 줄로 이동하는 작업입니다.',
        'qa로 시작하고 I로 done: 와 공백을 씁니다. Esc, j 다음 일반 모드의 q로 녹화를 끝냅니다.',
        'note에서는 j로 건너뛰세요. prod에서 @a를 한 번 실행하고 worker에서 @@로 반복할 수 있습니다.',
        '잘못 적용하면 u로 결과를 확인하며 되돌립니다. 녹화를 끝내고 :w와 Enter로 저장하세요.',
      ],
    },
  },
];

export const macroLessons = [...coreLessons, repetitionTransfer].map((part, index, all) => ({
  ...part,
  label: `${index + 1} / ${all.length} · ${part.label.replace(/^\d+ \/ \d+ · /, '')}`,
}));
