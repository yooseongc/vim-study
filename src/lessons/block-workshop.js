export const blockWorkshop = {
  id: 'block-workshop',
  title: '같은 열을 골라 함께 편집하기',
};
export const blockMode = '\u0016';
export function blockBounds(snapshot) {
  if (snapshot?.mode !== blockMode || !snapshot.visualStart?.[0]) return null;
  const [row, col] = snapshot.cursor;
  const [startRow, startCol] = snapshot.visualStart;
  const top = Math.min(row, startRow),
    bottom = Math.max(row, startRow),
    left = Math.min(col, startCol),
    right = Math.max(col, startCol);
  return { top, bottom, left, right, rows: bottom - top + 1, columns: right - left + 1 };
}
const reference = [
  'v는 문자 단위, 대문자 V는 줄 단위, Ctrl+v는 직사각형 블록 선택입니다. Ctrl을 누른 채 v를 누르세요. Shift+Ctrl만 누르는 조합이 아닙니다.',
  'j는 아래로, k는 위로, l은 오른쪽, h는 왼쪽입니다. 블록 선택 중에는 이 이동이 선택 범위를 바꿉니다. Esc는 선택만 취소합니다.',
  '블록에서 대문자 I는 선택한 왼쪽 가장자리에 입력합니다. 처음에는 첫 줄에서만 보이고, Esc로 입력을 마치면 다른 선택 줄에도 적용됩니다.',
  '블록을 고른 뒤 x로 선택한 칸들을 삭제할 수 있습니다. 이 예시에서는 번호 두 글자와 공백 한 칸, 총 세 열을 지웁니다.',
  '범위를 잘못 골랐으면 편집 전에 Esc로 취소하세요. 이미 바꿨으면 일반 모드에서 u로 되돌리고 결과를 확인합니다. Ctrl+r는 되돌린 변경을 복원합니다.',
  'gg는 첫 줄, 숫자 0은 현재 줄의 첫 칸입니다. 연습 중 위치를 잃으면 Esc, gg, 0으로 돌아와 다시 고를 수 있습니다.',
  '이 단원은 길이가 같은 영문 열을 사용합니다. 탭·한글·길이가 다른 줄에서는 화면의 열과 문자 수가 다를 수 있으므로 선택 범위를 따로 확인해야 합니다. 터미널이 Ctrl+v를 가로채면 키 전달 설정도 확인하세요.',
];
function goal(label, title, explanation, keys, result, hints) {
  return { label, title, explanation, keys, result, hints };
}
const start = goal(
  '선택 시작',
  '첫 칸에서 블록 선택을 시작합니다.',
  '1행 1열에서 Ctrl을 누른 채 v를 누르세요.',
  [['Ctrl+v', '동시에 누르기']],
  '블록 선택 모드 · 1행 × 1열',
  [
    '현재 위치가 다르면 Esc, gg, 숫자 0으로 첫 칸에 갑니다.',
    'Ctrl과 v를 함께 누르세요. 문자 v만 누르는 선택과 다릅니다.',
  ],
);
const cancel = {
  ...goal(
    '범위 수정',
    '선택 범위를 다시 고릅니다.',
    'Esc로 선택을 취소합니다. gg와 숫자 0으로 첫 칸에 돌아오세요.',
    [
      ['Esc', '선택 취소'],
      ['gg', '첫 줄'],
      ['0', '첫 칸'],
    ],
    '파일은 그대로 · 1행 1열',
    [
      '선택만 바꾼 상태라면 u로 편집을 취소할 필요가 없습니다.',
      '첫 칸에서 Ctrl+v로 다시 고르세요. note 줄은 포함하지 않습니다.',
    ],
  ),
  recovery: true,
};
const recover = {
  ...goal(
    '편집 복구',
    '바꾼 내용을 먼저 되돌립니다.',
    'Esc로 나온 뒤 u로 변경을 되돌리고 범위를 다시 확인하세요.',
    [
      ['Esc', '일반 모드'],
      ['u', '되돌리기'],
    ],
    '처음 내용으로 돌아오면 다시 선택',
    [
      '현재 내용 점검에서 목표와 다른 줄도 볼 수 있습니다.',
      'u로 복구한 다음 gg와 숫자 0으로 첫 칸에 돌아오세요.',
    ],
  ),
  recovery: true,
};
const save = goal(
  '저장',
  'note를 확인하고 저장합니다.',
  'note 줄은 그대로 남겨야 합니다. :w로 저장하세요.',
  [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  '대상 줄만 변경 · 저장 완료',
  ['블록 편집도 저장 전에는 버퍼의 변경입니다.', '콜론, w, Enter로 파일에 저장하세요.'],
);
function lesson(file, initial, target, goals, stage) {
  return {
    title: blockWorkshop.title,
    showBlock: true,
    reference,
    practice: { guided: { file, initial, target } },
    guidedGoals: goals,
    guidedStage: stage,
    challengeHints: [],
  };
}
const initial = 'api=off\nweb=off\njob=off\nnote: keep';
const first = '# api=off\nweb=off\njob=off\nnote: keep';
const target = '# api=off\n# web=off\n# job=off\nnote: keep';
const numbered = '01 api\n02 web\n03 job\nnote: keep';
const unnumbered = 'api\nweb\njob\nnote: keep';
export const blockLessons = [
  {
    label: '1 / 3 · 같은 열에 함께 입력하기',
    recap: 'Esc로 마칠 때 다른 줄에도 적용됐습니다.',
    detail:
      '세 줄의 첫 칸을 골라 #와 공백을 붙였습니다. 블록 I 입력은 첫 줄에서 시작하고, Esc로 마칠 때 선택했던 다른 줄에도 반영됩니다.',
    lesson: lesson(
      'insert.txt',
      initial,
      target,
      [
        start,
        goal(
          '줄 늘리기',
          '3행까지 선택을 늘립니다.',
          'j로 한 줄씩 내려갑니다. 열은 1열에 두고 note 앞에서 멈추세요.',
          [['j', '아래로 · 3행까지']],
          '1~3행 · 1열 · 세 칸 선택',
          [
            '현재 범위가 1~2행이면 j를 한 번 더 누릅니다.',
            'note까지 내려갔다면 Esc로 취소하고 첫 칸에서 다시 고르세요.',
          ],
        ),
        goal(
          '블록 입력',
          '대문자 I로 입력을 시작합니다.',
          '선택한 왼쪽 가장자리에 입력합니다. 소문자 i와 다른 동작입니다.',
          [['I', '대문자 I']],
          '첫 줄에서 입력 모드 시작',
          ['선택이 1~3행, 1열인지 확인하세요.', 'Shift를 누른 채 i를 눌러 대문자 I를 입력합니다.'],
        ),
        goal(
          '첫 줄 입력',
          '#와 공백을 입력합니다.',
          '지금은 첫 줄만 바뀌어 보여도 정상입니다. # 뒤에 공백을 넣으세요.',
          [['# ', '끝에 공백']],
          '첫 줄만 # api=off · 아직 입력 중',
          [
            '다른 줄에 적용하려고 직접 커서를 옮기지 마세요.',
            '샵 기호 # 다음 공백을 하나 입력합니다.',
          ],
        ),
        goal(
          '함께 적용',
          'Esc로 나머지 줄에 적용합니다.',
          '입력을 마치면 선택했던 다른 두 줄에도 같은 문구가 붙습니다.',
          [['Esc', '입력 끝 · 함께 적용']],
          '세 줄에 #와 공백 · note는 그대로',
          [
            '입력 중의 첫 줄 모습과 Esc 이후를 비교하세요.',
            'Esc를 한 번 누르고 세 줄이 모두 바뀌었는지 확인합니다.',
          ],
        ),
        save,
        cancel,
        recover,
      ],
      (snap) => {
        const text = snap?.lines.join('\n');
        if (text === target) return snap.mode.startsWith('i') ? 4 : 5;
        if (snap?.mode.startsWith('i')) return text === first ? 4 : 3;
        if (text !== initial) return 7;
        const bounds = blockBounds(snap);
        if (!bounds) return 0;
        if (bounds.top !== 1 || bounds.left !== 1 || bounds.right !== 1 || bounds.bottom > 3)
          return 6;
        return bounds.bottom === 3 ? 2 : 1;
      },
    ),
    question: '첫 줄에만 #가 보이는 입력 중에는 어떻게 하나요?',
    answers: [
      '다른 줄로 이동해서 직접 다시 입력합니다.',
      'Esc로 입력을 마치고 다른 줄의 결과를 봅니다.',
    ],
    correct: 1,
    why: '블록 I 입력은 Esc로 마칠 때 다른 선택 줄에도 반영됩니다.',
  },
  {
    label: '2 / 3 · 번호 열만 지우기',
    recap: '줄 전체가 아니라 직사각형을 지웠습니다.',
    detail:
      '세 줄의 번호와 공백만 지우고 api·web·job은 남겼습니다. 선택할 행과 열을 모두 확인해야 필요한 부분만 바꿀 수 있습니다.',
    lesson: lesson(
      'columns.txt',
      numbered,
      unnumbered,
      [
        start,
        goal(
          '직사각형 만들기',
          '3행, 3열까지 고릅니다.',
          'l로 오른쪽, j로 아래로 늘립니다. 번호와 공백 세 칸만 고르세요.',
          [
            ['l', '오른쪽 · 3열까지'],
            ['j', '아래로 · 3행까지'],
          ],
          '1~3행 · 1~3열 · 3 × 3 블록',
          [
            '숫자 두 글자와 그 뒤 공백까지가 3열입니다.',
            'l 두 번과 j 두 번으로 늘릴 수 있습니다. 화면의 범위를 확인하세요.',
          ],
        ),
        goal(
          '선택 삭제',
          '선택한 칸들만 지웁니다.',
          'x로 번호와 공백을 삭제합니다. note는 선택 밖에 있어야 합니다.',
          [['x', '블록 삭제']],
          'api · web · job · note: keep',
          ['행은 세 줄, 열도 세 칸인지 먼저 확인하세요.', '소문자 x를 한 번 누르세요.'],
        ),
        save,
        cancel,
        recover,
      ],
      (snap) => {
        const text = snap?.lines.join('\n');
        if (text === unnumbered) return 3;
        if (text !== numbered) return 5;
        const bounds = blockBounds(snap);
        if (!bounds) return 0;
        if (bounds.top !== 1 || bounds.left !== 1 || bounds.bottom > 3 || bounds.right > 3)
          return 4;
        return bounds.bottom === 3 && bounds.right === 3 ? 2 : 1;
      },
    ),
    question: '편집하기 전에 note까지 선택한 것을 발견했다면?',
    answers: ['Esc로 선택을 취소하고 범위를 다시 고릅니다.', '일단 지운 뒤 파일을 닫습니다.'],
    correct: 0,
    why: '선택만 잘못한 상태라면 Esc로 취소할 수 있습니다. 파일 내용은 아직 바뀌지 않았습니다.',
  },
  {
    label: '3 / 3 · 두 동작을 조합하기',
    recap: '필요한 행과 열만 골라 편집했습니다.',
    detail:
      '두 줄의 번호를 제거하고 #와 공백을 붙였습니다. note는 그대로 남기고 저장한 결과까지 확인했습니다.',
    lesson: {
      title: blockWorkshop.title,
      showBlock: true,
      reference,
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'combine.txt',
          initial: '01 dev\n02 prod\nnote: keep',
          target: '# dev\n# prod\nnote: keep',
          title: '번호를 빼고 두 줄을 주석 처리하세요.',
          description:
            '앞의 두 줄에서 번호와 공백 세 칸을 지우고, #와 공백을 붙여 저장하세요. note는 그대로 남깁니다.',
          expected: '# dev · # prod · note: keep 순서로 저장',
        },
      },
      challengeHints: [
        '먼저 두 줄의 번호와 공백을 직사각형으로 고릅니다.',
        '첫 칸에서 Ctrl+v, l 두 번, j 한 번으로 2행 × 3열을 선택하고 x로 지울 수 있습니다.',
        'gg와 숫자 0으로 첫 칸에 갑니다. Ctrl+v와 j로 두 줄의 첫 열을 고르세요.',
        '대문자 I 다음 #와 공백을 쓰고 Esc로 적용합니다. 결과를 확인하고 :w와 Enter로 저장하세요.',
      ],
    },
  },
];
