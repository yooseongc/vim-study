const mission = (id, title, skill, file, initial, target, story, objective, hints, review) => ({ id, title, skill, file, initial, target, story, objective, hints, review });
export const missions = [
  mission('port', '새벽 2시, 연결되지 않는 서버', '검색 · 단어 변경', 'nginx.conf',
`# production gateway\nserver {\n    listen 8080;\n    server_name api.example.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_read_timeout 30s;\n    }\n}\n`,
`# production gateway\nserver {\n    listen 80;\n    server_name api.example.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_read_timeout 30s;\n    }\n}\n`,
'배포 직후 헬스 체크가 실패했습니다. 원인은 잘못된 수신 포트. 다른 설정은 건드리지 않고 서비스를 복구하세요.',
'listen 포트를 8080에서 80으로 바꾸세요. upstream의 3000과 나머지 내용은 유지한 뒤 :w로 저장하세요.',
['/8080을 입력하고 Enter를 누르면 대상에 바로 도착합니다. 이동 횟수보다 목적지를 생각하세요.', 'ciw는 커서가 있는 단어를 바꿉니다. 80을 입력하고 Esc로 돌아오세요.', '/8080 → Enter → ciw → 80 → Esc → :w → Enter'],
'검색으로 도착하고 ciw로 의미 단위를 바꿉니다. 실수했다면 u, 되돌리기를 취소하려면 Ctrl-r. 로컬 nginx.conf에서도 같은 편집을 재현해 보세요.'),
  mission('quotes', '문자열 속으로 바로 들어가기', '텍스트 객체 · ci"', 'release.js',
'const release = {\n  name: "staging candidate",\n  region: "ap-northeast-2",\n  retries: 3,\n};\n',
'const release = {\n  name: "production ready",\n  region: "ap-northeast-2",\n  retries: 3,\n};\n',
'릴리스 이름이 아직 스테이징을 가리킵니다. 공백을 포함한 문자열을 정확하게 교체해야 합니다.',
'name 문자열을 production ready로 바꾸세요. 따옴표, region, retries는 유지하세요.',
['/staging으로 이동하세요. 문자열을 한 글자씩 지울 필요가 없습니다.', 'ci"는 따옴표 안쪽 전체를 바꿉니다. ca"와의 차이도 생각해 보세요.', '/staging → Enter → ci" → production ready → Esc → :w → Enter'],
'operator + text object를 익히면 문자열 길이는 중요하지 않습니다. ci), ci], cip도 같은 문법입니다. i는 안쪽, a는 구분자를 포함한 영역입니다.'),
  mission('repeat', '같은 수정을 세 번 하지 않기', '점 명령 · 반복', 'features.conf',
'feature.search = false\nfeature.export = false\nfeature.audit = false\nfeature.legacy = false\n',
'feature.search = true\nfeature.export = true\nfeature.audit = true\nfeature.legacy = false\n',
'신규 기능 세 가지를 켜야 합니다. 하지만 legacy 기능은 아직 열면 안 됩니다. 편집 한 번을 재사용하세요.',
'search, export, audit의 false를 true로 변경하세요. legacy는 false로 남겨 두세요.',
['/false로 첫 값에 이동한 뒤 ciwtrue<Esc>로 한 번 수정하세요.', 'n으로 다음 검색 결과에 이동하고 .으로 직전 수정을 반복하세요. 두 번만 반복하면 됩니다.', '/false → Enter → ciw → true → Esc → n. → n. → :w → Enter'],
'점 명령은 마지막 변경을 재생합니다. 검색으로 대상을 선택하고 .으로 동작을 반복하면 판단과 입력을 분리할 수 있습니다. 일괄 치환도 유효하지만 범위를 먼저 확인하세요.'),
  mission('substitute', '로그의 잡음을 걷어내기', '범위 · :substitute', 'upstreams.conf',
'# archive: old.internal must remain here\napi=old.internal:3000\nworker=old.internal:3001\nmetrics=old.internal:9090\n# rollback: old.internal\n',
'# archive: old.internal must remain here\napi=new.internal:3000\nworker=new.internal:3001\nmetrics=new.internal:9090\n# rollback: old.internal\n',
'내부 도메인이 바뀌었습니다. 실행 설정만 바꾸고, 롤백을 위한 주석은 그대로 보존해야 합니다.',
'2–4행의 old.internal만 new.internal로 변경하세요. 주석과 포트 번호는 유지하세요.',
[':%s는 파일 전체입니다. 이번에는 2,4라는 명시적 범위를 사용해 보세요.', '패턴의 .은 임의 문자입니다. 도메인의 점을 정확히 찾으려면 \\.으로 이스케이프하세요.', ':2,4s/old\\.internal/new.internal/g → Enter → :w → Enter'],
'범위 + 명령을 조합하면 일괄 작업을 통제할 수 있습니다. 실제 파일에서는 치환 플래그 c를 붙여 하나씩 확인하는 습관이 도움이 됩니다.'),
  mission('macro', '반복 업무를 녹화하세요', '매크로 · 레지스터', 'hosts.txt',
'api-01\napi-02\nworker-01\nworker-02\nmetrics-01\n',
'server api-01 enabled;\nserver api-02 enabled;\nserver worker-01 enabled;\nserver worker-02 enabled;\nserver metrics-01 enabled;\n',
'호스트 목록을 서버 설정으로 변환해야 합니다. 길이가 다른 다섯 행에도 통하는 편집 동작을 만드세요.',
'각 행을 server <기존 호스트명> enabled; 형식으로 바꾸세요. 호스트 순서를 유지하세요.',
['행 시작은 0 또는 ^, 행 끝에서 입력은 A입니다. 다음 행까지 이동하는 작업 하나를 녹화하세요.', 'gg0으로 출발 → qa로 녹화 → Iserver <Esc> → A enabled;<Esc> → j0 → q로 종료.', '첫 행을 녹화하며 바꿨으므로 4@a로 나머지 네 행을 처리하세요. 마지막에 :w로 저장합니다.'],
'매크로는 좌표보다 구조를 기준으로 만들 때 견고합니다. I와 A는 길이가 다른 행에도 통합니다. qa는 a에 녹화, @a는 실행, @@는 마지막 매크로 재실행입니다.'),
  mission('buffers', '설정 두 개를 함께 맞추기', '버퍼 · :bn · :wa', 'app.env',
'API_HOST=api.internal\nAPI_PORT=3000\n', 'API_HOST=api.internal\nAPI_PORT=4000\n',
'앱 포트 변경이 프록시 설정에 반영되지 않았습니다. 두 파일을 오가며 설정의 일관성을 회복하세요.',
'app.env의 API_PORT와 proxy.env의 UPSTREAM_PORT를 모두 4000으로 바꾸고 두 파일을 저장하세요. :ls로 버퍼 목록을 확인할 수 있습니다.',
[':ls로 열린 버퍼를 확인하세요. :bn은 다음 버퍼, :bp는 이전 버퍼입니다.', 'app.env를 수정하고 :w, :bn으로 proxy.env로 이동한 뒤 포트를 수정하세요.', ':wa는 모든 변경된 버퍼를 저장합니다. :split proxy.env로 두 파일을 나란히 살펴볼 수도 있습니다.'],
'파일은 디스크의 내용, 버퍼는 메모리의 편집 내용, 윈도는 버퍼를 보는 창입니다. :bn과 :bp, Ctrl-w w를 구분해 익히세요. 다음 단계는 quickfix와 :argdo입니다.'),
];
missions[5].extra = { 'proxy.env': 'UPSTREAM_HOST=api.internal\nUPSTREAM_PORT=3000\n' };
missions[5].extraTarget = { 'proxy.env': 'UPSTREAM_HOST=api.internal\nUPSTREAM_PORT=4000\n' };
export function filesFor(m) { return { [m.file]: m.initial, ...m.extra }; }
export function validate(m, files) {
  const normalize = value => typeof value === 'string' ? value.replace(/\r\n/g, '\n').replace(/\n$/, '') : null;
  return Object.entries({ [m.file]: m.target, ...m.extraTarget }).map(([file, target]) => ({ file, ok: normalize(files[file]) === normalize(target) }));
}
