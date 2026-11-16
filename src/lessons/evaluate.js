function equalState(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && equalState(a[key], b[key]))
  );
}

export function stateMatches(expected = {}, snapshot) {
  return Object.entries(expected).every(([key, value]) => equalState(snapshot?.[key], value));
}

export function modeMatches(step, mode) {
  return step.modes ? step.modes.includes(mode) : step.mode === mode;
}

export function stepSatisfied(step, snapshot, pressed, saved) {
  return Boolean(
    snapshot &&
    modeMatches(step, snapshot.mode) &&
    snapshot.lines.join('\n') === step.text &&
    (!step.pressed || pressed.includes(step.pressed)) &&
    (step.commandType === undefined || snapshot.commandType === step.commandType) &&
    (step.command === undefined || snapshot.command === step.command) &&
    (step.cursor === undefined ||
      (snapshot.cursor?.[0] === step.cursor[0] && snapshot.cursor?.[1] === step.cursor[1])) &&
    (step.register === undefined || snapshot.register === step.register) &&
    stateMatches(step.state, snapshot) &&
    (!step.saved || (saved === step.text && !snapshot.modified)),
  );
}
