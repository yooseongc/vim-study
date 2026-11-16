import { useCallback, useRef, useState } from 'react';
import { readStudy, writeStorage, STUDY_KEY } from '../lib/storage.js';

export function useStudyStore() {
  const [initial] = useState(readStudy);
  const [state, setState] = useState(initial.state);
  const [warning, setWarning] = useState(initial.warning);
  const latest = useRef(state);
  const update = useCallback((transform) => {
    const next = transform(latest.current);
    latest.current = next;
    setState(next);
    const persisted = writeStorage(STUDY_KEY, next);
    setWarning(
      persisted ? '' : '변경 내용을 브라우저에 저장하지 못했습니다. 이번 세션에서만 유지됩니다.',
    );
    return persisted;
  }, []);
  const saveFile = useCallback(
    (id, name, content) =>
      update((previous) => ({
        ...previous,
        files: {
          ...previous.files,
          [id]: { ...previous.files[id], [name]: content },
        },
      })),
    [update],
  );
  const complete = useCallback(
    (id) =>
      update((previous) => ({
        ...previous,
        completed: previous.completed.includes(id)
          ? previous.completed
          : [...previous.completed, id],
      })),
    [update],
  );
  const reset = useCallback(
    (id) =>
      update((previous) => {
        const files = { ...previous.files };
        delete files[id];
        return { ...previous, files };
      }),
    [update],
  );
  return { state, warning, saveFile, complete, reset };
}
