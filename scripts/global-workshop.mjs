import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { globalLessons } from '../src/lessons/global-workshop.js';
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
    window.globalSnapshot = null;
    callback.observe = (value) => {
      window.globalSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.globalSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.globalSnapshot?.lines.join('\n'))).toBe(text);
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
      path: `test-results/global-${label}-${width}.png`,
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
  await expect(page.getByRole('heading', { name: globalLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = globalLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#global-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#global-continue').click();
    await ready();
  }
}
async function printed(commandText) {
  await command(commandText);
  await expect
    .poll(() => page.evaluate(() => window.globalSnapshot.lastCommand))
    .toBe(commandText.slice(1));
  if (await page.evaluate(() => window.globalSnapshot.mode === 'r'))
    await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.globalSnapshot.mode)).toBe('n');
}
try {
  await page.goto(`${base}#global-workshop`);
  await expect(page.locator('#global-start')).toBeVisible();
  await expect(page.getByLabel('선택된 줄 예시').locator('mark')).toHaveCount(2);
  await page.getByRole('button', { name: 'DEBUG · 위치 상관없이', exact: true }).click();
  await expect(page.getByLabel('선택된 줄 예시').locator('mark')).toHaveCount(3);
  await page.screenshot({ path: 'test-results/global-intro.png', fullPage: true });
  await page.locator('#global-start').click();
  await ready();
  await mobile('start');
  await type(':g/');
  await expect(page.locator('#workshop-goal')).toHaveText('DEBUG로 시작하는 줄만 고릅니다.');
  await type('^DEBUG/');
  await expect(page.locator('#workshop-goal')).toHaveText('고른 줄을 먼저 출력합니다.');
  await mobile('print');
  await command('p');
  await expect
    .poll(() => page.evaluate(() => window.globalSnapshot.lastCommand))
    .toBe('g/^DEBUG/p');
  if (await page.evaluate(() => window.globalSnapshot.mode === 'r'))
    await page.keyboard.press('Enter');
  await textIs(globalLessons[0].lesson.practice.guided.initial);
  await expect(page.locator('#workshop-goal')).toHaveText('확인한 조건을 다시 씁니다.');
  await mobile('same-condition');
  await type(':g/^DEBUG/');
  await expect(page.locator('#workshop-goal')).toHaveText('선택한 줄 전체를 지웁니다.');
  await mobile('delete');
  await command('d');
  await textIs(globalLessons[0].lesson.practice.guided.target);
  await type('u');
  await textIs(globalLessons[0].lesson.practice.guided.initial);
  await page.keyboard.press('Control+r');
  await textIs(globalLessons[0].lesson.practice.guided.target);
  await finish(0);
  await printed(':v/^KEEP/p');
  await textIs(globalLessons[1].lesson.practice.guided.initial);
  await expect(page.locator('#workshop-goal')).toHaveText('확인한 조건을 다시 씁니다.');
  await mobile('inverse');
  await command(':g/^KEEP/d');
  await expect(page.locator('#workshop-goal')).toHaveText('지운 내용을 먼저 되돌립니다.');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await mobile('recover');
  await type('u');
  await textIs(globalLessons[1].lesson.practice.guided.initial);
  await command(':v/^KEEP/d');
  await textIs(globalLessons[1].lesson.practice.guided.target);
  await finish(1);
  await command(':g/^TEMP/d');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText('TEMPORARY plan', { exact: true })).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('u');
  await textIs(globalLessons[2].lesson.practice.challenge.initial);
  await type(':g/^TEMP /d');
  await textIs(globalLessons[2].lesson.practice.challenge.initial);
  await page.keyboard.press('Enter');
  await textIs(globalLessons[2].lesson.practice.challenge.target);
  await finish(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(globalLessons[2].lesson.practice.challenge.initial);
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /목록을 정하고 함께 바꾸기/ }).click();
  await expect(page.locator('#batch-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: anchored preview, actual print without mutation, global delete/undo/redo, inverse selection, broad-pattern recovery, word boundary, three saved exercises, five layouts, reset and no records.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.globalSnapshot));
  await page.screenshot({ path: 'test-results/global-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
