import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { substitution } from '../src/lessons/substitution.js';
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
      window.subSnapshot = snapshot;
      observe(snapshot);
    };
  });
}
async function press(key) {
  if (['Escape', 'Enter'].includes(key)) await page.keyboard.press(key);
  else await page.keyboard.type(key, { delay: 25 });
}
async function focus() {
  await page.locator('#lesson-focus').click();
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.subSnapshot?.lines.join('\n'))).toBe(text);
}
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#substitution',
  );
  await ready();
  const actions = [
    'Escape',
    ':',
    's',
    '/',
    'old',
    '/',
    'new',
    '/',
    'Enter',
    'u',
    ':',
    's/old/new/',
    'g',
    'Enter',
    ':',
    '1,2',
    's/old/new/',
    'g',
    'Enter',
    ':',
    '%',
    's/old/new/',
    'g',
    'c',
    'Enter',
    'n',
    'y',
    'y',
    ':',
    'w',
    'Enter',
  ];
  for (let index = 0; index < actions.length; index++) {
    await expect(page.locator('#lesson-step')).toHaveText(`${index + 1} / 31`);
    await focus();
    await press(actions[index]);
    await expect(page.locator('#lesson-next')).toBeEnabled();
    if (index === 6) {
      await press('x');
      await expect(page.locator('#lesson-next')).toBeDisabled();
      await page.keyboard.press('Backspace');
      await expect(page.locator('#lesson-next')).toBeEnabled();
    }
    if (index === 24) {
      await expect(page.locator('#lesson-mode')).toHaveText('치환 확인 중');
      await page.screenshot({ path: 'test-results/substitution-confirm.png', fullPage: true });
    }
    await page.locator('#lesson-next').click();
  }
  await page.getByRole('button', { name: '파일 전체의 모든 old', exact: true }).click();
  await expect(page.locator('#quiz-next')).toBeDisabled();
  for (const answer of [
    '현재 줄의 첫 번째 old',
    '%는 전체 줄, g는 각 대상 줄의 모든 일치 항목',
    'n으로 건너뛴다',
  ]) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.locator('#quiz-next').click();
  }
  await ready();
  await focus();
  await press(':%s/off/on/g');
  await press('Enter');
  await textIs(substitution.challengeInitial.replaceAll('off', 'on'));
  await page.locator('#lesson-check').click();
  await expect(page.locator('#lesson-diagnosis')).toContainText('2번째 줄');
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await focus();
  await press('u');
  await textIs(substitution.challengeInitial);
  await press(':%s/off/on/gc');
  await press('Enter');
  await expect(page.locator('#lesson-mode')).toHaveText('치환 확인 중');
  // Quit after accepting one match; q must preserve that edit.
  await press('y');
  await press('q');
  await textIs('dev: on off\nnote: off stays\nprod: off off');
  await press('u');
  await textIs(substitution.challengeInitial);
  await press(':%s/off/on/gc');
  await press('Enter');
  await expect(page.locator('#lesson-mode')).toHaveText('치환 확인 중');
  for (const key of ['y', 'y', 'n', 'y', 'y']) await press(key);
  await textIs(substitution.challengeTarget);
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await press(':w');
  await press('Enter');
  await expect(page.locator('#lesson-finish')).toBeEnabled();
  await page.locator('#lesson-finish').click();
  assert.equal(
    await page.evaluate(() => localStorage.getItem('vim-field-guide:substitution:v1')),
    null,
  );
  assert.equal(await page.evaluate(() => localStorage.getItem('vim-field-guide:review:v1')), null);
  await page.screenshot({ path: 'test-results/substitution-complete.png', fullPage: true });
  await page.getByRole('button', { name: '내 파일에서 연습하기', exact: true }).click();
  await expect(page.locator('#title')).toHaveText('나의 Vim 작업 공간');
  await expect.poll(() => page.workers().length).toBe(1);
  await page.getByRole('button', { name: /범위를 정하고 확인하며 치환하기/ }).click();
  await ready();
  await expect(page.locator('#lesson-step')).toHaveText('1 / 31');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/substitution-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: 31 Vim steps, current-line/range/all-file substitution, g/c flags, actual confirmation mode, y/n/q behavior, protected line feedback, save gating, no records, navigation and mobile.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.subSnapshot));
  await page.screenshot({ path: 'test-results/substitution-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
