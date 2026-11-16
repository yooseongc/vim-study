export const basics = { id: 'basics', title: '기억을 정리하는 첫 편집' };
export const initialText = 'hello';
export const editedText = 'Vim hello';
export const steps = [
  {
    title: '일반 모드가 출발점입니다',
    explanation:
      'Vim은 모드에 따라 같은 키가 다르게 작동합니다. 일반 모드에서는 글자를 입력하는 대신 이동하거나 편집 명령을 내립니다. 기억이 헷갈릴 때는 Esc로 돌아오세요.',
    key: 'Esc',
    action: '편집기에 포커스를 두고 Esc 키를 한 번 누르세요.',
    expected: '일반 모드 · 내용은 hello 그대로',
    recovery: 'Esc는 키보드 왼쪽 위의 키입니다. E, s, c를 글자로 입력하는 것이 아닙니다.',
    mode: 'n',
    text: initialText,
    pressed: 'Escape',
  },
  {
    title: 'i는 입력 모드로 들어가는 키입니다',
    explanation:
      'i는 insert, 즉 입력을 뜻합니다. “인터랙티브 모드”가 아니라 입력 모드입니다. 지금 커서가 있는 글자 앞에서 입력을 시작합니다.',
    key: 'i',
    action: '영문 소문자 i를 한 번 누르세요. 아직 다른 글자는 입력하지 마세요.',
    expected: '입력 모드 · 내용은 hello 그대로',
    recovery:
      '일반 모드에서 시작해야 합니다. 잘못 입력했다면 Esc로 돌아온 뒤 아래의 처음부터 다시를 사용하세요.',
    mode: 'i',
    text: initialText,
    pressed: 'i',
  },
  {
    title: '이제 글자가 파일에 들어갑니다',
    explanation:
      '입력 모드에서는 키가 명령이 아니라 글자가 됩니다. hello 앞에 Vim과 공백 하나를 붙여 보세요. 이번에는 영어 입력 상태를 사용합니다.',
    key: 'Vim + Space',
    action: '대문자 V, 소문자 i, 소문자 m을 입력하고 Space 키를 한 번 누르세요.',
    expected: '입력 모드 · Vim hello',
    recovery:
      '입력한 글자를 고칠 때는 Backspace를 쓰세요. Vim 뒤에 공백이 정확히 하나 있어야 합니다.',
    mode: 'i',
    text: editedText,
  },
  {
    title: 'Esc로 한 번의 편집을 마칩니다',
    explanation:
      'Esc는 입력 모드에서 일반 모드로 돌아갑니다. 글자를 지우거나 저장하지는 않습니다. 방금 입력한 내용을 유지한 채 다음 편집 명령을 받을 준비를 합니다.',
    key: 'Esc',
    action: 'Esc 키를 한 번 누르세요.',
    expected: '일반 모드 · Vim hello · 아직 저장 안 됨',
    recovery: 'Esc를 눌러도 Vim hello는 남아 있어야 합니다. Esc와 undo는 다른 동작입니다.',
    mode: 'n',
    text: editedText,
    pressed: 'Escape',
  },
  {
    title: 'u는 방금 한 변경을 되돌립니다',
    explanation:
      '일반 모드의 u는 undo입니다. 방금 입력 모드에서 추가한 Vim과 공백을 하나의 변경으로 되돌립니다. 한 글자씩 지우는 명령이 아닙니다.',
    key: 'u',
    action: '영문 소문자 u를 한 번 누르세요.',
    expected: '일반 모드 · 다시 hello',
    recovery:
      'u라는 글자가 파일에 들어갔다면 입력 모드였던 것입니다. Esc로 돌아오세요. 헷갈리면 처음부터 다시 연습해도 됩니다.',
    mode: 'n',
    text: initialText,
    pressed: 'u',
  },
  {
    title: 'Ctrl+r는 되돌리기를 취소합니다',
    explanation:
      'redo는 undo로 되돌렸던 변경을 다시 적용합니다. 이번에는 두 키를 차례로 누르는 것이 아니라 함께 누릅니다.',
    key: 'Ctrl + r',
    action: 'Ctrl 키를 누른 상태에서 r을 한 번 누르고 두 키를 놓으세요.',
    expected: '일반 모드 · Vim hello로 복원',
    recovery:
      'Ctrl 없이 r만 누르면 다른 명령입니다. Esc로 취소한 뒤 Ctrl을 누른 상태에서 r을 누르세요.',
    mode: 'n',
    text: editedText,
    pressed: 'Ctrl+r',
  },
  {
    title: ':는 명령줄을 엽니다',
    explanation:
      '저장할 때 쓰던 :w의 콜론부터 분리해서 봅시다. 일반 모드에서 :를 입력하면 화면 아래에 명령줄이 열립니다. 아직 저장되지는 않습니다.',
    key: ':',
    action: '콜론 :을 한 번 입력하세요. 보통 영문 키보드에서는 Shift를 누른 채 ; 키를 누릅니다.',
    expected: '명령줄 모드 · 아래에 : 표시',
    recovery: 'Esc를 누르면 명령줄을 취소할 수 있습니다. 취소했다면 :를 다시 입력하세요.',
    mode: 'c',
    text: editedText,
    command: '',
  },
  {
    title: '명령줄에서 w는 write입니다',
    explanation:
      '일반 모드의 w는 다음 단어로 이동합니다. 지금은 콜론으로 연 명령줄이므로 w가 저장 명령을 뜻합니다. 모드와 콜론이 의미를 바꿉니다.',
    key: 'w',
    action: '명령줄에 소문자 w를 한 번 입력하세요. Enter는 다음 단계에서 누릅니다.',
    expected: '명령줄 모드 · 아래에 :w 표시',
    recovery: '이미 :가 있으므로 콜론을 다시 입력하지 마세요. 오타는 Backspace로 고칠 수 있습니다.',
    mode: 'c',
    text: editedText,
    command: 'w',
  },
  {
    title: 'Enter를 눌러 저장을 실행합니다',
    explanation:
      ':w를 쓰기만 해서는 실행되지 않습니다. Enter로 실행해야 버퍼의 내용이 파일에 기록됩니다. 이 사이트에서는 브라우저에도 저장해 줍니다.',
    key: 'Enter',
    action: 'Enter 키를 한 번 누르세요.',
    expected: '일반 모드 · Vim hello · 저장 완료',
    recovery:
      '저장하지 않고 다음 단계로 넘어갈 수는 없습니다. Esc, 콜론, w, Enter를 각각 순서대로 눌러 저장할 수 있습니다.',
    mode: 'n',
    text: editedText,
    saved: true,
  },
];
export const questions = [
  {
    question: '일반 모드에서 w를 누르면?',
    answers: ['파일을 저장한다', '다음 단어로 이동한다', '입력 모드로 바뀐다'],
    correct: 1,
    why: '일반 모드의 w는 이동입니다. 저장은 콜론으로 명령줄을 열고 w를 입력한 뒤 Enter로 실행합니다.',
  },
  {
    question: '입력 후 Esc를 누르면?',
    answers: ['입력을 취소한다', '자동으로 저장한다', '내용은 유지하고 일반 모드로 돌아온다'],
    correct: 2,
    why: 'Esc는 모드를 바꿉니다. 변경을 되돌리는 u, 파일에 기록하는 :w와 구별하세요.',
  },
  {
    question: 'u로 되돌린 변경을 다시 적용하려면?',
    answers: ['Ctrl을 누른 채 r', '소문자 r만 누르기', 'u를 계속 누르기'],
    correct: 0,
    why: 'Ctrl+r가 redo입니다. 키를 함께 누른다는 점이 중요합니다.',
  },
];

Object.assign(basics, {
  steps,
  questions,
  file: 'first-edit.txt',
  initial: initialText,
  eyebrow: '첫 단원 · 모드 → 편집 → 되돌리기 → 저장',
  challengeInitial: 'ready',
  challengeTarget: 'Vim ready',
  challengeDescription:
    '새 파일에는 ready가 있습니다. 앞에 Vim과 공백 하나를 붙여 Vim ready로 만들고 저장하세요. 이번에는 직접 모드를 선택해 보세요.',
  hints: [
    'Esc로 일반 모드로 돌아갑니다.',
    '줄의 맨 앞에서 i를 눌러 입력 모드로 들어갑니다.',
    'Vim을 입력하고 Space를 한 번 누릅니다.',
    'Esc로 일반 모드로 돌아갑니다.',
    '콜론을 입력해 명령줄을 엽니다.',
    'w를 입력합니다.',
    'Enter로 저장을 실행합니다.',
  ],
  recap:
    'i는 입력, Esc는 일반 모드 복귀, u는 undo, Ctrl+r는 redo입니다. 저장은 콜론 → w → Enter입니다.',
  note: '종료는 명령줄에서 q를 입력한 뒤 Enter입니다. :q!는 저장하지 않은 변경을 버립니다. !가 모든 곳에서 무조건 강제를 뜻하지는 않습니다.',
  nextLabel: '편집 문법 배우기',
});
