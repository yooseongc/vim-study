import { ex, changeWord, question } from './builders.js';
const initial = 'TODO api\nkeep=yes';
const web = 'TODO web\nkeep=yes';
const apiDone = 'DONE api\nkeep=yes';
const webDone = 'DONE web\nkeep=yes';
const notes = 'TODO is a word\nkeep=yes';
const files = { 'api.txt': apiDone, 'web.txt': webDone, 'notes.txt': notes };
export const quickfix = {
  id: 'quickfix',
  title: '검색 결과를 작업 목록으로 쓰기',
  badge: '목록',
  skill: 'vimgrep · quickfix · 다음 결과',
  persist: false,
  showTarget: true,
  file: 'api.txt',
  initial,
  files: { 'web.txt': web, 'notes.txt': notes },
  eyebrow: 'Quickfix · 여러 파일의 수정할 위치 모으기',
  steps: [
    ...ex(
      [
        [
          'vimgrep ',
          'Vim 안에서 파일을 검색합니다',
          'vimgrep은 외부 grep 프로그램 없이 파일을 읽고 quickfix라는 위치 목록을 만듭니다. 끝에 공백을 넣으세요.',
        ],
        [
          '/TODO/',
          '찾을 패턴을 지정합니다',
          '슬래시 사이의 TODO를 찾습니다. 이전 단원의 검색어와 같은 역할입니다.',
        ],
        [
          ' /work/api.txt /work/web.txt',
          '검색할 파일을 한정합니다',
          '공백으로 구분한 두 파일만 검사합니다. notes.txt는 설명 파일이므로 목록에 넣지 않습니다. 맨 앞 공백도 필요합니다.',
        ],
      ],
      initial,
      initial,
      { cursor: [1, 1], state: { quickfixCount: 2, quickfixIndex: 1, path: '/work/api.txt' } },
    ),
    ...ex(
      [
        [
          'cnext',
          '다음 검색 결과로 이동합니다',
          'quickfix의 다음 항목입니다. 일반 검색 n과 달리 다른 파일로도 이동합니다.',
        ],
      ],
      initial,
      web,
      { state: { quickfixIndex: 2, path: '/work/web.txt' } },
    ),
    ...ex(
      [['cprevious', '이전 검색 결과로 돌아갑니다', 'quickfix 목록의 앞 항목으로 돌아옵니다.']],
      web,
      initial,
      { state: { quickfixIndex: 1, path: '/work/api.txt' } },
    ),
    ...changeWord(initial, ' api\nkeep=yes', 'DONE', apiDone),
    ...ex(
      [
        [
          'cnext',
          '두 번째 수정 위치로 갑니다',
          '현재 버퍼의 수정은 남아 있습니다. 이 환경은 hidden 설정으로 저장 전에도 다른 버퍼로 이동할 수 있습니다.',
        ],
      ],
      apiDone,
      web,
      { state: { path: '/work/web.txt' } },
    ),
    ...changeWord(web, ' web\nkeep=yes', 'DONE', webDone),
    ...ex(
      [
        [
          'wa',
          '열린 수정 버퍼를 모두 저장합니다',
          'write all입니다. 현재 web뿐 아니라 먼저 수정한 api도 저장합니다.',
        ],
      ],
      webDone,
      webDone,
      {
        state: { files, dirtyCount: 0 },
        stateHint: 'api와 web을 모두 저장해야 합니다. notes 파일은 그대로 보존하세요.',
      },
    ),
  ],
  questions: [
    question(
      'quickfix 목록이 담는 것은?',
      '파일과 줄 등 검색 결과의 위치',
      ['복사한 텍스트만', '키보드 녹화만'],
      '목록의 항목을 따라 여러 파일의 수정 위치로 이동할 수 있습니다.',
    ),
    question(
      '파일을 넘어 다음 결과로 이동하려면?',
      ':cnext',
      ['항상 n만 사용한다', ':q'],
      'n은 현재 버퍼의 검색 반복입니다. :cnext는 quickfix의 다음 항목입니다.',
    ),
    question(
      'api와 web을 모두 수정한 뒤 :w만 하면?',
      '현재 파일만 저장된다',
      ['언제나 모든 파일이 저장된다', '둘 다 취소된다'],
      ':wa는 모든 수정 버퍼를 저장합니다. 저장할 파일의 범위도 구분하세요.',
    ),
  ],
  challengeInitial: 'TODO dev\nkeep=yes',
  challengeFiles: { 'web.txt': 'TODO prod\nkeep=yes', 'notes.txt': notes },
  challengeTarget: 'DONE prod\nkeep=yes',
  challengeState: {
    path: '/work/web.txt',
    dirtyCount: 0,
    files: {
      'api.txt': 'DONE dev\nkeep=yes',
      'web.txt': 'DONE prod\nkeep=yes',
      'notes.txt': notes,
    },
  },
  challengeDescription:
    'api.txt와 web.txt의 TODO를 DONE으로 바꾸고 둘 다 저장하세요. notes.txt의 TODO는 설명이므로 보존합니다. 마지막에는 web.txt를 열어 두세요.',
  hints: [
    '콜론을 열고 vimgrep을 입력합니다.',
    '공백 뒤 /TODO/를 입력합니다.',
    '공백 뒤 /work/api.txt /work/web.txt를 입력하고 Enter를 누릅니다.',
    '첫 결과에서 c, i, w로 단어를 바꾸고 DONE을 입력한 뒤 Esc를 누릅니다.',
    '콜론, cnext, Enter로 다음 결과에 갑니다.',
    '같은 방법으로 DONE으로 바꿉니다.',
    '콜론, wa, Enter로 두 버퍼를 저장합니다.',
  ],
  recap: '대상을 검색해 목록으로 만들고, 다음 위치로 이동해 편집한 뒤 모든 대상 파일을 저장합니다.',
  note: ':copen은 목록 창, :cclose는 그 창을 닫는 명령입니다. 목록 자체는 창을 닫아도 남습니다. :make의 오류 목록도 같은 quickfix 이동을 사용합니다.',
  nextLabel: '파일 목록에 같은 변경 적용하기',
};
