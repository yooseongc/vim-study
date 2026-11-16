export function checkExercise(course, snapshot, saved) {
  if (!snapshot) return { kind: 'waiting', message: 'Vim을 준비하고 있습니다.' };
  if (snapshot.path !== `/work/${course.file}`)
    return {
      kind: 'path',
      message: `${course.file}에서 연습하고 있습니다. 콜론을 열고 e /work/${course.file}를 입력한 뒤 Enter로 돌아오세요.`,
    };
  const target = course.target.split('\n');
  const row = Array.from(
    { length: Math.max(target.length, snapshot.lines.length) },
    (_, i) => i,
  ).find((i) => target[i] !== snapshot.lines[i]);
  if (row !== undefined)
    return {
      kind: 'text',
      row: row + 1,
      actual: snapshot.lines[row] ?? '(줄 없음)',
      expected: target[row] ?? '(이 줄은 없어야 합니다)',
      message: target[row]?.startsWith('note:')
        ? `${row + 1}번째 설명 줄은 바꾸지 않는 부분입니다. Esc로 나온 뒤 u로 마지막 변경을 되돌려보세요.`
        : `${row + 1}번째 줄을 목표와 비교해보세요. 지금까지 맞게 바꾼 줄은 그대로 두면 됩니다.`,
    };
  if (snapshot.mode !== 'n')
    return {
      kind: 'mode',
      message:
        '내용은 맞습니다. Esc로 일반 모드로 돌아오세요. 명령줄의 저장을 실행 중이라면 Enter로 마치세요.',
    };
  if (snapshot.modified || snapshot.dirtyCount || saved !== course.target)
    return {
      kind: 'save',
      message: '내용은 맞습니다. 콜론 → w → Enter로 저장하면 이 문제가 끝납니다.',
    };
  return { kind: 'success', message: '바꿀 내용과 남길 내용, 저장까지 확인했습니다.' };
}

export function modeText(mode = '') {
  if (mode === 'n') return '일반 모드';
  if (mode.startsWith('no')) return '범위를 기다리는 중';
  if (mode.startsWith('i')) return '입력 모드';
  if (mode.startsWith('c')) return '명령줄 입력 중';
  if (mode === 'r?') return '치환 확인 중';
  return mode ? '다른 모드 · Esc로 돌아오기' : 'Vim 준비 중';
}
