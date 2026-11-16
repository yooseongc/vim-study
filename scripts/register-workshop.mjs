import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { registerLessons } from '../src/lessons/register-workshop.js';
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
    window.registerSnapshot = null;
    callback.observe = (value) => {
      window.registerSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.registerSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect
    .poll(() => page.evaluate(() => window.registerSnapshot?.lines.join('\n')))
    .toBe(text);
}
async function register(field, text) {
  await expect
    .poll(() => page.evaluate((field) => window.registerSnapshot?.[field], field))
    .toBe(text);
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
    const b = await page.evaluate(() => {
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
    assert.equal(b.overflow, false);
    assert.ok(b.canvas >= 150 && b.next <= height, JSON.stringify({ label, width, ...b }));
    if (b.key) assert.ok(b.key <= b.coach, JSON.stringify({ label, width, ...b }));
    await page.screenshot({ path: `test-results/register-${label}-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: registerLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 3) {
    const segment = registerLessons[index];
    await page
      .getByRole('button', { name: segment.answers[1 - segment.correct], exact: true })
      .click();
    await expect(page.locator('#register-continue')).toBeDisabled();
    await page.getByRole('button', { name: segment.answers[segment.correct], exact: true }).click();
    await page.locator('#register-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#register-workshop`);
  await expect(page.locator('#register-start')).toBeVisible();
  await page.getByRole('button', { name: 'dd로 trash를 삭제한 뒤' }).click();
  await expect(page.locator('[data-register="register"]')).toContainText('trash');
  await expect(page.locator('[data-register="registerZero"]')).toContainText('ready');
  await page.screenshot({ path: 'test-results/register-intro.png', fullPage: true });
  await page.locator('#register-start').click();
  await ready();
  await mobile('copy');
  await type('yy');
  await register('registerZero', 'ready\n');
  await type('jdd');
  await register('register', 'trash\n');
  await register('registerZero', 'ready\n');
  await type('p');
  await textIs('ready\nslot\ntrash');
  await expect(page.locator('#workshop-goal')).toHaveText('방금 붙인 trash를 되돌립니다.');
  await type('u');
  await expect(page.locator('#workshop-goal')).toHaveText('이번에는 0에서 꺼냅니다.');
  await mobile('zero');
  await type('"0p');
  await textIs('ready\nslot\nready');
  await finish(0);
  await mobile('named');
  await type('"ayyjdd');
  await register('registerA', 'ready\n');
  await register('register', 'trash\n');
  await type('"ap');
  await textIs('ready\nslot\nready');
  await finish(1);
  await type('yy');
  await mobile('discard');
  await type('j"_dd');
  await register('register', 'ready\n');
  await register('registerZero', 'ready\n');
  await type('p');
  await textIs('ready\nslot\nready');
  await finish(2);
  // A wrong default paste is rejected; recovery can use any suitable register.
  await type('yyjddGp');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText('4번째 줄을 목표와 비교해보세요. 지금까지 맞게 바꾼 줄은 그대로 두면 됩니다.'),
  ).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('u"0p');
  await textIs(registerLessons[3].lesson.practice.challenge.target);
  await finish(3);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(registerLessons[3].lesson.practice.challenge.initial);
  await type('iX');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /학습 목차/ }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: /범위를 고르고, 확인하며 바꾸기/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /범위를 고르고, 확인하며 바꾸기/ }).click();
  await expect(page.locator('#range-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: actual unnamed/0/a register contents, default paste mistake and undo recovery, named yank, black-hole deletion, four saved exercises, quizzes, alternative recovery, no records, five layouts, scoped retry and dirty navigation.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.registerSnapshot));
  await page.screenshot({ path: 'test-results/register-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
