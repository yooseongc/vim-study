export const review = { id: 'review', title: '다시 꺼내 쓰는 연습' };
const saveHints = [
  'Esc로 일반 모드로 돌아갑니다.',
  '콜론으로 명령줄을 엽니다.',
  'w를 입력합니다.',
  'Enter로 저장합니다.',
];
export const reviewCards = [
  {
    id: 'insert',
    title: '입력과 저장',
    from: '첫 편집',
    description: '기존 단어 앞에 글자를 붙이고 저장합니다.',
    variants: [
      { initial: 'ready', target: 'Vim ready', add: 'Vim ' },
      { initial: 'notes', target: 'My notes', add: 'My ' },
      { initial: 'draft', target: 'New draft', add: 'New ' },
    ],
  },
  {
    id: 'word',
    title: '단어 하나 바꾸기',
    from: '편집 문법',
    description: '공백과 뒤의 단어를 남기고 첫 단어만 바꿉니다.',
    variants: [
      {
        initial: 'const name = "guest user";\nconst role = "viewer";',
        target: 'const name = "admin user";\nconst role = "viewer";',
        search: 'guest',
        replacement: 'admin',
      },
      {
        initial: 'const name = "draft report";\nconst role = "viewer";',
        target: 'const name = "final report";\nconst role = "viewer";',
        search: 'draft',
        replacement: 'final',
      },
      {
        initial: 'const name = "old config";\nconst role = "viewer";',
        target: 'const name = "new config";\nconst role = "viewer";',
        search: 'old',
        replacement: 'new',
      },
    ],
  },
  {
    id: 'quotes',
    title: '따옴표 안쪽 바꾸기',
    from: '편집 문법',
    description: '두 단어를 함께 바꾸되 따옴표와 다음 줄은 보존합니다.',
    variants: [
      {
        initial: 'const name = "guest editor";\nconst role = "viewer";',
        target: 'const name = "release ready";\nconst role = "viewer";',
        search: 'guest',
        replacement: 'release ready',
      },
      {
        initial: 'const name = "old title";\nconst role = "viewer";',
        target: 'const name = "team notes";\nconst role = "viewer";',
        search: 'old',
        replacement: 'team notes',
      },
      {
        initial: 'const name = "draft page";\nconst role = "viewer";',
        target: 'const name = "public guide";\nconst role = "viewer";',
        search: 'draft',
        replacement: 'public guide',
      },
    ],
  },
];

export function reviewCourse(card, attempt = 0) {
  const variant = card.variants[attempt % card.variants.length];
  const hints =
    card.id === 'insert'
      ? [
          'Esc로 일반 모드로 돌아갑니다.',
          '줄 맨 앞에서 i를 누릅니다.',
          `${JSON.stringify(variant.add)}를 입력합니다. 마지막 공백도 포함합니다.`,
        ]
      : [
          'Esc로 일반 모드로 돌아갑니다.',
          '슬래시로 검색줄을 엽니다.',
          `${variant.search}를 입력합니다.`,
          'Enter로 검색을 확정합니다.',
          'c로 바꾸기를 시작합니다.',
          'i로 안쪽 범위를 고릅니다.',
          card.id === 'word'
            ? 'w로 단어를 대상으로 정합니다.'
            : '큰따옴표로 따옴표 안쪽 전체를 고릅니다.',
          `${variant.replacement}를 입력합니다.`,
        ];
  return {
    id: `review-${card.id}`,
    review: true,
    title: card.title,
    eyebrow: `변형 복습 · ${card.from}`,
    file: 'review.txt',
    steps: [],
    questions: [],
    initial: variant.initial,
    challengeInitial: variant.initial,
    challengeTarget: variant.target,
    challengeTitle: card.title,
    challengeDescription: `${card.description} 아래 목표 내용으로 만들고 저장하세요. 해결 방법은 자유입니다.`,
    hints: [...hints, ...saveHints],
    recap: '목표 내용과 저장 상태를 실제 Vim에서 확인했습니다.',
    note: '타수나 속도로 평가하지 않습니다. 도움말 또는 실패한 점검을 사용했다면 조금 뒤 다른 예제로 다시 연습합니다.',
    nextLabel: '복습 목록으로',
  };
}
