export function stepSatisfied(step, snapshot, pressed, saved) {
  return Boolean(
    snapshot &&
    snapshot.mode === step.mode &&
    snapshot.lines.join('\n') === step.text &&
    (!step.pressed || pressed.includes(step.pressed)) &&
    (step.commandType === undefined || snapshot.commandType === step.commandType) &&
    (step.command === undefined || snapshot.command === step.command) &&
    (step.cursor === undefined ||
      (snapshot.cursor?.[0] === step.cursor[0] && snapshot.cursor?.[1] === step.cursor[1])) &&
    (step.register === undefined || snapshot.register === step.register) &&
    (!step.saved || (saved === step.text && !snapshot.modified)),
  );
}
