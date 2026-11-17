# 개발 기준

## 경계

- React 컴포넌트는 렌더링과 사용자 이벤트를 담당합니다. 화면을 querySelector/innerHTML로 갱신하지 않습니다. 외부 API와 연결할 DOM은 ref로 전달합니다.
- 자유 연습 데이터와 채점은 `missions.js`, 안내 단원 데이터와 채점은 `lessons/`에 둡니다. 저장 형식은 `lib/storage.js`와 `lessons/progress.js`에서 관리합니다. 저장 형식을 변경할 때는 기존 데이터를 읽는 마이그레이션을 먼저 준비합니다.
- Vim의 Worker, Canvas, 브라우저 이벤트는 `lib/vim-engine.js`가 소유합니다. `useVimEngine`은 생성과 해제만 연결합니다. 컴포넌트가 사라지면 Worker, Observer, 이벤트, 콜백을 함께 해제합니다.
- vim-wasm 0.0.13에는 공개 dispose API가 없습니다. 버전에 종속된 정리는 어댑터의 `disposeVim` 한 곳으로 제한합니다. 버전 변경 시 생명주기 검증이 필수입니다.
- 동시 Ex 명령은 엔진 내부에서 직렬화합니다. 이전 세션의 콜백은 세션별 레지스트리에서 제거하여 새 세션을 변경하지 못하게 합니다.

## 스타일

- 전역 CSS는 기본 타이포그래피와 기본 요소 스타일만 둡니다. 컴포넌트 스타일은 CSS Modules에 둡니다.
- `!important`, ID 선택자, 전역 와일드카드로 기능별 우선순위를 덮지 않습니다. 박스 모델 초기화 외에는 전역 `*`를 사용하지 않습니다.
- 표시 여부는 React 조건부 렌더링, 상태 차이는 명시적 클래스, 반응형은 해당 컴포넌트의 미디어 쿼리로 표현합니다.
- 인라인 스타일은 사용자가 고른 폰트/크기와 진행률처럼 동적인 값에만 사용합니다.
- 디자인 변경과 기술 전환을 한 번에 섞지 않습니다.
- 학습 안내는 한 단계에 한 동작만 제시합니다. 물리 키, 입력할 문자열, 동시 입력을 구분합니다. 단계 검증은 키 입력 추측이 아니라 Vim의 실제 모드/내용/저장 결과를 함께 사용합니다.
- 새 대표 단원에서는 각 키의 의미를 설명하되 실행은 명령 단위로 이어갈 수 있게 합니다. 자동 진행은 실제 결과를 기준으로 하고 입력 중간 상태를 거치도록 강제하지 않습니다. 학습 화면은 가로 넘침뿐 아니라 설명·편집기·진행 버튼의 화면 내 배치와 키보드만으로 진행하는 흐름도 검사합니다.
- M6 이후 단원에는 완료·복습 기록을 추가하지 않습니다. 여러 파일 과제는 저장된 모든 대상 파일과 보존할 파일, 미저장 버퍼 수를 함께 검증합니다. 로컬 파일 검사는 브라우저 안에서만 실행하며 SSH나 셸 실습의 실제 수행을 자동 통과로 표시하지 않습니다.
- 명시적인 상태 점검은 요청 후 들어오는 Vim 스냅샷으로 판정합니다. 타이머는 동일 상태도 전달하며 UI는 동일 스냅샷의 객체를 유지해 불필요한 렌더링을 막습니다. 입력 도중 상태를 자동으로 실패 기록에 넣지 않습니다.
- 복습 일정은 `lessons/review-progress.js`에서 계산하고 시각을 인자로 받아 테스트합니다. 기존 입문·편집 문법의 저장 키는 유지합니다. 미리 연습했다고 복습 날짜를 뒤로 미루지 않습니다.
- 자유 작업 공간의 파일은 미션·학습 기록과 분리합니다. 파일 이름은 저장 복원과 엔진 명령 진입에서 모두 검증합니다. 파일 저장 이벤트는 현재 버퍼가 아닌 실제로 쓰인 파일을 읽습니다. 용량 부족을 저장 성공으로 표시하지 않습니다.

## 검증과 배포

1. `npm run format:check`, `npm test`, `npm run build`를 통과시킵니다.
2. 개발 서버를 실행하고 `TEST_URL`에 출력된 URL을 지정합니다.
3. `node scripts/smoke.mjs`: 실제 Vim으로 여섯 미션, 폰트 설정, 저장 복원.
4. `node scripts/layout.mjs`: 일곱 화면 크기, Canvas 크기, 확대/복원, 설정 창.
5. `node scripts/lifecycle.mjs`: StrictMode, 반복 이동, Worker 수, 미저장 경고, 뒤로 가기, 종료/재시작/초기화.
   `node scripts/basics.mjs`: M2 첫 단원, 실제 모드 전환, 오답 차단, 독립 편집·저장 확인.
   `node scripts/grammar.mjs`: M3 편집 문법, 18단계, 범위 대기·검색 위치·레지스터, 잘못된 범위 차단, 독립 편집·저장 확인.
   `node scripts/review.mjs`: M4 상태 점검, 변형 복습, 도움 여부, 복습 일정·기록 복원, 미저장 경고와 모바일 화면.
   `node scripts/workspace.mjs`: M5 파일 생성·다중 버퍼·창 분할·범위 저장·줄바꿈·다운로드·삭제·복원·저장 실패·모바일 화면.
   `node scripts/dot.mjs`: M6 점 명령의 18단계, 검색 위치, undo/redo, 보호할 검색 결과 건너뛰기, 저장 검증과 기록 미생성.
   `node scripts/substitution.mjs`: M6 치환의 31단계, 현재 줄·줄 범위·전체 파일, g/c 옵션, y/n/q 응답, 저장과 기록 미생성.
   `node scripts/advanced.mjs`: M6 후반 일곱 단원, 레지스터·녹화·mark·블록·quickfix·arglist·global의 실제 상태, 독립 과제와 보호 파일, 기록 미생성, 화면과 다음 단원 연결.
   `node scripts/local.mjs`: 로컬 과정, ZIP 다운로드, 파일 비교·오답·크기 제한, 반응형과 작업 공간 연결.
   `node scripts/local-native.mjs`: 실제 로컬 Vim/Bash로 여러 파일 편집, 매크로, 외부 필터, 검사기와 읽기 전용 복구. 설치된 Vim/Bash가 필요하며 SSH 접속·대화형 job control은 자동 검증 범위 밖입니다.
   `node scripts/workshop.mjs`: 새 대표 단원의 연속 입력, 키보드 진행·힌트, 현재 문제 초기화, 실수 복구, 저장 판정, 여러 화면에서의 조작 가능성과 Worker 정리.
   `node scripts/range-workshop.mjs`: 치환 미리보기와 실제 Vim의 여섯 조합 비교, 네 문제, 확인 중 y/n/q·undo 복구, 범위 밖 변경 차단, 긴 명령 노출, resize 뒤 픽셀과 확인 모드 유지.
   `node scripts/register-workshop.mjs`: 기본·0·a의 실제 내용, 삭제 후 붙이기 실수와 undo 복구, 이름 붙인 복사·버리기, 네 문제의 저장과 기록 미생성, 다섯 화면 크기와 미저장 이동 경고.
   `node scripts/macro-workshop.mjs`: 녹화와 a 덮어쓰기, 점과 매크로의 커서 차이, @a·@@, 예외 줄 복구, 녹화 종료와 저장 판정, 세 문제와 다섯 화면 크기.
   `node scripts/navigation-workshop.mjs`: mark와 register의 분리, 줄·칸 복귀, 점프 기록 왕복, 편집 보존, 입력 모드 안내, 독립 과제의 보호할 줄과 다섯 화면 크기.
   `node scripts/block-workshop.mjs`: 선택 방식 비교, 실제 블록 범위, 취소와 undo/redo, Esc 이후 입력 적용, 열 삭제, 보호할 줄과 저장, 다섯 화면 크기.
   `node scripts/quickfix-workshop.mjs`: 검색 명령 구성, 목록 창과 다음·이전 결과, 파일별 편집·저장, 숨은 미저장 버퍼, 설명 파일 복구, 세 문제와 다섯 화면 크기.
   `node scripts/batch-workshop.mjs`: 치환 범위, 실제 arglist 이름, argdo와 update 범위, 파일별 undo/redo, 보호 파일 복구, 세 문제와 다섯 화면 크기.
   `node scripts/global-workshop.mjs`: 출력과 삭제, 줄 시작 패턴, 반대 조건, 잘못 삭제한 줄 복구, TEMP/TEMPORARY 구분과 다섯 화면 크기.
   `node scripts/transport-repro.mjs`: 공유 메모리의 payload 완성 전 상태 공개 방지. 원본 비교는 `UNPATCHED_TRANSPORT=1`로 실행하며 실패가 예상됩니다.
   `node scripts/input-stress.mjs`: 지연 없는 입력·명령·resize 반복. 실패를 감추기 위해 입력 지연이나 자동 재시도를 추가하지 않습니다.
   `node scripts/isolation-startup.mjs`: 서비스 워커 제어가 등록 응답보다 먼저 시작하는 첫 접속, 일반 첫 접속, 새로고침 횟수와 등록 거부 안내.
6. 공개 전에 변경 내용을 검토하고, 배포 성공 뒤 운영 주소에서도 동작을 확인합니다.

브라우저 검증은 별도의 숨겨진 임시 프로필에서 수행합니다. 사용자가 보고 있는 창의 크기를 테스트 목적으로 바꾸지 않습니다.
