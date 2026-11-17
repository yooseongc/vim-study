import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { sample, previewSubstitution, rangeLessons } from '../src/lessons/range-workshop.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('test-results', { recursive: true });
async function type(text) {
  await page.keyboard.type(text, { delay: 35 });
}
async function command(text) {
  await type(text);
  await page.keyboard.press('Enter');
}
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#vim-input')).toBeFocused();
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const original = callbacks.observe;
    window.rangeSnapshot = null;
    callbacks.observe = (value) => {
      window.rangeSnapshot = value;
      original(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.rangeSnapshot?.mode)).toBe('n');
  assert.equal(page.workers().length, 1);
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.rangeSnapshot?.lines.join('\n'))).toBe(text);
}
async function mobileKeys(name) {
  await page.setViewportSize({ width: 320, height: 844 });
  const bounds = await page.evaluate(() => {
    const key = document.querySelector('ol[aria-label] li:last-child').getBoundingClientRect();
    const coach = document.querySelector('#workshop-goal').parentElement.getBoundingClientRect();
    return { key: key.bottom, coach: coach.bottom };
  });
  await page.screenshot({ path: `test-results/range-${name}-320.png`, fullPage: true });
  assert.ok(bounds.key <= bounds.coach, JSON.stringify({ name, ...bounds }));
  await page.setViewportSize({ width: 1280, height: 720 });
}
async function finish(index) {
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(
    page.getByRole('heading', { name: '목표대로 편집하고 저장했습니다.' }),
  ).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  if (index < 3) {
    const part = rangeLessons[index];
    await page.getByRole('button', { name: part.answers[1 - part.correct], exact: true }).click();
    await expect(page.locator('#range-continue')).toBeEnabled();
    await page.getByRole('button', { name: part.answers[part.correct], exact: true }).click();
    await page.locator('#range-continue').click();
    await ready();
  }
}
try {
  await page.goto(`${base}#range-workshop`);
  await expect(page.locator('#range-start')).toBeVisible();
  assert.equal(page.workers().length, 0);
  const preview = page.getByLabel('치환 결과 미리보기');
  for (const [scope, label] of [
    ['', '현재 줄'],
    ['1,2', '1~2번 줄'],
    ['%', '전체 줄'],
  ]) {
    await page.getByRole('radio', { name: label, exact: true }).check();
    for (const all of [false, true]) {
      await page.getByRole('checkbox').setChecked(all);
      assert.deepEqual(
        await preview.locator('code').allTextContents(),
        previewSubstitution(scope, all).split('\n'),
      );
    }
  }
  await expect(page.getByRole('status')).toContainText('note도 바뀝니다');
  await page.screenshot({ path: 'test-results/range-intro.png', fullPage: true });
  await page.locator('#range-start').click();
  await ready();
  await mobileKeys('first');
  // Compare the preview to actual Vim, including % without g.
  for (const scope of ['', '1,2', '%']) {
    for (const all of [false, true]) {
      await command(`:${scope}s/small/large/${all ? 'g' : ''}`);
      await textIs(previewSubstitution(scope, all));
      await type('u');
      await textIs(sample);
    }
  }
  await command(':s/small/large/');
  await expect(page.locator('#workshop-goal')).toHaveText('같은 줄의 남은 small도 바꿉니다.');
  await mobileKeys('g');
  await command(':s/small/large/g');
  await textIs(rangeLessons[0].lesson.practice.guided.target);
  await type('u');
  await expect(page.locator('#workshop-goal')).toHaveText('같은 줄의 남은 small도 바꿉니다.');
  await page.keyboard.press('Control+r');
  await finish(0);
  await mobileKeys('range');
  await command(':1,2s/small/large/g');
  await textIs(rangeLessons[1].lesson.practice.guided.target);
  await finish(1);
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
    [1024, 768],
    [768, 900],
    [390, 844],
    [320, 844],
  ]) {
    await page.setViewportSize({ width, height });
    // Check after the old vim-wasm delayed resize would have fired.
    await page.waitForTimeout(650);
    await page.locator('#workshop-next').scrollIntoViewIfNeeded();
    const size = await page.evaluate(() => {
      const canvas = document.querySelector('#vim-canvas').getBoundingClientRect();
      const next = document.querySelector('#workshop-next').getBoundingClientRect();
      const lastKey = document
        .querySelector('ol[aria-label] li:last-child')
        .getBoundingClientRect();
      const coach = document.querySelector('#workshop-goal').parentElement.getBoundingClientRect();
      const element = document.querySelector('#vim-canvas');
      const pixel = [
        ...element.getContext('2d').getImageData(20, Math.floor(element.height / 2), 1, 1).data,
      ];
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        keyBottom: lastKey.bottom,
        coachBottom: coach.bottom,
        pixel,
        height: canvas.height,
        bottom: next.bottom,
        scroll: scrollY,
      };
    });
    assert.equal(size.overflow, false);
    assert.ok(size.height >= 150 && size.bottom <= height + 1, JSON.stringify({ width, ...size }));

    assert.ok(size.keyBottom <= size.coachBottom, JSON.stringify({ width, ...size }));
    assert.notDeepEqual(size.pixel.slice(0, 3), [0, 0, 0], 'resize must not erase the canvas');
    await page.screenshot({ path: `test-results/range-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await command(':%s/small/large/gc');
  await expect(page.locator('#workshop-mode')).toHaveText('치환 확인 중');
  await page.keyboard.press('F2');
  await expect(page.locator('#vim-input')).toBeFocused();
  await type('yq');
  await textIs(sample.replace('small', 'large'));
  await expect(page.locator('#workshop-mode')).toHaveText('일반 모드');
  await type('u');
  await textIs(sample);
  await page.setViewportSize({ width: 390, height: 844 });
  await command(':%s/small/large/gc');
  await type('yyyy');
  await expect(page.locator('#workshop-goal')).toHaveText('note의 small은 n으로 남깁니다.');
  await page.screenshot({ path: 'test-results/range-confirm-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(650);
  await expect(page.locator('#workshop-mode')).toHaveText('치환 확인 중');
  await page.screenshot({ path: 'test-results/range-confirm.png', fullPage: true });
  await type('nyy');
  await textIs(rangeLessons[2].lesson.practice.guided.target);
  await finish(2);
  // A broad substitution must fail; recover it and make a deliberate selection.
  await command(':%s/off/on/g');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText(/3번째 설명 줄은 바꾸지 않는 부분/)).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('u');
  await textIs(rangeLessons[3].lesson.practice.challenge.initial);
  await command(':%s/off/on/gc');
  await type('yynyy');
  await textIs(rangeLessons[3].lesson.practice.challenge.target);
  await finish(3);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await ready();
  await textIs(rangeLessons[3].lesson.practice.challenge.initial);
  await type('iX');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /학습 목차/ }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: /한 번 바꾸고, 다시 쓰기/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /한 번 바꾸고, 다시 쓰기/ }).click();
  await expect(page.locator('#workshop-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: six preview combinations match actual Vim, four exercises, undo/redo, confirmation y/n/q and recovery, protected line, save gates, quizzes, scoped retry, no records, six viewports, dirty navigation and worker cleanup.',
  );
} catch (error) {
  console.error(await page.evaluate(() => window.rangeSnapshot));
  await page.screenshot({ path: 'test-results/range-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
