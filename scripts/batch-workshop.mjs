import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { batchLessons } from '../src/lessons/batch-workshop.js';
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
    window.batchSnapshot = null;
    callback.observe = (value) => {
      window.batchSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.batchSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.batchSnapshot?.lines.join('\n'))).toBe(text);
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
      path: `test-results/batch-${label}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index, save = true) {
  if (save) {
    await expect(page.locator('#workshop-next')).toBeDisabled();
    await command(index === 0 ? ':w' : ':argdo update');
    const course =
      batchLessons[index].lesson.practice.guided || batchLessons[index].lesson.practice.challenge;
    await expect
      .poll(() => page.evaluate(() => window.batchSnapshot.files))
      .toEqual(course.targets ?? { [course.file]: course.target });
    if (await page.evaluate(() => window.batchSnapshot.mode === 'r'))
      await page.keyboard.press('Enter');
  }
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { name: batchLessons[index].recap })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = batchLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#batch-continue')).toBeDisabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#batch-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#batch-workshop`);
  await expect(page.locator('#batch-start')).toBeVisible();
  await page.getByRole('button', { name: 'notes도 포함', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('함께 바뀝니다');
  await page.getByRole('button', { name: 'api·web만 선택', exact: true }).click();
  await expect(page.getByLabel('파일 목록 범위 미리보기').locator('code').nth(2)).toHaveText(
    'mode=old backup=old',
  );
  await page.screenshot({ path: 'test-results/batch-intro.png', fullPage: true });
  await page.locator('#batch-start').click();
  await ready();
  await mobile('single');
  await type(':%s/');
  await expect(page.locator('#workshop-goal')).toHaveText('old를 찾습니다.');
  await type('old/');
  await expect(page.locator('#workshop-goal')).toHaveText('new로 모두 바꿉니다.');
  await mobile('replace');
  await command('new/');
  await textIs('mode=new backup=old\nnote: keep');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':%s/old/new/g');
  await textIs(batchLessons[0].lesson.practice.guided.target);
  await finish(0);
  await expect(page.locator('#batch-files')).toHaveText('api.txt · web.txt · notes.txt');
  await mobile('list');
  // Same count is not enough: names must match the intended list.
  await command(':args /work/api.txt /work/notes.txt');
  await expect(page.locator('#batch-files')).toHaveText('api.txt · notes.txt');
  await expect(page.locator('#workshop-goal')).toHaveText('작업할 파일 목록을 정합니다.');
  await type(':args ');
  await expect(page.locator('#workshop-goal')).toHaveText('api.txt를 목록에 넣습니다.');
  await type('/work/api.txt ');
  await expect(page.locator('#workshop-goal')).toHaveText('web.txt까지 지정합니다.');
  await mobile('second-file');
  await command('/work/web.txt');
  await expect(page.locator('#batch-files')).toHaveText('api.txt · web.txt');
  await type(':argdo ');
  await expect(page.locator('#workshop-goal')).toHaveText('파일의 전체 줄을 고릅니다.');
  await mobile('argdo');
  await command('%s/old/new/g');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.dirtyCount)).toBe(2);
  await expect(page.locator('#workshop-goal')).toHaveText('목록의 파일만 저장합니다.');
  await expect
    .poll(() => page.evaluate(() => window.batchSnapshot.buffers))
    .toEqual(batchLessons[1].lesson.practice.guided.targets);
  await command(':first');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.path)).toBe('/work/api.txt');
  await textIs(batchLessons[1].lesson.practice.guided.target);
  await command(':last');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.path)).toBe('/work/web.txt');
  await command(':w');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.dirtyCount)).toBe(1);
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await type(':argdo ');
  await expect(page.locator('#workshop-goal')).toHaveText('수정된 버퍼를 저장합니다.');
  await mobile('update');
  await page.keyboard.press('Escape');
  await finish(1);
  await command(':args /work/api.txt /work/web.txt /work/notes.txt');
  await command(':argdo %s/draft/final/g');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.dirtyCount)).toBe(3);
  if (await page.evaluate(() => window.batchSnapshot.mode === 'r'))
    await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.mode)).toBe('n');
  await type('u');
  await expect
    .poll(() => page.evaluate(() => window.batchSnapshot.buffers['api.txt']))
    .toBe('mode=final backup=final\nnote: keep');
  await expect
    .poll(() => page.evaluate(() => window.batchSnapshot.buffers['web.txt']))
    .toBe('mode=final backup=final\nnote: keep');
  await textIs('mode=draft backup=draft\nnote: keep');
  // Undo affected only notes. Redo, then exclude it from saving to test update scope.
  await page.keyboard.press('Control+r');
  await command(':args /work/api.txt /work/web.txt');
  await command(':argdo update');
  await expect
    .poll(() => page.evaluate(() => window.batchSnapshot.files['web.txt']))
    .toBe('mode=final backup=final\nnote: keep');
  if (await page.evaluate(() => window.batchSnapshot.mode === 'r'))
    await page.keyboard.press('Enter');
  await expect
    .poll(() => page.evaluate(() => window.batchSnapshot.files['notes.txt']))
    .toBe('mode=draft backup=draft\nnote: keep');
  await expect.poll(() => page.evaluate(() => window.batchSnapshot.dirtyCount)).toBe(1);
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText(
      'notes.txt 파일은 그대로 보존해야 합니다. 이 파일로 돌아가 변경을 되돌려주세요.',
    ),
  ).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await command(':e /work/notes.txt');
  await expect(page.locator('#batch-position')).toContainText('목록 밖');
  await type('u');
  await finish(2, false);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await expect
    .poll(() => page.evaluate(() => window.batchSnapshot.files))
    .toEqual({
      'api.txt': 'mode=draft backup=draft\nnote: keep',
      'web.txt': 'mode=draft backup=draft\nnote: keep',
      'notes.txt': 'mode=draft backup=draft\nnote: keep',
    });
  await page.getByRole('button', { name: /학습 목차/ }).click();
  await page.getByRole('button', { name: /검색 목록을 따라 편집하기/ }).click();
  await expect(page.locator('#quickfix-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: scope preview, substitution g, exact argument filenames, continuous commands, actual argdo changes, first/last, unsaved hidden buffers, update scope, per-buffer undo/redo, protected-file recovery, three exercises, five layouts, reset and no records.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.batchSnapshot));
  await page.screenshot({ path: 'test-results/batch-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
