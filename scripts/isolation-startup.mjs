import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
try {
  for (const delayed of [true, false]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    let navigations = 0;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });
    if (delayed)
      await context.addInitScript(() => {
        const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
        navigator.serviceWorker.register = async (...args) => {
          const registration = await register(...args);
          // Let activation/controllerchange happen before the register promise is delivered.
          await new Promise((resolve) => setTimeout(resolve, 600));
          return registration;
        };
      });
    await page.goto(`${base}#workspace`);
    try {
      await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 20000 });
      assert.equal(
        await page.evaluate(() => crossOriginIsolated),
        true,
        `cold isolation, delayed=${delayed}`,
      );
      assert.equal(page.workers().length, 1);
      await page.reload();
      await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
      assert.ok(navigations <= 3, `no reload loop: ${navigations}`);
      assert.deepEqual(errors, []);
    } catch (error) {
      console.error(
        await page.evaluate(() => ({
          isolated: crossOriginIsolated,
          controller: navigator.serviceWorker.controller?.scriptURL,
          status: document.querySelector('#engine-status')?.textContent,
        })),
      );
      throw error;
    } finally {
      await context.close();
    }
  }
  const denied = await browser.newContext();
  await denied.addInitScript(() => {
    navigator.serviceWorker.register = () =>
      Promise.reject(new Error('registration denied for test'));
  });
  const deniedPage = await denied.newPage();
  const deniedErrors = [];
  deniedPage.on('pageerror', (error) => deniedErrors.push(error.message));
  await deniedPage.goto(`${base}#workspace`);
  await expect(deniedPage.locator('#engine-status')).toContainText('연결 확인 필요');
  await expect(
    deniedPage.getByRole('status').filter({ hasText: 'Vim 실행 환경을 준비' }),
  ).toHaveCount(0);
  assert.deepEqual(deniedErrors, []);
  await denied.close();
  console.log(
    'PASS: cold first visit with early controller activation, normal startup, actual WASM boot, bounded reloads and registration-denied fallback.',
  );
} finally {
  await browser.close();
}
