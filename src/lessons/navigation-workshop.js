export const navigationWorkshop = {
  id: 'navigation-workshop',
  title: '멀리 이동하고, 다시 돌아오기',
};
export const navigationSample = 'start\n  alpha = old\nmiddle\n  omega = old\nend';
const target = navigationSample.replace('old', 'new');
const reference = [
  'ma는 m(mark) 뒤에 a(표시 이름)입니다. 현재 파일의 줄과 칸을 기억합니다. mark a와 복사·매크로 보관함 a는 별개입니다.',
  "'a는 작은따옴표와 a입니다. 표시한 줄의 첫 공백 아닌 문자로 갑니다. `a는 백틱과 a이며 표시한 정확한 칸으로 갑니다. 백틱은 보통 숫자 1 왼쪽 키입니다.",
  'G는 마지막 줄, gg는 첫 줄입니다. 검색과 이런 큰 이동은 점프 기록에 남습니다. j·k 같은 한 줄 이동이 모두 기록되는 것은 아닙니다.',
  'Ctrl+o는 이전 점프 위치, Ctrl+i는 그 기록의 다음 위치입니다. Ctrl을 누른 채 영문자를 누르세요. Ctrl+i는 터미널에서 Tab과 같은 코드일 수 있습니다.',
  'Ctrl+o는 파일 내용을 되돌리지 않습니다. 편집을 취소하는 u와 다릅니다. 다시 올 장소를 직접 고르려면 mark, 최근 점프를 따라가려면 이동 기록을 씁니다.',
  ':marks와 :jumps를 입력하고 Enter로 실제 목록도 볼 수 있습니다. 소문자 mark는 파일별로 따로 존재합니다. 이 단원은 영문 예시이므로 화면의 칸은 Vim의 열 위치와 같습니다.',
];
function goal(label, title, explanation, keys, result, hints) {
  return { label, title, explanation, keys, result, hints };
}
const search = goal(
  '찾기',
  'alpha의 old로 이동합니다.',
  '/로 검색을 열고 old를 찾습니다. Enter로 위치를 확정하세요.',
  [
    ['/', '검색'],
    ['old', '찾을 단어'],
    ['Enter', '확정'],
  ],
  '2행 11열 · alpha의 old',
  [
    '검색 중에는 아직 Enter로 확정하지 않은 상태일 수 있습니다.',
    '슬래시, old, Enter를 순서대로 입력하세요.',
  ],
);
const end = goal(
  '멀리 이동',
  '파일 끝으로 이동합니다.',
  '대문자 G를 누릅니다. 파일 내용은 바뀌지 않고 커서만 움직입니다.',
  [['G', '마지막 줄']],
  '5행 1열 · end',
  ['소문자 g 한 번과는 다른 명령입니다.', 'Shift를 누른 채 g를 눌러 대문자 G를 입력하세요.'],
);
const edit = goal(
  '돌아와서 편집',
  'alpha의 old만 new로 바꿉니다.',
  'c, i, w로 단어 안쪽을 비웁니다. new를 쓰고 Esc로 마칩니다.',
  [
    ['c', '바꾸기'],
    ['i', '안쪽'],
    ['w', '단어'],
    ['new', '새 내용'],
    ['Esc', '입력 끝'],
  ],
  'alpha만 new · omega는 old',
  ['커서가 alpha의 old 위인지 먼저 확인하세요.', 'ciw를 누르고 new를 입력한 뒤 Esc로 나오세요.'],
);
const save = goal(
  '저장',
  '다른 줄을 확인하고 저장합니다.',
  'omega는 old인 채 남겨둡니다. :w로 저장하고 Enter로 마칩니다.',
  [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  'alpha만 new로 저장',
  [
    '이동과 표시만으로 파일 내용이 바뀌지는 않습니다.',
    '콜론, w, Enter로 편집한 파일을 저장하세요.',
  ],
);
function at(snap, row, col) {
  return snap?.mode === 'n' && snap.cursor?.[0] === row && snap.cursor?.[1] === col;
}
function lesson(file, goals, guidedStage) {
  return {
    title: navigationWorkshop.title,
    showNavigation: true,
    reference,
    practice: { guided: { file, initial: navigationSample, target } },
    guidedGoals: goals,
    guidedStage,
    challengeHints: [],
  };
}
export const navigationLessons = [
  {
    label: '1 / 3 · 다시 올 위치 표시하기',
    recap: '줄과 정확한 위치를 구분했습니다.',
    detail:
      'alpha의 old 위치에 a를 표시했습니다. 작은따옴표는 그 줄의 첫 공백 아닌 문자, 백틱은 표시한 정확한 칸으로 돌아갑니다.',
    lesson: lesson(
      'mark.txt',
      [
        search,
        goal(
          '위치 표시',
          '현재 위치를 a로 기억합니다.',
          'm 뒤에 a를 눌러 표시합니다. 복사 보관함 a와는 별개입니다.',
          [
            ['m', 'mark'],
            ['a', '표시 이름'],
          ],
          'mark a: 2행 11열',
          [
            '위치를 표시하는 m은 파일 내용이나 복사 보관함을 바꾸지 않습니다.',
            '소문자 m, a를 차례로 누르세요.',
          ],
        ),
        end,
        goal(
          '줄로 복귀',
          '표시한 줄로 돌아옵니다.',
          '작은따옴표 뒤에 a를 누릅니다. 앞의 공백 다음 첫 글자로 갑니다.',
          [
            ["'", '작은따옴표'],
            ['a', '표시 a'],
          ],
          '2행 3열 · alpha의 a',
          [
            '작은따옴표는 표시한 열까지 복원하지 않습니다.',
            '작은따옴표와 a를 누르세요. 백틱과 다른 키입니다.',
          ],
        ),
        goal(
          '칸으로 복귀',
          '이번에는 정확한 칸으로 갑니다.',
          '백틱 뒤에 a를 누릅니다. 표시했던 old의 첫 칸으로 돌아갑니다.',
          [
            ['`', '백틱'],
            ['a', '표시 a'],
          ],
          '2행 11열 · old의 o',
          [
            '백틱은 보통 숫자 1 왼쪽에 있습니다.',
            '백틱과 a를 순서대로 누르세요. 화면의 현재 위치와 mark a가 같아집니다.',
          ],
        ),
        edit,
        save,
      ],
      (snap, previous = 0) => {
        if (snap?.lines.join('\n') === target) return snap.mode.startsWith('i') ? 5 : 6;
        if (snap?.lines.join('\n') !== navigationSample) return null;
        const marked = snap.markA?.[0] === 2 && snap.markA?.[1] === 11;
        if (!marked) return at(snap, 2, 11) ? 1 : 0;
        if (at(snap, 5, 1)) return 3;
        if (at(snap, 2, 3)) return 4;
        if (at(snap, 2, 11)) return previous >= 3 ? 5 : 2;
        return null;
      },
    ),
    question: '표시한 old의 정확한 칸으로 돌아가는 것은?',
    answers: ["'a — 작은따옴표와 a", '`a — 백틱과 a'],
    correct: 1,
    why: '작은따옴표는 줄의 첫 공백 아닌 문자, 백틱은 표시한 열까지 복원합니다.',
  },
  {
    label: '2 / 3 · 이동 기록 따라가기',
    recap: '위치를 되돌려도 편집을 취소하지는 않습니다.',
    detail:
      'G로 멀리 이동한 뒤 Ctrl+o로 이전 위치, Ctrl+i로 다음 위치를 따라갔습니다. 직접 표시를 남기는 mark와는 다른 방법입니다.',
    lesson: lesson(
      'jumps.txt',
      [
        search,
        end,
        goal(
          '이전 점프',
          '이전 위치로 돌아갑니다.',
          'Ctrl을 누른 채 소문자 o를 누릅니다. G 이전의 old 위치로 돌아갑니다.',
          [['Ctrl+o', '동시에 누르기']],
          '2행 11열 · 파일 내용 그대로',
          [
            'o는 older, 이전 기록으로 생각하면 됩니다.',
            'Ctrl을 누른 채 o를 한 번 누르세요. o라는 글자를 입력하는 것이 아닙니다.',
          ],
        ),
        goal(
          '다음 점프',
          '다음 기록으로 다시 갑니다.',
          'Ctrl을 누른 채 i를 누릅니다. 방금 되돌아온 기록에서 앞으로 갑니다.',
          [['Ctrl+i', '동시에 누르기']],
          '5행 1열 · end',
          ['Ctrl+i는 입력 모드의 i와 다릅니다.', 'Ctrl을 누른 채 i를 한 번 누르세요.'],
        ),
        goal(
          '다시 돌아오기',
          '편집할 위치로 돌아옵니다.',
          'Ctrl+o로 old 위치에 돌아와 편집을 이어갑니다.',
          [['Ctrl+o', '이전 점프']],
          '2행 11열 · alpha의 old',
          [
            '점프 기록을 따라가는 기능은 파일 내용을 되돌리지 않습니다.',
            'Ctrl을 누른 채 o를 누르고 현재 위치를 확인하세요.',
          ],
        ),
        edit,
        save,
      ],
      (snap, previous = 0) => {
        if (snap?.lines.join('\n') === target) return snap.mode.startsWith('i') ? 5 : 6;
        if (snap?.lines.join('\n') !== navigationSample) return null;
        if (at(snap, 5, 1)) return previous >= 3 ? 4 : 2;
        if (at(snap, 2, 11)) return previous >= 4 ? 5 : previous >= 2 ? 3 : 1;
        return null;
      },
    ),
    question: 'Ctrl+o와 u는 무엇이 다른가요?',
    answers: [
      'Ctrl+o는 점프 위치, u는 편집 변경을 되돌립니다.',
      '둘 다 방금 편집한 내용을 취소합니다.',
    ],
    correct: 0,
    why: '이동 기록과 편집 이력은 별개입니다. 파일이 바뀌었는지는 내용으로 확인하세요.',
  },
  {
    label: '3 / 3 · 돌아와서 필요한 곳만 편집하기',
    recap: '돌아갈 위치를 정하고 편집을 마쳤습니다.',
    detail:
      'left의 draft만 final로 바꾸고 right는 그대로 남겼습니다. 표시와 이동 기록은 상황에 맞게 골라 쓸 수 있습니다.',
    lesson: {
      title: navigationWorkshop.title,
      showNavigation: true,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'return.txt',
          initial: 'start\n  left = draft\nmiddle\n  right = draft\nend',
          target: 'start\n  left = final\nmiddle\n  right = draft\nend',
          title: 'left만 final로 바꾸세요.',
          description:
            'left의 draft에 a를 표시하세요. 끝으로 갔다가 돌아와 final로 바꾸고 저장합니다. right는 그대로 남깁니다.',
          expected: 'left = final · right = draft · 저장 완료',
        },
      },
      challengeHints: [
        'draft를 검색하면 먼저 left의 단어로 갑니다. Enter로 검색을 확정하세요.',
        'ma로 현재 위치를 표시하고 G로 마지막 줄로 이동해보세요.',
        '백틱과 a로 정확한 칸에 돌아올 수 있습니다. Ctrl+o로 이전 점프를 따라가도 됩니다.',
        'ciw로 단어를 비우고 final을 입력한 뒤 Esc로 나옵니다. :w와 Enter로 저장하세요.',
      ],
    },
  },
];
