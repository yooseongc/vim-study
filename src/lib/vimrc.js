import { vimFont } from './fonts.js';
import { workspaceVimrc } from './workspace-vimrc.js';

export function createVimrc(names, settings, sessionId, observe = false, workspace = false) {
  const bridge = `window.__vimFieldSessions.get("${sessionId}")`;
  const dict =
    '{' + names.map((name) => `'${name}': join(readfile('/work/${name}'), "\\n")`).join(',') + '}';
  return `set nocompatible
set number hidden noswapfile nobackup nowritebackup
set incsearch hlsearch ignorecase smartcase
set backspace=indent,eol,start
let &guifont = '${vimFont(settings)}'
set laststatus=2
let &statusline = '%f %m%r%=%l:%c'
syntax on
set background=dark
highlight Normal guifg=#d5e2dd guibg=#152521
highlight LineNr guifg=#71847c guibg=#152521
highlight StatusLine guifg=#152521 guibg=#b0c4a0
highlight Search guifg=#152521 guibg=#e6c27a
function! FieldCheck()
call jsevalfunc('${bridge}?.result(...arguments)', [${dict}, len(filter(getbufinfo(), 'v:val.changed'))], v:true)
endfunction
${
  observe
    ? `function! FieldObserve(timer)
let snapshot = {'mode': mode(1), 'lines': getline(1,'$'), 'modified': &modified, 'command': getcmdline(), 'commandType': getcmdtype(), 'cursor': [line('.'), col('.')], 'register': getreg('"')}
let snapshot.path = expand('%:p')
let snapshot.registerA = getreg('a')
let snapshot.registerZero = getreg('0')
let snapshot.recording = reg_recording()
let snapshot.markA = getpos("'a")[1:2]
let snapshot.jumpCount = len(getjumplist()[0])
let snapshot.visualStart = [line('v'), col('v')]
let snapshot.quickfixCount = len(getqflist())
let snapshot.quickfixIndex = get(getqflist({'idx': 0}), 'idx', 0)
let snapshot.quickfixWindow = &buftype ==# 'quickfix'
let snapshot.buffers = {}
for name in ${JSON.stringify(names)}
let path = '/work/' . name
let snapshot.buffers[name] = bufloaded(path) ? join(getbufline(path, 1, '$'), "\\n") : join(readfile(path), "\\n")
endfor
let snapshot.argumentCount = argc()
let snapshot.argumentIndex = argidx()
let snapshot.dirtyCount = len(filter(getbufinfo(), 'v:val.changed'))
let snapshot.files = ${dict}
call jsevalfunc('${bridge}?.observe(...arguments)', [snapshot], v:true)
endfunction
call timer_start(100, function('FieldObserve'), {'repeat': -1})`
    : ''
}
augroup FieldGuide
autocmd!
autocmd BufWritePost /work/* call jsevalfunc('${bridge}?.saved(...arguments)', [expand('%:p'), getline(1,'$')], v:true)
autocmd BufEnter * call jsevalfunc('${bridge}?.path(...arguments)', [expand('%:p')], v:true)
autocmd TextChanged,TextChangedI,BufWritePost,BufEnter * call jsevalfunc('${bridge}?.changed(...arguments)', [len(filter(getbufinfo(), 'v:val.changed'))], v:true)
augroup END
${workspace ? workspaceVimrc(bridge) : ''}
`;
}
