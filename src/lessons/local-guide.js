export const labGoals = [
  ['api.conf · web.conf', 'mode=prod, port=8080으로 변경', '두 파일을 모두 저장하세요.'],
  ['notes.txt', '원본 그대로 보존', '설명에 있는 draft와 3000은 바꾸지 않습니다.'],
  ['tasks.txt', '첫 두 줄 앞에 ready: 와 공백 추가', 'note: keep은 그대로 남깁니다.'],
  ['events.log', 'DEBUG로 시작하는 줄 삭제', 'INFO DEBUG stays는 남깁니다.'],
  ['names.txt', 'alpha, beta, zeta 순서로 정리', '중복 alpha는 하나만 남깁니다.'],
];
export const localOutcomes = {
  setup: ['새 실습 폴더와 여섯 파일이 보입니다.', 'Vim 안에서 api.conf를 보고 있습니다.'],
  project: [
    'api.conf와 web.conf를 모두 저장했습니다.',
    'notes.txt를 보존했고 tasks.txt와 events.log도 목표와 같습니다.',
  ],
  filter: [
    'names.txt가 alpha, beta, zeta 세 줄로 저장됐습니다.',
    '외부 필터도 undo로 복구할 수 있음을 확인했습니다.',
  ],
  shell: [
    'verify.sh의 여섯 파일이 PASS입니다.',
    'Ctrl+z와 fg로 같은 Vim 프로세스에 돌아오는지 직접 확인합니다.',
  ],
  permissions: [
    'api.conf 원본은 보존하고 수정본은 새 이름으로 저장했습니다.',
    'readonly 옵션과 OS 파일 권한의 차이를 구분합니다.',
  ],
  ssh: [
    '로컬 셸과 원격 셸을 구분합니다.',
    '허용된 서버에서만 직접 확인합니다. 파일 검사로 접속 여부를 판정하지 않습니다.',
  ],
};
export const commandParts = {
  'vim -Nu NONE -N api.conf web.conf': [
    ['vim', '편집기 실행'],
    ['-u NONE', '개인 설정 없이'],
    ['-N', 'Vim 방식'],
    ['api.conf web.conf', '열 두 파일 · 목록'],
  ],
  ':args api.conf web.conf': [
    [':args', '작업할 파일 목록'],
    ['api.conf web.conf', '대상 두 개'],
  ],
  ':argdo %s/draft/prod/g': [
    ['argdo', '대상 파일마다'],
    ['%', '파일 전체 줄'],
    ['s/draft/prod/', 'draft를 prod로'],
    ['g', '줄 안의 모든 일치'],
  ],
  ':argdo %s/3000/8080/g': [
    ['argdo', '대상 파일마다'],
    ['%', '파일 전체 줄'],
    ['s/3000/8080/', '3000을 8080으로'],
    ['g', '줄 안의 모든 일치'],
  ],
  ':1,2s/^/ready: /': [
    ['1,2', '첫 두 줄'],
    ['s', '치환'],
    ['^', '줄 시작'],
    ['ready: ', '붙일 내용 · 끝 공백 포함'],
  ],
  ':g/^DEBUG/d': [
    ['g', '조건에 맞는 줄마다'],
    ['^DEBUG', 'DEBUG로 시작'],
    ['d', '줄 전체 삭제'],
  ],
  ':%!sort -u': [
    ['%', '전체 줄을'],
    ['!', '외부 필터에 보내기'],
    ['sort', '정렬'],
    ['-u', '중복 제거'],
  ],
  ':!bash verify.sh': [
    [':!', '셸 명령 한 번 실행'],
    ['bash verify.sh', '저장된 파일 검사'],
  ],
};
