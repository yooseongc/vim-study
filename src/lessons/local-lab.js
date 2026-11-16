export const labInitial = {
  'api.conf': 'mode=draft\nport=3000\n',
  'web.conf': 'mode=draft\nport=3000\n',
  'notes.txt': 'mode=draft is an example\nport=3000 stays here\n',
  'tasks.txt': 'api\nweb\nnote: keep\n',
  'events.log': 'DEBUG cache\nINFO ready\nDEBUG worker\nINFO DEBUG stays\n',
  'names.txt': 'zeta\nalpha\nalpha\nbeta\n',
};
export const labExpected = {
  'api.conf': 'mode=prod\nport=8080\n',
  'web.conf': 'mode=prod\nport=8080\n',
  'notes.txt': labInitial['notes.txt'],
  'tasks.txt': 'ready: api\nready: web\nnote: keep\n',
  'events.log': 'INFO ready\nINFO DEBUG stays\n',
  'names.txt': 'alpha\nbeta\nzeta\n',
};
export function validateLab(files) {
  return Object.entries(labExpected).map(([name, expected]) => {
    const text = files[name]?.replace(/\r\n/g, '\n');
    const lines = text?.split('\n');
    const target = expected.split('\n');
    const row =
      lines &&
      Array.from({ length: Math.max(lines.length, target.length) }, (_, i) => i).find(
        (i) => lines[i] !== target[i],
      );
    return {
      name,
      passed: text === expected,
      message:
        text === undefined
          ? '파일을 선택하지 않았습니다.'
          : text === expected
            ? '목표와 일치합니다.'
            : `${row + 1}번째 줄이 다릅니다. 마지막 줄바꿈과 보존할 내용도 확인하세요.`,
    };
  });
}

export const localSections = [
  {
    id: 'setup',
    title: '1. 내 컴퓨터에 연습 공간 만들기',
    intro:
      '이 과정은 Linux·macOS 또는 Windows의 WSL에서 Vim과 Bash를 사용하는 실습입니다. Windows 네이티브 Vim으로 편집 과제는 할 수 있지만, 셸 명령과 Ctrl+z 실습은 WSL에서 하세요. 브라우저는 로컬 명령을 대신 실행하지 않습니다.',
    steps: [
      {
        title: '실습 묶음을 내려받고 압축을 풉니다',
        text: '아래 ZIP에는 여섯 연습 파일, 결과 비교용 expected 폴더, verify.sh가 들어 있습니다. 새 폴더에 풀어 원본 프로젝트와 구분하세요. 초기화하려면 ZIP을 다른 새 폴더에 다시 풉니다.',
      },
      {
        title: '터미널에서 그 폴더로 이동합니다',
        where: '셸',
        command: 'cd vim-study-lab',
        text: '먼저 터미널의 현재 위치를 압축을 푼 상위 폴더로 옮기세요. 이 명령은 그 안의 vim-study-lab으로 들어갑니다. WSL에서는 Windows 경로가 /mnt/c/... 형태로 보입니다.',
      },
      {
        title: '현재 위치를 확인합니다',
        where: '셸',
        command: 'pwd',
        text: '앞으로 편집하는 파일이 어디에 있는지 확인합니다.',
      },
      {
        title: '연습 파일을 확인합니다',
        where: '셸',
        command: 'ls',
        text: 'api.conf, web.conf, notes.txt, tasks.txt, events.log, names.txt가 보여야 합니다.',
      },
      {
        title: 'Vim을 확인합니다',
        where: '셸',
        command: 'vim --version',
        text: '명령을 찾을 수 없다면 사용 중인 환경에 Vim 설치가 먼저 필요합니다. vim.wasm과 로컬 Vim은 버전·설정이 다를 수 있습니다.',
      },
      {
        title: '설정 없는 Vim으로 시작합니다',
        where: '셸',
        command: 'vim -Nu NONE -N api.conf web.conf',
        text: '-u NONE은 개인 설정을 읽지 않고, -N은 Vim 방식으로 실행합니다. 두 파일이 arglist에 들어갑니다. 이후에는 익숙해진 뒤 자신의 설정으로도 재현해 보세요.',
      },
    ],
  },
  {
    id: 'project',
    title: '2. 작은 프로젝트를 혼자 고치기',
    intro:
      'api와 web의 mode를 prod, port를 8080으로 바꿉니다. notes는 설명 파일이므로 그대로 남깁니다. 앞 단원에서 배운 방법 중 원하는 방법을 선택하세요. 각 명령줄은 콜론으로 시작하고 Enter로 실행합니다.',
    steps: [
      {
        title: '대상 파일만 지정합니다',
        where: 'Vim 명령줄',
        command: ':args api.conf web.conf',
        text: 'args 뒤의 두 이름이 작업 범위입니다. 파일이 열려 있다는 것만으로 일괄 작업의 대상이 되지는 않습니다.',
      },
      {
        title: '수정한 버퍼를 유지하며 이동하도록 설정합니다',
        where: 'Vim 명령줄',
        command: ':set hidden',
        text: '개인 설정 없는 Vim은 수정한 버퍼를 떠날 때 막을 수 있습니다. hidden은 버퍼를 버리지 않고 다른 파일을 열게 합니다. 일괄 편집 전에 설정합니다. 저장하지 않은 내용은 여전히 메모리에만 있으므로 끝에서 저장해야 합니다.',
      },
      {
        title: '두 파일의 mode를 바꿉니다',
        where: 'Vim 명령줄',
        command: ':argdo %s/draft/prod/g',
        text: 'argdo는 각 파일에서 실행, %는 전체 줄, s는 치환, g는 줄 안의 모든 항목입니다. 두 파일 모두 해당 패턴이 있는지 확인하고 실행합니다. 중간 오류가 나면 앞에서 바뀐 파일도 있으므로 결과를 확인하세요.',
      },
      {
        title: '두 파일의 port를 바꿉니다',
        where: 'Vim 명령줄',
        command: ':argdo %s/3000/8080/g',
        text: '파일별 버퍼는 바뀌었지만 아직 디스크에 저장하지 않았습니다.',
      },
      {
        title: '수정한 두 파일을 저장합니다',
        where: 'Vim 명령줄',
        command: ':argdo update',
        text: '목록의 파일마다 변경이 있으면 씁니다. :first와 :last로 두 파일의 결과를 각각 확인해 보세요.',
      },
      {
        title: 'tasks 파일을 엽니다',
        where: 'Vim 명령줄',
        command: ':edit tasks.txt',
        text: 'api와 web 앞에 ready: 와 공백을 붙입니다. note: keep은 남깁니다. q → a로 녹화를 시작하고 I로 줄 앞에 입력한 다음 Esc, j, q로 마치세요. 다음 줄에서 @ 다음 a로 한 번 실행합니다. :w로 저장합니다.',
      },
      {
        title: '로그를 엽니다',
        where: 'Vim 명령줄',
        command: ':edit events.log',
        text: 'DEBUG로 시작하는 줄만 제거합니다. 먼저 /로 검색줄을 열고 ^DEBUG를 쓴 다음 Enter, n으로 대상 줄을 확인하세요.',
      },
      {
        title: '조건에 맞는 로그를 지웁니다',
        where: 'Vim 명령줄',
        command: ':g/^DEBUG/d',
        text: 'INFO DEBUG stays는 남겨야 합니다. 내용을 확인하고 :w로 저장합니다.',
      },
    ],
  },
  {
    id: 'filter',
    title: '3. 외부 도구의 결과를 편집에 쓰기',
    intro:
      '이 부분은 실제 OS의 sort 프로그램을 사용합니다. 브라우저 Vim에서는 실행할 수 없습니다. 입력 범위가 외부 프로그램의 표준 입력으로 가고, 출력이 그 범위를 대체합니다.',
    steps: [
      {
        title: '이름 목록을 엽니다',
        where: 'Vim 명령줄',
        command: ':edit names.txt',
        text: '중복된 alpha와 정렬되지 않은 네 줄이 보입니다.',
      },
      {
        title: '필터로 정렬하고 중복을 없앱니다',
        where: 'Vim 명령줄',
        command: ':%!sort -u',
        text: '%는 전체 줄, !는 외부 필터, sort는 정렬, -u는 중복 제거입니다. alpha, beta, zeta 세 줄이 되어야 합니다. 작은 연습 파일에서 결과를 먼저 확인하세요.',
      },
      {
        title: '결과가 다르면 되돌립니다',
        where: 'Vim 일반 모드',
        command: 'u',
        text: '필터 실행도 편집입니다. u로 원래 네 줄로 돌아오는지 확인하세요.',
      },
      {
        title: '결과를 복원합니다',
        where: '키 조합',
        command: 'Ctrl+r',
        text: 'Ctrl을 누른 채 r을 누릅니다. 복원된 세 줄을 확인한 뒤 :w로 저장합니다.',
      },
    ],
  },
  {
    id: 'shell',
    title: '4. Vim과 셸을 오가며 결과 검사하기',
    intro:
      '편집기 안의 버퍼와 디스크 파일은 다를 수 있습니다. 검증 스크립트는 디스크를 읽으므로 먼저 저장해야 합니다. 출력이 맞아도 사용한 키나 이해도까지 검증하는 것은 아닙니다.',
    steps: [
      {
        title: '수정한 파일을 모두 저장합니다',
        where: 'Vim 명령줄',
        command: ':wa',
        text: '지금까지 수정한 모든 버퍼를 씁니다.',
      },
      {
        title: '셸 명령을 한 번 실행합니다',
        where: 'Vim 명령줄',
        command: ':!bash verify.sh',
        text: '여기서는 범위 %가 없으므로 파일 내용을 필터로 바꾸지 않습니다. 스크립트를 실행하고 출력만 봅니다. 여섯 PASS가 목표이며 실패한 파일은 차이를 보여줍니다. 안내가 나오면 Enter로 Vim에 돌아갑니다.',
      },
      {
        title: 'Vim을 잠시 뒤로 보냅니다',
        where: '키 조합 · Unix/WSL 터미널',
        command: 'Ctrl+z',
        text: 'Ctrl을 누른 채 z를 누릅니다. Vim을 종료하지 않고 셸로 돌아갑니다. 미저장 버퍼도 프로세스 안에 남습니다.',
      },
      {
        title: '멈춰 있는 작업을 확인합니다',
        where: '셸',
        command: 'jobs',
        text: 'Vim이 Stopped 상태로 나타나는지 확인합니다.',
      },
      {
        title: '같은 Vim으로 돌아옵니다',
        where: '셸',
        command: 'fg',
        text: '방금 멈춘 작업을 앞으로 가져옵니다. 새 vim 명령을 실행하는 것과 다릅니다. 여러 작업이 있다면 jobs에서 Vim의 작업 번호를 확인하세요.',
      },
      {
        title: '저장을 확인하고 종료합니다',
        where: 'Vim 명령줄',
        command: ':qa',
        text: '저장하지 않은 버퍼가 있으면 종료가 거부됩니다. 확인 없이 !를 붙이지 말고 :wa로 저장한 뒤 다시 종료하세요.',
      },
    ],
  },
  {
    id: 'permissions',
    title: '5. 읽기 전용과 권한 오류에서 내용 지키기',
    intro:
      'Vim의 readonly 옵션과 운영체제의 쓰기 권한은 다릅니다. 느낌표가 권한을 주는 것은 아닙니다. 이 실습은 원본 대신 연습 파일에서 진행합니다.',
    steps: [
      {
        title: '읽기 전용으로 파일을 엽니다',
        where: '셸',
        command: 'vim -Nu NONE -N -R api.conf',
        text: '-R은 Vim의 readonly 옵션을 켭니다. 파일 자체의 OS 권한은 바꾸지 않습니다.',
      },
      {
        title: '편집과 저장이 다른 일인지 확인합니다',
        text: '일반 모드에서 대문자 A를 누르고 공백과 #check를 입력한 뒤 Esc를 누르세요. :w를 실행하면 readonly 경고가 나옵니다. 경고가 나와도 버퍼의 수정은 남아 있습니다.',
      },
      {
        title: '다른 이름으로 작업 내용을 보존합니다',
        where: 'Vim 명령줄',
        command: ':saveas api-recovered.conf',
        text: '새 파일에 저장합니다. 같은 이름이 이미 있다면 덮어쓰지 말고 api-recovered-2.conf처럼 새 이름을 쓰세요. 원래 api.conf는 그대로여서 앞의 검증 결과를 유지합니다. :q로 종료하세요.',
      },
      {
        title: '실제 파일 권한도 확인합니다',
        where: '셸',
        command: 'ls -l api.conf',
        text: '소유자와 쓰기 권한을 확인합니다. 실제 Permission denied는 파일뿐 아니라 부모 디렉터리의 권한, 마운트 상태도 확인해야 합니다. :w!는 권한을 새로 부여하지 않습니다. 권한 없는 운영 파일에 관리자 권한을 자동으로 덧붙이지 말고 편집본을 다른 곳에 보존하세요.',
      },
    ],
  },
  {
    id: 'ssh',
    title: '6. 접속 가능한 연습 서버에서 재현하기',
    intro:
      '본인에게 허용된 SSH 연습 서버가 있을 때 실행하는 확장 실습입니다. 이 사이트는 서버나 계정을 제공하지 않으며 접속 결과를 자동 판정하지 않습니다. 서버가 없다면 로컬 편집 과제까지 마친 상태로 남겨 두세요.',
    steps: [
      {
        title: '접속 정보를 확인합니다',
        where: '로컬 셸 · 자리표시자 교체 필요',
        command: 'ssh USER@HOST',
        text: 'USER와 HOST를 실제 허용된 계정과 호스트로 바꾸세요. 최초 호스트 키 지문은 서버 관리자가 제공한 값과 확인합니다. 개인 키나 비밀번호를 이 사이트에 입력하지 않습니다.',
      },
      {
        title: '어느 컴퓨터인지 확인합니다',
        where: '원격 셸',
        command: 'hostname',
        text: '원격 호스트의 이름이 예상한 서버인지 확인하세요.',
      },
      {
        title: '원격 작업 위치를 확인합니다',
        where: '원격 셸',
        command: 'pwd',
        text: '로컬의 같은 이름 폴더와 구별합니다. 운영 설정 파일을 실습에 사용하지 마세요.',
      },
      {
        title: '새 실습 폴더를 만듭니다',
        where: '원격 셸',
        command: 'mkdir vim-study-practice',
        text: '이미 있다면 새 이름을 선택합니다. 이 폴더로 cd한 뒤 직접 연습 파일을 만들어도 됩니다.',
      },
      {
        title: '원격 Vim에서 직접 편집합니다',
        where: '원격 셸 · 실습 폴더 안',
        command: 'vim remote.txt',
        text: 'i로 alpha: draft와 beta: draft를 각각 한 줄에 입력하고 Esc로 나옵니다. 검색과 점 반복으로 둘 다 final로 바꿔 저장하세요. 종료 후 cat remote.txt로 디스크의 결과를 확인합니다. Ctrl+w 창 이동과 Ctrl+v 블록 선택도 원격 터미널에서 전달되는지 확인해 보세요.',
      },
      {
        title: '원격 연결을 종료합니다',
        where: '원격 셸',
        command: 'exit',
        text: 'Vim을 저장하고 종료한 뒤 셸에서 실행합니다. 로컬로 돌아온 후 hostname을 다시 확인하면 경계를 구분하기 쉽습니다.',
      },
    ],
  },
];

export function labArchiveFiles() {
  const readme =
    [
      'Vim Field Guide — local practice',
      '',
      'Linux / macOS / WSL + Vim + Bash',
      'Extract into a fresh folder. Edit the six files, not expected/.',
      'Run: bash verify.sh',
      'The script reads files and reports differences; it does not change them.',
      'Passing verifies file contents only, not SSH, permissions, or keystrokes.',
      '',
      ...localSections.flatMap((section) => [
        section.title,
        section.intro,
        ...section.steps.flatMap((step) => [
          step.title,
          step.command ? `[${step.where}] ${step.command}` : '',
          step.text,
        ]),
        '',
      ]),
    ].join('\n') + '\n';
  const verify =
    '#!/usr/bin/env bash\nset -u\ncd -- "$(dirname -- "$0")" || exit 1\nfailed=0\nfor name in api.conf web.conf notes.txt tasks.txt events.log names.txt; do\n  if diff -u -- "expected/$name" "$name"; then\n    printf "PASS %s\\n" "$name"\n  else\n    printf "FAIL %s\\n" "$name"\n    failed=1\n  fi\ndone\nexit "$failed"\n';
  return {
    ...labInitial,
    ...Object.fromEntries(
      Object.entries(labExpected).map(([name, text]) => [`expected/${name}`, text]),
    ),
    'README.txt': readme,
    'verify.sh': verify,
  };
}
