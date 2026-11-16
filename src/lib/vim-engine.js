import { VimWasm, checkBrowserCompatibility } from 'vim-wasm';
import { loadEditorFont, vimFont } from './fonts.js';
import { createVimrc } from './vimrc.js';
import { validFileName } from './workspace-files.js';

// vim-wasm 0.0.13 has no public dispose API. Keep its pinned-version
// internals here only; UI components never access workers or screen handlers.
function disposeVim(vim) {
  if (!vim) return;
  clearTimeout(vim.screen.resizer.bounceTimerToken);
  vim.screen.onVimExit();
  vim.worker.terminate();
}

export function createVimEngine({ canvas, input, files, settings, callbacks }) {
  const sessionId = crypto.randomUUID();
  const sessions = (window.__vimFieldSessions ??= new Map());
  sessions.set(sessionId, callbacks);
  let vim,
    observer,
    windowResize,
    disposed = false,
    ready = false,
    serial = Promise.resolve();
  const stop = () => {
    if (disposed) return;
    disposed = true;
    ready = false;
    sessions.delete(sessionId);
    observer?.disconnect();
    if (windowResize) window.removeEventListener('resize', windowResize);
    input.removeEventListener('keydown', onKey, true);
    disposeVim(vim);
  };
  const onKey = (event) => {
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key))
      callbacks.key({ key: event.key, ctrl: event.ctrlKey });
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopImmediatePropagation();
      callbacks.escapeFocus();
    }
  };
  async function start() {
    const reason = checkBrowserCompatibility();
    if (reason) throw new Error('HTTPS 또는 localhost로 접속하고 서비스 워커를 허용하세요.');
    await loadEditorFont(settings);
    if (disposed) return;
    input.addEventListener('keydown', onKey, true);
    vim = new VimWasm({
      canvas,
      input,
      workerScriptPath: `${import.meta.env.BASE_URL}vendor/vim.js`,
    });
    let lastSize = '';
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const size = `${width}:${height}:${dpr}`;
      if (!ready || disposed || width <= 0 || height <= 0 || lastSize === size) return;
      lastSize = size;
      // Assigning even the same canvas size erases all pixels. Vim may skip
      // repainting an unchanged grid, so only clear a dimension when it changes.
      const pixelWidth = Math.floor(width * dpr);
      const pixelHeight = Math.floor(height * dpr);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      vim.resize(Math.floor(width), Math.floor(height));
    };
    observer = new ResizeObserver(resize);
    vim.onVimInit = () => {
      if (disposed) return;
      ready = true;
      // vim-wasm 0.0.13 also installs a delayed window resize handler. It
      // clears the canvas again 500 ms later, after our observer has repainted.
      // This adapter owns both element and window resizing instead.
      vim.screen.resizer.onVimExit();
      clearTimeout(vim.screen.resizer.bounceTimerToken);
      windowResize = resize;
      window.addEventListener('resize', windowResize, { passive: true });
      observer.observe(canvas);
      resize();
      callbacks.ready();
      vim.focus();
    };
    vim.onError = (error) => {
      if (!disposed) {
        callbacks.error(error);
        stop();
      }
    };
    vim.onVimExit = () => {
      if (!disposed) {
        callbacks.exit();
        stop();
      }
    };
    vim.onFileExport = (path, contents) => {
      if (disposed) return;
      const url = URL.createObjectURL(new Blob([contents]));
      const link = document.createElement('a');
      link.href = url;
      link.download = path.split('/').pop();
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const names = Object.keys(files);
    vim.start({
      clipboard: false,
      dirs: ['/work'],
      files: {
        '/field.vim': createVimrc(
          names,
          settings,
          sessionId,
          Boolean(callbacks.observe),
          Boolean(callbacks.workspaceState),
        ),
        ...Object.fromEntries(Object.entries(files).map(([name, text]) => [`/work/${name}`, text])),
      },
      cmdArgs: ['-u', '/field.vim', ...names.map((name) => `/work/${name}`)],
    });
  }
  start().catch((error) => {
    if (!disposed) {
      callbacks.error(error);
      stop();
    }
  });
  function command(action) {
    const result = serial.then(() => {
      if (!ready || disposed) throw new Error('Vim이 실행 중이 아닙니다.');
      return action();
    });
    serial = result.catch(() => {});
    return result;
  }
  return {
    dispose: stop,
    focus: () => {
      if (ready && !disposed) vim.focus();
    },
    check: () =>
      command(() => {
        vim.sendKeydown('Escape', 27);
        return vim.cmdline('call FieldCheck()');
      }),
    openFile: (name) =>
      command(() => {
        if (!validFileName(name))
          throw new Error(
            '파일 이름은 영문·숫자로 시작하고 영문·숫자·점·밑줄·하이픈만 사용할 수 있습니다 (최대 64자).',
          );
        vim.sendKeydown('Escape', 27);
        return vim.cmdline(`execute 'edit ' . fnameescape('/work/${name}')`);
      }),
    deleteFile: (name) =>
      command(() => {
        if (!validFileName(name)) throw new Error('지원하지 않는 파일 이름입니다.');
        vim.sendKeydown('Escape', 27);
        return vim.cmdline(`call WorkspaceDelete('/work/${name}')`);
      }),
    setFont: (next) =>
      command(async () => {
        await loadEditorFont(next);
        if (disposed) throw new Error('Vim 세션이 종료되었습니다.');
        await vim.cmdline(`let &guifont = '${vimFont(next)}' | redraw!`);
      }),
  };
}
