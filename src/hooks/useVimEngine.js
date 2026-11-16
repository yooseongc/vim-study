import { useEffect, useRef, useState } from 'react';
import { createVimEngine } from '../lib/vim-engine.js';

export function useVimEngine(files, settings, callbacks) {
  const canvas = useRef(null),
    input = useRef(null),
    engine = useRef(null);
  const latest = useRef(callbacks);
  latest.current = callbacks;
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('실제 Vim을 불러오는 중…');
  useEffect(() => {
    setStatus('loading');
    setMessage('실제 Vim을 불러오는 중…');
    const current = createVimEngine({
      canvas: canvas.current,
      input: input.current,
      files,
      settings,
      callbacks: {
        ...(callbacks.observe ? { observe: (...args) => latest.current.observe(...args) } : {}),
        ...Object.fromEntries(
          ['key', 'escapeFocus', 'changed', 'saved', 'path', 'result'].map((name) => [
            name,
            (...args) => latest.current[name](...args),
          ]),
        ),
        ready: () => {
          setStatus('ready');
          setMessage('');
        },
        error: (error) => {
          setStatus('error');
          setMessage(`Vim을 실행하지 못했습니다. ${error.message}`);
        },
        exit: () => {
          setStatus('exited');
          setMessage('Vim을 종료했습니다. 미션을 다시 선택하거나 새로고침해 주세요.');
          latest.current.changed(false);
        },
      },
    });
    engine.current = current;
    return () => {
      engine.current = null;
      current.dispose();
    };
  }, [files, settings]);
  return { canvas, input, engine, status, message };
}
