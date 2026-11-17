const title = '찾고, 이동하고, 범위를 편집하기';
const goal = (label, explanation, keys, result, extra = {}) => ({
  label,
  title: label,
  explanation,
  keys,
  result,
  hints: ['위치를 잃었다면 Esc로 나온 뒤 gg로 첫 줄에 돌아오세요. 변경은 u로 되돌릴 수 있습니다.'],
  ...extra,
});
const save = goal(
  '확인하고 저장합니다.',
  '목표와 보존할 부분을 비교한 뒤 저장하세요.',
  [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  '목표 내용과 저장',
);
const recovery = {
  ...goal(
    '바뀐 부분을 다시 확인하세요.',
    '현재 내용 점검에서 다른 줄을 확인하고 Esc 다음 u로 최근 변경을 되돌려보세요.',
    [
      ['Esc', '일반 모드'],
      ['u', '최근 변경 되돌리기'],
    ],
    '목표와 다른 부분 복구',
  ),
  recovery: true,
};
const wordInitial = 'warn: disk full\nnote: warn is an example';
const wordTarget = 'info: disk full\nnote: warn is an example';
const codeInitial = 'if (ready) {\nrun();\nlog();\n}\n// keep this comment';
const codeTarget = 'if (ready) {\n  run();\n  log();\n}\n// keep this comment';
const lineInitial = 'log("ready")';
const lineTarget = '// status message\nlog("ready");';
export const codeEditingLessons = [
  {
    label: '문자 단위로 골라 바꾸기',
    detail:
      'v로 문자 선택을 시작하고 e로 단어 끝까지 고릅니다. c는 선택한 내용을 바꾸고 입력 모드로 들어갑니다.',
    lesson: {
      title,
      reference: [
        'v는 문자 선택, V는 줄 선택입니다. Esc는 선택을 취소합니다.',
        'e는 단어 끝으로 갑니다. 여기서는 warn의 n이며 콜론은 선택하지 않습니다.',
        '선택한 범위에서 c는 새 내용을 입력하고, d는 지운 뒤 일반 모드에 남습니다.',
      ],
      practice: {
        guided: {
          file: 'message.txt',
          initial: wordInitial,
          target: wordTarget,
          description: '첫 줄의 경고 수준만 info로 바꾸세요. 콜론과 메시지, 설명 줄은 남깁니다.',
        },
      },
      guidedGoals: [
        goal(
          '문자 선택을 시작합니다.',
          '첫 글자 w에서 소문자 v를 누릅니다. 줄 전체가 아닌 글자 단위로 고릅니다.',
          [['v', '문자 선택']],
          '문자 선택 모드',
        ),
        goal(
          '단어 끝까지 선택합니다.',
          'e는 현재 단어의 끝으로 이동합니다. warn 네 글자만 선택하고 콜론은 남겨두세요.',
          [['e', '단어 끝']],
          'warn만 선택',
        ),
        goal(
          '선택한 범위를 바꿉니다.',
          'c는 선택한 내용을 비우고 새 입력을 시작합니다.',
          [['c', '선택 범위 바꾸기']],
          '콜론 유지 · 입력 모드',
        ),
        goal(
          '새 수준을 입력합니다.',
          'info를 쓰고 Esc로 나옵니다. 기존 메시지는 그대로 둡니다.',
          [
            ['info', '새 내용'],
            ['Esc', '입력 마치기'],
          ],
          'info: disk full',
        ),
        save,
        recovery,
      ],
      challengeHints: [],
      guidedStage(s) {
        const text = s.lines.join('\n');
        if (text === wordTarget) return s.mode.startsWith('i') ? 3 : 4;
        if (s.mode.startsWith('i')) return 3;
        if (text !== wordInitial) return 5;
        if (s.mode === 'v') return s.cursor?.[1] === 1 ? 1 : 2;
        return 0;
      },
    },
  },
  {
    label: '두 줄의 들여쓰기 맞추기',
    detail:
      'shiftwidth는 들여쓰기 폭이며 expandtab은 탭 대신 공백을 씁니다. V로 두 줄을 고른 뒤 >로 오른쪽에 들여쓰기를 추가합니다.',
    lesson: {
      title,
      reference: [
        '이 문제에서는 현재 버퍼의 들여쓰기 폭을 공백 두 칸으로 맞춥니다. 개인 파일의 설정은 바꾸지 않습니다.',
        'V는 줄 선택, j는 다음 줄까지 선택 확장, >는 선택한 줄의 들여쓰기를 한 단계 늘립니다.',
        '<는 들여쓰기를 줄입니다. u로 변경을 되돌리고 다시 고를 수도 있습니다.',
      ],
      practice: {
        guided: {
          file: 'task.js',
          initial: codeInitial,
          target: codeTarget,
          description:
            '중괄호 안의 run과 log 두 줄만 공백 두 칸 들여쓰세요. 괄호와 주석 줄은 그대로 남깁니다.',
        },
      },
      guidedGoals: [
        goal(
          '이 파일의 들여쓰기 폭을 정합니다.',
          'setlocal은 현재 버퍼의 설정입니다. shiftwidth=2는 한 단계 두 칸, expandtab은 공백 사용입니다. Enter로 실행하세요.',
          [
            [':', '명령줄'],
            ['setlocal ', '현재 버퍼 설정'],
            ['shiftwidth=2 ', '두 칸'],
            ['expandtab', '공백 사용'],
            ['Enter', '실행'],
          ],
          '두 칸 들여쓰기 설정',
        ),
        goal(
          '첫 실행문으로 갑니다.',
          '첫 줄에서 j로 run 줄에 갑니다.',
          [['j', '아래 한 줄']],
          'run 줄 위에 커서',
        ),
        goal(
          '줄 선택을 시작합니다.',
          '대문자 V는 현재 줄 전체를 고릅니다.',
          [['V', '줄 선택']],
          'run 한 줄 선택',
        ),
        goal(
          '두 번째 실행문도 고릅니다.',
          'j로 log까지 선택합니다. 닫는 중괄호까지 내리지 마세요.',
          [['j', '다음 줄까지 선택']],
          'run과 log 두 줄 선택',
        ),
        goal(
          '두 줄을 함께 들여씁니다.',
          '>를 한 번 누르면 선택한 두 줄의 들여쓰기가 한 단계 늘어납니다.',
          [['>', '오른쪽으로 한 단계']],
          '각 실행문 앞 공백 두 칸',
          {
            prediction: {
              question: '지금 >를 누르면 어느 줄이 바뀔까요?',
              answers: ['선택한 run과 log 두 줄', '파일의 모든 줄'],
              correct: 0,
              why: '줄 선택이 편집 범위를 정합니다. 중괄호와 주석은 선택하지 않았으므로 남습니다.',
            },
          },
        ),
        save,
        recovery,
      ],
      challengeHints: [],
      guidedStage(s, previous = 0) {
        const text = s.lines.join('\n');
        if (text === codeTarget) return 5;
        if (text !== codeInitial) return 6;
        if (previous === 0 && s.lastCommand !== 'setlocal shiftwidth=2 expandtab') return 0;
        if (s.mode === 'V') return s.cursor?.[0] === 2 ? 3 : 4;
        if (s.cursor?.[0] === 2) return 2;
        return 1;
      },
    },
  },
  {
    label: '원하는 문자 뒤와 줄 위에 쓰기',
    detail:
      'f는 현재 줄의 문자를 찾습니다. a는 커서 뒤에서 입력하고 O는 현재 줄 위에 새 줄을 만듭니다.',
    lesson: {
      title,
      reference: [
        'f 다음에 찾을 문자를 누르면 현재 줄에서 그 문자로 갑니다. / 검색과는 범위가 다릅니다.',
        'i는 커서 앞에서, a는 커서 뒤에서 입력을 시작합니다.',
        'o는 아래 새 줄, O는 위 새 줄에서 입력을 시작합니다.',
      ],
      practice: {
        guided: {
          file: 'status.js',
          initial: lineInitial,
          target: lineTarget,
          description: '닫는 괄호 뒤에 세미콜론을 붙이고, 위에 상태 메시지라는 주석을 추가하세요.',
        },
      },
      guidedGoals: [
        goal(
          '닫는 괄호를 찾습니다.',
          'f 다음 닫는 괄호를 누릅니다. 이 줄에서 ) 위로 커서가 갑니다.',
          [
            ['f', '줄 안의 문자 찾기'],
            [')', '찾을 문자'],
          ],
          '닫는 괄호 위에 커서',
        ),
        goal(
          '커서 뒤에 입력을 시작합니다.',
          'a는 커서 뒤에서 입력합니다. 괄호 앞에 쓰는 i와 구분하세요.',
          [['a', '커서 뒤에서 입력']],
          '괄호 뒤 입력 모드',
        ),
        goal(
          '세미콜론을 붙입니다.',
          ';를 쓰고 Esc로 입력을 마칩니다.',
          [
            [';', '문장 끝'],
            ['Esc', '일반 모드'],
          ],
          'log("ready");',
        ),
        goal(
          '위에 주석 줄을 만듭니다.',
          '대문자 O로 현재 줄 위에 새 줄을 만듭니다. 소문자 o는 아래에 만듭니다.',
          [['O', '위 새 줄에서 입력']],
          '위쪽 빈 줄 · 입력 모드',
        ),
        goal(
          '주석을 입력합니다.',
          '// status message를 쓰고 Esc로 나옵니다.',
          [
            ['// status message', '주석'],
            ['Esc', '입력 마치기'],
          ],
          '주석 아래에 원래 코드',
        ),
        save,
        recovery,
      ],
      challengeHints: [],
      guidedStage(s) {
        const text = s.lines.join('\n');
        if (text === lineTarget) return s.mode.startsWith('i') ? 4 : 5;
        if (s.mode.startsWith('i')) return s.lines.length > 1 ? 4 : 2;
        if (text === lineInitial + ';') return 3;
        if (text !== lineInitial) return 6;
        return s.cursor?.[1] === lineInitial.length ? 1 : 0;
      },
    },
  },
  {
    label: '방법을 골라 코드 블록 정리하기',
    detail:
      '따옴표 안쪽 변경과 줄 선택 들여쓰기를 조합하거나, 작은 범위를 다시 입력할 수 있습니다.',
    lesson: {
      title,
      reference: [
        'ci"는 큰따옴표 안쪽만 바꿉니다.',
        '줄 선택 뒤 >는 선택한 줄을 들여씁니다. 폭이 다르면 setlocal shiftwidth=2 expandtab으로 맞출 수 있습니다.',
      ],
      guidedGoals: [],
      guidedStage: () => null,
      practice: {
        challenge: {
          file: 'notify.js',
          initial: 'if (ready) {\nsend("draft");\nlog("sent");\n}\n// draft is an example',
          target: 'if (ready) {\n  send("release");\n  log("sent");\n}\n// draft is an example',
          title: '발송 내용을 고치고 코드 블록을 정리하세요.',
          description:
            'send의 인자만 release로 바꾸고 두 실행문을 공백 두 칸 들여쓰세요. log의 인자와 주석은 보존합니다. 방법은 직접 고르세요.',
          expected: '인자 변경 · 두 줄 들여쓰기 · 주석 보존 · 저장',
        },
      },
      challengeHints: [
        '내용 변경과 들여쓰기를 따로 생각하세요. 같은 draft가 있는 주석은 수정 대상이 아닙니다.',
        '인자는 따옴표 안쪽을 고르면 주변 코드가 남습니다.',
        '들여쓰기 폭을 두 칸으로 맞추고 실행문 두 줄만 선택하세요.',
      ],
      solutions: [
        [
          '범위를 골라 조합했다면',
          'send의 따옴표 안쪽만 바꾸고, 실행문 두 줄을 골라 들여씁니다. 주석이 선택 범위에 없는지 확인하세요.',
        ],
        [
          '직접 다시 입력했다면',
          '같은 결과라면 통과합니다. 기존 코드가 길수록 필요한 범위만 편집하면 재입력과 오타를 줄일 수 있습니다.',
        ],
      ],
    },
  },
];
