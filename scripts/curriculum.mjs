import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { curriculum, nextLesson } from '../src/lessons/curriculum.js';
const base = (process.env.TEST_URL || 'http://127.0.0.1:5185/vim-study/').split('#')[0];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  assert.equal(new Set(curriculum.map((c) => c.id)).size, 13);
  assert.equal(nextLesson('local'), undefined);
  assert.equal(nextLesson('unknown'), undefined);
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 900],
    [390, 844],
    [320, 568],
    [1280, 480],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base);
    await expect(page.locator('#home-start')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    await page.screenshot({ path: `test-results/curriculum-home-${width}.png`, fullPage: true });
    const menuButton = page.getByRole('button', { name: '학습 목차', exact: true });
    await menuButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('details')).not.toHaveAttribute('open');
    for (const course of curriculum)
      await expect(dialog.getByRole('button', { name: new RegExp(course.title) })).toHaveCount(1);
    assert.equal(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth), true);
    await page.screenshot({ path: `test-results/curriculum-menu-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(menuButton).toBeFocused();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const course of curriculum) {
    await page.goto(base + '#' + course.id);
    await page.getByRole('button', { name: '학습 목차', exact: true }).click();
    const current = page.locator('dialog [aria-current="step"]');
    await expect(current).toContainText(course.title);
    await current.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    assert.equal(page.workers().length, 0);
  }
  await page.getByRole('button', { name: '학습 목차', exact: true }).click();
  await page.getByRole('button', { name: '학습 시작 안내', exact: true }).click();
  await expect(page.locator('#home-start')).toBeVisible();
  await page.locator('#home-start').click();
  await expect(page.locator('#basics-workshop-start')).toBeVisible();
  await page.goBack();
  await page.getByRole('button', { name: '기본 편집을 안다면, 반복 줄이기부터 →' }).click();
  await expect(page.locator('#workshop-start')).toBeVisible();
  await page.getByRole('button', { name: '학습 목차', exact: true }).click();
  await page.locator('dialog summary').click();
  await page.getByRole('button', { name: '기억을 정리하는 첫 편집', exact: true }).click();
  await expect(page.locator('#title')).toHaveText('기억을 정리하는 첫 편집');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok((await page.locator('#mission-list').boundingBox()).height <= 150);
  await page.screenshot({ path: 'test-results/curriculum-legacy-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: /전체 학습 목차/ }).click();
  await expect(page.locator('#home-start')).toBeVisible();
  await page.goto(base + '#workspace');
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await page.locator('#workspace-focus').click();
  await page.keyboard.type('iUnsaved');
  await page.keyboard.press('Escape');
  await expect(page.locator('#workspace-state')).toContainText('미저장');
  await page.getByRole('button', { name: '학습 목차', exact: true }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '학습 시작 안내', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  assert.ok(page.url().endsWith('#workspace'));
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '학습 시작 안내', exact: true }).click();
  await expect(page.locator('#home-start')).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => (document.documentElement.style.fontSize = '32px'));
  await page.getByRole('button', { name: '학습 목차', exact: true }).click();
  assert.equal(
    await page.locator('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth),
    true,
  );
  await expect(page.getByRole('button', { name: '학습 목차 닫기', exact: true })).toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    'PASS: 13 unique courses, current route, same-route close, home entry paths, legacy return, keyboard focus, six viewports and no idle Vim workers.',
  );
} finally {
  await browser.close();
}
