import { localSections } from './local-lab.js';
const setup = localSections.find((section) => section.id === 'setup');
const nativeSetup = {
  ...setup,
  intro:
    'Windows용 Vim과 PowerShell에서 시작합니다. 이 경로에서는 Bash나 WSL을 사용하지 않습니다. 먼저 Windows용 Vim을 설치해 터미널에서 실행할 수 있는지 확인하세요.',
  steps: [
    setup.steps[0],
    {
      title: '압축을 푼 실습 폴더로 이동합니다',
      where: 'PowerShell',
      command: 'Set-Location .\\vim-study-lab',
      text: '압축을 푼 상위 폴더에서 실행합니다. 다른 위치에 풀었다면 해당 경로를 사용하고, 공백이 있는 경로는 큰따옴표로 감싸세요.',
    },
    {
      title: '현재 위치를 확인합니다',
      where: 'PowerShell',
      command: 'Get-Location',
      text: 'vim-study-lab 폴더에 들어왔는지 확인합니다.',
    },
    {
      title: '연습 파일을 확인합니다',
      where: 'PowerShell',
      command: 'Get-ChildItem',
      text: 'api.conf, web.conf, notes.txt, tasks.txt, events.log, names.txt가 보여야 합니다.',
    },
    { ...setup.steps[4], where: 'PowerShell' },
    { ...setup.steps[5], where: 'PowerShell' },
  ],
};
const nativeFilter = {
  id: 'filter',
  title: '3. Vim 안에서 이름 정리하기',
  intro:
    '이 경로는 외부 sort 대신 Vim 내부의 sort를 사용합니다. 결과 파일은 같지만 외부 프로그램에 내용을 보내는 필터 실습은 별도입니다. 외부 필터는 WSL 또는 Linux·macOS 경로에서 연습하세요.',
  steps: [
    {
      title: '이름 목록을 엽니다',
      where: 'Vim 명령줄',
      command: ':edit names.txt',
      text: '원래 네 줄에서 alpha가 중복되어 있는지 확인합니다.',
    },
    {
      title: '정렬하고 중복을 없앱니다',
      where: 'Vim 명령줄',
      command: ':sort u',
      text: 'sort는 줄을 정렬합니다. 뒤의 u는 같은 줄을 하나만 남기는 옵션입니다. 외부 프로그램이나 Bash를 호출하지 않습니다.',
    },
    {
      title: '한 번 되돌려 비교합니다',
      where: 'Vim 일반 모드',
      command: 'u',
      text: '일반 모드의 u는 undo입니다. :sort 뒤에 붙이는 u 옵션과 역할이 다릅니다.',
    },
    {
      title: '결과를 복원하고 저장합니다',
      where: '키 조합',
      command: 'Ctrl+r',
      text: 'Ctrl을 누른 채 r로 정렬된 결과를 복원한 뒤 :w와 Enter로 저장합니다.',
    },
  ],
};
const nativeCheck = {
  id: 'shell',
  title: '4. 저장한 파일을 브라우저에서 확인하기',
  intro:
    '이 경로에서는 Bash 검사 스크립트와 Ctrl+z/fg를 사용하지 않습니다. 수정한 여섯 파일을 저장한 뒤 이 페이지에서 파일 내용만 비교합니다.',
  steps: [
    {
      title: '모든 수정 버퍼를 저장합니다',
      where: 'Vim 명령줄',
      command: ':wa',
      text: '현재 보이지 않는 버퍼의 변경까지 저장합니다.',
    },
    {
      title: '저장을 확인하고 종료합니다',
      where: 'Vim 명령줄',
      command: ':qa',
      text: '저장하지 않은 내용이 있으면 종료가 거부됩니다. !를 붙이기 전에 어떤 파일이 미저장인지 확인하세요.',
    },
    {
      title: '편집한 여섯 파일을 선택합니다',
      text: '아래 편집 결과 확인에서 실습 폴더의 여섯 파일을 선택하세요. expected 폴더의 정답 파일은 선택하지 않습니다. 실행한 명령이나 숙련도를 검사하는 것은 아닙니다.',
    },
  ],
};
export function localSectionsFor(environment) {
  if (environment === 'native') return [nativeSetup, localSections[1], nativeFilter, nativeCheck];
  if (environment === 'unix')
    return localSections.map((section) =>
      section.id !== 'setup'
        ? section
        : {
            ...section,
            intro:
              'Linux·macOS의 터미널에서 Vim과 Bash를 사용하는 실습입니다. ZIP을 새 폴더에 풀고 그 위치에서 시작하세요.',
            steps: section.steps.map((step) =>
              step.command !== 'cd vim-study-lab'
                ? step
                : {
                    ...step,
                    text: '터미널에서 압축을 푼 상위 폴더로 이동한 다음 실행하세요. 경로에 공백이 있으면 큰따옴표로 감쌉니다.',
                  },
            ),
          },
    );
  return localSections;
}
export const nativeOutcomes = {
  filter: [
    'alpha, beta, zeta 세 줄이 정렬되어 저장되어 있습니다.',
    '외부 필터와 Vim 내부 정렬은 다른 방법임을 구분합니다.',
  ],
  shell: [
    '수정한 여섯 파일의 저장을 마쳤습니다.',
    '브라우저에서 여섯 파일의 목표 일치를 확인합니다.',
  ],
};
