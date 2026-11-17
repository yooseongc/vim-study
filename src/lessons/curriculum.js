// The public learning path. Legacy routes remain in catalog.js.
export const curriculum = [
  {
    id: 'basics-workshop',
    title: '모드를 알고, 편집하고 저장하기',
    group: '편집의 기본',
    label: '이어서 모드를 알고, 편집하고 저장하기',
  },
  {
    id: 'grammar-workshop',
    title: '찾고, 이동하고, 범위를 편집하기',
    group: '편집의 기본',
    label: '이어서 검색과 편집 문법 배우기',
  },
  {
    id: 'workshop',
    title: '한 번 바꾸고, 다시 쓰기',
    group: '범위와 반복',
    label: '이어서 한 번 바꾸고 다시 쓰기',
  },
  {
    id: 'range-workshop',
    title: '범위를 고르고, 확인하며 바꾸기',
    group: '범위와 반복',
    label: '이어서 범위를 고르고, 확인하며 바꾸기',
  },
  {
    id: 'register-workshop',
    title: '복사한 내용을 지키며 편집하기',
    group: '범위와 반복',
    label: '이어서 복사한 내용 보관하기',
  },
  {
    id: 'macro-workshop',
    title: '여러 동작을 묶고, 확인하며 반복하기',
    group: '범위와 반복',
    label: '이어서 여러 동작을 매크로로 묶기',
  },
  {
    id: 'navigation-workshop',
    title: '멀리 이동하고, 다시 돌아오기',
    group: '이동과 여러 파일',
    label: '이어서 멀리 이동하고 제자리로 돌아오기',
  },
  {
    id: 'block-workshop',
    title: '같은 열을 골라 함께 편집하기',
    group: '이동과 여러 파일',
    label: '이어서 여러 줄을 블록으로 편집하기',
  },
  {
    id: 'buffer-workshop',
    title: '버퍼와 창을 구분하며 파일 다루기',
    group: '이동과 여러 파일',
    label: '이어서 버퍼와 창을 구분하기',
  },
  {
    id: 'quickfix-workshop',
    title: '검색 목록을 따라 편집하기',
    group: '이동과 여러 파일',
    label: '이어서 검색 목록으로 파일 이동하기',
  },
  {
    id: 'batch-workshop',
    title: '목록을 정하고 함께 바꾸기',
    group: '이동과 여러 파일',
    label: '이어서 파일 목록에 같은 변경 적용하기',
  },
  {
    id: 'global-workshop',
    title: '조건으로 줄을 골라 처리하기',
    group: '이동과 여러 파일',
    label: '이어서 조건에 맞는 줄만 처리하기',
  },
  {
    id: 'local',
    title: '내 터미널에서 마무리하기',
    group: '내 터미널로',
    label: '이어서 내 터미널에서 마무리하기',
  },
];
export const curriculumGroups = [...new Set(curriculum.map((course) => course.group))];
export function nextLesson(id) {
  const index = curriculum.findIndex((course) => course.id === id);
  return index < 0 ? undefined : curriculum[index + 1];
}
