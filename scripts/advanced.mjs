import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { advancedCourses, nextCourse } from '../src/lessons/catalog.js';
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const solutions = {
  registers: ['"ayyjdd"ap', ':w', 'Enter'],
  macros: ['qaIactive: ', 'Esc', 'jq@a', ':w', 'Enter'],
  navigation: ['/draft', 'Enter', 'maG`aciwfinal', 'Esc', ':w', 'Enter'],
  block: ['Ctrl+v', 'jI# ', 'Esc', ':w', 'Enter'],
  quickfix: [
    ':vimgrep /TODO/ /work/api.txt /work/web.txt',
    'Enter',
    'ciwDONE',
    'Esc',
    ':cnext',
    'Enter',
    'ciwDONE',
    'Esc',
    ':wa',
    'Enter',
  ],
  batch: [
    ':args /work/api.txt /work/web.txt',
    'Enter',
    ':argdo %s/draft/final/g',
    'Enter',
    ':argdo update',
    'Enter',
    'Enter',
  ],
  global: [':g/^TEMP/d', 'Enter', ':w', 'Enter'],
};
async function press(page, key) {
  if (key === 'Esc') await page.keyboard.press('Escape');
  else if (key === 'Enter' || key.startsWith('Ctrl+'))
    await page.keyboard.press(key.replace('Ctrl+', 'Control+'));
  else await page.keyboard.type(key, { delay: 45 });
}
async function ready(page) {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#lesson-mode')).toHaveText('일반 모드');
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const observe = callbacks.observe;
    callbacks.observe = (snapshot) => {
      window.advancedSnapshot = snapshot;
      observe(snapshot);
    };
  });
}
try {
  for (const course of advancedCourses.filter(
    (item) => !process.env.COURSE || item.id === process.env.COURSE,
  )) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    let current = '';
    try {
      await page.goto(base + '#' + course.id);
      await ready(page);
      for (let i = 0; i < course.steps.length; i++) {
        const step = course.steps[i];
        current = `${course.id} ${i + 1}/${course.steps.length} ${step.key}`;
        await expect(page.locator('#lesson-step')).toHaveText(`${i + 1} / ${course.steps.length}`);
        await page.locator('#lesson-focus').click();
        await press(page, step.key);
        await expect(page.locator('#lesson-next')).toBeEnabled({ timeout: 8000 });
        if (['Ctrl+v', '@'].includes(step.key))
          await page.screenshot({
            path: `test-results/${course.id}-in-progress.png`,
            fullPage: true,
          });
        await page.locator('#lesson-next').click();
      }
      await page.getByRole('button', { name: course.questions[0].answers[1], exact: true }).click();
      await expect(page.locator('#quiz-next')).toBeDisabled();
      for (const question of course.questions) {
        await page
          .getByRole('button', { name: question.answers[question.correct], exact: true })
          .click();
        await page.locator('#quiz-next').click();
      }
      current = `${course.id} independent challenge`;
      await ready(page);
      await expect(page.locator('#lesson-finish')).toBeDisabled();
      await page.locator('#lesson-focus').click();
      for (const key of solutions[course.id].slice(0, -2)) await press(page, key);
      await expect(page.locator('#lesson-finish')).toBeDisabled();
      for (const key of solutions[course.id].slice(-2)) await press(page, key);
      await expect(page.locator('#lesson-finish')).toBeEnabled({ timeout: 8000 });
      // A correct active file alone must not pass if a protected file is changed.
      if (course.challengeState) {
        await press(page, ':edit /work/notes.txt');
        await press(page, 'Enter');
        await press(page, 'x');
        await press(page, ':w');
        await press(page, 'Enter');
        await press(page, ':edit /work/web.txt');
        await press(page, 'Enter');
        await expect(page.locator('#lesson-finish')).toBeDisabled();
        await press(page, ':edit /work/notes.txt');
        await press(page, 'Enter');
        await press(page, 'u');
        await press(page, ':w');
        await press(page, 'Enter');
        await press(page, ':edit /work/web.txt');
        await press(page, 'Enter');
        await expect(page.locator('#lesson-finish')).toBeEnabled();
      }
      await page.locator('#lesson-finish').click();
      assert.deepEqual(
        await page.evaluate(() =>
          Object.keys(localStorage).filter((key) =>
            /review|registers|macros|navigation|block|quickfix|batch|global/.test(key),
          ),
        ),
        [],
      );
      await page.screenshot({ path: `test-results/${course.id}-complete.png`, fullPage: true });
      await page.getByRole('button', { name: course.nextLabel, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${nextCourse(course.id)}$`));
      await expect.poll(() => page.workers().length).toBe(course.id === 'global' ? 0 : 1);
      page.on('dialog', (dialog) => dialog.accept());
      await page.goto(base + '#' + course.id);
      await ready(page);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await page.screenshot({ path: `test-results/${course.id}-mobile.png`, fullPage: true });
      assert.deepEqual(errors, []);
      console.log(
        `PASS: ${course.id}: ${course.steps.length} real Vim stages, quiz, independent saved challenge, protected files, no records, navigation and mobile.`,
      );
    } catch (error) {
      console.error(current, await page.evaluate(() => window.advancedSnapshot));
      await page.screenshot({ path: `test-results/${course.id}-failure.png`, fullPage: true });
      throw error;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
