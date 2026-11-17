export function checkExercise(course, snapshot, saved) {
  if (!snapshot) return { kind: 'waiting', message: 'Vim을 준비하고 있습니다.' };
  if (course.targets) return checkFiles(course, snapshot);
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
  if (snapshot.recording)
    return { kind: 'recording', message: '내용은 맞습니다. Esc로 나온 뒤 q로 녹화를 끝내세요.' };
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

function checkFiles(course, snapshot) {
  if (snapshot.quickfixWindow)
    return {
      kind: 'path',
      message: '목록 창입니다. :cclose와 Enter로 닫고 파일로 돌아오세요. 목록은 남습니다.',
    };
  if (!Object.keys(course.targets).some((name) => snapshot.path === `/work/${name}`))
    return { kind: 'path', message: `:e /work/${course.file}와 Enter로 연습 파일에 돌아오세요.` };
  for (const [name, target] of Object.entries(course.targets)) {
    const actual =
      snapshot.path === `/work/${name}` ? snapshot.lines.join('\n') : snapshot.buffers?.[name];
    if (actual !== target)
      return {
        kind: 'files',
        message: course.protectedFiles?.includes(name)
          ? `${name} 파일은 그대로 보존해야 합니다. 이 파일로 돌아가 변경을 되돌려주세요.`
          : `${name}의 편집 내용을 확인하세요. 목표와 다른 내용이 남아 있습니다.`,
      };
  }
  if (snapshot.recording)
    return { kind: 'recording', message: '내용은 맞습니다. Esc로 나온 뒤 q로 녹화를 끝내세요.' };
  if (snapshot.mode !== 'n')
    return { kind: 'mode', message: '내용은 맞습니다. Esc로 일반 모드로 돌아오세요.' };
  if (
    snapshot.dirtyCount ||
    snapshot.modified ||
    Object.entries(course.targets).some(([name, target]) => snapshot.files?.[name] !== target)
  )
    return {
      kind: 'save',
      message:
        '내용은 맞습니다. :wa와 Enter로 모든 수정 버퍼를 저장하세요. :w는 현재 파일만 저장합니다.',
    };
  return { kind: 'success', message: '모든 대상 파일의 저장과 보존할 파일을 확인했습니다.' };
}

export function modeText(mode = '') {
  if (mode === 'r') return '메시지 확인 · Enter로 계속';
  if (mode === 'v') return '문자 선택 모드';
  if (mode === 'V') return '줄 선택 모드';
  if (mode === '\u0016') return '블록 선택 모드';
  if (mode === 'n') return '일반 모드';
  if (mode.startsWith('no')) return '범위를 기다리는 중';
  if (mode.startsWith('i')) return '입력 모드';
  if (mode.startsWith('c')) return '명령줄 입력 중';
  if (mode === 'r?') return '치환 확인 중';
  return mode ? '다른 모드 · Esc로 돌아오기' : 'Vim 준비 중';
}
