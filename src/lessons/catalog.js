import { basics } from './basics.js';
import { grammar } from './grammar.js';
import { dot } from './dot.js';
import { substitution } from './substitution.js';
import { registers } from './registers.js';
import { macros } from './macros.js';
import { navigation } from './navigation.js';
import { block } from './block.js';
import { quickfix } from './quickfix.js';
import { batch } from './batch.js';
import { globalLesson } from './global.js';

export const guidedCourses = [
  basics,
  grammar,
  dot,
  substitution,
  registers,
  macros,
  navigation,
  block,
  quickfix,
  batch,
  globalLesson,
];
export const advancedCourses = [
  registers,
  macros,
  navigation,
  block,
  quickfix,
  batch,
  globalLesson,
];
export function nextCourse(id) {
  return guidedCourses[guidedCourses.findIndex((course) => course.id === id) + 1]?.id || 'local';
}
