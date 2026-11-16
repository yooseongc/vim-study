import { modeMatches, stateMatches, stepSatisfied } from './evaluate.js';

export const issueLabels = {
  mode: '모드 구분',
  text: '편집 범위와 내용',
  command: '명령줄',
  cursor: '검색 위치',
  register: '복사 범위',
  save: '저장',
  key: '키 입력',
  state: 'Vim 상태와 여러 파일 저장',
};

export function diagnose(step, snapshot, pressed = [], saved = '') {
  if (!snapshot)
    return { kind: 'waiting', message: 'Vim이 준비되면 현재 상태를 확인할 수 있습니다.' };
  if (stepSatisfied(step, snapshot, pressed, saved)) {
    return { kind: 'success', message: '내용과 모드가 목표에 맞습니다. 다음으로 넘어가도 됩니다.' };
  }
  if (!modeMatches(step, snapshot.mode)) {
    if (snapshot.mode === 'r' || snapshot.mode === 'rm')
      return {
        kind: 'mode',
        message: 'Vim이 출력 메시지 확인을 기다립니다. Enter를 눌러 편집 화면으로 돌아오세요.',
      };
    if (snapshot.mode === 'r?')
      return {
        kind: 'mode',
        message:
          '치환 확인에 답하는 중입니다. 현재 항목을 바꾸려면 y, 건너뛰려면 n, 남은 확인을 중단하려면 q를 누르세요. 이미 바꾼 내용은 유지됩니다.',
      };
    if (step.mode === 'r?')
      return {
        kind: 'mode',
        message:
          '아직 치환 확인 상태가 아닙니다. c 옵션이 붙은 명령을 입력하고 Enter로 실행했는지 확인하세요. 이미 확인을 끝냈다면 처음부터 다시 연습할 수 있습니다.',
      };
    const message = snapshot.mode.startsWith('i')
      ? '지금은 입력 모드입니다. 편집을 마쳤다면 Esc를 한 번 눌러 일반 모드로 돌아오세요.'
      : snapshot.mode.startsWith('c')
        ? '지금은 명령줄에 입력 중입니다. 실행하려면 Enter, 취소하려면 Esc를 누르세요.'
        : snapshot.mode.startsWith('no')
          ? 'Vim이 편집할 범위를 기다리고 있습니다. 안내의 다음 범위 키를 누르거나 Esc로 취소하세요.'
          : step.mode === 'i'
            ? '아직 입력 모드가 아닙니다. 안내의 키로 입력을 시작한 뒤 글자를 쓰세요.'
            : step.mode === 'c'
              ? '아직 명령줄이 열리지 않았습니다. 이번 단계에 안내된 콜론 또는 슬래시부터 누르세요.'
              : step.mode === 'no'
                ? '아직 범위를 기다리는 상태가 아닙니다. 안내의 동작 키부터 눌러 보세요.'
                : '먼저 Esc로 일반 모드로 돌아온 뒤 현재 내용을 확인하세요.';
    return { kind: 'mode', message };
  }
  const target = step.text.split('\n');
  const row = Array.from(
    { length: Math.max(target.length, snapshot.lines.length) },
    (_, i) => i,
  ).find((i) => target[i] !== snapshot.lines[i]);
  if (row !== undefined)
    return {
      kind: 'text',
      message: `${row + 1}번째 줄이 목표와 다릅니다. 공백과 따옴표, 바꾸지 않아야 할 부분도 비교해 보세요.`,
      actual: snapshot.lines[row],
      expected: target[row],
    };
  if (
    (step.commandType !== undefined && step.commandType !== snapshot.commandType) ||
    (step.command !== undefined && step.command !== snapshot.command)
  ) {
    return {
      kind: 'command',
      message:
        '명령줄의 종류 또는 내용이 다릅니다. 검색은 /, 저장은 :로 시작합니다. 오타는 Backspace로 고치세요.',
      actual: `${snapshot.commandType || ''}${snapshot.command}`,
      expected: `${step.commandType || ':'}${step.command}`,
    };
  }
  if (
    step.cursor &&
    (snapshot.cursor?.[0] !== step.cursor[0] || snapshot.cursor?.[1] !== step.cursor[1])
  ) {
    return {
      kind: 'cursor',
      message: `커서 위치가 다릅니다. 목표는 ${step.cursor[0]}번째 줄 ${step.cursor[1]}번째 칸입니다. 안내한 이동을 확인하세요.`,
    };
  }
  if (step.register !== undefined && step.register !== snapshot.register) {
    return {
      kind: 'register',
      message:
        '파일은 맞지만 복사한 내용이 다릅니다. 대상 안에 커서를 두고 복사할 범위를 다시 골라 보세요.',
      actual: snapshot.register || '',
      expected: step.register,
    };
  }
  if (!stateMatches(step.state, snapshot)) {
    return {
      kind: 'state',
      message:
        step.stateHint ||
        '내용 외의 Vim 상태가 아직 목표와 다릅니다. 파일 위치, 레지스터, 녹화 여부와 저장 상태를 안내와 비교하세요.',
    };
  }
  if (step.saved && (snapshot.modified || saved !== step.text)) {
    return {
      kind: 'save',
      message:
        '편집은 맞았습니다. 아직 이 내용을 저장하지 않았습니다. 콜론으로 명령줄을 열고, w를 입력한 다음 Enter를 누르세요.',
    };
  }
  return {
    kind: 'key',
    message: `현재 내용은 맞습니다. 이번 단계의 ${step.key || step.pressed} 키도 직접 눌러 확인해 보세요.`,
  };
}
