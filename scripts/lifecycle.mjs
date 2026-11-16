import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || 'msedge',
  headless: true,
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/');
  const ready = async () => {
    await page.waitForFunction(() =>
      document.querySelector('#engine-status')?.textContent.includes('WASM'),
    );
    await expect
      .poll(() => page.workers().length, { message: 'exactly one live Vim worker' })
      .toBe(1);
    assert.equal(
      await page.evaluate(() => window.__vimFieldSessions.size),
      1,
      'one callback registry entry',
    );
  };
  await ready();
  const documentId = await page.evaluate(() => (window.testDocumentId = crypto.randomUUID()));
  for (const name of [
    '문자열 속으로',
    '같은 수정을',
    '로그의 잡음',
    '반복 업무를',
    '설정 두 개',
    '새벽 2시',
  ]) {
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await expect(page.locator('#title')).toContainText(name);
    await ready();
    assert.equal(
      await page.evaluate(() => window.testDocumentId),
      documentId,
      'mission navigation must not reload the page',
    );
  }
  const sessionId = await page.evaluate(() => [...window.__vimFieldSessions.keys()][0]);
  await page.locator('#editor-expand').click();
  await page.locator('#editor-expand').click();
  assert.equal(
    await page.evaluate(() => [...window.__vimFieldSessions.keys()][0]),
    sessionId,
    'layout changes preserve the Vim instance',
  );
  await page.locator('#vim-input').focus();
  await page.keyboard.type('iunsaved');
  await page.keyboard.press('Escape');
  await page.keyboard.type(
    ":call jsevalfunc('document.body.dataset.modified=arguments[0]', [&modified], v:true)",
  );
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.body.dataset.modified === '1');
  let warned = false;
  page.once('dialog', async (dialog) => {
    warned = true;
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: /문자열 속으로/ }).click();
  assert.ok(warned, 'unsaved navigation requires confirmation');
  assert.match(await page.locator('#title').innerText(), /새벽 2시/);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /문자열 속으로/ }).click();
  await ready();
  await page.goBack();
  await ready();
  assert.match(await page.locator('#title').innerText(), /새벽 2시/);
  await page.locator('#vim-input').focus();
  await page.keyboard.type(':qall!');
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    () => document.querySelector('#engine-status').textContent === 'VIM · 종료',
  );
  assert.equal(await page.evaluate(() => window.__vimFieldSessions.size), 0);
  await expect.poll(() => page.workers().length).toBe(0);
  await page.getByRole('button', { name: /문자열 속으로/ }).click();
  await ready();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#reset').click();
  await ready();
  assert.equal(await page.evaluate(() => window.testDocumentId), documentId);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: StrictMode startup, SPA navigation, one Worker, expand preserves engine, unsaved cancel/accept, browser back, quit cleanup, restart/reset.',
  );
} finally {
  await browser.close();
}
