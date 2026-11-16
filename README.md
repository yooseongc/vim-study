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

- vim-wasm 0.0.13에 포함된 실제 Vim 8.2.0055. 모방한 키 바인딩이 아닌 Vim의 검색, text object, 레지스터, 매크로, 버퍼, 분할을 사용합니다.
- 설정 포트 수정, 문자열 편집, 점 반복, 범위 치환, 매크로 변환, 두 버퍼 동기화의 여섯 미션.
- 단계별 힌트와 완료 후 복습. 정해진 키 순서를 강제하지 않으며 저장된 파일 내용을 검증합니다. 부수적인 변경도 검출합니다.
- 편집기 아래 **편집기 설정**에서 Mono 폰트와 12–28px 크기를 선택합니다. 미리보기와 실제 Vim에 적용하고 다음 방문에도 보관합니다. 기본값은 시스템 Mono 16px입니다. JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Inconsolata는 사이트에 포함되어 설치 없이 사용합니다. Cascadia Code/Mono, Consolas, Menlo, Monaco, Courier New는 기기에 설치된 것을 사용하며 없으면 시스템 Mono로 대체합니다. 한글은 기기의 대체 글꼴을 사용합니다. 영문 일반·굵은 글꼴을 로드한 뒤 Vim의 글자 폭을 계산합니다.
- 미션별 지정 파일은 `:w` 시 localStorage에 보관합니다. 미저장 변경은 이동·종료 시 경고합니다. `:wa`로 여러 버퍼를 저장할 수 있습니다.
- 완료 기록은 로컬 브라우저에만 보관합니다. 계정 동기화는 없습니다. 임의의 새 파일을 영구 저장하는 범용 파일시스템은 아직 아닙니다.
- `/vim-study/` 범위의 coi-serviceworker로 GitHub Pages에서 cross-origin isolation을 구성합니다. 최초 접속 시 한 번 새로고침될 수 있습니다.

## 학습 원칙과 다음 과정

목표는 키 암기가 아니라 의도를 편집 연산으로 표현하는 능력입니다. 미션 해결 → 힌트와 비교 → 다른 방식으로 재도전 → 로컬 터미널에서 재현의 순환을 권장합니다. 타수는 관찰값이고 점수·통과 기준이 아닙니다.

1. 생존: 모드, 저장, undo/redo, 도움말. 첫 미션에 최소 안내를 제공합니다.
2. 편집 문법: operator + motion/text object, 검색으로 목적지 찾기.
3. 반복 제거: dot, 범위 치환, 매크로와 레지스터.
4. 작업 공간: 버퍼와 윈도 구분, split과 파일 간 편집.
5. 후속 구현: marks/jumplist, 레지스터 보존, visual block, quickfix, arglist/argdo, global 명령, 변형 미션과 간격 반복.
6. 로컬 전이 과정: SSH, 권한, 외부 필터, 셸 왕복, 실제 프로젝트 편집. 브라우저의 가상 파일 성공을 실제 서버 작업 능력으로 동일시하지 않습니다.

각 미션의 데이터·힌트·완료 조건은 `src/missions.js`에 모여 있습니다. 실제 엔진과 학습 UI 연결은 `src/main.js`입니다. 긴 Ex 명령은 엔진 통신 버퍼 제한을 피하도록 vimrc 함수로 정의하고 짧은 함수 호출만 전송합니다.

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

## 배포

GitHub 저장소 `yooseongc/vim-study`의 Settings → Pages → Source를 GitHub Actions로 설정합니다. main 브랜치에 push하면 `.github/workflows/pages.yml`이 테스트·빌드 후 배포합니다. 기존 루트 블로그 저장소를 수정할 필요가 없습니다. `vite.config.js`의 base는 `/vim-study/`입니다.

## 오픈소스

- [vim.wasm](https://github.com/rhysd/vim.wasm): Vim license. 배포물의 `vendor/VIM-LICENSE.txt`와 upstream 소스를 참고하세요.
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker): MIT. 배포물의 `vendor/COI-LICENSE.txt`에 저작권·라이선스를 포함합니다.
- Vite, Playwright는 개발·검증 도구입니다. 각 패키지의 라이선스를 따릅니다.
- 포함된 Mono 폰트는 Fontsource 패키지로 공급하며 SIL Open Font License를 따릅니다. 각 원문의 저작권 및 라이선스를 `vendor/<font-name>-LICENSE.txt`로 함께 배포합니다.
