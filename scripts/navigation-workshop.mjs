import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { navigationLessons } from '../src/lessons/navigation-workshop.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('test-results', { recursive: true });
async function type(text) {
  await page.keyboard.type(text, { delay: 40 });
}
async function command(text) {
  await type(text);
  await page.keyboard.press('Enter');
}
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#vim-input')).toBeFocused();
  await page.evaluate(() => {
    const callback = [...window.__vimFieldSessions.values()][0];
    const original = callback.observe;
    window.navigationSnapshot = null;
    callback.observe = (value) => {
      window.navigationSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.navigationSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect
    .poll(() => page.evaluate(() => window.navigationSnapshot?.lines.join('\n')))
    .toBe(text);
}
async function cursor(row, col) {
  await expect
    .poll(() => page.evaluate(() => window.navigationSnapshot?.cursor))
    .toEqual([row, col]);
  await expect(page.locator('#navigation-cursor')).toHaveText(`${row}행 ${col}열`);
}
async function mobile(label) {
  for (const [width, height] of [
    [1280, 720],
    [1024, 768],
    [768, 900],
    [390, 844],
    [320, 844],
  ]) {
    await page.setViewportSize({ width, height });
    const bounds = await page.evaluate(() => {
      const canvas = document.querySelector('#vim-canvas').getBoundingClientRect();
      const coach = document.querySelector('#workshop-goal').parentElement.getBoundingClientRect();
      const key = document.querySelector('ol[aria-label] li:last-child')?.getBoundingClientRect();
      return {
        canvas: canvas.height,
        next: document.querySelector('#workshop-next').getBoundingClientRect().bottom,
        key: key?.bottom,
        coach: coach.bottom,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(bounds.overflow, false);
    assert.ok(
      bounds.canvas >= 150 && bounds.next <= height,
      JSON.stringify({ label, width, ...bounds }),
    );
    if (bounds.key)
      assert.ok(bounds.key <= bounds.coach, JSON.stringify({ label, width, ...bounds }));
    await page.screenshot({
      path: `test-results/navigation-${label}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: navigationLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = navigationLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#navigation-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#navigation-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#navigation-workshop`);
  await expect(page.locator('#navigation-start')).toBeVisible();
  await expect(page.getByLabel('복귀 위치 예시').locator('mark')).toHaveText('a');
  await page.getByRole('button', { name: '백틱 · 표시한 칸' }).click();
  await expect(page.getByLabel('복귀 위치 예시').locator('mark')).toHaveText('o');
  await page.screenshot({ path: 'test-results/navigation-intro.png', fullPage: true });
  await page.locator('#navigation-start').click();
  await ready();
  await mobile('search');
  await type('"ayy'); // mark a must not change the independent register a.
  await command('/old');
  await cursor(2, 11);
  await type('ma');
  await expect(page.locator('#navigation-mark')).toHaveText('2행 11열');
  assert.equal(await page.evaluate(() => window.navigationSnapshot.registerA), 'start\n');
  await type('G');
  await cursor(5, 1);
  await expect
    .poll(() => page.evaluate(() => window.navigationSnapshot.jumpCount))
    .toBeGreaterThan(0);
  await type("'a");
  await cursor(2, 3);
  await expect(page.locator('#workshop-goal')).toHaveText('이번에는 정확한 칸으로 갑니다.');
  await mobile('exact');
  await type('`a');
  await cursor(2, 11);
  await mobile('edit');
  await type('ciwnew');
  await expect.poll(() => page.evaluate(() => window.navigationSnapshot?.mode)).toBe('i');
  await expect(page.locator('#workshop-goal')).toHaveText('alpha의 old만 new로 바꿉니다.');
  await page.keyboard.press('Escape');
  await textIs(navigationLessons[0].lesson.practice.guided.target);
  await finish(0);
  await command('/old');
  await cursor(2, 11);
  await type('G');
  await cursor(5, 1);
  await expect(page.locator('#workshop-goal')).toHaveText('이전 위치로 돌아갑니다.');
  await mobile('older');
  await page.keyboard.press('Control+o');
  await cursor(2, 11);
  await expect(page.locator('#workshop-goal')).toHaveText('다음 기록으로 다시 갑니다.');
  await mobile('newer');
  await page.keyboard.press('Control+i');
  await cursor(5, 1);
  await page.keyboard.press('Control+o');
  await cursor(2, 11);
  await expect(page.locator('#workshop-goal')).toHaveText('alpha의 old만 new로 바꿉니다.');
  await type('ciwnew');
  await expect.poll(() => page.evaluate(() => window.navigationSnapshot?.mode)).toBe('i');
  await expect(page.locator('#workshop-goal')).toHaveText('alpha의 old만 new로 바꿉니다.');
  await page.keyboard.press('Escape');
  await textIs(navigationLessons[1].lesson.practice.guided.target);
  // A later jump back restores position, not the earlier file contents.
  await type('G');
  await cursor(5, 1);
  await page.keyboard.press('Control+o');
  await cursor(2, 13);
  await textIs(navigationLessons[1].lesson.practice.guided.target);
  await finish(1);
  await command('/draft');
  await type('maG`a');
  await cursor(2, 10);
  await type('ciwfinal');
  await page.keyboard.press('Escape');
  await command('/draft');
  await type('ciwfinal');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText('4번째 줄을 목표와 비교해보세요. 지금까지 맞게 바꾼 줄은 그대로 두면 됩니다.'),
  ).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('u');
  await textIs(navigationLessons[2].lesson.practice.challenge.target);
  await finish(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(navigationLessons[2].lesson.practice.challenge.initial);
  await expect(page.locator('#navigation-mark')).toHaveText('표시 없음');
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /여러 동작을 묶고, 확인하며 반복하기/ }).click();
  await expect(page.locator('#macro-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /멀리 이동하고, 다시 돌아오기/ }).click();
  await expect(page.locator('#navigation-start')).toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    'PASS: mark versus register a, quote/backtick exact columns, real Ctrl+o/Ctrl+i history, jumps preserve edits, protected-line recovery, three saved exercises, quizzes, five layouts, scoped reset, no records and course navigation.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.navigationSnapshot));
  await page.screenshot({ path: 'test-results/navigation-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
