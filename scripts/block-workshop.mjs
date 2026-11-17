import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { blockLessons } from '../src/lessons/block-workshop.js';
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
    window.blockSnapshot = null;
    callback.observe = (value) => {
      window.blockSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.blockSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.blockSnapshot?.lines.join('\n'))).toBe(text);
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
      path: `test-results/block-${label}-${width}.png`,
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
  await expect(page.getByRole('heading', { name: blockLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = blockLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#block-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#block-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#block-workshop`);
  await expect(page.locator('#block-start')).toBeVisible();
  await expect(page.getByLabel('선택 범위 예시').locator('mark')).toHaveText(['01 ', '02 ', '03 ']);
  await page.getByRole('button', { name: 'V · 줄', exact: true }).click();
  await expect(page.getByLabel('선택 범위 예시').locator('mark')).toHaveText([
    '01 api',
    '02 web',
    '03 job',
  ]);
  await page.getByRole('button', { name: 'v · 문자', exact: true }).click();
  await expect(page.getByLabel('선택 범위 예시').locator('mark')).toHaveText([
    '01 api',
    '02 web',
    '03 ',
  ]);
  await page.screenshot({ path: 'test-results/block-intro.png', fullPage: true });
  await page.locator('#block-start').click();
  await ready();
  await mobile('start');
  await page.keyboard.press('Control+v');
  await expect(page.locator('#block-range')).toHaveText('1~1행 · 1~1열 (1 × 1)');
  await type('jjj');
  await expect(page.locator('#workshop-goal')).toHaveText('선택 범위를 다시 고릅니다.');
  await mobile('cancel');
  await page.keyboard.press('Escape');
  await textIs(blockLessons[0].lesson.practice.guided.initial);
  await type('gg0');
  await page.keyboard.press('Control+v');
  await type('jj');
  await expect(page.locator('#block-range')).toHaveText('1~3행 · 1~1열 (3 × 1)');
  await mobile('selected');
  await type('I# ');
  await textIs('# api=off\nweb=off\njob=off\nnote: keep');
  await expect(page.locator('#workshop-goal')).toHaveText('Esc로 나머지 줄에 적용합니다.');
  await mobile('input');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.keyboard.press('Escape');
  await textIs(blockLessons[0].lesson.practice.guided.target);
  await type('u');
  await textIs(blockLessons[0].lesson.practice.guided.initial);
  await page.keyboard.press('Control+r');
  await textIs(blockLessons[0].lesson.practice.guided.target);
  await finish(0);
  await page.keyboard.press('Control+v');
  await type('lll');
  await expect(page.locator('#workshop-goal')).toHaveText('선택 범위를 다시 고릅니다.');
  await page.keyboard.press('Escape');
  await type('gg0');
  await page.keyboard.press('Control+v');
  await type('lljj');
  await expect(page.locator('#block-range')).toHaveText('1~3행 · 1~3열 (3 × 3)');
  await mobile('delete');
  await type('x');
  await textIs(blockLessons[1].lesson.practice.guided.target);
  await finish(1);
  await page.keyboard.press('Control+v');
  await type('lljxgg0');
  await page.keyboard.press('Control+v');
  await type('jjI# ');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText(
      '3번째 설명 줄은 바꾸지 않는 부분입니다. Esc로 나온 뒤 u로 마지막 변경을 되돌려보세요.',
    ),
  ).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('ugg0');
  await page.keyboard.press('Control+v');
  await type('jI# ');
  await page.keyboard.press('Escape');
  await textIs(blockLessons[2].lesson.practice.challenge.target);
  await finish(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(blockLessons[2].lesson.practice.challenge.initial);
  await expect(page.locator('#block-range')).toHaveText('선택 없음');
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /멀리 이동하고, 다시 돌아오기/ }).click();
  await expect(page.locator('#navigation-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: selection previews, live block bounds, cancel, first-line input then Escape propagation, undo/redo, column deletion, protected-line recovery, three saved exercises, quizzes, five layouts, reset, no records and worker cleanup.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.blockSnapshot));
  await page.screenshot({ path: 'test-results/block-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
