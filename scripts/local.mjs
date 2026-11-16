import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { labInitial, labExpected, localSections } from '../src/lessons/local-lab.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const payload = (files) =>
  Object.entries(files).map(([name, text]) => ({
    name,
    mimeType: 'text/plain',
    buffer: Buffer.from(text),
  }));
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#local',
  );
  await expect(page.locator('#title')).toHaveText('내 터미널에서 마무리하기');
  assert.equal(page.workers().length, 0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: '실습 묶음 받기 (.zip)' }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'vim-study-lab.zip');
  assert.equal(await download.failure(), null);
  await download.saveAs('test-results/downloaded-lab.zip');
  for (const section of localSections) {
    await page.getByRole('button', { name: section.title, exact: true }).click();
    await expect(page.getByRole('heading', { name: section.title, exact: true })).toBeVisible();
    await expect(page.getByText(section.steps.at(-1).title, { exact: true })).toBeVisible();
  }
  const input = page.getByLabel('실습 파일 여섯 개 선택', { exact: true });
  await input.setInputFiles(payload(labInitial));
  await expect(page.locator('#local-results li')).toHaveCount(6);
  await expect(page.locator('#local-success')).toHaveCount(0);
  await input.setInputFiles(payload({ ...labExpected, 'notes.txt': 'changed\n' }));
  await expect(page.locator('#local-success')).toHaveCount(0);
  await expect(page.locator('#local-results')).toContainText('○ notes.txt');
  await input.setInputFiles(payload(labExpected));
  await expect(page.locator('#local-success')).toBeVisible();
  await input.setInputFiles(payload({ 'api.conf': 'x'.repeat(65537) }));
  await expect(page.getByRole('status')).toContainText('64KB');
  await expect(page.locator('#local-success')).toHaveCount(0);
  await input.setInputFiles(payload(labExpected));
  await expect(page.locator('#local-success')).toBeVisible();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: localSections[0].title, exact: true }).click();
  await page.screenshot({ path: 'test-results/local-desktop.png', fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
      console.error(
        'overflow',
        width,
        await page.evaluate(() =>
          [...document.querySelectorAll('body *')]
            .filter(
              (el) =>
                el.getBoundingClientRect().right > innerWidth + 1 &&
                getComputedStyle(el).position !== 'absolute',
            )
            .map((el) => [el.tagName, el.className, el.getBoundingClientRect().right])
            .slice(-20),
        ),
      );
      await page.screenshot({ path: 'test-results/local-overflow.png', fullPage: true });
      assert.fail('horizontal overflow');
    }
  }
  await page.getByRole('button', { name: '내 파일에서 자유롭게 연습하기' }).click();
  await expect(page.locator('#title')).toHaveText('나의 Vim 작업 공간');
  await expect.poll(() => page.workers().length).toBe(1);
  for (const hash of ['', '#unknown-lesson']) {
    await page.goto(
      (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + hash,
    );
    await expect(page.locator('#title')).toHaveText('기억을 정리하는 첫 편집');
    await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS: local curriculum, ZIP download, file comparison, protected file failure, missing/oversize handling, no records, four widths and workspace navigation.',
  );
} finally {
  await browser.close();
}
