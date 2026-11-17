function challenge(course, hints, solutions, options = {}) {
  return {
    label: '방법을 직접 고르는 종합 문제',
    detail: '문제의 목표와 보존할 내용을 확인한 뒤 필요한 편집 방법을 조합합니다.',
    lesson: {
      title: course.title,
      practice: { challenge: course },
      guidedGoals: [],
      guidedStage: () => null,
      reference: [
        '검색은 문자열을 찾습니다. 편집 대상인지는 현재 줄과 파일을 보고 판단하세요.',
        '내용 변경과 저장은 별개입니다. 실수는 일반 모드의 u로 되돌린 뒤 결과를 확인하세요.',
      ],
      challengeHints: hints,
      solutions,
      ...options,
    },
  };
}
export const repetitionTransfer = challenge(
  {
    file: 'release.csv',
    initial: 'task,owner,status\nbackup,ops,pending\ndeploy,ops,pending\nexample,docs,pending',
    target: 'task,owner,status\nbackup,platform,ready\ndeploy,platform,ready\nexample,docs,pending',
    title: '배포표에서 실제 작업 두 개만 갱신하세요.',
    description:
      'backup과 deploy의 담당 팀을 platform, 상태를 ready로 바꿉니다. 제목 줄과 example 행은 그대로 남깁니다. 사용할 명령은 직접 고르세요.',
    expected: '실제 작업 두 행의 팀·상태 변경 · 예시 보존 · 저장',
  },
  [
    '반복되는 것은 한 단어 변경인가요, 두 필드를 바꾸는 일인가요? 먼저 한 행을 완성해보세요.',
    '범위 치환을 쓰면 2번과 3번 줄만 대상입니다. 매크로라면 첫 실행의 내용과 끝 위치를 확인하세요.',
    '예시의 pending도 검색됩니다. 단어가 같다고 바꿀 대상은 아닙니다.',
  ],
  [
    [
      '범위 치환 두 번',
      '대상 행이 연속되어 있으므로 같은 두 줄에 담당 팀과 상태의 치환을 각각 적용할 수 있습니다.',
    ],
    [
      '한 행의 작업을 녹화',
      '담당 팀과 상태 변경을 함께 녹화하고 다음 행에서 한 번 실행할 수 있습니다. 마지막 예시 행에서는 멈춰야 합니다.',
    ],
    [
      '검색과 점 반복',
      '필드별로 검색과 변경 반복을 조합할 수도 있습니다. 점은 마지막 변경 하나만 반복한다는 점을 기억하세요.',
    ],
  ],
);
export const filesTransfer = challenge(
  {
    file: 'server.conf',
    initial: 'port=3000\nenabled=false',
    files: {
      'README.md': 'Start: curl localhost:3000\nOld examples used 3000.',
      'history.txt': 'Original port: 3000',
    },
    targets: {
      'server.conf': 'port=8080\nenabled=true',
      'README.md': 'Start: curl localhost:8080\nOld examples used 3000.',
      'history.txt': 'Original port: 3000',
    },
    protectedFiles: ['history.txt'],
    title: '설정과 사용 안내를 함께 맞추세요.',
    description:
      '서버 포트를 8080으로 바꾸고 활성화하세요. README의 Start 명령도 같은 포트로 고칩니다. 과거 포트를 설명하는 문장과 history.txt는 보존하고 수정한 두 파일을 저장하세요.',
    expected: '설정과 실행 안내 일치 · 과거 기록 보존 · 모두 저장',
  },
  [
    '파일 전체에 같은 치환을 하면 과거 기록까지 바뀝니다. 바꿀 줄을 먼저 고르세요.',
    '두 창으로 비교하거나 버퍼를 하나씩 열어도 됩니다. 파일을 바꾼 뒤 숨은 미저장 버퍼를 확인하세요.',
    '현재 파일만 저장한 경우에는 다른 파일의 변경도 따로 저장하거나 wa를 사용하세요.',
  ],
  [
    [
      '두 창에서 비교',
      '설정과 실행 예제를 함께 보면서 숫자를 맞출 수 있습니다. 같은 3000이라도 과거 설명은 바꾸지 않습니다.',
    ],
    [
      '파일별로 순서대로 편집',
      '버퍼 이동으로 하나씩 수정해도 됩니다. 내용이 같은지 확인한 후 두 버퍼의 저장을 마칩니다.',
    ],
  ],
  { showBuffers: true },
);
