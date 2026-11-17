import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { bufferLessons } from '../src/lessons/buffer-workshop.js';
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
    window.bufferSnapshot = null;
    callback.observe = (value) => {
      window.bufferSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.bufferSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.bufferSnapshot?.lines.join('\n'))).toBe(text);
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
      path: `test-results/buffer-${label}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function windows(count) {
  await expect.poll(() => page.evaluate(() => window.bufferSnapshot.windowCount)).toBe(count);
}
async function edit() {
  await command('/old');
  await mobile('edit-range');
  await page.keyboard.type('ciwnew');
  await page.keyboard.press('Escape');
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(
    page.getByRole('heading', { name: '목표대로 편집하고 저장했습니다.' }),
  ).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 2) {
    const part = bufferLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#buffer-continue')).toBeEnabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#buffer-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#buffer-workshop`);
  await page.getByRole('button', { name: 'a.txt를 new로 바꿔 보기', exact: true }).click();
  await expect(page.getByLabel('두 창 예시').locator('code')).toHaveText(['mode=new', 'mode=new']);
  await page.getByRole('button', { name: '다른 버퍼 보기', exact: true }).click();
  await expect(page.getByLabel('두 창 예시').locator('code')).toHaveText(['mode=new', 'mode=old']);
  await page.screenshot({ path: 'test-results/buffer-intro.png', fullPage: true });
  await page.evaluate(() =>
    localStorage.setItem(
      'vim-field-guide:workspace:v1',
      JSON.stringify({ files: { 'mine.txt': 'Personal file\n' } }),
    ),
  );
  await page.locator('#buffer-start').click();
  await ready();
  await mobile('start');
  await command(':split');
  await windows(2);
  await expect
    .poll(() => page.evaluate(() => window.bufferSnapshot.windowBuffers))
    .toEqual(['a.txt', 'a.txt']);
  await mobile('same-edit');
  await edit();
  await textIs(bufferLessons[0].lesson.practice.guided.target);
  await mobile('switch');
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.keyboard.press('Control+w');
  await page.keyboard.press('w');
  await expect.poll(() => page.evaluate(() => window.bufferSnapshot.currentWindow)).toBe(2);
  await mobile('close');
  await command(':close');
  await windows(1);
  await textIs(bufferLessons[0].lesson.practice.guided.target);
  await finish(0);
  await mobile('open-file');
  await type(':split');
  await expect(page.locator('#workshop-goal')).toHaveText('b.txt 경로를 붙입니다.');
  await mobile('file-path');
  await command(' /work/b.txt');
  await windows(2);
  await mobile('other-edit');
  await edit();
  await mobile('hidden-soon');
  await command(':close');
  await windows(1);
  await expect(page.locator('#buffer-list')).toContainText('b.txt · 미저장 · 숨김');
  await textIs(bufferLessons[1].lesson.practice.guided.initial);
  await mobile('remaining-edit');
  await edit();
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await expect
    .poll(() => page.evaluate(() => window.bufferSnapshot.files['b.txt']))
    .toBe(bufferLessons[1].lesson.practice.guided.initial);
  await mobile('save-all');
  await command(':buffer b.txt');
  await windows(1);
  await textIs(bufferLessons[1].lesson.practice.guided.targets['b.txt']);
  await command(':buffer a.txt');
  await command(':wa');
  await finish(1);
  await edit();
  await command(':buffer b.txt');
  await edit();
  await command(':buffer notes.txt');
  await type('ix');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(
    page.getByText(
      'notes.txt 파일은 그대로 보존해야 합니다. 이 파일로 돌아가 변경을 되돌려주세요.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.locator('#workshop-focus').click();
  await type('u');
  await command(':buffer a.txt');
  await command(':split');
  await command(':wa');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':close');
  await finish(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [
    'vim-field-guide:workspace:v1',
  ]);
  await page.getByRole('button', { name: '내 파일로 자유롭게 연습하기 →', exact: true }).click();
  await expect(page).toHaveURL(/#workspace$/);
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('vim-field-guide:workspace:v1')).files,
    ),
    { 'mine.txt': 'Personal file\n' },
  );
  await page.locator('#vim-input').focus();
  await page.keyboard.type('gg0iSaved ');
  await page.keyboard.press('Escape');
  await command(':w');
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('vim-field-guide:workspace:v1')).files['mine.txt'],
      ),
    )
    .toBe('Saved Personal file\n');
  await page.reload();
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('vim-field-guide:workspace:v1')).files['mine.txt'],
    ),
    'Saved Personal file\n',
  );
  await page.getByRole('button', { name: '버퍼와 창을 설명부터 연습하기 →', exact: true }).click();
  await expect(page.locator('#buffer-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: same-buffer split, focus switch, close preserves text, hidden dirty buffers, w versus wa, buffer switching, protected file, final window count, five layouts, preserved personal files, workspace save/reload and return.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.bufferSnapshot));
  await page.screenshot({ path: 'test-results/buffer-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
