import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/');
  await page.waitForFunction(() =>
    document.querySelector('#engine-status').textContent.includes('WASM'),
  );
  await page.evaluate(() => document.fonts.ready);
  await mkdir('test-results', { recursive: true });
  for (const [width, height] of [
    [1920, 1080],
    [1366, 768],
    [1024, 600],
    [768, 1024],
    [390, 844],
    [320, 568],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(400);
    const metrics = await page.evaluate(() => {
      const canvas = document.querySelector('#vim-canvas');
      return {
        width: innerWidth,
        content: document.documentElement.scrollWidth,
        storySize: parseFloat(getComputedStyle(document.querySelector('#story')).fontSize),
        canvasWidth: canvas.width,
        renderedWidth: canvas.clientWidth,
        canvasHeight: canvas.height,
        renderedHeight: canvas.clientHeight,
      };
    });
    assert.ok(metrics.content <= width, `${width}: content overflow ${metrics.content}`);
    assert.ok(metrics.storySize >= 16);
    assert.ok(Math.abs(metrics.canvasWidth - metrics.renderedWidth) <= 1, JSON.stringify(metrics));
    assert.ok(
      Math.abs(metrics.canvasHeight - metrics.renderedHeight) <= 1,
      JSON.stringify(metrics),
    );
    await page.screenshot({
      path: `test-results/layout-${width}.png`,
      fullPage: true,
    });
    await page.locator('#editor-expand').click();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#mission-brief').isVisible(), false);
    await page.locator('#settings-open').click();
    const dialog = await page.locator('#settings').boundingBox();
    assert.ok(dialog.x >= 0 && dialog.x + dialog.width <= width && dialog.height <= height);
    await page.keyboard.press('Escape');
    await page.locator('#editor-expand').click();
    assert.equal(await page.locator('#mission-brief').isVisible(), true);
  }
  console.log(
    'PASS: seven viewport sizes, readable body text, no horizontal overflow, real canvas resize, expand/restore, bounded settings dialog.',
  );
} finally {
  await browser.close();
}
