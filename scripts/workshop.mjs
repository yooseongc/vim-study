import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { practice } from '../src/lessons/workshop.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#workshop-mode')).toHaveText('일반 모드');
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const observe = callbacks.observe;
    callbacks.observe = (value) => {
      window.workshopSnapshot = value;
      observe(value);
    };
  });
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('vim-input');
}
async function type(text) {
  await page.keyboard.type(text, { delay: 35 });
}
async function textIs(text) {
  await expect
    .poll(() => page.evaluate(() => window.workshopSnapshot?.lines.join('\n')))
    .toBe(text);
}
try {
  await page.goto(base);
  await expect(page.locator('#workshop-start')).toBeVisible();
  await page.screenshot({ path: 'test-results/workshop-intro.png', fullPage: true });
  assert.equal(page.workers().length, 0);
  // Start and complete the guided exercise using only keyboard input.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#workshop-start')).toBeFocused();
  await page.keyboard.press('Enter');
  await ready();
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
    [1024, 768],
    [768, 900],
    [390, 844],
    [320, 844],
  ]) {
    await page.setViewportSize({ width, height });
    const dimensions = await page.evaluate(() => {
      const canvas = document.querySelector('#vim-canvas').getBoundingClientRect();
      const next = document.querySelector('#workshop-next').getBoundingClientRect();
      const goal = document.querySelector('#workshop-goal').getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        canvasTop: canvas.top,
        canvasBottom: canvas.bottom,
        canvasHeight: canvas.height,
        nextBottom: next.bottom,
        goalTop: goal.top,
        goalBottom: goal.bottom,
        viewport: innerHeight,
        scroll: scrollY,
      };
    });
    assert.equal(dimensions.overflow, false, JSON.stringify({ width, ...dimensions }));
    assert.ok(
      dimensions.canvasHeight >= 150 &&
        dimensions.canvasTop >= 0 &&
        dimensions.canvasBottom <= height,
      JSON.stringify({ width, ...dimensions }),
    );
    assert.ok(
      dimensions.nextBottom <= height &&
        dimensions.goalTop >= 0 &&
        dimensions.goalBottom <= height &&
        (width > 850 || dimensions.goalBottom < dimensions.canvasTop),
      JSON.stringify({ width, ...dimensions }),
    );
    assert.equal(dimensions.scroll, 0, 'initial focus must not scroll the page');
    await page.screenshot({ path: `test-results/workshop-${width}.png`, fullPage: true });
    assert.equal(page.workers().length, 1);
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.keyboard.press('F2');
  await expect(page.getByText('힌트 1 / 2', { exact: true })).toBeVisible();
  await expect(page.locator('#vim-input')).toBeFocused();
  await type('/small');
  await page.keyboard.press('Enter');
  await expect(page.locator('#workshop-goal')).toHaveText('small을 large로 바꿉니다.');
  await type('ciwlarge');
  await page.keyboard.press('Escape');
  await textIs(practice.guided.first);
  await expect(page.locator('#workshop-goal')).toHaveText('다음 small로 이동합니다.');
  await type('n.');
  await textIs(practice.guided.target);
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await type('u');
  await textIs(practice.guided.first);
  await page.keyboard.press('Control+r');
  await textIs(practice.guided.target);
  await type(':w');
  await page.keyboard.press('Enter');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: '변경은 한 번. 적용은 두 번.' })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '다른 문제 혼자 풀기 →' })).toBeDisabled();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await ready();
  // Reset stays inside the current problem, with no duplicated workers.
  await type('ix');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '문제 초기화', exact: true }).click();
  await ready();
  await textIs(practice.challenge.initial);
  await expect(page.locator('#workshop-goal')).toHaveText(practice.challenge.title);
  await expect.poll(() => page.workers().length).toBe(1);
  await type('/whole');
  await page.keyboard.press('Enter');
  await type('ciwoat');
  await page.keyboard.press('Escape');
  await type('n.');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText(/3번째 설명 줄은 바꾸지 않는 부분/)).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('un.n.');
  await textIs(practice.challenge.target);
  await expect(page.getByText(/3번째 설명 줄은 바꾸지 않는 부분/)).toHaveCount(0);
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await type(':w');
  await page.keyboard.press('Enter');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(
    page.getByRole('heading', { name: '바꿀 줄과 남길 줄을 구별했어요.' }),
  ).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.screenshot({ path: 'test-results/workshop-finished.png', fullPage: true });
  await page.getByRole('button', { name: '다음에는 범위를 정해 치환하기 →' }).click();
  await expect(page.locator('#title')).toHaveText('범위를 정하고 확인하며 치환하기');
  await expect.poll(() => page.workers().length).toBe(1);
  await page.getByRole('button', { name: /한 번 바꾸고, 다시 쓰기/ }).click();
  await page.locator('#workshop-start').click();
  await ready();
  await page.locator('#settings-open').click();
  await page.locator('#font-family').selectOption('JetBrains Mono');
  await expect(page.locator('#settings-status')).toContainText('설정이 적용되었습니다');
  await page.locator('#font-size').focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('#font-size-value')).toHaveText('20 px');
  await expect(page.locator('#settings-status')).toContainText('설정이 적용되었습니다');
  await page.keyboard.press('Escape');
  await expect(page.locator('#vim-input')).toBeFocused();
  await textIs(practice.guided.initial);
  assert.equal(page.workers().length, 1);
  await type('iX');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /학습 목차/ }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: /기억을 정리하는 첫 편집/ }).click();
  await expect(page.getByRole('dialog', { name: '어디부터 연습할까요?' })).toBeVisible();
  await page.getByRole('button', { name: '학습 목차 닫기' }).click();
  await page.getByRole('button', { name: '문제 초기화', exact: true }).click();
  await ready();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press('F2');
  await type('/small');
  await page.keyboard.press('Enter');
  await expect(page.locator('#workshop-goal')).toHaveText('small을 large로 바꿉니다.');
  await expect
    .poll(() => page.locator('#workshop-goal').evaluate((el) => el.parentElement.scrollTop))
    .toBe(0);
  await page.screenshot({ path: 'test-results/workshop-mobile-edit.png', fullPage: true });
  await type(':q!');
  await page.keyboard.press('Enter');
  await expect(page.locator('#workshop-mode')).toHaveText('Vim 종료됨');
  await expect.poll(() => page.workers().length).toBe(0);
  await page.getByRole('button', { name: '문제 초기화', exact: true }).click();
  await ready();
  assert.deepEqual(errors, []);
  console.log(
    'PASS: keyboard-only guided practice, continuous ciw and n/dot, hints without focus loss, undo/redo, exact protected-line feedback, scoped reset, save gates, completion cleanup, no records, six usable viewports and next course.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.workshopSnapshot));
  await page.screenshot({ path: 'test-results/workshop-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
