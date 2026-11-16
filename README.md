# Vim Field Guide

실제 Vim으로 상황을 해결하는 한국어 실전 훈련장. 배포 경로는 https://yooseongc.github.io/vim-study/ 입니다.

## 실행

Node.js 22 이상에서:

```sh
npm ci
npm run dev
npm test
npm run build
```

개발 서버가 출력하는 `/vim-study/` 주소로 접속합니다. `file://`에서는 동작하지 않습니다. 산출물은 `dist/`입니다. 외부 CDN 없이 Vim 바이너리를 함께 배포합니다.

## 구현 범위

- 첫 화면의 **기억을 정리하는 첫 편집**은 M2 안내 단원입니다. Esc → i → 텍스트 입력 → Esc → u → Ctrl+r → 콜론 → w → Enter를 아홉 화면으로 나누고, 각 키의 뜻과 예상 결과를 설명합니다. 실제 Vim의 모드·버퍼·명령줄·저장 이벤트로 단계를 검증하며, 확인 전에는 다음 단계로 넘어가지 않습니다.
- 단원 마지막에는 개념 확인 질문 세 개와 별도의 새 파일에서 직접 편집·저장하는 연습을 제공합니다. 완료 기록과 마지막 저장 내용은 `vim-field-guide:basics:v1`에 저장합니다. 안내 단원은 다시 방문하면 초기 파일부터 시작합니다. 중간 단계/undo 이력 복원은 하지 않습니다. 기존 여섯 미션의 데이터는 유지됩니다.
- 안내 UI는 사이트에 포함된 Noto Sans KR을 사용합니다. 본문은 16px, 보조 문구는 13–14px로 표시하고 대비를 높였습니다. 넓은 화면에서는 설명과 Vim을 나란히 표시하며, 좁은 화면은 세로 배치와 가로 스크롤 단원 목록을 사용합니다. 편집기 높이는 화면 높이에 반응하며 **편집기 확대**로 학습 설명을 잠시 접을 수 있습니다. ResizeObserver로 실제 Vim 캔버스 해상도와 편집 영역을 함께 갱신합니다.
- vim-wasm 0.0.13에 포함된 실제 Vim 8.2.0055. 모방한 키 바인딩이 아닌 Vim의 검색, text object, 레지스터, 매크로, 버퍼, 분할을 사용합니다.
- 설정 포트 수정, 문자열 편집, 점 반복, 범위 치환, 매크로 변환, 두 버퍼 동기화의 여섯 미션.
- 단계별 힌트와 완료 후 복습. 정해진 키 순서를 강제하지 않으며 저장된 파일 내용을 검증합니다. 부수적인 변경도 검출합니다.
- 편집기 아래 **편집기 설정**에서 Mono 폰트와 12–28px 크기를 선택합니다. 미리보기와 실제 Vim에 적용하고 다음 방문에도 보관합니다. 기본값은 시스템 Mono 16px입니다. JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Inconsolata는 사이트에 포함되어 설치 없이 사용합니다. Cascadia Code/Mono, Consolas, Menlo, Monaco, Courier New는 기기에 설치된 것을 사용하며 없으면 시스템 Mono로 대체합니다. 한글은 기기의 대체 글꼴을 사용합니다. 영문 일반·굵은 글꼴을 로드한 뒤 Vim의 글자 폭을 계산합니다.
- 미션별 지정 파일은 `:w` 시 localStorage에 보관합니다. 미저장 변경은 이동·종료 시 경고합니다. `:wa`로 여러 버퍼를 저장할 수 있습니다.
- 완료 기록은 로컬 브라우저에만 보관합니다. 계정 동기화는 없습니다. 임의의 새 파일을 영구 저장하는 범용 파일시스템은 아직 아닙니다.
- `/vim-study/` 범위의 coi-serviceworker로 GitHub Pages에서 cross-origin isolation을 구성합니다. 최초 접속 시 한 번 새로고침될 수 있습니다.

## 학습 원칙과 다음 과정

M3 **편집 명령을 문장처럼 조합하기**는 `#grammar`에서 시작합니다. 검색줄 열기부터 검색어·확정, c → i → w, y → i → 큰따옴표, d → i → 큰따옴표, P와 저장을 18단계로 나눕니다. 실제 커서 위치·모드·복사 내용·파일을 확인합니다. 이해 확인 3문제와 다른 문자열을 스스로 바꾸는 과제가 이어집니다. M2 완료 화면에서도 이 단원으로 이동할 수 있습니다.

단계별 수업은 `GuidedLesson`을 공유하고, 내용은 `lessons/basics.js`와 `lessons/grammar.js`, 채점은 `lessons/evaluate.js`에 둡니다. 완료·저장 기록은 단원별 `vim-field-guide:<id>:v1` 키에 보관하며 기존 M2 기록은 유지됩니다. `node scripts/grammar.mjs`로 실제 Vim 전체 흐름을 검증합니다.

목표는 키 암기가 아니라 의도를 편집 연산으로 표현하는 능력입니다. 미션 해결 → 힌트와 비교 → 다른 방식으로 재도전 → 로컬 터미널에서 재현의 순환을 권장합니다. 타수는 관찰값이고 점수·통과 기준이 아닙니다.

1. 생존: 모드, 저장, undo/redo, 도움말. 첫 미션에 최소 안내를 제공합니다.
2. 편집 문법: operator + motion/text object, 검색으로 목적지 찾기.
3. 반복 제거: dot, 범위 치환, 매크로와 레지스터.
4. 작업 공간: 버퍼와 윈도 구분, split과 파일 간 편집.
5. 후속 구현: marks/jumplist, 레지스터 보존, visual block, quickfix, arglist/argdo, global 명령, 변형 미션과 간격 반복.
6. 로컬 전이 과정: SSH, 권한, 외부 필터, 셸 왕복, 실제 프로젝트 편집. 브라우저의 가상 파일 성공을 실제 서버 작업 능력으로 동일시하지 않습니다.

## React 구조

- `src/App.jsx`: 미션 선택, 진행률, 화면 전환. 미션 이동은 전체 새로고침 없이 처리합니다.
- `src/components/`: 미션 목록·학습 세션·Vim 화면·설정 다이얼로그.
- `src/hooks/`: 저장 상태와 엔진 생명주기를 React에 연결합니다.
- `src/lib/`: 저장 데이터 검증, 폰트 로딩, Vim 어댑터, vimrc 생성.
- `src/styles/`: 기본 타이포그래피와 컴포넌트별 CSS Modules. 자체 CSS에 `!important`를 사용하지 않습니다.
- `src/missions.js`: 미션 데이터·힌트·완료 조건. UI 프레임워크와 독립적입니다.

React StrictMode를 활성화합니다. 미션 변경과 초기화 시 기존 Worker·이벤트·Observer·콜백을 정리하고, 확대/축소나 힌트 변경 시에는 Vim 인스턴스를 유지합니다. 기존 localStorage 키와 형식은 유지합니다. 긴 Ex 명령은 엔진 통신 버퍼 제한을 피하도록 vimrc 함수로 정의하고 짧은 호출만 전송합니다.

개발 원칙과 검증 절차는 [CONTRIBUTING.md](./CONTRIBUTING.md)에 정리합니다.

## 한계

vim.wasm은 오래된 실험적 이식판입니다. 현재 Vim/Neovim 전체 호환을 보장하지 않습니다. `:!grep`, `system()` 등 실제 OS 프로세스를 실행할 수 없습니다. 자동 JS 대체 엔진은 넣지 않았으며, 지원되지 않는 브라우저는 실행 불가 사유를 표시합니다. 키보드가 있는 최신 데스크톱 Chromium을 우선 검증합니다. Canvas 기반 편집기는 스크린리더 지원이 제한됩니다. Ctrl+Shift+F로 편집기에서 결과 확인 버튼으로 포커스를 옮길 수 있습니다.

## 검증

`npm test`는 초기값 실패, 정답 통과, 주변 내용 손상, CRLF, 누락 파일, 두 파일의 동시 수정 조건을 검사합니다.

로컬 Edge가 설치된 환경에서 실제 Vim 통합 검증:

```powershell
$env:TEST_URL='http://127.0.0.1:5173/vim-study/'
node scripts/smoke.mjs
```

다른 Chromium 채널은 `BROWSER_CHANNEL=chrome` 등으로 선택합니다. 여섯 미션을 실제 키 입력으로 풀고, 저장·새로고침 복원·오답 검출·다중 버퍼·모바일 가로 넘침을 확인합니다. 캡처는 무시되는 `test-results/`에 저장됩니다.

`node scripts/layout.mjs`는 `TEST_URL` 또는 기본 로컬 5184 포트에서 320px 휴대폰부터 1920px 데스크톱까지 7가지 화면 크기로 안내문 크기, 가로 넘침, Vim 캔버스 크기, 확대·복원 및 설정 창의 크기를 검증합니다.

`node scripts/lifecycle.mjs`는 StrictMode 시작, 새로고침 없는 미션 전환, Worker 수, 미저장 이동 경고, 뒤로 가기, 종료와 재시작을 검증합니다. `npm run format:check`로 JSX/CSS 형식을 확인합니다.

`node scripts/basics.mjs`는 새 단원의 아홉 단계를 실제 Vim 입력으로 통과시키며, 잘못된 입력 차단, 모드 전환, undo/redo, 저장, 질문 오답 재시도, 독립 연습과 완료 기록을 검사합니다. 기존 미션 테스트는 `#port`, 새 단원은 `#basics`로 접근합니다.

## 배포

GitHub 저장소 `yooseongc/vim-study`의 Settings → Pages → Source를 GitHub Actions로 설정합니다. main 브랜치에 push하면 `.github/workflows/pages.yml`이 테스트·빌드 후 배포합니다. 기존 루트 블로그 저장소를 수정할 필요가 없습니다. `vite.config.js`의 base는 `/vim-study/`입니다.

## 오픈소스

- [vim.wasm](https://github.com/rhysd/vim.wasm): Vim license. 배포물의 `vendor/VIM-LICENSE.txt`와 upstream 소스를 참고하세요.
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker): MIT. 배포물의 `vendor/COI-LICENSE.txt`에 저작권·라이선스를 포함합니다.
- Vite, Playwright는 개발·검증 도구입니다. 각 패키지의 라이선스를 따릅니다.
- 포함된 Mono 폰트는 Fontsource 패키지로 공급하며 SIL Open Font License를 따릅니다. 각 원문의 저작권 및 라이선스를 `vendor/<font-name>-LICENSE.txt`로 함께 배포합니다.
