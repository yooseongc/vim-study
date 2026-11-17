import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { quickfixLessons } from '../src/lessons/quickfix-workshop.js';
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
    window.quickfixSnapshot = null;
    callback.observe = (value) => {
      window.quickfixSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.quickfixSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect
    .poll(() => page.evaluate(() => window.quickfixSnapshot?.lines.join('\n')))
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
    if (await page.locator('#workshop-next').count())
      await page.locator('#workshop-next').scrollIntoViewIfNeeded();
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
      bounds.canvas >= 150 && bounds.next <= height + 1,
      JSON.stringify({ label, width, ...bounds }),
    );
    if (bounds.key)
      assert.ok(bounds.key <= bounds.coach, JSON.stringify({ label, width, ...bounds }));
    await page.screenshot({
      path: `test-results/quickfix-${label}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(index === 0 ? ':w' : ':wa');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(
    page.getByRole('heading', { name: '목표대로 편집하고 저장했습니다.' }),
  ).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = quickfixLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#quickfix-continue')).toBeEnabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#quickfix-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#quickfix-workshop`);
  await expect(page.locator('#quickfix-start')).toBeVisible();
  await page.getByRole('button', { name: '다음 결과 · cnext', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('이동만으로 저장되지');
  await page.screenshot({ path: 'test-results/quickfix-intro.png', fullPage: true });
  await page.locator('#quickfix-start').click();
  await ready();
  await mobile('command');
  await type(':vimgrep ');
  await expect(page.locator('#workshop-goal')).toHaveText('찾을 단어를 지정합니다.');
  await type('/TODO/ ');
  await expect(page.locator('#workshop-goal')).toHaveText('현재 파일에서 검색합니다.');
  await mobile('pattern');
  await command('%');
  await expect(page.locator('#quickfix-position')).toHaveText('1 / 2');
  await command(':copen');
  await expect(page.locator('#workshop-goal')).toHaveText('목록 창을 닫습니다.');
  await mobile('list');
  await command(':cclose');
  await expect(page.locator('#quickfix-position')).toHaveText('1 / 2');
  await command(':cnext');
  await expect(page.locator('#quickfix-position')).toHaveText('2 / 2');
  await command(':cprevious');
  await expect(page.locator('#quickfix-position')).toHaveText('1 / 2');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await expect(page.locator('#workshop-goal')).toHaveText('다음 검색 결과로 갑니다.');
  await command(':cnext');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await textIs(quickfixLessons[0].lesson.practice.guided.target);
  await finish(0);
  await type(':vimgrep /TODO/ ');
  await expect(page.locator('#workshop-goal')).toHaveText('첫 번째 검색 파일을 넣습니다.');
  await mobile('file-one');
  await type('/work/api.txt ');
  await expect(page.locator('#workshop-goal')).toHaveText('web.txt까지 지정하고 실행합니다.');
  await mobile('file-two');
  await command('/work/web.txt');
  await expect(page.locator('#quickfix-position')).toHaveText('1 / 2');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await command(':cnext');
  await expect.poll(() => page.evaluate(() => window.quickfixSnapshot.path)).toBe('/work/web.txt');
  await expect(page.locator('#quickfix-dirty')).toHaveText('1개');
  await command(':cprevious');
  await textIs(quickfixLessons[1].lesson.practice.guided.target);
  await command(':cnext');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await expect(page.locator('#quickfix-dirty')).toHaveText('2개');
  await command(':w');
  await expect(page.locator('#quickfix-dirty')).toHaveText('1개');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText(
      '내용은 맞습니다. :wa와 Enter로 모든 수정 버퍼를 저장하세요. :w는 현재 파일만 저장합니다.',
    ),
  ).toBeVisible();
  await page.locator('#workshop-focus').click();
  await mobile('save-all');
  await page.getByText('편집 내용을 텍스트로 보기', { exact: true }).click();
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const panel = page
      .locator('details')
      .filter({ has: page.getByText('편집 내용을 텍스트로 보기', { exact: true }) })
      .locator('> div');
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.height <= 262);
    const positions = await panel.locator('pre').evaluateAll((nodes) =>
      nodes.map((node) => ({
        top: node.getBoundingClientRect().top,
        bottom: node.getBoundingClientRect().bottom,
      })),
    );
    for (let i = 1; i < positions.length; i++)
      assert.ok(positions[i].top >= positions[i - 1].bottom, 'file contents must not overlap');
    await page.screenshot({ path: `test-results/quickfix-files-${width}.png`, fullPage: true });
  }
  await page.getByText('편집 내용을 텍스트로 보기', { exact: true }).click();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.locator('#workshop-focus').click();
  await finish(1);
  // Include the explanation file deliberately: a match is not necessarily an edit target.
  await command(':vimgrep /TODO/ /work/*.txt');
  await expect(page.locator('#quickfix-position')).toHaveText('1 / 3');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await command(':cnext');
  await expect
    .poll(() => page.evaluate(() => window.quickfixSnapshot.path))
    .toBe('/work/notes.txt');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await command(':cnext');
  await type('ciwDONE');
  await page.keyboard.press('Escape');
  await command(':wa');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText(
      'notes.txt 파일은 그대로 보존해야 합니다. 이 파일로 돌아가 변경을 되돌려주세요.',
    ),
  ).toBeVisible();
  await page.locator('#workshop-focus').click();
  await command(':cprevious');
  await type('u');
  await command(':cnext');
  await finish(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(quickfixLessons[2].lesson.practice.challenge.initial);
  await expect(page.locator('#quickfix-position')).toHaveText('0 / 0');
  await expect
    .poll(() => page.evaluate(() => window.quickfixSnapshot.files))
    .toEqual({
      'api.txt': 'TODO dev\nnote: keep',
      'web.txt': 'TODO prod\nnote: keep',
      'notes.txt': 'note: TODO means unfinished',
    });
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /같은 열을 골라 함께 편집하기/ }).click();
  await expect(page.locator('#block-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: command parts, actual quickfix list/window, next/previous across files, hidden edits, current-file versus all-file saves, protected file recovery, three exercises, five viewports, full reset, no records and worker cleanup.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.quickfixSnapshot));
  await page.screenshot({ path: 'test-results/quickfix-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
