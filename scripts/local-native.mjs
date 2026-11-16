import { mkdir, mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { labArchiveFiles, labExpected } from '../src/lessons/local-lab.js';

await mkdir('test-results', { recursive: true });
const cwd = await mkdtemp(resolve('test-results/native-lab-'));
for (const [name, text] of Object.entries(labArchiveFiles())) {
  await mkdir(dirname(resolve(cwd, name)), { recursive: true });
  await writeFile(resolve(cwd, name), text);
}
const windows = process.platform === 'win32';
const vim = process.env.VIM_BIN || (windows ? 'C:/Program Files/Git/usr/bin/vim.exe' : 'vim');
const bash = process.env.BASH_BIN || (windows ? 'C:/Program Files/Git/bin/bash.exe' : 'bash');
const env = {
  ...process.env,
  PATH: windows ? `C:\\Program Files\\Git\\usr\\bin;${process.env.PATH}` : process.env.PATH,
};
function run(command, args) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    timeout: 30000,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  return result;
}
assert.equal(run(bash, ['verify.sh']).status, 1, 'initial lab must fail');
await writeFile(
  resolve(cwd, 'practice.vim'),
  `set hidden
set shell=sh shellcmdflag=-c shellquote= shellxquote= shellredir=>%s\\ 2>&1
args api.conf web.conf
argdo %s/draft/prod/g
argdo %s/3000/8080/g
argdo update
edit tasks.txt
normal! gg0
call feedkeys("qaIready: \\<Esc>jq@a", 'xt')
write
edit events.log
g/^DEBUG/d
write
edit names.txt
%!sort -u
write
quitall
`,
);
const edited = run(vim, ['-Nu', 'NONE', '-i', 'NONE', '-N', '-n', '-es', '-S', 'practice.vim']);
assert.equal(edited.status, 0, edited.stderr || edited.stdout);
for (const [name, expected] of Object.entries(labExpected))
  assert.equal(
    (await readFile(resolve(cwd, name), 'utf8')).replaceAll('\r\n', '\n'),
    expected,
    name,
  );
assert.equal(run(bash, ['verify.sh']).status, 0, 'native edits must pass');
await writeFile(
  resolve(cwd, 'readonly.vim'),
  `edit api.conf
set readonly
normal! gg0
normal! A #check
let v:errmsg = ''
silent! write
call assert_match('E45', v:errmsg)
saveas api-recovered.conf
call assert_equal(['mode=prod', 'port=8080'], readfile('api.conf'))
call assert_equal(['mode=prod #check', 'port=8080'], readfile('api-recovered.conf'))
if len(v:errors)
  call writefile(v:errors, 'errors.txt')
  cquit
endif
quitall
`,
);
const recovered = run(vim, ['-Nu', 'NONE', '-i', 'NONE', '-N', '-n', '-es', '-S', 'readonly.vim']);
assert.equal(
  recovered.status,
  0,
  await readFile(resolve(cwd, 'errors.txt'), 'utf8').catch(() => recovered.stderr),
);
await writeFile(resolve(cwd, 'notes.txt'), 'changed\n');
assert.equal(run(bash, ['verify.sh']).status, 1, 'collateral edit must fail');
console.log(
  'PASS: native Vim multi-file edits, recorded macro, global, external sort, Bash checker failure/success, readonly E45 and saveas recovery. SSH/job-control require an interactive user environment.',
);
