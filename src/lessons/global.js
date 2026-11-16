import { ex, save, question } from './builders.js';
const initial = 'DEBUG cache\nINFO ready\nDEBUG worker\nINFO DEBUG stays';
const target = 'INFO ready\nINFO DEBUG stays';
export const globalLesson = {
  id: 'global',
  title: '조건에 맞는 줄만 처리하기',
  badge: '조건',
  skill: '줄 시작 패턴 · global · 삭제',
  persist: false,
  showTarget: true,
  file: 'events.txt',
  initial,
  eyebrow: 'Global · 일치하는 줄을 골라 명령 실행하기',
  steps: [
    ...ex(
      [
        [
          'g',
          'global 명령을 시작합니다',
          '명령줄 맨 앞의 g는 global입니다. 치환 끝의 g 옵션과 다릅니다. 패턴에 맞는 줄마다 명령을 실행합니다.',
        ],
        ['/', '패턴의 시작을 표시합니다', '슬래시 사이에 어떤 줄을 고를지 적습니다.'],
        [
          '^DEBUG',
          'DEBUG로 시작하는 줄만 고릅니다',
          '^는 줄 시작입니다. INFO DEBUG stays처럼 중간에 DEBUG가 있는 줄은 고르지 않습니다.',
        ],
        ['/', '패턴의 끝을 표시합니다', '이제 고른 줄에서 할 동작을 뒤에 붙입니다.'],
        [
          'd',
          '선택된 줄을 삭제합니다',
          '여기서 d는 줄 삭제 Ex 명령입니다. Enter 전에는 아직 아무것도 삭제되지 않습니다.',
        ],
      ],
      initial,
      target,
    ),
    ...save(target),
  ],
  questions: [
    question(
      ':g/^DEBUG/d에서 ^가 필요한 이유는?',
      'DEBUG로 시작하는 줄만 고르기 위해',
      ['파일을 저장하기 위해', '모든 문자를 대문자로 바꾸기 위해'],
      '줄 중간의 DEBUG를 남겨야 하므로 줄 시작 위치를 패턴으로 제한합니다.',
    ),
    question(
      'global의 역할은?',
      '일치하는 줄마다 뒤의 명령을 실행한다',
      ['언제나 전체 파일을 삭제한다', '치환의 g 옵션과 완전히 같다'],
      'global은 줄을 고르는 명령이고, 치환의 g는 한 줄의 모든 일치 항목을 바꾸는 옵션입니다.',
    ),
    question(
      '삭제할 줄을 먼저 확인하려면?',
      '같은 패턴으로 검색해 위치를 확인한다',
      ['일단 저장부터 한다', '더 넓은 패턴으로 무조건 삭제한다'],
      '슬래시 검색과 n으로 대상을 확인할 수 있습니다. :g/패턴/p는 일치 줄 출력에도 사용할 수 있습니다.',
    ),
  ],
  challengeInitial: 'TEMP one\nKEEP TEMP reference\nTEMP two\nKEEP done',
  challengeTarget: 'KEEP TEMP reference\nKEEP done',
  challengeDescription:
    'TEMP로 시작하는 줄만 삭제하고 저장하세요. KEEP TEMP reference의 중간에 있는 TEMP는 그대로 남겨야 합니다.',
  hints: [
    '콜론으로 명령줄을 엽니다.',
    'g를 입력합니다.',
    '슬래시를 입력합니다.',
    '^TEMP로 줄 시작의 TEMP만 고릅니다.',
    '슬래시로 패턴을 닫습니다.',
    'd를 입력하고 Enter로 실행합니다.',
    '콜론, w, Enter로 저장합니다.',
  ],
  recap:
    'global은 줄을 고르고, 뒤의 명령은 그 줄에서 할 일을 정합니다. 패턴의 범위가 곧 작업 범위입니다.',
  note: ':v/패턴/명령은 반대로 일치하지 않는 줄에 실행합니다. 로컬 과정에서는 배운 방법들을 실제 파일에 조합합니다.',
  nextLabel: '내 터미널에서 마무리하기',
};
