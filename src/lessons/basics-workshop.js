export const basicsWorkshop = { id: 'basics-workshop', title: '모드를 알고, 편집하고 저장하기' };
const reference = [
  '일반 모드는 키로 동작을 지시하는 상태입니다. i는 insert, 즉 입력 모드로 들어가는 명령입니다. 인터랙티브 모드라는 이름은 쓰지 않습니다.',
  '입력 모드에서는 글자가 들어갑니다. Esc는 내용을 유지한 채 일반 모드로 돌아옵니다. 저장하거나 변경을 되돌리는 키가 아닙니다.',
  '일반 모드의 w는 다음 단어로 이동합니다. 저장하려면 :로 명령줄을 열고 w를 입력한 뒤 Enter로 실행합니다.',
  'u는 마지막 변경을 되돌립니다. Ctrl+r는 Ctrl을 누른 채 r을 눌러 되돌린 변경을 다시 적용합니다. 저장 후에도 undo 이력은 남아 있습니다.',
  '0은 숫자 영으로 줄 맨 앞으로 이동합니다. 이 연습에서는 첫 줄 맨 앞에서 i로 입력합니다.',
  ':w는 현재 연습 파일을 저장하며 종료하지 않습니다. :q는 종료, :wq는 저장 후 종료, :q!는 미저장 변경을 버리고 종료합니다. !가 모든 문맥에서 무조건 강제를 뜻하지는 않습니다.',
  '이 단원은 문제를 나가면 연습 파일을 남기지 않습니다. 내 파일을 보관하려면 자유 작업 공간을 사용하세요.',
];
const goal = (label, title, explanation, keys, result, hints = []) => ({
  label,
  title,
  explanation,
  keys,
  result,
  hints,
});
function lesson(initial, undo = false) {
  const target = `Vim ${initial}`;
  const goals = [
    goal(
      '입력 시작',
      '글자를 넣을 모드로 들어갑니다.',
      '일반 모드에서 i는 입력 시작입니다. 첫 줄 맨 앞에서 시작합니다.',
      [['i', '입력 모드']],
      '입력 모드 표시',
      ['커서가 옮겨졌다면 Esc, 숫자 0, i로 줄 맨 앞에서 다시 시작하세요.'],
    ),
    goal(
      '텍스트 입력',
      'Vim과 공백 하나를 붙입니다.',
      'Vim을 쓰고 Space를 한 번 누르세요. 다 썼다면 Esc로 입력을 마칩니다.',
      [
        ['Vim', '입력할 글자'],
        ['Space', '공백 하나'],
        ['Esc', '일반 모드로'],
      ],
      target,
      ['이미 쓴 글자는 다시 쓰지 마세요. 공백까지 넣었으면 Esc만 누릅니다.'],
    ),
    goal(
      '되돌리기',
      '방금 넣은 글자를 되돌립니다.',
      'u는 마지막 변경을 되돌립니다. Esc로 나왔기 때문에 글자 u가 입력되지 않습니다.',
      [['u', 'undo']],
      initial,
      [
        '이 문제는 저장 전에 undo와 redo를 비교합니다. 저장해도 undo 이력이 사라지는 것은 아닙니다.',
      ],
    ),
    goal(
      '다시 적용',
      '되돌린 변경을 다시 적용합니다.',
      'Ctrl을 누른 채 r을 누릅니다. 두 글자를 차례로 쓰는 것이 아닙니다.',
      [['Ctrl+r', 'redo · 함께 누르기']],
      target,
      ['새 편집을 시작하지 않고 Ctrl+r를 누르면 방금 되돌린 변경이 돌아옵니다.'],
    ),
    goal(
      '저장',
      '내용을 파일에 저장합니다.',
      'Esc만으로는 저장되지 않습니다. 콜론으로 명령줄을 열고 w, Enter로 실행합니다.',
      [
        [':', '명령줄 열기'],
        ['w', 'write · 저장'],
        ['Enter', '실행'],
      ],
      `${target} · 저장 완료`,
      ['일반 모드의 w는 이동입니다. 저장은 :w와 Enter입니다.'],
    ),
    {
      ...goal(
        '복구',
        '입력한 내용을 확인합니다.',
        'Esc로 나온 뒤 u로 마지막 변경을 되돌려보세요. 처음부터 다시 하려면 문제 초기화를 사용합니다.',
        [
          ['Esc', '일반 모드'],
          ['u', '마지막 변경 되돌리기'],
        ],
        `첫 줄 ${target}`,
        ['목표와 같은 글자와 공백인지 확인하세요.'],
      ),
      recovery: true,
    },
  ];
  // Keep only relevant normal steps; recovery is not counted as progress.
  if (!undo) goals.splice(2, 2);
  const save = undo ? 4 : 2,
    recovery = undo ? 5 : 3;
  return {
    title: basicsWorkshop.title,
    reference,
    challengeHints: [],
    guidedGoals: goals,
    practice: { guided: { file: undo ? 'undo.txt' : 'hello.txt', initial, target } },
    guidedStage(s, previous = 0) {
      const text = s.lines.join('\n');
      if (text === target) {
        if (s.mode.startsWith('i')) return 1;
        if (undo && previous < 3 && s.mode === 'n' && s.modified) return 2;
        return save;
      }
      if (text === initial) {
        if (undo && [2, 3, 4].includes(previous) && s.mode === 'n') return 3;
        return s.mode.startsWith('i') ? 1 : 0;
      }
      if (s.mode.startsWith('i') && ['V', 'Vi', 'Vim'].some((prefix) => text === prefix + initial))
        return 1;
      return recovery;
    },
  };
}
export const basicsLessons = [
  {
    label: '1 / 3 · 입력과 저장',
    recap: '모드 전환과 저장을 구분했습니다.',
    detail: 'i로 입력하고 Esc로 나왔습니다. :w를 Enter로 실행해야 파일에 저장됩니다.',
    lesson: lesson('hello'),
    question: '입력한 뒤 Esc를 누르면?',
    answers: ['내용을 유지하고 일반 모드로 돌아간다', '내용을 자동으로 저장한다'],
    correct: 0,
    why: 'Esc는 모드 전환입니다. 저장은 명령줄에서 :w와 Enter로 실행합니다.',
  },
  {
    label: '2 / 3 · 되돌리기와 다시 적용',
    recap: '편집과 복구 방법을 익혔습니다.',
    detail: 'u는 undo, Ctrl+r는 redo입니다. 파일에 기록하는 저장과는 별개의 동작입니다.',
    lesson: lesson('ready', true),
    question: '일반 모드에서 w만 누르면?',
    answers: ['현재 파일을 저장한다', '다음 단어로 이동한다'],
    correct: 1,
    why: '저장은 :로 명령줄을 열고 w, Enter로 실행합니다. 같은 키도 모드에 따라 뜻이 다릅니다.',
  },
  {
    label: '3 / 3 · 혼자 편집하고 저장하기',
    recap: '모드를 직접 골라 첫 편집을 마쳤습니다.',
    detail: '첫 줄에 Vim과 공백을 붙이고, 설명 줄은 보존한 채 저장했습니다.',
    lesson: {
      title: basicsWorkshop.title,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'first.txt',
          initial: 'start\nnote: keep this line',
          target: 'Vim start\nnote: keep this line',
          title: '첫 줄 앞에 Vim을 붙여주세요.',
          description: '첫 줄을 Vim start로 만들고 저장하세요. 두 번째 설명 줄은 그대로 남깁니다.',
          expected: 'Vim start · 설명 줄 유지 · 저장 완료',
        },
      },
      challengeHints: [
        '첫 줄 맨 앞에서 i로 입력 모드에 들어갑니다.',
        'Vim과 공백 하나를 입력하고 Esc로 나옵니다.',
        '잘못 썼다면 일반 모드의 u로 되돌릴 수 있습니다.',
        ':로 명령줄을 열고 w, Enter로 저장합니다.',
      ],
    },
  },
];
