import { action as a, ex, question } from './builders.js';
const initial = 'mode=old\nkeep=yes';
const target = 'mode=new\nkeep=yes';
const files = { 'api.txt': target, 'web.txt': target, 'notes.txt': initial };
export const batch = {
  id: 'batch',
  title: '파일 목록에 같은 변경 적용하기',
  badge: '일괄',
  skill: 'arglist · argdo · 저장 확인',
  persist: false,
  showTarget: true,
  file: 'api.txt',
  initial,
  files: { 'web.txt': initial, 'notes.txt': initial },
  eyebrow: '여러 파일 · 범위를 먼저 정하고 반복하기',
  steps: [
    ...ex(
      [
        [
          'args ',
          '작업할 파일 목록을 정합니다',
          'arglist는 명령을 반복 적용할 파일 목록입니다. 열린 모든 버퍼와 같은 뜻이 아닙니다.',
        ],
        [
          '/work/api.txt /work/web.txt',
          '두 파일만 선택합니다',
          '두 경로 사이에 공백을 넣습니다. notes.txt는 같은 old를 포함하지만 이번 변경 대상에서 제외합니다.',
        ],
      ],
      initial,
      initial,
      { state: { argumentCount: 2, argumentIndex: 0, path: '/work/api.txt' } },
    ),
    ...ex(
      [
        [
          'argdo ',
          '각 파일에서 실행할 명령을 준비합니다',
          'argdo 뒤의 명령을 목록의 각 파일에서 실행합니다. 아직 치환 내용은 쓰지 않았습니다.',
        ],
        [
          '%s/old/new/',
          '파일마다 전체 줄의 old를 new로 바꿉니다',
          '%는 그 파일의 전체 줄 범위입니다. 앞 단원에서 배운 치환 문장을 사용합니다.',
        ],
        [
          'g',
          '각 줄의 모든 일치 항목을 바꿉니다',
          '모든 대상 파일에 old가 있음을 먼저 확인했습니다. 명령이 오류로 멈추면 앞에서 변경된 파일도 있으므로 결과를 점검해야 합니다.',
        ],
      ],
      initial,
      target,
      { state: { argumentIndex: 1, path: '/work/web.txt', dirtyCount: 2 } },
    ),
    ...ex(
      [
        [
          'argdo ',
          '같은 파일 목록을 다시 순회합니다',
          '바꾸기와 저장을 분리해 무엇이 수정됐는지 확인합니다.',
        ],
        [
          'update',
          '변경된 파일만 저장합니다',
          'update는 수정된 버퍼만 파일에 씁니다. argdo와 결합하면 지정한 두 파일을 저장합니다.',
        ],
      ],
      target,
      target,
      { modes: ['n', 'r'], state: { files, dirtyCount: 0 } },
    ),
    a(
      'Enter',
      '저장 메시지를 확인합니다',
      '여러 파일의 저장 메시지가 쌓이면 Enter를 기다립니다. Enter로 편집 화면에 돌아오세요. 이미 일반 모드라면 커서만 한 줄 내려가며 내용은 바뀌지 않습니다.',
      target,
    ),
    ...ex(
      [
        [
          'first',
          '목록의 첫 파일을 확인합니다',
          '첫 파일 api도 변경됐는지 확인하세요. notes는 제외된 채로 남아야 합니다.',
        ],
      ],
      target,
      target,
      { state: { path: '/work/api.txt', argumentIndex: 0 } },
    ),
    ...ex(
      [
        [
          'last',
          '목록의 마지막 파일을 확인합니다',
          '마지막 파일 web도 저장됐습니다. 파일마다 상태를 확인하는 습관을 들이세요.',
        ],
      ],
      target,
      target,
      { state: { path: '/work/web.txt', argumentIndex: 1, files, dirtyCount: 0 } },
    ),
  ],
  questions: [
    question(
      'argdo가 처리하는 범위는?',
      'arglist에 지정한 파일들',
      ['항상 디스크 전체', '무조건 열린 모든 버퍼'],
      ':args로 작업 대상을 명시하고 :argdo로 순회합니다.',
    ),
    question(
      '치환 뒤 update가 하는 일은?',
      '수정된 버퍼를 저장한다',
      ['변경을 되돌린다', '새 파일 목록을 자동 검색한다'],
      '치환은 메모리의 버퍼를 바꾸고 update는 그 변경을 파일에 씁니다.',
    ),
    question(
      '두 번째 파일에서 오류가 나면?',
      '앞 파일의 변경도 확인한다',
      ['모든 변경이 자동 취소된다', '오류를 무시하고 완료로 간주한다'],
      '여러 파일 명령은 전체가 한 번에 취소되는 거래가 아닙니다. 파일별 undo와 저장 상태를 확인하세요.',
    ),
  ],
  challengeInitial: 'mode=draft\nkeep=yes',
  challengeFiles: { 'web.txt': 'mode=draft\nkeep=yes', 'notes.txt': 'mode=draft\nkeep=yes' },
  challengeTarget: 'mode=final\nkeep=yes',
  challengeState: {
    path: '/work/web.txt',
    dirtyCount: 0,
    files: {
      'api.txt': 'mode=final\nkeep=yes',
      'web.txt': 'mode=final\nkeep=yes',
      'notes.txt': 'mode=draft\nkeep=yes',
    },
  },
  challengeDescription:
    'api와 web의 draft만 final로 바꿔 저장하세요. notes의 draft는 보존합니다. 작업 목록을 두 파일로 한정하고 마지막 파일 web에서 마무리하세요.',
  hints: [
    '콜론 뒤 args와 공백을 입력합니다.',
    '/work/api.txt /work/web.txt를 쓰고 Enter로 파일 목록을 정합니다.',
    '콜론 뒤 argdo와 공백을 입력합니다.',
    '%s/draft/final/g를 쓰고 Enter로 적용합니다.',
    '콜론 뒤 argdo와 공백을 입력합니다.',
    'update를 쓰고 Enter로 두 파일을 저장합니다.',
  ],
  recap:
    '작업 목록을 먼저 한정하고 변경과 저장을 구분해서 실행합니다. 제외한 파일도 결과 검사의 일부입니다.',
  note: '패턴이 없는 파일을 건너뛰려면 치환의 e 옵션을 사용할 수 있습니다. 처음에는 오류를 숨기기보다 대상 파일을 확인하는 편이 좋습니다.',
  nextLabel: '조건에 맞는 줄만 처리하기',
};
