import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { grammarLessons } from '../src/lessons/grammar-workshop.js';
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
    window.grammarSnapshot = null;
    callback.observe = (value) => {
      window.grammarSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot?.lines.join('\n'))).toBe(text);
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
      path: `test-results/grammar-${label}-${width}.png`,
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
  await expect(page.getByRole('heading', { name: grammarLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 3) {
    const part = grammarLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#grammar-workshop-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#grammar-workshop-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#grammar-workshop`);
  await page.getByRole('button', { name: 'di" · 따옴표 안쪽 비우기', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('일반 모드에 남습니다');
  await page.screenshot({ path: 'test-results/grammar-intro.png', fullPage: true });
  await page.locator('#grammar-workshop-start').click();
  await ready();
  await mobile('search');
  await type('/guest');
  await expect(page.locator('#workshop-goal')).toHaveText('guest의 위치를 찾습니다.');
  await textIs(grammarLessons[0].lesson.practice.guided.initial);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.cursor)).toEqual([1, 1]);
  await command('/guest');
  await expect(page.locator('#workshop-goal')).toHaveText('바꾸기 동작을 고릅니다.');
  await page.keyboard.type('n');
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.cursor[0])).toBe(2);
  await page.keyboard.type('N');
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.cursor[0])).toBe(1);
  await type('c');
  await expect(page.locator('#workshop-goal')).toHaveText('단어 안쪽을 고릅니다.');
  await textIs(grammarLessons[0].lesson.practice.guided.initial);
  await mobile('range');
  await page.keyboard.press('Escape');
  await textIs(grammarLessons[0].lesson.practice.guided.initial);
  await page.keyboard.type('ciwadmin'); // no artificial input delay
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.mode)).toBe('i');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await mobile('input');
  await page.keyboard.press('Escape');
  await textIs(grammarLessons[0].lesson.practice.guided.target);
  await mobile('save');
  await finish(0);
  await mobile('motion-start');
  await type('w');
  await expect(page.locator('#workshop-goal')).toHaveText('앞 단어로 돌아옵니다.');
  await type('b');
  await expect(page.locator('#workshop-goal')).toHaveText('지우기 동작을 고릅니다.');
  await type('$');
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.cursor)).toEqual([1, 15]);
  await type('0d');
  await expect(page.locator('#workshop-goal')).toHaveText('다음 단어 앞까지 지웁니다.');
  await mobile('motion');
  await type('w');
  await textIs(grammarLessons[1].lesson.practice.guided.target);
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.mode)).toBe('n');
  await type('u');
  await textIs(grammarLessons[1].lesson.practice.guided.initial);
  await page.keyboard.press('Control+r');
  await finish(1);
  await command('/guest');
  await expect(page.locator('#workshop-goal')).toHaveText('따옴표 안쪽을 바꿉니다.');
  await mobile('quotes');
  await page.keyboard.type('ci"admin user');
  await expect(page.locator('#workshop-goal')).toHaveText('admin user를 입력합니다.');
  await mobile('quote-input');
  await page.keyboard.press('Escape');
  await expect(page.locator('#workshop-goal')).toHaveText('old의 위치를 찾습니다.');
  await command('/old');
  await expect(page.locator('#workshop-goal')).toHaveText('tag의 안쪽만 비웁니다.');
  await mobile('quote-delete');
  await page.keyboard.type('di"');
  await textIs(grammarLessons[2].lesson.practice.guided.target);
  await expect.poll(() => page.evaluate(() => window.grammarSnapshot.mode)).toBe('n');
  await finish(2);
  await mobile('challenge');
  await command('/guest');
  await page.keyboard.type('ciwadmin');
  await page.keyboard.press('Escape');
  await command('/old');
  await page.keyboard.type('ci"production ready');
  await page.keyboard.press('Escape');
  await command('/remove');
  await page.keyboard.type('dw');
  await command(':2d');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText(/설명 줄은 바꾸지 않는 부분/)).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await page.keyboard.type('u');
  await textIs(grammarLessons[3].lesson.practice.challenge.target);
  await finish(3);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(grammarLessons[3].lesson.practice.challenge.initial);
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: '모드를 알고, 편집하고 저장하기', exact: false }).click();
  await expect(page.locator('#basics-workshop-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: search preview/cancel/confirm, n/N, operator waiting/cancel, continuous ciw, w/b/0/$, dw undo/redo, ci"/di" mode difference, protected line, four exercises, five layouts, reset and no records.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.grammarSnapshot));
  await page.screenshot({ path: 'test-results/grammar-workshop-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
