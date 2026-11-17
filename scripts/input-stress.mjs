import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const base = (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0];
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const rounds = Number(process.env.STRESS_ROUNDS || 20);
try {
  assert.ok(Number.isInteger(rounds) && rounds > 0, 'STRESS_ROUNDS must be a positive integer');
  await page.goto(`${base}#workshop`);
  await page.locator('#workshop-start').click();
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await page.evaluate(() => {
    const callback = [...window.__vimFieldSessions.values()][0];
    const observe = callback.observe;
    callback.observe = (value) => {
      window.stressSnapshot = value;
      observe(value);
    };
  });
  await expect.poll(() => page.evaluate(() => window.stressSnapshot?.mode)).toBe('n');
  for (let round = 0; round < rounds; round++) {
    await page.setViewportSize({ width: round % 2 ? 1024 : 1280, height: 720 });
    await page.locator('#vim-input').focus();
    await page.keyboard.type('ggdGi');
    await expect.poll(() => page.evaluate(() => window.stressSnapshot.mode)).toBe('i');
    const payload = `round${round}:` + "Az09&[]()'=_-+?;:".repeat(24);
    await page.keyboard.type(payload); // Intentionally zero delay: do not throttle to hide transport races.
    await page.keyboard.press('Escape');
    await expect
      .poll(() => page.evaluate(() => window.stressSnapshot.lines.join('\n')), {
        message: `burst input round ${round}`,
      })
      .toBe(payload);
    const diagnostic =
      "call jsevalfunc('document.body.dataset.modified=arguments[0]', [&modified], v:true)";
    await page.evaluate(() => delete document.body.dataset.modified);
    await page.keyboard.type(':' + diagnostic);
    await expect
      .poll(() => page.evaluate(() => window.stressSnapshot.command), {
        message: `command round ${round}`,
      })
      .toBe(diagnostic);
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.body.dataset.modified)).toBe('1');
    await expect.poll(() => page.evaluate(() => window.stressSnapshot.mode)).toBe('n');
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${rounds} zero-delay text/Ex bursts with resize; exact contents, command strings and executed diagnostics.`,
  );
} catch (error) {
  console.error(await page.evaluate(() => window.stressSnapshot));
  throw error;
} finally {
  await browser.close();
}
