import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { macroLessons } from '../src/lessons/macro-workshop.js';
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
    window.macroSnapshot = null;
    callback.observe = (value) => {
      window.macroSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.macroSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.macroSnapshot?.lines.join('\n'))).toBe(text);
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
    await page.screenshot({ path: `test-results/macro-${label}-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: macroLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = macroLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#macro-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#macro-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#macro-workshop`);
  await expect(page.locator('#macro-start')).toBeVisible();
  await page.getByRole('button', { name: '@a · 편집과 이동', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('job으로 이동');
  await page.screenshot({ path: 'test-results/macro-intro.png', fullPage: true });
  await page.locator('#macro-start').click();
  await ready();
  await type('"ayy');
  await expect(page.locator('#macro-content')).toHaveText('a: api<Enter>');
  await mobile('start');
  await type('qaItypo');
  await page.keyboard.press('Escape');
  await type('q');
  await expect(page.locator('#workshop-goal')).toHaveText('편집 내용을 먼저 복구합니다.');
  await type('u');
  await expect(page.locator('#workshop-goal')).toHaveText('a에 짧게 녹화합니다.');
  await type('qa');
  await expect(page.locator('#macro-recording')).toContainText('a 녹화 중');
  await expect(page.locator('#workshop-goal')).toHaveText('줄 앞에 문구를 붙입니다.');
  await mobile('record');
  await page.keyboard.press('F2');
  await expect(page.locator('#vim-input')).toBeFocused();
  await type('Ienabled: ');
  await page.keyboard.press('Escape');
  await expect(page.locator('#workshop-goal')).toHaveText('다음 줄로 이동합니다.');
  await type('jq');
  await expect(page.locator('#macro-content')).toHaveText('a: Ienabled: <Esc>j');
  // Dot changes text but stays on the same line; undo keeps the recorded macro.
  await type('.');
  await textIs(macroLessons[0].lesson.practice.guided.target);
  assert.equal(await page.evaluate(() => window.macroSnapshot.cursor[0]), 2);
  await type('u');
  await type('@a');
  await textIs(macroLessons[0].lesson.practice.guided.target);
  assert.equal(await page.evaluate(() => window.macroSnapshot.cursor[0]), 3);
  await finish(0);
  await type('qaIactive: ');
  await page.keyboard.press('Escape');
  await type('jq@a');
  await expect(page.locator('#workshop-goal')).toHaveText('note에서는 실행하지 않습니다.');
  await mobile('skip');
  // Deliberately cross the boundary, then recover without losing a.
  await type('@@');
  await expect(page.locator('#workshop-goal')).toHaveText('note에 적용한 변경을 되돌립니다.');
  await mobile('recover');
  await type('u');
  await expect(page.locator('#macro-content')).toContainText('Iactive: <Esc>j');
  await command(':4');
  await expect(page.locator('#workshop-goal')).toHaveText('job에서 마지막 매크로를 실행합니다.');
  await type('@@');
  await textIs(macroLessons[1].lesson.practice.guided.target);
  await finish(1);
  await type('qaIdone: ');
  await page.keyboard.press('Escape');
  await type('jqj@a@@');
  await textIs(macroLessons[2].lesson.practice.challenge.target);
  // A correct saved file must not finish a lesson while still recording.
  await type('qa');
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await expect(
    page.getByText('내용은 맞습니다. Esc로 나온 뒤 q로 녹화를 끝내세요.', { exact: true }),
  ).toBeVisible();
  await type('q');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: macroLessons[2].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(macroLessons[2].lesson.practice.challenge.initial);
  await expect(page.locator('#macro-content')).toContainText('아직 녹화한 내용 없음');
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /복사한 내용을 지키며 편집하기/ }).click();
  await expect(page.locator('#register-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: actual recording, dot versus macro cursor, @a/@@, protected-line recovery, undo preserves a, recording-end/save gates, three exercises, quizzes, five layouts, scoped retry, no records and course navigation.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.macroSnapshot));
  await page.screenshot({ path: 'test-results/macro-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
