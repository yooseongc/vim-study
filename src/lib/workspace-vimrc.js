export function workspaceVimrc(bridge) {
  return `cd /work
set nomodeline
function! WorkspaceObserve(timer)
let buffers = map(filter(getbufinfo(), 'v:val.listed'), '{"number": v:val.bufnr, "path": v:val.name, "modified": v:val.changed}')
let state = {'path': expand('%:p'), 'buffer': bufnr('%'), 'windows': winnr('$'), 'window': win_getid(), 'windowNumber': winnr(), 'buffers': buffers, 'mode': mode(1), 'command': getcmdline()}
call jsevalfunc('${bridge}?.workspaceState(...arguments)', [state], v:true)
endfunction
call timer_start(150, function('WorkspaceObserve'), {'repeat': -1})
function! WorkspaceSaved(path)
try
let contents = join(readfile(a:path, 'b'), "\\n")
call jsevalfunc('${bridge}?.workspaceEvent(...arguments)', ['saved', a:path, contents], v:true)
catch
call jsevalfunc('${bridge}?.workspaceEvent(...arguments)', ['error', a:path, v:exception], v:true)
endtry
endfunction
function! WorkspaceDelete(path)
try
let buffer = bufnr(a:path)
if buffer != -1 && getbufvar(buffer, '&modified')
throw 'Save changes before deleting this file.'
endif
if buffer != -1
execute 'bwipeout ' . buffer
endif
if filereadable(a:path) && delete(a:path) != 0
throw 'Could not delete file.'
endif
call jsevalfunc('${bridge}?.workspaceEvent(...arguments)', ['deleted', a:path, ''], v:true)
catch
call jsevalfunc('${bridge}?.workspaceEvent(...arguments)', ['error', a:path, v:exception], v:true)
endtry
endfunction
augroup WorkspaceFiles
autocmd!
autocmd BufWritePost,FileWritePost,FileAppendPost /work/* call WorkspaceSaved(expand('<afile>:p'))
augroup END
`;
}
