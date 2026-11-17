import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { basicsLessons } from '../src/lessons/basics-workshop.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await mkdir('test-results', { recursive: true });
const type = (text) => page.keyboard.type(text); // Deliberately continuous input.
async function command(text) {
  await type(text);
  await page.keyboard.press('Enter');
}
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#vim-input')).toBeFocused();
  await page.evaluate(() => {
    const callback = [...window.__vimFieldSessions.values()][0];
    const observe = callback.observe;
    window.basicsSnapshot = null;
    callback.observe = (value) => {
      window.basicsSnapshot = value;
      observe(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.basicsSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.basicsSnapshot?.lines.join('\n'))).toBe(text);
}
async function layouts(label) {
  for (const [width, height] of [
    [1280, 720],
    [1024, 768],
    [768, 900],
    [390, 844],
    [320, 844],
  ]) {
    await page.setViewportSize({ width, height });
    const bounds = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      canvas: document.querySelector('#vim-canvas')?.getBoundingClientRect().height,
      next: document.querySelector('#workshop-next')?.getBoundingClientRect().bottom,
      key: document.querySelector('ol[aria-label] li:last-child')?.getBoundingClientRect().bottom,
      coach: document.querySelector('#workshop-goal')?.parentElement.getBoundingClientRect().bottom,
    }));
    assert.equal(bounds.overflow, false);
    if (bounds.canvas)
      assert.ok(
        bounds.canvas >= 150 &&
          bounds.next <= height &&
          (!bounds.key || bounds.key <= bounds.coach),
        JSON.stringify({ label, width, ...bounds }),
      );
    await page.screenshot({
      path: `test-results/basics-workshop-${label}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: basicsLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = basicsLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#basics-workshop-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#basics-workshop-continue').click();
    await ready();
  }
}
try {
  await page.goto(base);
  await page
    .getByRole('button', { name: '모드와 저장이 헷갈리면 입문부터 →', exact: true })
    .click();
  await expect(page).toHaveURL(/#basics-workshop$/);
  const logo = page.getByRole('img', { name: 'Vim 로고' });
  await expect.poll(() => logo.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.getByRole('button', { name: '입력 모드', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('글자 w가 들어갑니다');
  await page.getByRole('button', { name: '명령줄', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Enter를 누르면');
  await layouts('intro');
  await page.locator('#basics-workshop-start').click();
  await ready();
  await type('i');
  await expect(page.locator('#workshop-goal')).toHaveText('Vim과 공백 하나를 붙입니다.');
  await type('Vim ');
  await textIs('Vim hello');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await layouts('input');
  await page.keyboard.press('Escape');
  await expect(page.locator('#workshop-goal')).toHaveText('내용을 파일에 저장합니다.');
  await type('w');
  await textIs('Vim hello');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await type(':w');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await layouts('save');
  await command(':w');
  await finish(0);
  await type('iVim ');
  await page.keyboard.press('Escape');
  await expect(page.locator('#workshop-goal')).toHaveText('방금 넣은 글자를 되돌립니다.');
  await type('u');
  await textIs('ready');
  await expect(page.locator('#workshop-goal')).toHaveText('되돌린 변경을 다시 적용합니다.');
  await layouts('redo');
  await page.keyboard.press('Control+r');
  await textIs('Vim ready');
  await expect(page.locator('#workshop-goal')).toHaveText('내용을 파일에 저장합니다.');
  await command(':w');
  await type('u');
  await textIs('ready');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.keyboard.press('Control+r');
  await command(':w');
  await finish(1);
  await type('iVim ');
  await page.keyboard.press('Escape');
  await command(':2d');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText(/설명 줄은 바꾸지 않는 부분/)).toBeVisible();
  await page.locator('#workshop-focus').click();
  await type('u');
  await textIs('Vim start\nnote: keep this line');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':w');
  await finish(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs('start\nnote: keep this line');
  await type('iVim ');
  await page.keyboard.press('Escape');
  await command(':w');
  await finish(2);
  await page.getByRole('button', { name: /이어서 검색과 편집 문법 배우기/ }).click();
  await expect(page.locator('#grammar-workshop-start')).toBeVisible();
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: '편집 명령을 문장처럼 조합하기', exact: false }).click();
  await expect(page).toHaveURL(/#grammar$/);
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Vim 로고' })
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: official logos, mode comparison, continuous input, Esc versus save, normal w, command cancel, undo/redo before and after save, protected line, three exercises, five layouts, no records and navigation.',
  );
} finally {
  await browser.close();
}
