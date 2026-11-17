import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5185/vim-study/') + '#basics-workshop',
  );
  await page.locator('#basics-workshop-start').click();
  await expect(page.locator('#workshop-mode')).toHaveText('일반 모드', { timeout: 30000 });
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
    [768, 900],
    [390, 844],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const brief = page.getByRole('region', { name: '이번 문제의 전체 목표' });
    await expect(brief).toContainText('hello');
    await expect(brief).toContainText('Vim hello');
    const coach = page.locator('#workshop-goal').locator('..');
    assert.equal(
      await coach.evaluate((el) => el.scrollHeight > el.clientHeight),
      false,
      'explanations must not need a nested scroll',
    );
    await expect(page.getByText('확인할 결과', { exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/learner-layout-${width}.png`, fullPage: true });
    await page.locator('#workshop-next').scrollIntoViewIfNeeded();
    assert.ok((await page.locator('#workshop-next').boundingBox()).y >= 0);
    assert.ok((await page.locator('#vim-canvas').boundingBox()).height >= 150);
  }
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText('1번째 줄 · 현재')).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  console.log(
    'PASS: full objective, readable explanations without nested scrolling, diagnostic before solving, usable canvas and reachable completion at five sizes.',
  );
} finally {
  await browser.close();
}
