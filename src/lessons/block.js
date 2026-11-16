import { action as a, save, question } from './builders.js';
const initial = 'api=off\nweb=off\njob=off\nnote=keep';
const first = '# api=off\nweb=off\njob=off\nnote=keep';
const target = '# api=off\n# web=off\n# job=off\nnote=keep';
export const block = {
  id: 'block',
  title: '여러 줄을 블록으로 편집하기',
  badge: '블록',
  skill: '직사각형 선택 · 함께 입력',
  persist: false,
  showTarget: true,
  file: 'block.txt',
  initial,
  eyebrow: 'Visual Block · 같은 열의 여러 줄에 입력하기',
  steps: [
    a(
      'Esc',
      '첫 줄 첫 칸에서 시작합니다',
      '세 서비스 줄 앞에 주석 표시 #와 공백을 붙입니다. 마지막 note 줄은 선택하지 않습니다.',
      initial,
      { cursor: [1, 1] },
    ),
    a(
      'Ctrl+v',
      '블록 선택을 시작합니다',
      'Vim의 블록 선택은 Ctrl+v입니다. Shift+Ctrl 조합이 아닙니다. 이 편집기는 시스템 붙여 넣기 대신 Vim 키 입력으로 처리합니다.',
      initial,
      { mode: '\u0016', state: { visualStart: [1, 1] } },
    ),
    a('j', '두 번째 줄까지 늘립니다', '같은 열에서 한 줄 아래로 선택 범위를 늘립니다.', initial, {
      mode: '\u0016',
      cursor: [2, 1],
      state: { visualStart: [1, 1] },
    }),
    a(
      'j',
      '세 번째 줄까지 늘립니다',
      '세 줄의 첫 칸이 선택됐습니다. note까지 내려가지 마세요.',
      initial,
      { mode: '\u0016', cursor: [3, 1], state: { visualStart: [1, 1] } },
    ),
    a(
      'I',
      '선택한 블록 앞에 입력합니다',
      '대문자 I입니다. 입력은 첫 줄에서 시작되며 Esc로 마칠 때 다른 선택 줄에도 적용됩니다.',
      initial,
      { mode: 'i' },
    ),
    a(
      '# ',
      '주석 표시와 공백을 씁니다',
      '지금은 첫 줄만 바뀌어 보여도 정상입니다. 끝의 공백도 넣으세요.',
      first,
      { mode: 'i', pressed: undefined },
    ),
    a(
      'Esc',
      '선택한 줄 모두에 적용합니다',
      '입력을 마치면 나머지 두 줄에도 #와 공백이 붙습니다. note는 그대로인지 확인하세요.',
      target,
    ),
    a(
      'u',
      '블록 변경을 되돌립니다',
      '범위를 잘못 골랐다면 결과를 확인하고 u로 되돌릴 수 있습니다.',
      initial,
    ),
    a('Ctrl+r', '블록 변경을 복원합니다', '세 줄에 적용됐던 변경을 다시 복원합니다.', target),
    ...save(target),
  ],
  questions: [
    question(
      'Visual Block을 시작하는 키는?',
      'Ctrl+v',
      ['Shift+Ctrl', '소문자 i'],
      'v는 문자 선택, 대문자 V는 줄 선택, Ctrl+v는 직사각형 블록 선택입니다.',
    ),
    question(
      '블록 I 입력이 다른 줄에 적용되는 시점은?',
      'Esc로 입력을 마칠 때',
      ['항상 첫 글자를 누를 때', '파일을 닫을 때만'],
      '첫 줄에서 입력하고 Esc로 끝내면 선택했던 다른 줄에도 반영됩니다.',
    ),
    question(
      'note까지 잘못 주석 처리했다면?',
      'u로 되돌리고 범위를 다시 선택한다',
      ['그대로 저장한다', 'Ctrl+o로 내용을 되돌린다'],
      '선택 범위를 확인하는 것이 중요합니다. 점프 이력과 편집 이력은 다릅니다.',
    ),
  ],
  challengeInitial: 'dev=on\nprod=on\nnote=keep',
  challengeTarget: '# dev=on\n# prod=on\nnote=keep',
  challengeDescription:
    '앞의 두 줄만 블록으로 골라 #와 공백을 붙이고 저장하세요. note는 주석 처리하지 않습니다.',
  hints: [
    '첫 줄 첫 칸에서 Ctrl+v를 누릅니다.',
    'j를 한 번 눌러 두 줄만 선택합니다.',
    '대문자 I를 누릅니다.',
    '#와 공백을 입력합니다.',
    'Esc로 두 줄 모두에 적용합니다.',
    '콜론, w, Enter로 저장합니다.',
  ],
  recap: '선택 범위를 눈으로 확인하고, 대문자 I로 입력한 뒤 Esc로 여러 줄에 적용합니다.',
  note: '터미널 설정이 Ctrl+v를 가로채면 Vim에서 Ctrl+q를 대안으로 쓸 수 있습니다. 환경에 따라 키 전달 설정도 확인하세요.',
  nextLabel: '여러 파일에서 대상을 찾고 바꾸기',
};
