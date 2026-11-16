import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { dot } from '../src/lessons/dot.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#lesson-mode')).toHaveText('일반 모드');
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const observe = callbacks.observe;
    callbacks.observe = (snapshot) => {
      window.dotSnapshot = snapshot;
      observe(snapshot);
    };
  });
}
async function focus() {
  await page.locator('#lesson-focus').click();
}
async function press(key) {
  if (['Escape', 'Enter', 'Control+r'].includes(key)) await page.keyboard.press(key);
  else await page.keyboard.type(key);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.dotSnapshot?.lines.join('\n'))).toBe(text);
}
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#dot',
  );
  await ready();
  const actions = [
    'Escape',
    '/',
    'pending',
    'Enter',
    'c',
    'i',
    'w',
    'ready',
    'Escape',
    'n',
    '.',
    'u',
    'Control+r',
    'n',
    '.',
    ':',
    'w',
    'Enter',
  ];
  for (let index = 0; index < actions.length; index++) {
    await expect(page.locator('#lesson-step')).toHaveText(`${index + 1} / 18`);
    await focus();
    await press(actions[index]);
    await expect(page.locator('#lesson-next')).toBeEnabled();
    if (index === 9) {
      // A second search skips the required target; unchanged text alone must not pass.
      await press('n');
      await expect(page.locator('#lesson-next')).toBeDisabled();
      await press('N');
      await expect(page.locator('#lesson-next')).toBeEnabled();
    }
    if (index === 10)
      await page.screenshot({ path: 'test-results/dot-guided.png', fullPage: true });
    await page.locator('#lesson-next').click();
  }
  await page.getByRole('button', { name: '검색부터 모든 키 입력', exact: true }).click();
  await expect(page.locator('#quiz-next')).toBeDisabled();
  for (const answer of [
    '현재 위치에서 단어를 ready로 바꾸는 변경',
    'n으로 그 위치를 건너뛰고 대상을 확인한다',
    'Ctrl을 누른 채 r',
  ]) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.locator('#quiz-next').click();
  }
  await ready();
  await focus();
  await press('/draft');
  await press('Enter');
  await press('ciwfinal');
  await press('Escape');
  let expected = dot.challengeInitial.replace('draft', 'final');
  await textIs(expected);
  await press('n');
  await press('.');
  expected = expected.replace('draft', 'final');
  await textIs(expected);
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await page.locator('#lesson-check').click();
  await expect(page.locator('#lesson-diagnosis')).toContainText('2번째 줄');
  await focus();
  await press('u');
  expected = dot.challengeInitial.replace('draft', 'final');
  await textIs(expected);
  await press('n');
  await press('.');
  expected = 'api: final\nnote: draft stays\nweb: final\njob: draft';
  await textIs(expected);
  await press('n');
  await press('.');
  await textIs(dot.challengeTarget);
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await press(':w');
  await press('Enter');
  await expect(page.locator('#lesson-finish')).toBeEnabled();
  await page.locator('#lesson-finish').click();
  assert.equal(await page.evaluate(() => localStorage.getItem('vim-field-guide:dot:v1')), null);
  assert.equal(await page.evaluate(() => localStorage.getItem('vim-field-guide:review:v1')), null);
  await page.screenshot({ path: 'test-results/dot-complete.png', fullPage: true });
  await page.getByRole('button', { name: '범위를 정해 치환하기', exact: true }).click();
  await expect(page.locator('#title')).toHaveText('범위를 정하고 확인하며 치환하기');
  await page.getByRole('button', { name: /나의 Vim 작업 공간/ }).click();
  await expect(page.locator('#title')).toHaveText('나의 Vim 작업 공간');
  await expect.poll(() => page.workers().length).toBe(1);
  await page.getByRole('button', { name: /한 번 바꾸고, 점으로 반복하기/ }).click();
  await ready();
  await expect(page.locator('#lesson-step')).toHaveText('1 / 18');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/dot-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: 18 actual Vim steps, search location checks, dot/undo/redo, quiz retry, skip protected match, wrong edit feedback, save gating, no progress records, workspace navigation and mobile.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.dotSnapshot));
  await page.screenshot({ path: 'test-results/dot-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
