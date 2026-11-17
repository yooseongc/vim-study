export const rangeWorkshop = { id: 'range-workshop', title: '범위를 고르고, 확인하며 바꾸기' };

export const sample =
  'tea: small small\ncoffee: small small\nnote: small stays\njuice: small small';

// This preview deliberately supports literal text only, not Vim regular expressions.
export function previewSubstitution(scope, all) {
  return sample
    .split('\n')
    .map((line, index) => {
      const included = scope === '%' || (scope === '1,2' ? index < 2 : index === 0);
      return included
        ? all
          ? line.replaceAll('small', 'large')
          : line.replace('small', 'large')
        : line;
    })
    .join('\n');
}

const first = sample.replace('small', 'large');
const line = previewSubstitution('', true);
const range = previewSubstitution('1,2', true);
const confirmed = 'tea: large large\ncoffee: large large\nnote: small stays\njuice: large large';
const reference = [
  ':s/small/large/ — :로 명령줄을 열고, s로 치환합니다. /는 찾을 내용과 새 내용을 나누는 구분자입니다. 마지막에 Enter로 실행합니다.',
  '범위를 생략하면 현재 줄, 1,2는 1번부터 2번 줄까지, %는 파일의 모든 줄입니다.',
  'g는 각 대상 줄 안의 모든 일치 항목입니다. 파일 전체를 뜻하지 않습니다. c는 바꾸기 전에 확인하는 옵션입니다.',
  '확인 중에는 y로 바꾸기, n으로 건너뛰기, q로 남은 치환 중단입니다. q는 이미 바꾼 내용을 되돌리지 않습니다. 일반 모드에서 u로 한 번의 치환을 되돌릴 수 있습니다.',
];
const saveGoal = {
  label: '저장',
  title: '결과를 확인하고 저장합니다.',
  explanation: '바꿀 줄과 남길 줄을 비교한 뒤, 파일에 저장하세요.',
  keys: [
    [':', '명령줄'],
    ['w', '저장'],
    ['Enter', '실행'],
  ],
  result: '목표 내용 그대로 저장 완료',
  hints: ['Esc로 일반 모드로 나옵니다.', '콜론, w, Enter를 순서대로 누르면 저장합니다.'],
};
function lesson(file, initial, target, goals, stage, expected) {
  return {
    title: rangeWorkshop.title,
    practice: { guided: { file, initial, target, expected } },
    guidedGoals: goals,
    guidedStage: stage,
    challengeHints: [],
    reference,
  };
}

export const rangeLessons = [
  {
    label: '1 / 4 · 한 줄에서 비교하기',
    recap: 'g는 줄 안에서 바꿀 개수를 정합니다.',
    detail:
      '기본 치환은 현재 줄의 첫 항목만 바꿉니다. g를 붙이면 그 줄에 남은 일치 항목을 모두 바꿉니다. 다른 줄은 그대로입니다.',
    lesson: lesson(
      'line.txt',
      sample,
      line,
      [
        {
          label: '첫 항목',
          title: '첫 small 하나만 바꿉니다.',
          explanation: ':로 명령줄을 엽니다. s는 치환, /는 찾을 내용과 새 내용의 구분자입니다.',
          keys: [
            [':', '명령줄'],
            ['s', '치환'],
            ['/small', '찾을 내용'],
            ['/large/', '새 내용'],
            ['Enter', '실행'],
          ],
          result: 'tea: large small · 다른 줄은 그대로',
          hints: [
            's는 substitute, 치환입니다. 범위를 쓰지 않으면 현재 줄을 바꿉니다.',
            ':s/small/large/를 입력하고 Enter를 누르세요. 같은 줄의 두 번째 small은 남습니다.',
          ],
        },
        {
          label: '줄 안의 모두',
          title: '같은 줄의 남은 small도 바꿉니다.',
          explanation: '이번에는 끝에 g를 붙입니다. g는 현재 줄 안의 모든 일치 항목을 뜻합니다.',
          keys: [
            [':', '명령줄'],
            ['s/small/large/', '같은 치환'],
            ['g', '줄 안의 모두'],
            ['Enter', '실행'],
          ],
          result: 'tea: large large · coffee·note·juice는 그대로',
          hints: [
            '범위는 여전히 현재 줄입니다. g만 붙여도 다른 줄까지 바뀌지는 않습니다.',
            ':s/small/large/g를 입력하고 Enter를 누르세요.',
          ],
        },
        saveGoal,
      ],
      (snapshot) => {
        const text = snapshot?.lines.join('\n');
        return text === line ? 2 : text === first ? 1 : text === sample ? 0 : null;
      },
    ),
    question: '같은 줄 안의 일치 항목을 모두 바꾸는 것은?',
    answers: ['% — 전체 줄 범위', 'g — 각 줄 안의 모든 일치 항목'],
    correct: 1,
    why: 'g는 줄 안의 적용 횟수, %는 대상 줄의 범위입니다.',
  },
  {
    label: '2 / 4 · 두 줄로 넓히기',
    recap: '줄 범위와 g는 서로 다른 역할입니다.',
    detail:
      '1,2로 대상 줄을 고르고 g로 그 줄 안의 모든 항목을 골랐습니다. 범위 밖인 note와 juice는 남겼습니다.',
    lesson: lesson(
      'range.txt',
      sample,
      range,
      [
        {
          label: '줄 범위',
          title: '1번과 2번 줄만 바꿉니다.',
          explanation: '1,2는 1~2번 줄입니다. 뒤에 치환 명령을 붙이세요.',
          keys: [
            [':', '명령줄'],
            ['1,2', '1~2번 줄'],
            ['s/small/large/', '치환'],
            ['g', '각 줄의 모두'],
            ['Enter', '실행'],
          ],
          result: 'tea·coffee는 large · note·juice는 small',
          hints: [
            '커서 위치와 관계없이 1번부터 2번 줄을 대상으로 합니다.',
            ':1,2s/small/large/g를 입력하고 Enter를 누르세요.',
          ],
        },
        saveGoal,
      ],
      (snapshot) => (snapshot?.lines.join('\n') === range ? 1 : 0),
    ),
    question: '1,2 뒤에 g를 붙이면 3번 줄도 바뀔까요?',
    answers: ['아니요. 범위는 여전히 1~2번 줄입니다.', '네. g가 전체 파일로 범위를 넓힙니다.'],
    correct: 0,
    why: 'g는 범위를 넓히지 않습니다. 3번 줄은 치환 대상이 아닙니다.',
  },
  {
    label: '3 / 4 · 하나씩 확인하기',
    recap: '찾은 내용과 바꿀 대상은 다를 수 있습니다.',
    detail:
      '전체 파일에서 찾더라도 note는 남겨야 합니다. c 옵션으로 묻고, y 또는 n으로 결정할 수 있습니다.',
    lesson: lesson(
      'confirm.txt',
      sample,
      confirmed,
      [
        {
          label: '확인 옵션',
          title: '이번에는 juice까지 바꿉니다.',
          explanation:
            '%로 전체 줄을 고릅니다. note는 남겨야 하므로 c를 붙여 바꾸기 전에 확인합니다.',
          keys: [
            [':', '명령줄'],
            ['%', '전체 줄'],
            ['s/small/large/', '치환'],
            ['g', '각 줄의 모두'],
            ['c', '먼저 확인'],
            ['Enter', '실행'],
          ],
          result: '파일이 바로 바뀌지 않고 첫 small에서 확인을 기다립니다.',
          hints: [
            '여기의 c는 confirm 옵션입니다. 일반 모드의 c(change)와 역할이 다릅니다.',
            ':%s/small/large/gc를 입력하고 Enter를 누르세요.',
          ],
        },
        {
          label: '바꿀 항목',
          title: '메뉴 항목이라면 y로 바꿉니다.',
          explanation:
            '강조된 항목이 tea·coffee·juice인지 확인하세요. y를 누르면 하나 바꾸고 다음 항목에서 다시 묻습니다.',
          keys: [['y', '현재 항목 바꾸기']],
          result: '메뉴 항목만 large로 변경 · Enter는 누르지 않습니다.',
          hints: [
            'y는 yes입니다. 확인 중에는 Enter 없이 바로 적용됩니다.',
            'note가 나오기 전까지만 y로 답하세요. 남은 확인을 멈추려면 q입니다.',
          ],
        },
        {
          label: '남길 항목',
          title: 'note의 small은 n으로 남깁니다.',
          explanation: '지금의 n은 no입니다. 일반 모드에서 다음 검색 결과로 가는 n과 다릅니다.',
          keys: [['n', '이번 항목 건너뛰기']],
          result: 'note는 그대로 두고 juice의 첫 small에서 다시 묻습니다.',
          hints: [
            '강조된 위치가 3번 note 줄인지 확인하세요.',
            'n을 한 번 누르세요. 그다음 juice 항목에는 y로 답합니다.',
          ],
        },
        saveGoal,
      ],
      (snapshot) => {
        if (snapshot?.mode === 'r?') return snapshot.cursor?.[0] === 3 ? 2 : 1;
        if (snapshot?.lines.join('\n') === confirmed) return 3;
        return 0;
      },
    ),
    question: '확인 도중 q로 중단하면 이미 바꾼 내용은?',
    answers: ['모두 원래대로 돌아갑니다.', '바꾼 내용은 남고, 남은 확인만 끝납니다.'],
    correct: 1,
    why: 'q는 취소가 아니라 남은 치환 중단입니다. 되돌리려면 일반 모드에서 u를 사용합니다.',
  },
  {
    label: '4 / 4 · 혼자 적용하기',
    recap: '범위와 예외를 함께 다뤘습니다.',
    detail:
      'dev와 prod의 off 네 개를 on으로 바꾸고, note와 title은 남겼습니다. 저장된 결과까지 확인했습니다.',
    lesson: {
      title: rangeWorkshop.title,
      practice: {
        challenge: {
          file: 'switches.txt',
          initial: 'title: switches\ndev: off off\nnote: off stays\nprod: off off',
          target: 'title: switches\ndev: on on\nnote: off stays\nprod: on on',
          title: '바꿀 항목 네 개, 남길 항목 하나.',
          description:
            'dev와 prod의 off를 모두 on으로 바꾸고 저장하세요. note의 off와 title은 그대로 남깁니다. 범위를 나누거나, 하나씩 확인해도 됩니다.',
          expected: 'dev·prod의 on 네 개 · note와 title은 그대로 · 저장 완료',
        },
      },
      guidedGoals: [],
      guidedStage: () => null,
      reference,
      challengeHints: [
        '바꿀 줄은 2번과 4번입니다. 전체 범위에서 확인하며 바꾸는 방법도 가능합니다.',
        '%는 전체 줄, g는 각 줄의 모든 항목, c는 바꾸기 전 확인입니다.',
        ':%s/off/on/gc를 실행한 뒤 강조된 줄을 확인하며 y 또는 n으로 답하세요. note에서는 n입니다.',
        '모든 변경을 확인한 뒤 :w와 Enter로 저장합니다.',
      ],
    },
  },
];

rangeLessons.at(-1).lesson.solutions = [
  [
    '바꿀 위치가 적다면',
    '검색으로 dev와 prod의 off를 고른 뒤 단어 바꾸기와 점 반복을 사용할 수 있습니다. 설명 줄에서는 반복하지 않습니다.',
  ],
  [
    '같은 변경이 많다면',
    '줄 범위를 나눠 치환하거나 확인 옵션 c를 사용합니다. 파일 전체를 한꺼번에 바꾸면 note까지 바뀌므로 범위 또는 확인이 필요합니다.',
  ],
];
