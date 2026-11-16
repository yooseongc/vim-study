const initial = 'const name = "guest user";\nconst role = "viewer";';
const changed = initial.replace('guest', 'admin');
const removed = initial.replace('guest', '');
const empty = initial.replace('guest user', '');

function step(title, explanation, key, action, mode, text, extra = {}) {
  return {
    title,
    explanation,
    key,
    action,
    mode,
    text,
    expected:
      mode === 'no'
        ? '편집 범위 대기 · 파일 내용은 그대로'
        : mode === 'i'
          ? '입력 모드 · 변경된 내용을 확인하세요'
          : mode === 'c'
            ? '명령줄 모드 · 아직 실행 전'
            : '일반 모드 · 결과를 확인하세요',
    recovery:
      '대기 중인 명령은 Esc로 취소할 수 있습니다. 취소했다면 이 단계까지의 키를 다시 순서대로 누르세요. 내용이 달라졌다면 처음부터 다시 연습할 수 있습니다.',
    ...extra,
  };
}

export const grammar = {
  id: 'grammar',
  title: '편집 명령을 문장처럼 조합하기',
  eyebrow: '두 번째 단원 · 동작과 범위',
  file: 'profile.js',
  initial,
  steps: [
    step(
      '먼저 바꿀 단어를 찾습니다',
      '슬래시 /는 앞으로 검색할 문자열을 받습니다. 검색어를 쓴 뒤 Enter로 확정하는 과정도 나누어 해 봅시다.',
      '/',
      '슬래시 키만 한 번 누르세요.',
      'c',
      initial,
      { command: '', commandType: '/' },
    ),
    step(
      '검색어를 입력합니다',
      '찾을 문자열을 검색줄에 씁니다. 파일의 내용은 바뀌지 않습니다.',
      'guest',
      'guest를 입력하세요. Enter는 다음 단계에서 누릅니다.',
      'c',
      initial,
      { command: 'guest', commandType: '/' },
    ),
    step(
      '검색을 확정합니다',
      '검색 중에는 일치하는 위치를 미리 보여 줍니다. Enter를 누르면 그 위치에서 편집을 시작할 수 있습니다.',
      'Enter',
      'Enter 키를 한 번 누르세요.',
      'n',
      initial,
      { cursor: [1, 15] },
    ),
    step(
      'c: 무엇을 할지 정합니다',
      'c는 change, 바꾸기입니다. c만 누르면 Vim은 “어디를 바꿀까?”를 기다립니다. 아직 글자를 입력하는 단계가 아닙니다.',
      'c',
      '소문자 c만 한 번 누르세요.',
      'no',
      initial,
      { pressed: 'c' },
    ),
    step(
      'i: 범위의 안쪽을 고릅니다',
      '이번 i는 입력 모드로 들어가라는 뜻이 아닙니다. c가 범위를 기다리고 있으므로 inside, 즉 어떤 대상의 안쪽이라는 뜻입니다. 다음 키로 대상을 정합니다.',
      'i',
      '소문자 i만 한 번 누르세요.',
      'no',
      initial,
      { pressed: 'i' },
    ),
    step(
      'w: 단어를 대상으로 정합니다',
      'w는 여기서 word, 단어입니다. c → i → w가 합쳐져 “단어 안쪽을 바꾼다”가 됩니다. guest만 지워지고 입력 모드가 열립니다. 뒤의 공백과 user는 남습니다.',
      'w',
      '소문자 w만 한 번 누르세요.',
      'i',
      removed,
    ),
    step(
      '새 단어를 입력합니다',
      '이제부터는 편집 명령이 아니라 파일에 들어갈 글자입니다. guest 대신 admin을 넣습니다.',
      'admin',
      '영문 문자열 admin을 입력하세요.',
      'i',
      changed,
      {
        recovery:
          '오타는 Backspace로 고치세요. admin 뒤에는 원래 있던 공백과 user가 남아 있어야 합니다.',
      },
    ),
    step(
      '편집을 마칩니다',
      'Esc로 입력을 마치면 일반 모드에서 다음 명령을 시작할 수 있습니다. 지금까지 바꾼 것은 한 단어뿐입니다.',
      'Esc',
      'Esc 키를 누르세요.',
      'n',
      changed,
      { pressed: 'Escape' },
    ),
    step(
      'y: 이번에는 복사합니다',
      'y는 yank, 복사입니다. 바꾸기의 c 자리에 y를 놓고 범위를 붙일 수 있습니다. 복사한 내용은 Vim의 레지스터라는 임시 보관함에 들어갑니다.',
      'y',
      '소문자 y만 누르세요.',
      'no',
      changed,
      { pressed: 'y' },
    ),
    step(
      '같은 i, 다른 대상',
      '다시 안쪽을 고릅니다. 이번에는 단어 하나가 아니라 따옴표 안의 두 단어 전체를 복사할 것입니다.',
      'i',
      '소문자 i만 누르세요.',
      'no',
      changed,
      { pressed: 'i' },
    ),
    step(
      '따옴표 안쪽을 복사합니다',
      '큰따옴표를 대상으로 지정하면 admin user 전체를 복사합니다. 따옴표 자체는 포함하지 않습니다. 파일이 그대로여도 복사된 내용을 직접 확인해 드립니다.',
      '"',
      '큰따옴표 키를 한 번 입력하세요. 보통 Shift를 누른 채 작은따옴표 키를 누릅니다.',
      'n',
      changed,
      { register: 'admin user' },
    ),
    step(
      'd: 이번에는 지웁니다',
      'd는 delete, 삭제입니다. c와 달리 삭제한 뒤 입력 모드로 들어가지 않습니다. 같은 범위에 다른 동작을 적용해 봅시다.',
      'd',
      '소문자 d만 누르세요.',
      'no',
      changed,
      { pressed: 'd' },
    ),
    step(
      '삭제할 범위의 안쪽',
      'i는 앞의 동작이 무엇이든 안쪽을 가리킵니다. 지금은 d가 기다리고 있으므로 삭제할 범위를 만드는 중입니다.',
      'i',
      '소문자 i만 누르세요.',
      'no',
      changed,
      { pressed: 'i' },
    ),
    step(
      '따옴표는 남기고 지웁니다',
      '큰따옴표 안의 admin user를 지웁니다. 빈 따옴표는 남고 일반 모드가 유지됩니다. 삭제한 내용도 Vim의 임시 보관함에 들어갑니다.',
      '"',
      '큰따옴표를 한 번 입력하세요.',
      'n',
      empty,
      { register: 'admin user' },
    ),
    step(
      'P: 커서 앞에 붙여넣습니다',
      '커서는 닫는 따옴표에 있습니다. 대문자 P로 그 앞에 보관한 문자열을 넣으면 따옴표 안으로 돌아갑니다. 소문자 p는 커서 뒤에 넣으므로 여기서는 결과가 다릅니다.',
      'Shift + p',
      'Shift를 누른 채 p를 한 번 눌러 대문자 P를 입력하세요.',
      'n',
      changed,
      { pressed: 'P' },
    ),
    step(
      '저장할 명령줄을 엽니다',
      '앞 단원에서 배운 저장을 다시 해 봅시다. 편집 명령과 명령줄 명령을 구분하세요.',
      ':',
      '콜론을 입력하세요.',
      'c',
      changed,
      { command: '' },
    ),
    step(
      '저장 명령을 씁니다',
      '명령줄의 w는 write입니다. 조금 전 범위에 쓰인 w와 모드가 다릅니다.',
      'w',
      '소문자 w를 입력하세요.',
      'c',
      changed,
      { command: 'w' },
    ),
    step(
      '저장을 실행합니다',
      'Enter로 실행하면 파일과 브라우저에 결과를 기록합니다.',
      'Enter',
      'Enter를 누르세요.',
      'n',
      changed,
      { saved: true },
    ),
  ],
  questions: [
    {
      question: '삭제한 뒤 곧바로 새 내용을 입력하고 싶다면 어떤 동작을 고를까요?',
      answers: ['d: 삭제', 'c: 바꾸기', 'y: 복사'],
      correct: 1,
      why: 'c는 범위를 지우고 입력 모드로 들어갑니다. d는 지운 뒤 일반 모드에 남고 y는 원본을 유지합니다.',
    },
    {
      question: 'c 다음에 누르는 i는 어떤 뜻일까요?',
      answers: ['안쪽 범위를 고르기', '즉시 입력 모드로 들어가기', '검색 결과로 이동하기'],
      correct: 0,
      why: '이미 c가 범위를 기다리고 있으므로 i는 inside입니다. 일반 모드에서 홀로 누르는 i와 문맥이 다릅니다.',
    },
    {
      question: '따옴표 안의 guest editor를 두 단어 모두 바꾸려면?',
      answers: ['c → i → w', 'c → i → "', 'y → i → "'],
      correct: 1,
      why: 'iw는 커서가 있는 단어, i"는 따옴표 안쪽 전체입니다. y를 고르면 바꾸지 않고 복사합니다.',
    },
  ],
  challengeInitial: initial.replace('guest user', 'guest editor'),
  challengeTarget: initial.replace('guest user', 'release ready'),
  challengeDescription:
    'name의 따옴표 안에 있는 guest editor를 release ready로 바꾸고 저장하세요. role의 viewer와 따옴표, 나머지 코드는 그대로 남겨야 합니다. 한 단어보다 넓은 범위를 직접 골라 보세요.',
  hints: [
    'Esc로 일반 모드로 돌아갑니다.',
    '슬래시를 누르고 guest를 입력합니다.',
    'Enter로 검색을 확정합니다.',
    'c를 눌러 바꾸기를 시작합니다.',
    'i로 안쪽 범위를 고릅니다.',
    '큰따옴표를 눌러 따옴표 안쪽 전체를 선택합니다.',
    'release ready를 입력합니다.',
    'Esc로 일반 모드로 돌아갑니다.',
    '콜론으로 명령줄을 엽니다.',
    'w를 입력합니다.',
    'Enter로 저장합니다.',
  ],
  recap:
    '동작을 먼저, 범위를 나중에 정합니다. c는 바꾸기, d는 삭제, y는 복사입니다. iw는 단어 안쪽, i"는 따옴표 안쪽입니다. 키는 동시에 누르지 않고 순서대로 누릅니다.',
  note: '일반 모드의 w는 다음 단어로 이동합니다. dw처럼 이동과 동작을 조합할 수도 있습니다. 다만 diw는 단어 중간에서도 단어 전체를 고릅니다. P는 커서 앞, p는 커서 뒤에 붙여넣습니다.',
  nextLabel: '점으로 변경 반복하기',
};
