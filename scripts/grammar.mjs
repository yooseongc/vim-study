import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
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
      window.testSnapshot = snapshot;
      observe(snapshot);
    };
  });
}
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#grammar',
  );
  await ready();
  const actions = [
    '/',
    'guest',
    'Enter',
    'c',
    'i',
    'w',
    'admin',
    'Escape',
    'y',
    'i',
    '"',
    'd',
    'i',
    '"',
    'P',
    ':',
    'w',
    'Enter',
  ];
  for (let i = 0; i < actions.length; i++) {
    await expect(page.locator('#lesson-step')).toHaveText(`${i + 1} / ${actions.length}`);
    await page.locator('#lesson-focus').click();
    if (['Escape', 'Enter'].includes(actions[i])) await page.keyboard.press(actions[i]);
    else await page.keyboard.type(actions[i], { delay: 25 });
    await expect(page.locator('#lesson-next')).toBeEnabled();
    if (i === 3)
      await page.screenshot({ path: 'test-results/grammar-pending.png', fullPage: true });
    await page.locator('#lesson-next').click();
  }
  await page.getByRole('button', { name: 'd: 삭제', exact: true }).click();
  await expect(page.locator('#quiz-next')).toBeDisabled();
  for (const answer of ['c: 바꾸기', '안쪽 범위를 고르기', 'c → i → "']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.locator('#quiz-next').click();
  }
  await ready();
  await page.locator('#lesson-focus').click();
  await page.keyboard.type('/guest', { delay: 25 });
  await page.keyboard.press('Enter');
  await page.keyboard.type('ciwrelease ready', { delay: 25 });
  await page.keyboard.press('Escape');
  await page.keyboard.type(':w', { delay: 25 });
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson-save')).toContainText('브라우저에도 저장');
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await page.keyboard.type('ci"release ready', { delay: 25 });
  await page.keyboard.press('Escape');
  await page.keyboard.type(':w', { delay: 25 });
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson-finish')).toBeEnabled();
  await page.locator('#lesson-finish').click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('vim-field-guide:grammar:v1')).completed,
    ),
    true,
  );
  await page.screenshot({ path: 'test-results/grammar-complete.png', fullPage: true });
  await page.reload();
  await ready();
  await expect(page.locator('#lesson-step')).toHaveText('1 / 18');
  await expect(
    page.locator('#mission-list button').filter({ hasText: '편집 명령을' }),
  ).toContainText('✓');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/grammar-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: /기억을 정리하는 첫 편집/ }).click();
  await ready();
  await expect(page.locator('#lesson-step')).toHaveText('1 / 9');
  await page.getByRole('button', { name: /편집 명령을 문장처럼/ }).click();
  await ready();
  await expect(page.locator('#lesson-step')).toHaveText('1 / 18');
  await expect.poll(() => page.workers().length).toBe(1);
  assert.equal(await page.evaluate(() => window.__vimFieldSessions.size), 1);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: 18 actions, operator-pending modes, cursor and register, quiz retry, wrong-range rejection, independent challenge, persistence, mobile.',
  );
} catch (error) {
  console.error('Vim snapshot:', await page.evaluate(() => window.testSnapshot));
  await page.screenshot({ path: 'test-results/grammar-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
