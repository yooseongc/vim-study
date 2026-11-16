import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const url = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#lesson-mode')).toHaveText('일반 모드');
  await expect.poll(() => page.workers().length).toBe(1);
}
async function type(text) {
  await page.locator('#lesson-focus').click();
  await page.keyboard.type(text);
}
async function save() {
  await page.keyboard.press('Escape');
  await page.keyboard.type(':w');
  await page.keyboard.press('Enter');
}
async function finish() {
  await expect(page.locator('#lesson-finish')).toBeEnabled();
  await page.locator('#lesson-finish').click();
  await expect(page.locator('#review-result')).toContainText('다음 복습');
  await page.getByRole('button', { name: '복습 목록으로', exact: true }).click();
  await expect.poll(() => page.workers().length).toBe(0);
}
async function records() {
  return page.evaluate(() => JSON.parse(localStorage.getItem('vim-field-guide:review:v1')));
}
try {
  await page.goto(url + '#review');
  await expect(page.locator('#review-due')).toHaveText('지금 복습할 항목 0개');
  await page.locator('[data-review="insert"] button').click();
  await ready();
  await type('iVim ');
  await expect(page.locator('#lesson-mode')).toHaveText('입력 모드');
  await page.locator('#lesson-check').click();
  await expect(page.locator('#lesson-diagnosis')).toContainText('입력 모드');
  await type('');
  await page.keyboard.press('Escape');
  await expect(page.locator('#lesson-mode')).toHaveText('일반 모드');
  await page.locator('#lesson-check').click();
  await expect(page.locator('#lesson-diagnosis')).toContainText(
    '아직 이 내용을 저장하지 않았습니다',
  );
  await type('');
  await save();
  await finish();
  let stored = await records();
  assert.deepEqual(stored.insert.issues, ['mode', 'save']);
  assert.equal(stored.insert.dueAt - stored.insert.lastAt, 600000);
  // Unassisted success, alternate valid editing sequence.
  await page.locator('[data-review="word"] button').click();
  await ready();
  await type('/guest');
  await page.keyboard.press('Enter');
  await page.keyboard.type('diwiadmin');
  await save();
  await finish();
  stored = await records();
  assert.equal(stored.word.assisted, false);
  assert.equal(stored.word.dueAt - stored.word.lastAt, 86400000);
  // Wrong range is diagnosed, hints stay counted even after closing them.
  await page.locator('[data-review="quotes"] button').click();
  await ready();
  await type('/guest');
  await page.keyboard.press('Enter');
  await page.keyboard.type('ciwrelease ready');
  await save();
  await expect(page.locator('#lesson-save')).toContainText('저장했습니다');
  await page.locator('#lesson-check').click();
  await expect(page.locator('#lesson-diagnosis')).toContainText('1번째 줄');
  await expect(page.locator('#lesson-diagnosis')).toContainText('release·ready·editor');
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await page.screenshot({ path: 'test-results/review-feedback.png', fullPage: true });
  await page.getByRole('button', { name: '기억이 안 나면 도움말' }).click();
  await page.getByRole('button', { name: '도움말 접기' }).click();
  await type('ci"release ready');
  await save();
  await finish();
  stored = await records();
  assert.equal(stored.quotes.assisted, true);
  assert.deepEqual(stored.quotes.issues, ['text']);
  await page.reload();
  await expect(page.locator('[data-review="quotes"]')).toContainText('편집 범위와 내용');
  // Clock boundary handled from persisted due dates, no wait required.
  await page.evaluate(() => {
    const key = 'vim-field-guide:review:v1';
    const saved = JSON.parse(localStorage.getItem(key));
    saved.quotes.dueAt = Date.now() - 1;
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('#review-due')).toHaveText('지금 복습할 항목 1개');
  await page.screenshot({ path: 'test-results/review-hub.png', fullPage: true });
  await page.locator('#review-start').click();
  await ready();
  await expect(page.locator('#review-target')).toContainText('team notes');
  await type('iunsaved');
  await page.keyboard.press('Escape');
  await expect(page.getByText('저장하지 않은 변경 있음', { exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '← 복습 목록', exact: true }).click();
  await expect(page.locator('#review-target')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '← 복습 목록', exact: true }).click();
  assert.equal((await records()).quotes.attempts, 1, 'abandoned review is not graded');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/review-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  // Feedback is available in the original guided lesson, not only review.
  await page.goto(url + '#basics');
  await ready();
  await type('i');
  await expect(page.locator('#lesson-mode')).toHaveText('입력 모드');
  await page.locator('#lesson-check').click();
  await expect(page.locator('#lesson-diagnosis')).toContainText('입력 모드');
  assert.deepEqual(errors, []);
  console.log(
    'PASS: real Vim mode/text/save feedback, alternative solution, hints, independent/assisted scheduling, variants, due queue, persistence, unsaved guard, lifecycle and mobile.',
  );
} catch (error) {
  await page.screenshot({ path: 'test-results/review-failure.png', fullPage: true });
  console.error((await page.locator('body').innerText()).slice(-3500));
  throw error;
} finally {
  await browser.close();
}
